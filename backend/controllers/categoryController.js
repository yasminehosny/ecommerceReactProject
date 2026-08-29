const fs = require("fs");
const path = require("path");
const Category = require("../models/category");
const Product = require("../models/Product");
const {
  DEFAULT_CATEGORY_IMAGE,
  deleteFromCloudinary,
} = require("../utils/cloudinaryHelpers");

const deleteImage = async (imageRef) => {
  if (!imageRef || imageRef.includes("placeholder.com")) return;

  if (imageRef.startsWith("http")) {
    await deleteFromCloudinary(imageRef);
    return;
  }

  if (imageRef === "default-category.jpg") return;

  const filePath = path.join(__dirname, "../uploads", imageRef);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// Retrieve all active categories (GET /api/categories) — public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve a single category by ID or slug (GET /api/categories/:identifier) — public
const getCategory = async (req, res) => {
  try {
    const { identifier } = req.params;

    const isMongoId = /^[a-f\d]{24}$/i.test(identifier);
    const category = isMongoId
      ? await Category.findById(identifier)
      : await Category.findOne({ slug: identifier });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const productCount = await Product.countDocuments({ category: category._id });

    res.status(200).json({ success: true, category, productCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new category (POST /api/categories) — admin only
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      if (req.uploadedImage) await deleteFromCloudinary(req.uploadedImage.url);
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (exists) {
      if (req.uploadedImage) await deleteFromCloudinary(req.uploadedImage.url);
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const image = req.uploadedImage?.url || DEFAULT_CATEGORY_IMAGE;

    const category = await Category.create({ name, description, image });

    res.status(201).json({ success: true, message: "Category created", category });
  } catch (error) {
    if (req.uploadedImage) await deleteFromCloudinary(req.uploadedImage.url);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a category's details (PUT /api/categories/:id) — admin only
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      if (req.uploadedImage) await deleteFromCloudinary(req.uploadedImage.url);
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const updateData = { ...req.body };

    if (req.uploadedImage) {
      await deleteImage(category.image);
      updateData.image = req.uploadedImage.url;
    }

    if (updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]/g, "");
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Category updated", category: updated });
  } catch (error) {
    if (req.uploadedImage) await deleteFromCloudinary(req.uploadedImage.url);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a category only when no products reference it (DELETE /api/categories/:id) — admin only
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — ${productCount} product(s) are using this category`,
      });
    }

    await deleteImage(category.image);
    await category.deleteOne();

    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle a category's active state (PUT /api/categories/:id/toggle) — admin only
const toggleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category ${category.isActive ? "activated" : "deactivated"}`,
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategory,
};
