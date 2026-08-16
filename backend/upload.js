const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================================
// IMAGES FOLDER
// =====================================================

const imagesFolder = path.join(__dirname, "..", "images");

// Create images folder if it does not exist
if (!fs.existsSync(imagesFolder)) {
  fs.mkdirSync(imagesFolder, { recursive: true });
}

// =====================================================
// STORAGE CONFIGURATION
// =====================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesFolder);
  },

  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    const fileName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + extension;

    cb(null, fileName);
  },
});

// =====================================================
// IMAGE FILE FILTER
// =====================================================

const fileFilter = function (req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed."));
  }
};

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({
  storage: storage,

  fileFilter: fileFilter,

  limits: {
    // Maximum size for EACH image: 5MB
    fileSize: 5 * 1024 * 1024,

    // Maximum files accepted in one upload request.
    //
    // We use:
    // 1 file for the main car image
    // up to 5 files for gallery images
    //
    // Total vehicle pictures = 6
    files: 6,
  },
});

// =====================================================
// EXPORT
// =====================================================

module.exports = upload;
