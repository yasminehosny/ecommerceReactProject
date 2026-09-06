const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const Category = require("../models/category");
const {
  DEFAULT_PRODUCT_IMAGE,
  deleteFromCloudinary,
} = require("../utils/cloudinaryHelpers");

const deleteImage = async (imageRef) => {
  if (!imageRef || imageRef.includes("placeholder.com")) return;

  if (imageRef.startsWith("http")) {
    await deleteFromCloudinary(imageRef);
    return;
  }

  if (imageRef === "default-product.jpg") return;

  const filePath = path.join(__dirname, "../uploads", imageRef);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

const cleanupUploadedImages = async (uploadedImages = []) => {
  await Promise.all(uploadedImages.map((img) => deleteFromCloudinary(img.url)));
};

// Get a list of products with filtering, sorting and pagination (GET /api/products) — public
const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort, search, page = 1, limit = 12 } = req.query;

    const filter = {};

    if (category) {
      const isMongoId = /^[a-f\d]{24}$/i.test(category);
      const cat = isMongoId
        ? await Category.findById(category)
        : await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const sortOption = {};
    if (sort === "price_asc") sortOption.price = 1;
    else if (sort === "price_desc") sortOption.price = -1;
    else sortOption.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
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
    const { name, price, description, category, quantity } = req.body;

    const cat = await Category.findById(category);
    if (!cat) {
      await cleanupUploadedImages(req.uploadedImages);
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const images = req.uploadedImages?.length > 0
      ? req.uploadedImages.map((img) => img.url)
      : [DEFAULT_PRODUCT_IMAGE];

    const product = await Product.create({
      name,
      price,
      description,
      category: cat._id,
      quantity,
      images,
      createdBy: req.user._id,
    });

    await product.populate("category", "name slug");

    res.status(201).json({
      success: true,
      message: `Product created with ${images.length} image(s)`,
      product,
    });
  } catch (error) {
    await cleanupUploadedImages(req.uploadedImages);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a product, optionally replacing or appending images (PUT /api/products/:id) — admin only
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      await cleanupUploadedImages(req.uploadedImages);
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (req.body.category) {
      const cat = await Category.findById(req.body.category);
      if (!cat) {
        await cleanupUploadedImages(req.uploadedImages);
        return res.status(400).json({ success: false, message: "Invalid category ID" });
      }
    }

    const updateData = { ...req.body };

    if (req.uploadedImages?.length > 0) {
      const newImages = req.uploadedImages.map((img) => img.url);

      if (req.body.replaceImages === "true") {
        await Promise.all(product.images.map(deleteImage));
        updateData.images = newImages;
      } else {
        const combined = [...product.images, ...newImages];
        if (combined.length > 10) {
          await cleanupUploadedImages(req.uploadedImages);
          return res.status(400).json({
            success: false,
            message: `Cannot exceed 10 images. Product already has ${product.images.length}.`,
          });
        }
        updateData.images = combined;
      }
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "name slug");

    res.status(200).json({
      success: true,
      message: "Product updated",
      product: updated,
    });
  } catch (error) {
    await cleanupUploadedImages(req.uploadedImages);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a specific image from a product (DELETE /api/products/:id/images/:index) — admin only
const deleteProductImage = async (req, res) => {
  try {
    const { id, index } = req.params;
    const imageIndex = Number(index);

    if (Number.isNaN(imageIndex) || imageIndex < 0) {
      return res.status(400).json({ success: false, message: "Invalid image index" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (imageIndex >= product.images.length) {
      return res.status(404).json({ success: false, message: "Image not found on this product" });
    }

    if (product.images.length === 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the last image. Upload a new one first.",
      });
    }

    const [removedImage] = product.images.splice(imageIndex, 1);
    await deleteImage(removedImage);
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

// Delete a product and all its images (DELETE /api/products/:id) — admin only
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await Promise.all(product.images.map(deleteImage));
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
