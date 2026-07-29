class MediaStrategy {
  /**
   * Xử lý file thuộc nhóm Media (Video/Ảnh)
   */
  process(file) {
    return {
      category: "Media",
      isPreviewable: true,
      formattedSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      note: "Tệp đa phương tiện hỗ trợ xem trực tuyến",
    };
  }
}

module.exports = MediaStrategy;