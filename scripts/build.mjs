import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pages } from "../src/pages.mjs";

const assetVersionPlaceholder = "__ASSET_VERSION__";
const versionedAssets = [
  "assets/css/site.css",
  "assets/js/media-controller.js",
  "assets/js/site.js",
  "assets/js/system-world.js"
];

const assetHash = createHash("sha256");
for (const asset of versionedAssets) {
  assetHash.update(asset);
  assetHash.update(await readFile(asset));
}
const assetVersion = assetHash.digest("hex").slice(0, 12);

const staleHtmlOutputs = [
  "skills.html",
  "projekte.html",
  "impressum.html",
  "datenschutz.html"
];

await Promise.all(staleHtmlOutputs.map((file) => rm(file, { force: true })));

for (const [file, html] of Object.entries(pages)) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html
    .replaceAll(assetVersionPlaceholder, assetVersion)
    .replace(/[ \t]+\n/g, "\n"));
}

console.log(`${Object.keys(pages).length} Seiten gebaut; Asset-Version ${assetVersion}; ${staleHtmlOutputs.length} kollidierende Legacy-Ausgaben entfernt.`);
