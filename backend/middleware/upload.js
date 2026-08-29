const multer = require("multer");
const path = require("path");
const { uploadToCloudinary } = require("../utils/cloudinaryHelpers");

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|jfif|gif/;
  const valid =
    allowed.test(file.mimetype) ||
    allowed.test(path.extname(file.originalname).toLowerCase());

  if (valid) return cb(null, true);
  cb(new Error("Images only (jpeg, jpg, png, webp, gif)"));
};

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
});

const uploadFilesToCloudinary = (folder) => async (req, res, next) => {
  try {
    if (!req.files?.length) return next();

    req.uploadedImages = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, folder))
    );
    next();
  } catch (error) {
    next(error);
  }
};

const uploadFileToCloudinary = (folder) => async (req, res, next) => {
  try {
    if (!req.file) return next();

    req.uploadedImage = await uploadToCloudinary(req.file.buffer, folder);
    next();
  } catch (error) {
    next(error);
  }
};

const uploadProductImages = [
  memoryUpload.array("images", 10),
  uploadFilesToCloudinary("ecommerce/products"),
];

const uploadCategoryImage = [
  memoryUpload.single("image"),
  uploadFileToCloudinary("ecommerce/categories"),
];

module.exports = {
  uploadProductImages,
  uploadCategoryImage,
};
