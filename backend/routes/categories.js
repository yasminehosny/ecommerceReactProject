const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const { protect, adminOnly } = require("../middleware/auth");
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategory,
} = require("../controllers/categoryController");

// Multer for category image
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, `category-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|jfif/;

    const mimetype = allowedTypes.test(file.mimetype);

    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype || extname) {
      return cb(null, true);
    }

    cb(new Error("Images only"));
  },

  limits: { fileSize: 3 * 1024 * 1024 },
});

// Public
router.get("/",                getCategories);
router.get("/:identifier",     getCategory);

// Admin
router.post(  "/",             protect, adminOnly, upload.single("image"), createCategory);
router.put(   "/:id",          protect, adminOnly, upload.single("image"), updateCategory);
router.delete("/:id",          protect, adminOnly, deleteCategory);
router.put(   "/:id/toggle",   protect, adminOnly, toggleCategory);

module.exports = router;
