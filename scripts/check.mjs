import { access, readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { pages } from "../src/pages.mjs";
import { normalizeInternalPath, site } from "../src/site-data.mjs";

const errors = [];
const checkedAssets = new Set();
const staleHtmlOutputs = ["skills.html", "projekte.html", "impressum.html", "datenschutz.html"];
const directoryRoutes = Object.keys(pages)
  .filter((file) => file.endsWith("/index.html"))
  .map((file) => file.replace(/\/index\.html$/, ""));
const internalRoutes = new Set(["/", ...directoryRoutes.map((route) => normalizeInternalPath(`/${route}`))]);

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const collectHtmlFiles = async (directory = ".") => {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if ([".git", ".media-tmp", "node_modules"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(path));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(path.replace(/^\.\//, ""));
  }
  return files;
};

for (const file of staleHtmlOutputs) {
  if (await exists(file)) errors.push(`Veraltete kollidierende Build-Ausgabe existiert: ${file}`);
}

for (const route of directoryRoutes) {
  if (route === "404") continue; // GitHub Pages benötigt zusätzlich die inhaltlich identische 404.html.
  const conflictingFile = `${route}.html`;
  if (await exists(conflictingFile)) {
    errors.push(`Routenkollision: ${route}/index.html und ${conflictingFile} existieren gleichzeitig`);
  }
}

for (const [file] of Object.entries(pages)) {
  if (!await exists(file)) {
    errors.push(`${file}: fehlt`);
    continue;
  }

  const html = await readFile(file, "utf8");
  if (!html.includes('<html lang="de"')) errors.push(`${file}: lang=de fehlt`);
  if (!html.includes("<main id=\"main\">")) errors.push(`${file}: main fehlt`);
  if (!html.includes("<title>")) errors.push(`${file}: title fehlt`);
  if (!html.includes('name="description"')) errors.push(`${file}: description fehlt`);
  if (!html.includes('class="skip-link"')) errors.push(`${file}: Skip-Link fehlt`);
  if (!html.includes('/assets/js/media-controller.js')) errors.push(`${file}: zentraler Media Controller fehlt`);

  const sceneCount = [...html.matchAll(/class="system-scene(?:\s|\")/g)].length;
  const mediaStateCount = [...html.matchAll(/data-media-state="poster"/g)].length;
  const posterCount = [...html.matchAll(/data-media-layer="poster"/g)].length;
  const videoCount = [...html.matchAll(/data-media-layer="video"/g)].length;
  if (sceneCount !== mediaStateCount || sceneCount !== posterCount || sceneCount !== videoCount) {
    errors.push(`${file}: Szenen benötigen je genau einen Zustand, ein Poster und ein Video (${sceneCount}/${mediaStateCount}/${posterCount}/${videoCount})`);
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) errors.push(`${file}: doppelte IDs ${[...new Set(duplicates)].join(", ")}`);

  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)">/);
  const openGraphMatch = html.match(/<meta property="og:url" content="([^"]+)">/);
  if (!canonicalMatch) {
    errors.push(`${file}: Canonical fehlt`);
  } else {
    const canonical = new URL(canonicalMatch[1]);
    if (canonical.origin !== site.origin) errors.push(`${file}: falscher Canonical-Host ${canonical.origin}`);
    if (canonical.pathname !== "/" && !canonical.pathname.endsWith("/")) errors.push(`${file}: Canonical ohne Slash ${canonical.href}`);
    if (canonical.pathname.includes(".html") || canonical.pathname.includes("/index.html")) errors.push(`${file}: nichtkanonische Canonical-URL ${canonical.href}`);
  }
  if (!openGraphMatch) errors.push(`${file}: Open-Graph-URL fehlt`);
  if (canonicalMatch && openGraphMatch && canonicalMatch[1] !== openGraphMatch[1]) errors.push(`${file}: Canonical und Open-Graph-URL weichen ab`);

  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = match[1];
    const target = new URL(href, site.origin);
    const pathname = target.pathname;
    if (pathname.startsWith("/assets/")) continue;
    if (pathname !== "/" && !pathname.includes(".") && !pathname.endsWith("/")) {
      errors.push(`${file}: interner Link ohne Slash ${href}`);
    }
    if (!pathname.includes(".") && !internalRoutes.has(normalizeInternalPath(pathname))) {
      errors.push(`${file}: internes Ziel ${href} fehlt im Build`);
    }
  }

  for (const match of html.matchAll(/(?:src|srcset)="(\/assets\/[^"]+)"/g)) {
    checkedAssets.add(match[1].slice(1));
  }
}

for (const htmlFile of await collectHtmlFiles()) {
  const html = await readFile(htmlFile, "utf8");
  if (/<meta\s+[^>]*http-equiv=["']?refresh["']?/i.test(html)) {
    errors.push(`${htmlFile}: Meta-Refresh ist nicht erlaubt`);
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

const frameSequences = {
  home: { desktop: 72, tablet: 54, mobile: 42 },
  skills: { desktop: 72, tablet: 54, mobile: 42 },
  archive: { desktop: 72, tablet: 54, mobile: 42 },
  portfolio: { desktop: 48, tablet: 36, mobile: 30 },
  analyzer: { desktop: 48, tablet: 36, mobile: 30 }
};

for (const [scene, counts] of Object.entries(frameSequences)) {
  for (const [format, expectedCount] of Object.entries(counts)) {
    const directory = `assets/media/frames/${scene}/${format}`;
    try {
      const frames = (await readdir(directory)).filter((file) => /^frame-\d{4}\.webp$/.test(file)).sort();
      if (frames.length !== expectedCount) errors.push(`${directory}: ${frames.length} statt ${expectedCount} Frames`);
      if (frames[0] !== "frame-0001.webp" || frames.at(-1) !== `frame-${String(expectedCount).padStart(4, "0")}.webp`) {
        errors.push(`${directory}: Frame-Nummerierung ist unvollständig`);
      }
      for (const frame of frames) {
        const details = await stat(join(directory, frame));
        if (!details.size) errors.push(`${directory}/${frame}: ist leer`);
      }
    } catch {
      errors.push(`${directory}: Frame-Sequenz fehlt`);
    }
  }
}

const siteCss = await readFile("assets/css/site.css", "utf8");
if (/background(?:-image)?\s*:[^;]*assets\/media\/system/i.test(siteCss)) {
  errors.push("assets/css/site.css: Szenenposter darf nicht zusätzlich als CSS-Hintergrund eingebunden sein");
}

const cname = (await readFile("CNAME", "utf8")).trim();
const canonicalHost = new URL(site.origin).hostname;
if (cname !== canonicalHost) errors.push(`Host-Konflikt: CNAME=${cname}, site.origin=${canonicalHost}`);

const sitemap = await readFile("sitemap.xml", "utf8");
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(match[1]);
  if (url.origin !== site.origin) errors.push(`Sitemap: falscher Host ${url.origin}`);
  if (url.pathname !== "/" && !url.pathname.endsWith("/")) errors.push(`Sitemap: URL ohne Slash ${url.href}`);
  if (url.pathname.includes(".html") || url.pathname.includes("/index.html")) errors.push(`Sitemap: nichtkanonische URL ${url.href}`);
}

const redirectFile = await readFile("_redirects", "utf8");
const redirects = new Map();
for (const [index, rawLine] of redirectFile.split("\n").entries()) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;
  const [source, target, status] = line.split(/\s+/);
  if (!source || !target) {
    errors.push(`_redirects:${index + 1}: unvollständige Regel`);
    continue;
  }
  if (redirects.has(source)) errors.push(`_redirects:${index + 1}: doppelte Quelle ${source}`);
  if (source === target) errors.push(`_redirects:${index + 1}: Selbstweiterleitung ${source}`);
  if (!target.includes(".") && normalizeInternalPath(target) !== target) errors.push(`_redirects:${index + 1}: Ziel ohne Slash ${target}`);
  if (status !== "301") errors.push(`_redirects:${index + 1}: Legacy-Redirect muss 301 sein`);
  redirects.set(source, target);
}

for (const source of redirects.keys()) {
  const seen = new Set();
  let current = source;
  let steps = 0;
  while (redirects.has(current)) {
    if (seen.has(current)) {
      errors.push(`Redirect-Zyklus ab ${source}`);
      break;
    }
    seen.add(current);
    current = redirects.get(current);
    steps += 1;
    if (steps > 1) {
      errors.push(`Redirect-Kette mit mehr als einer internen Stufe ab ${source}`);
      break;
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`${Object.keys(pages).length} HTML-Seiten geprüft: Routing, exklusive Medienzustände und 15 gerätespezifische Frame-Sequenzen sind konsistent.`);
