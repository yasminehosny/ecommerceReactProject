const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true },
});

// Delivery slot schema: date and time period (morning/afternoon/evening)
const deliverySlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, "Delivery date is required"],
  },
  period: {
    type: String,
    required: [true, "Delivery period is required"],
    enum: {
      values: ["morning", "afternoon", "evening", "night"],
      message: "Period must be morning, afternoon, evening, or night",
    },
  },
}, { _id: false });

// Order schema stores items, payment method, delivery slot and timestamps
// (used for order management and admin queries)
//
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    // Payment method
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery"],
      default: "cash_on_delivery",
    },
   

    // Order status
    status: {
      type: String,
      enum: ["pending", "confirmed", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },

    // Shipping address fields
    shippingAddress: {
      street:  { type: String, required: [true, "Street is required"] },
      city:    { type: String, required: [true, "City is required"]   },
      country: { type: String, default: "Egypt" },
      phone:   { type: String, required: [true, "Phone is required"]  },
    },

    // Delivery slot chosen by the customer
    deliverySlot: {
      type: deliverySlotSchema,
      required: [true, "Please choose a delivery slot"],
    },

    // Timestamps for various order lifecycle events
    confirmedAt:     { type: Date },
    outForDeliveryAt:{ type: Date },
    deliveredAt:     { type: Date },
    cancelledAt:     { type: Date },
    cancelReason:    { type: String },
  },
  { timestamps: true }
);

// Index for admin queries by delivery date
orderSchema.index({ "deliverySlot.date": 1, status: 1 });

module.exports = mongoose.model("Order", orderSchema);