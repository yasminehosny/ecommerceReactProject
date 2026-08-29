const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/200x200?text=Category",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Generate a URL-friendly slug from the category name before saving
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")        // convert spaces to dashes
      .replace(/[^\w\-]/g, "");    // remove non-alphanumeric characters
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);