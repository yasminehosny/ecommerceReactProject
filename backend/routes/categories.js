const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const { uploadCategoryImage } = require("../middleware/upload");
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategory,
} = require("../controllers/categoryController");

// Public
router.get("/", getCategories);
router.get("/:identifier", getCategory);

// Admin
router.post("/", protect, adminOnly, uploadCategoryImage, createCategory);
router.put("/:id", protect, adminOnly, uploadCategoryImage, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);
router.put("/:id/toggle", protect, adminOnly, toggleCategory);

module.exports = router;
