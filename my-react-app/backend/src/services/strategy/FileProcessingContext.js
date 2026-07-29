const MediaStrategy = require("./media.strategy");
const DocumentStrategy = require("./document.strategy");

class FileProcessingContext {
  constructor() {
    this.strategies = {
      media: new MediaStrategy(),
      document: new DocumentStrategy(),
    };
  }

  /**
   * Tự động chọn Strategy dựa theo FileType / MimeType
   */
  getStrategy(mimeType) {
    if (!mimeType) return this.strategies.document;

    if (mimeType.startsWith("video/") || mimeType.startsWith("image/")) {
      return this.strategies.media;
    }
    return this.strategies.document;
  }

  /**
   * Thực thi Strategy tương ứng
   */
  executeStrategy(file) {
    const strategy = this.getStrategy(file.mimetype || file.fileType);
    return strategy.process(file);
  }
}

module.exports = FileProcessingContext;