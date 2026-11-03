const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// KaTeX の CSS を、コードではなくファイルとして同梱する。WebView に渡す HTML に、実行時に読み込んで入れる。
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  (ext) => ext !== "css",
);
config.resolver.assetExts.push("css");

module.exports = config;
