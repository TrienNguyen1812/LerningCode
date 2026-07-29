const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Thư mục gốc assets ở ngoài folder src
    const baseAssetsPath = path.join(__dirname, "../../assets");
    let subFolder = "file"; // Mặc định là tài liệu (pdf, docx, pptx...)

    // Phân loại thư mục lưu trữ động
    if (file.mimetype.startsWith("image/")) {
      subFolder = "image";
    } else if (file.mimetype.startsWith("video/")) {
      subFolder = "video"; // Tách riêng thư mục video bài học
    }

    const finalPath = path.join(baseAssetsPath, subFolder);

    // Tự động khởi tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath, { recursive: true });
    }

    cb(null, finalPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Kiểm tra toàn diện cả đuôi file và MimeType
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp|mp4|mov|mkv|avi|docx|pptx|pdf|xlsx/;
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith("video/") || file.mimetype.startsWith("image/");

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Định dạng file không được hệ thống hỗ trợ!"));
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Giới hạn 100MB cho Video / Slide bài giảng
  fileFilter,
});

module.exports = upload;