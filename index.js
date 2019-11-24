const fs = require("fs");
const postHTML = require("posthtml");
const posthtmlInlineAssets = require("posthtml-inline-assets");
const package = require(
  require('app-root-path').resolve('/package.json')
);

module.exports = bundler => {
  bundler.on("bundled", (bundle) => {
    const bundles = Array.from(bundle.childBundles).concat([bundle]);
    const extensions = (package.inliner && Array.isArray(package.inliner.ext)) || [];

    return Promise.all(bundles.map(async bundle => {
      if (!bundle.entryAsset || extensions.indexOf(bundle.entryAsset.type) >= 0) return;

      const cwd = bundle.entryAsset.options.outDir;
      const data = fs.readFileSync(bundle.name);
      const result = await postHTML([posthtmlInlineAssets({ cwd })]).process(data);
      fs.writeFileSync(bundle.name, result.html);
    }));
  });
};
