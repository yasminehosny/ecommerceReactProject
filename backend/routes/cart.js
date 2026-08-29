const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

router.use(protect); // All cart routes require login

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:productId", updateCartItem);
router.delete("/", clearCart);
router.delete("/:productId", removeFromCart);

module.exports = router;
