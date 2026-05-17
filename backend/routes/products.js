const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const { protect, adminOnly } = require("../middleware/auth");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} = require("../controllers/productController");

// Multer setup: accept up to 10 image files, 10MB each
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname);   // keeps original ext
    const safeName = `product-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,  
    files: 10,                    
  },
});

// Public
router.get("/",    getProducts);
router.get("/:id", getProduct);

// Admin
router.post(  "/",
  protect, adminOnly,
  upload.array("images", 10),    
  createProduct
);

router.put("/:id",
  protect, adminOnly,
  upload.array("images", 10),
  updateProduct
);

router.delete("/:id",             protect, adminOnly, deleteProduct);
router.delete("/:id/images/:filename", protect, adminOnly, deleteProductImage);

module.exports = router;