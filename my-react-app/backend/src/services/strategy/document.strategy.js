class DocumentStrategy {
  /**
   * Xử lý file thuộc nhóm Document (PDF, Word, TXT...)
   */
  process(file) {
    return {
      category: "Document",
      isPreviewable: false,
      formattedSize: `${(file.size / 1024).toFixed(1)} KB`,
      note: "Tài liệu văn bản học tập",
    };
  }
}

module.exports = DocumentStrategy;