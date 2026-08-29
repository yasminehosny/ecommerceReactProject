const Order   = require("../models/Order");
const Cart    = require("../models/Cart");
const Product = require("../models/Product");

// Slot config
const SLOT_HOURS = {
  morning:   { label: "9:00 AM – 12:00 PM", from: 9,  to: 12 },
  afternoon: { label: "12:00 PM – 5:00 PM", from: 12, to: 17 },
  evening:   { label: "5:00 PM – 9:00 PM",  from: 17, to: 21 },
  night:     { label: "9:00 PM – 12:00 AM", from: 21, to: 24 },
};

// Helper: validate delivery slot
const validateSlot = (deliverySlot) => {
  if (!deliverySlot?.date || !deliverySlot?.period) {
    return "deliverySlot must include date and period";
  }

  const { date, period } = deliverySlot;

  if (!SLOT_HOURS[period]) {
    return "Period must be: morning | afternoon | evening | night";
  }

  const slotDate  = new Date(date);
  const today     = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow  = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isNaN(slotDate.getTime())) return "Invalid date format";
  if (slotDate < tomorrow)       return "Delivery date must be at least tomorrow";

  // Max 14 days ahead
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 14);
  if (slotDate > maxDate)        return "Delivery date cannot be more than 14 days ahead";

  return null; // ✅ valid
};

// @desc    Get available delivery slots (next 14 days from order date)
// @route   GET /api/orders/slots
// @access  Private
const getAvailableSlots = async (req, res) => {
  try {
    const slots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= 14; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);

      const dateStr = date.toISOString().split("T")[0]; // "2025-01-20"

      const periods = Object.entries(SLOT_HOURS).map(([key, val]) => ({
        period: key,
        label:  val.label,
      }));

      slots.push({ date: dateStr, periods });
    }

    res.status(200).json({ success: true, slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Place order - Cash on Delivery + Delivery Slot
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, deliverySlot } = req.body;

    // 1. Validate delivery slot
    const slotError = validateSlot(deliverySlot);
    if (slotError) {
      return res.status(400).json({ success: false, message: slotError });
    }

    // 2. Validate shipping address
    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.phone) {
      return res.status(400).json({
        success: false,
        message: "shippingAddress must include street, city, and phone",
      });
    }

    // 3. Load cart
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // 4. Check stock
    for (const item of cart.items) {
      if (item.product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product.name}" (available: ${item.product.quantity})`,
        });
      }
    }

    // 5. Build order
    const orderItems = cart.items.map((item) => ({
      product:  item.product._id,
      name:     item.product.name,
      price:    item.price,
      quantity: item.quantity,
      image:    item.product.images?.[0] || "default-product.jpg", // أول صورة
    }));

    const order = await Order.create({
      user:            req.user._id,
      items:           orderItems,
      totalAmount:     cart.totalAmount,
      paymentMethod:   "cash_on_delivery",
      isPaid:          false,
      shippingAddress,
      deliverySlot: {
        date:   new Date(deliverySlot.date),
        period: deliverySlot.period,
      },
      status: "pending",
    });

    // 6. Deduct stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { quantity: -item.quantity },
      });
    }

    // 7. Clear cart
    await Cart.findOneAndDelete({ user: req.user._id });

    // 8. Response
    const slotInfo = SLOT_HOURS[deliverySlot.period];
    res.status(201).json({
      success: true,
      message: "Order placed successfully — Cash on Delivery",
      order,
      summary: {
        totalAmount:    `${cart.totalAmount} EGP`,
        paymentMethod:  "Cash on Delivery",
        deliveryDate:   deliverySlot.date,
        deliveryPeriod: slotInfo.label,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product", "name images");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin) — فلتر بالتاريخ والسلوت
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date)   filter["deliverySlot.date"] = new Date(date);

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name images")
      .sort({ "deliverySlot.date": 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const validStatuses = ["pending", "confirmed", "out_for_delivery", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // Set the right timestamp for each status
    const timestampMap = {
      confirmed:        { confirmedAt: new Date() },
      out_for_delivery: { outForDeliveryAt: new Date() },
      delivered:        { deliveredAt: new Date(), isPaid: true }, // عند التسليم = تم الدفع
      cancelled:        { cancelledAt: new Date(), cancelReason: cancelReason || "" },
    };

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, ...timestampMap[status] },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: `Order marked as ${status}`,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order (User - only if still pending)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel — order is already "${order.status}"`,
      });
    }

    order.status      = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || "Cancelled by customer";
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity },
      });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled and stock restored",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAvailableSlots,
  placeOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};