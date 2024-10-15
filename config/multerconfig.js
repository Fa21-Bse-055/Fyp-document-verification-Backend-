const multer = require("multer");
const path = require("path");

const generateUniqueCode = require("../utils/generateUniqueCode");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/uploads/uploadCNIC/");
  },
  filename: (req, file, cb) => {
    cb(null, "CNIC" + generateUniqueCode() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  const filetypes = /jpg|png|jpeg/i;
  const extname = filetypes.test(path.extname(file.originalname));
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
