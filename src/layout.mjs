import { nav, normalizeInternalPath, site } from "./site-data.mjs";

const arrow = '<span aria-hidden="true">↗</span>';
const assetVersion = "__ASSET_VERSION__";
const versionedAsset = (path) => `${path}?v=${assetVersion}`;

export const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const current = (active, key) => active === key ? ' aria-current="page"' : "";

const navigation = (active, className = "site-nav", label = "Hauptnavigation") => `
  <nav class="${className}" aria-label="${label}">
    ${nav.map((item) => `<a href="${item.href}"${current(active, item.key)}>${escapeHtml(item.label)}</a>`).join("\n    ")}
  </nav>`;

export const header = (active) => `
  <header class="site-header" data-site-header>
    <div class="site-header__inner shell">
      <a class="brand" href="/" aria-label="beckerbyte – Startseite"${current(active, "home")}>
        <img src="/assets/img/header.png" width="411" height="71" alt="beckerbyte">
      </a>
      ${navigation(active)}
      <a class="header-contact" href="/kontakt/">Projekt besprechen ${arrow}</a>
      <details class="mobile-nav" data-mobile-nav>
        <summary aria-label="Navigation öffnen"><span>Menü</span><i aria-hidden="true"></i></summary>
        <div class="mobile-nav__panel">
          ${navigation(active, "mobile-nav__links", "Mobile Hauptnavigation")}
          <div class="mobile-nav__meta">
            ${site.socials.map((item) => `<a href="${item.href}" target="_blank" rel="noopener noreferrer">${item.label} ${arrow}</a>`).join("\n            ")}
            <a href="/impressum/">Impressum</a>
            <a href="/datenschutz/">Datenschutz</a>
          </div>
        </div>
      </details>
    </div>
  </header>`;

export const footer = () => `
  <footer class="site-footer">
    <div class="shell">
      <div class="site-footer__lead">
        <p class="eyebrow">Nächster Knotenpunkt</p>
        <a class="site-footer__mail" href="mailto:${site.email}">${site.email} ${arrow}</a>
      </div>
      <div class="site-footer__grid">
        <div>
          <img src="/assets/img/header.png" width="411" height="71" alt="beckerbyte">
          <p>Privates Creative-Tech-Portfolio von ${site.owner}.</p>
        </div>
        <nav aria-label="Seitennavigation">
          ${nav.map((item) => `<a href="${item.href}">${escapeHtml(item.label)}</a>`).join("\n          ")}
        </nav>
        <nav aria-label="Externe Profile">
          ${site.socials.map((item) => `<a href="${item.href}" target="_blank" rel="noopener noreferrer">${item.label} ${arrow}</a>`).join("\n          ")}
        </nav>
        <nav aria-label="Rechtliches">
          <a href="/impressum/">Impressum</a>
          <a href="/datenschutz/">Datenschutz</a>
        </nav>
      </div>
      <div class="site-footer__bottom">
        <span>© <span data-current-year>2026</span> ${site.owner}</span>
        <span>${site.location} · gebaut als lernendes System</span>
      </div>
    </div>
  </footer>`;

export const breadcrumbs = (items) => `
  <nav class="breadcrumbs" aria-label="Brotkrümelnavigation">
    <ol>
      ${items.map((item, index) => `<li>${item.href && index < items.length - 1 ? `<a href="${normalizeInternalPath(item.href)}">${escapeHtml(item.label)}</a>` : `<span${index === items.length - 1 ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</span>`}</li>`).join("\n      ")}
    </ol>
  </nav>`;

