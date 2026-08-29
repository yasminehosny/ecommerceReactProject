const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const { uploadProductImages } = require("../middleware/upload");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} = require("../controllers/productController");

// Public
router.get("/", getProducts);
router.get("/:id", getProduct);

// Admin
router.post("/", protect, adminOnly, uploadProductImages, createProduct);
router.put("/:id", protect, adminOnly, uploadProductImages, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.delete("/:id/images/:index", protect, adminOnly, deleteProductImage);

module.exports = router;
