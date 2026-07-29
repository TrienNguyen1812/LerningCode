class SystemFile {
  constructor({ IdFile, FileName, FilePath, FileType, FileSize, UploadDate }) {
    this.id = IdFile;
    this.fileName = FileName;
    this.filePath = FilePath;
    this.fileType = FileType;
    this.fileSize = FileSize;
    this.uploadDate = UploadDate;
  }
}

module.exports = SystemFile;