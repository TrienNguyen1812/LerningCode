const FileFacade = require("../facade/file.facade");

// Đảm bảo chỉ tạo duy nhất 1 thể hiện (instance) của FileFacade
const fileSingleton = new FileFacade();

module.exports = fileSingleton;