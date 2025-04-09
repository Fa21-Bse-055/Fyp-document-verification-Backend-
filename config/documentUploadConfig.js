const multer = require("multer");
const path = require("path");
const fs = require("fs");
const generateUniqueCode = require("../utils/generateUniqueCode");

// Create directory if it doesn't exist
const uploadDir = "./verificationFiles/documents/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, "DOC_" + generateUniqueCode() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept pdf, docx, doc, txt files
  const filetypes = /pdf|docx|doc|txt|jpg|jpeg|png/i;
  const extname = filetypes.test(path.extname(file.originalname));
  const mimetype = filetypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only document files (PDF, DOCX, DOC, TXT) or images (JPG, JPEG, PNG) are allowed!"));
  }
};

const uploadDocument = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

module.exports = uploadDocument; 