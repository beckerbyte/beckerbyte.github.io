import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pages } from "../src/pages.mjs";
import { redirectPage } from "../src/layout.mjs";

const redirects = {
  "skills.html": ["/skills", "Skills & Erfahrung"],
  "projekte.html": ["/projekte", "Projekte"],
  "impressum.html": ["/impressum", "Anbieterhinweis"],
  "datenschutz.html": ["/datenschutz", "Datenschutz"]
};

for (const [file, html] of Object.entries(pages)) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html.replace(/[ \t]+\n/g, "\n"));
}

for (const [file, [target, label]] of Object.entries(redirects)) {
  await writeFile(file, redirectPage(target, label));
}

console.log(`${Object.keys(pages).length} Seiten und ${Object.keys(redirects).length} Legacy-Weiterleitungen gebaut.`);
