import { readFile, writeFile } from "node:fs/promises";

const pages = {
  "index.html": {
    brandHref: "#home",
    primaryHref: "#about",
    primaryLabel: "Profil",
    contactHref: "#contact",
    active: "home"
  },
  "skills.html": {
    brandHref: "index.html",
    primaryHref: "index.html",
    primaryLabel: "Home",
    contactHref: "index.html#contact",
    active: "skills"
  },
  "projekte.html": {
    brandHref: "index.html",
    primaryHref: "index.html",
    primaryLabel: "Home",
    contactHref: "index.html#contact",
    active: "projects"
  },
  "impressum.html": {
    brandHref: "index.html",
    primaryHref: "index.html",
    primaryLabel: "Home",
    contactHref: "index.html#contact",
    active: "imprint"
  },
  "datenschutz.html": {
    brandHref: "index.html",
    primaryHref: "index.html",
    primaryLabel: "Home",
    contactHref: "index.html#contact",
    active: "privacy"
  }
};

const activeClass = "rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white";
const idleClass = "rounded-full px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white";
const mobileActiveClass = "block rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white";
const mobileIdleClass = "block rounded-xl px-4 py-3 text-sm text-zinc-200 hover:bg-white/5";

const [headerTemplate, footerTemplate] = await Promise.all([
  readFile("src/partials/header.html", "utf8"),
  readFile("src/partials/footer.html", "utf8")
]);

const replaceTokens = (template, values) =>
  template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!(key in values)) {
      throw new Error(`Unbekannter Template-Platzhalter: ${key}`);
    }
    return values[key];
  });

for (const [file, page] of Object.entries(pages)) {
  const values = {
    BRAND_HREF: page.brandHref,
    PRIMARY_HREF: page.primaryHref,
    PRIMARY_LABEL: page.primaryLabel,
    CONTACT_HREF: page.contactHref,
    SKILLS_CLASS: page.active === "skills" ? activeClass : idleClass,
    SKILLS_CURRENT: page.active === "skills" ? ' aria-current="page"' : "",
    PROJECTS_CLASS: page.active === "projects" ? activeClass : idleClass,
    PROJECTS_CURRENT: page.active === "projects" ? ' aria-current="page"' : "",
    MOBILE_SKILLS_CLASS: page.active === "skills" ? mobileActiveClass : mobileIdleClass,
    MOBILE_SKILLS_CURRENT: page.active === "skills" ? ' aria-current="page"' : "",
    MOBILE_PROJECTS_CLASS: page.active === "projects" ? mobileActiveClass : mobileIdleClass,
    MOBILE_PROJECTS_CURRENT: page.active === "projects" ? ' aria-current="page"' : "",
    IMPRINT_CLASS: page.active === "imprint" ? "text-white" : "transition hover:text-white",
    IMPRINT_CURRENT: page.active === "imprint" ? ' aria-current="page"' : "",
    PRIVACY_CLASS: page.active === "privacy" ? "text-white" : "transition hover:text-white",
    PRIVACY_CURRENT: page.active === "privacy" ? ' aria-current="page"' : ""
  };

  const [pageTemplate, header, footer] = await Promise.all([
    readFile(`src/pages/${file}`, "utf8"),
    Promise.resolve(replaceTokens(headerTemplate, values)),
    Promise.resolve(replaceTokens(footerTemplate, values))
  ]);

  const output = pageTemplate
    .replace("  {{HEADER}}", header.trimEnd())
    .replace("  {{FOOTER}}", footer.trimEnd());

  if (output.includes("{{")) {
    throw new Error(`Nicht aufgelöster Platzhalter in ${file}`);
  }

  await writeFile(file, output);
}
