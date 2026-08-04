import { access, readFile, stat } from "node:fs/promises";
import { pages } from "../src/pages.mjs";

const errors = [];
const checkedAssets = new Set();
const internalLinks = new Set(["/", ...Object.keys(pages)
  .filter((file) => file.endsWith("/index.html"))
  .map((file) => `/${file.replace(/\/index\.html$/, "")}`)]);

for (const [file] of Object.entries(pages)) {
  try {
    await access(file);
  } catch {
    errors.push(`${file}: fehlt`);
    continue;
  }

  const html = await readFile(file, "utf8");
  if (!html.includes('<html lang="de"')) errors.push(`${file}: lang=de fehlt`);
  if (!html.includes("<main id=\"main\">")) errors.push(`${file}: main fehlt`);
  if (!html.includes("<title>")) errors.push(`${file}: title fehlt`);
  if (!html.includes('name="description"')) errors.push(`${file}: description fehlt`);
  if (!html.includes('class="skip-link"')) errors.push(`${file}: Skip-Link fehlt`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) errors.push(`${file}: doppelte IDs ${[...new Set(duplicates)].join(", ")}`);

  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = match[1].split("#")[0];
    if (href.startsWith("/assets/") || href === "/404" || internalLinks.has(href)) continue;
    errors.push(`${file}: internes Ziel ${href} fehlt im Build`);
  }

  for (const match of html.matchAll(/(?:src|srcset)="(\/assets\/[^"]+)"/g)) {
    checkedAssets.add(match[1].slice(1));
  }
}

for (const asset of checkedAssets) {
  try {
    const details = await stat(asset);
    if (!details.size) errors.push(`${asset}: ist leer`);
  } catch {
    errors.push(`${asset}: referenziertes Asset fehlt`);
  }
}

const scenes = ["home", "profile", "skills", "archive", "portfolio", "analyzer", "contact", "legal", "notfound"];
const formats = ["desktop", "tablet", "mobile"];
const extensions = ["mp4", "webm", "webp"];
for (const scene of scenes) {
  for (const format of formats) {
    for (const extension of extensions) {
      const suffix = extension === "webp" ? "-poster.webp" : `.${extension}`;
      const asset = `assets/media/system/${scene}/${scene}-${format}${suffix}`;
      try {
        const details = await stat(asset);
        if (!details.size) errors.push(`${asset}: ist leer`);
      } catch {
        errors.push(`${asset}: fehlt`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`${Object.keys(pages).length} HTML-Seiten geprüft: Struktur, IDs, interne Ziele und responsive Medien sind konsistent.`);
