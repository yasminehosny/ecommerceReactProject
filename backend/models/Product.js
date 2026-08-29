const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "one-size", "N/A"],
      default: "N/A",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    // Array of image URLs (Cloudinary) or legacy filenames (max 10)
    images: {
      type: [String],
      default: ["https://via.placeholder.com/400x300?text=No+Image"],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "Maximum 10 images per product",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model("Product", productSchema);