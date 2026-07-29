const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../assets/files");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 🟢 Decode UTF-8 tiếng Việt
    const originalNameUtf8 = Buffer.from(file.originalname, "latin1").toString("utf8");

    // Replace khoảng trắng thành dấu gạch dưới để URL đẹp
    const safeFileName = originalNameUtf8.replace(/\s+/g, "_");

    // 🎯 Chỉ giữ tên file gốc (Đã bỏ Date.now() và random suffix)
    cb(null, safeFileName);
  },
});

const upload = multer({ storage });
module.exports = upload;