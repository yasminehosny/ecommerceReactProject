const fs       = require("fs");
const path     = require("path");
const Product  = require("../models/Product");
const Category = require("../models/Category");

// Delete an image file from the uploads folder (helper)
const deleteFile = (filename) => {
  if (!filename || filename === "default-product.jpg") return;
  const filePath = path.join(__dirname, "../uploads", filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// Get a list of products with filtering, sorting and pagination (GET /api/products) — public
const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, size, sort, search, page = 1, limit = 12 } = req.query;

    const filter = {};

    if (category) {
      const isMongoId = /^[a-f\d]{24}$/i.test(category);
      const cat = isMongoId
        ? await Category.findById(category)
        : await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }

    if (size) filter.size = size;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const sortOption = {};
    if (sort === "price_asc")       sortOption.price = 1;
    else if (sort === "price_desc") sortOption.price = -1;
    else                            sortOption.createdAt = -1;

    const skip    = (Number(page) - 1) * Number(limit);
    const total   = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category", "name slug image")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get details for a single product by ID (GET /api/products/:id) — public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug image");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new product with optional images (POST /api/products) — admin only
const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, size, quantity } = req.body;

    // Validate category
    const cat = await Category.findById(category);
    if (!cat) {
      // Clean up uploaded files if category is invalid
      if (req.files) req.files.forEach(f => deleteFile(f.filename));
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    // Build images array from uploaded files
    const images = req.files && req.files.length > 0
      ? req.files.map(f => f.filename)
      : ["default-product.jpg"];

    const product = await Product.create({
      name, price, description,
      category: cat._id,
      size, quantity, images,
      createdBy: req.user._id,
    });

    await product.populate("category", "name slug");

    res.status(201).json({
      success: true,
      message: `Product created with ${images.length} image(s)`,
      product,
    });
  } catch (error) {
    if (req.files) req.files.forEach(f => deleteFile(f.filename));
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a product, optionally replacing or appending images (PUT /api/products/:id) — admin only
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      if (req.files) req.files.forEach(f => deleteFile(f.filename));
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Validate new category if provided
    if (req.body.category) {
      const cat = await Category.findById(req.body.category);
      if (!cat) {
        if (req.files) req.files.forEach(f => deleteFile(f.filename));
        return res.status(400).json({ success: false, message: "Invalid category ID" });
      }
    }

    const updateData = { ...req.body };

    // Image handling
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => f.filename);

      if (req.body.replaceImages === "true") {
        // Delete old images from disk and replace all
        product.images.forEach(deleteFile);
        updateData.images = newImages;
      } else {
        // Append new images to existing ones (max 10)
        const combined = [...product.images, ...newImages];
        if (combined.length > 10) {
          req.files.forEach(f => deleteFile(f.filename));
          return res.status(400).json({
            success: false,
            message: `Cannot exceed 10 images. Product already has ${product.images.length}.`,
          });
        }
        updateData.images = combined;
      }
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id, updateData, { new: true, runValidators: true }
    ).populate("category", "name slug");

    res.status(200).json({
      success: true,
      message: "Product updated",
      product: updated,
    });
  } catch (error) {
    if (req.files) req.files.forEach(f => deleteFile(f.filename));
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a specific image from a product (DELETE /api/products/:id/images/:filename) — admin only
const deleteProductImage = async (req, res) => {
  try {
    const { id, filename } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!product.images.includes(filename)) {
      return res.status(404).json({ success: false, message: "Image not found on this product" });
    }

    if (product.images.length === 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the last image. Upload a new one first.",
      });
    }

    // Remove from array and delete from disk
    product.images = product.images.filter(img => img !== filename);
    deleteFile(filename);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Image deleted",
      remainingImages: product.images,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a product and all its images from disk (DELETE /api/products/:id) — admin only
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Delete all images from disk
    product.images.forEach(deleteFile);

    await product.deleteOne();

    res.status(200).json({ success: true, message: "Product and all images deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
};