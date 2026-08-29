const { Readable } = require("stream");
const cloudinary = require("../config/cloudinary");

const DEFAULT_PRODUCT_IMAGE = "https://via.placeholder.com/400x300?text=No+Image";
const DEFAULT_CATEGORY_IMAGE = "https://via.placeholder.com/200x200?text=Category";

const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  const pathPart = parts[1].replace(/^v\d+\//, "");
  return pathPart.replace(/\.[^/.]+$/, "");
};

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (urlOrPublicId) => {
  if (!urlOrPublicId || urlOrPublicId.startsWith("default-") || urlOrPublicId.includes("placeholder.com")) {
    return;
  }

  const publicId = urlOrPublicId.startsWith("http")
    ? getPublicIdFromUrl(urlOrPublicId)
    : urlOrPublicId;

  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
  }
};

module.exports = {
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_CATEGORY_IMAGE,
  getPublicIdFromUrl,
  uploadToCloudinary,
  deleteFromCloudinary,
};
