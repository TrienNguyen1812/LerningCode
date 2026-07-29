module.exports = (err, req, res, next) => {
  console.error("❌ System Error Log:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi máy chủ nội bộ!",
  });
};