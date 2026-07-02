const CSharpStrategy = require("./strategies/CSharpStrategy");

class CompilerFactory {
  static getStrategy(language) {
    switch (language.toLowerCase()) {
      case "csharp":
        return new CSharpStrategy();
      default:
        throw new Error(`Ngôn ngữ ${language} chưa được hỗ trợ.`);
    }
  }
}
module.exports = CompilerFactory;