export const scene = (name, label, options = {}) => {
  const { compact = false, priority = false, frameSequence = true } = options;
  const mediaRoot = `/assets/media/system/${name}/${name}`;
  const frameSequences = {
    home: [72, 54, 42],
    skills: [72, 54, 42],
    archive: [72, 54, 42],
    portfolio: [48, 36, 30],
    analyzer: [48, 36, 30]
  };
  const frames = compact || !frameSequence ? null : frameSequences[name];
  return `
    <div class="system-scene${compact ? " system-scene--compact" : ""}" data-scene="${name}" data-media-state="poster" data-preferred-media="${frames ? "frames" : "video"}"${frames ? ` data-frame-root="/assets/media/frames/${name}" data-frame-count-desktop="${frames[0]}" data-frame-count-tablet="${frames[1]}" data-frame-count-mobile="${frames[2]}"` : ""} aria-hidden="true">
      <picture class="system-scene__poster" data-media-layer="poster">
        <source media="(max-width: 47.99rem)" srcset="${mediaRoot}-mobile-poster.webp">
        <source media="(max-width: 74.99rem)" srcset="${mediaRoot}-tablet-poster.webp">
        <img src="${mediaRoot}-desktop-poster.webp" alt="" width="1920" height="1080"${priority ? ' fetchpriority="high"' : ' loading="lazy"'}>
      </picture>
      <video class="system-scene__video" muted loop playsinline preload="none" tabindex="-1" data-media-layer="video" data-atmosphere="${name}" aria-hidden="true"></video>
      ${frames ? '<canvas class="system-scene__frames" data-media-layer="frames" aria-hidden="true"></canvas>' : ''}
      <canvas class="system-scene__canvas system-scene__effects" data-media-layer="effects" data-system-world="${name}" aria-hidden="true"></canvas>
      <div class="system-scene__veil"></div>
    </div>`;
};

export const action = (href, label, variant = "primary", external = false) => `
  <a class="button button--${variant}" href="${normalizeInternalPath(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(label)} ${arrow}</a>`;

export const tags = (items) => `<ul class="tag-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

export const pageIntro = ({ index, kicker, title, copy, sceneName, sceneLabel }) => `
  <section class="page-hero${["skills", "archive"].includes(sceneName) ? " frame-story" : ""}"${["skills", "archive"].includes(sceneName) ? ` data-frame-story="${sceneName}"` : ""}>
    <div class="hero-stage">
      ${scene(sceneName, sceneLabel, { priority: true })}
      <div class="shell page-hero__inner">
        <div class="page-index" aria-hidden="true">${index}</div>
        <div class="page-hero__copy" data-reveal>
          <p class="eyebrow">${escapeHtml(kicker)}</p>
          <h1>${title}</h1>
          <p class="lede">${escapeHtml(copy)}</p>
        </div>
      </div>
    </div>
  </section>`;

const structuredData = (data) => data ? `\n  <script type="application/ld+json">${JSON.stringify(data)}</script>` : "";

export const layout = ({ active, title, description, route, sceneName, body, noindex = false, schema = null }) => {
  const canonical = `${site.origin}${normalizeInternalPath(route)}`;
  const mediaRoot = `${site.origin}/assets/media/system/${sceneName}/${sceneName}-desktop-poster.webp`;
  return `<!DOCTYPE html>
<html lang="de" data-motion="pending">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="de_DE">
  <meta property="og:site_name" content="beckerbyte">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${mediaRoot}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#070a0f">
  <link rel="icon" href="/assets/img/favicon-v2.png" type="image/png">
  <link rel="preload" href="/assets/img/header.png" as="image">
  <link rel="stylesheet" href="${versionedAsset("/assets/css/site.css")}">
  <script type="module" src="${versionedAsset("/assets/js/media-controller.js")}"></script>
  <script type="module" src="${versionedAsset("/assets/js/site.js")}"></script>
  <script type="module" src="${versionedAsset("/assets/js/system-world.js")}"></script>${structuredData(schema)}
</head>
<body data-page="${active}" data-scene="${sceneName}">
  <a class="skip-link" href="#main">Zum Inhalt springen</a>
  ${header(active)}
  <main id="main">${body}</main>
  ${footer()}
  <div class="page-transition" aria-hidden="true"></div>
</body>
</html>\n`;
};
