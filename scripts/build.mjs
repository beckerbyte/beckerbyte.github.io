import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pages } from "../src/pages.mjs";

const staleHtmlOutputs = [
  "skills.html",
  "projekte.html",
  "impressum.html",
  "datenschutz.html"
];

await Promise.all(staleHtmlOutputs.map((file) => rm(file, { force: true })));

for (const [file, html] of Object.entries(pages)) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html.replace(/[ \t]+\n/g, "\n"));
}

console.log(`${Object.keys(pages).length} Seiten gebaut; ${staleHtmlOutputs.length} kollidierende Legacy-Ausgaben entfernt.`);
