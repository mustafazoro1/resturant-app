const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Exclude @google-cloud temp build dirs that cause ENOENT watch errors after pnpm install
const blockList = [
  /node_modules[/\\]\.pnpm[/\\]@google-cloud[^/\\]*[/\\].*_tmp_[^/\\]*[/\\].*/,
  /node_modules[/\\]@google-cloud[/\\].*_tmp_[^/\\]*[/\\].*/,
];

const existing = config.resolver?.blockList;
if (existing) {
  config.resolver.blockList = Array.isArray(existing)
    ? [...existing, ...blockList]
    : [existing, ...blockList];
} else {
  config.resolver = { ...config.resolver, blockList };
}

module.exports = config;
