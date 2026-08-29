const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getAvailableSlots,
  placeOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

router.use(protect);

router.get("/slots",       getAvailableSlots);   // GET  /api/orders/slots
router.post("/",           placeOrder);           // POST /api/orders
router.get("/",            getMyOrders);          // GET  /api/orders
router.get("/admin/all",   adminOnly, getAllOrders);           // GET  /api/orders/admin/all
router.get("/:id",         getOrder);             // GET  /api/orders/:id
router.put("/:id/status",  adminOnly, updateOrderStatus);     // PUT  /api/orders/:id/status
router.put("/:id/cancel",  cancelOrder);          // PUT  /api/orders/:id/cancel

module.exports = router;