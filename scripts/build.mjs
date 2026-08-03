import { readFile, writeFile } from "node:fs/promises";

const pages = {
  "index.html": { active: "home" },
  "skills.html": { active: "skills" },
  "projekte.html": { active: "projects" },
  "impressum.html": { active: "imprint" },
  "datenschutz.html": { active: "privacy" }
};

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

const current = (active, page) => active === page ? ' aria-current="page"' : "";
const activeClass = (active, page) => active === page ? " is-active" : "";

for (const [file, page] of Object.entries(pages)) {
  const values = {
    BRAND_ACTIVE_CLASS: activeClass(page.active, "home"),
    BRAND_CURRENT: current(page.active, "home"),
    HOME_ACTIVE_CLASS: activeClass(page.active, "home"),
    HOME_CURRENT: current(page.active, "home"),
    SKILLS_ACTIVE_CLASS: activeClass(page.active, "skills"),
    SKILLS_CURRENT: current(page.active, "skills"),
    PROJECTS_ACTIVE_CLASS: activeClass(page.active, "projects"),
    PROJECTS_CURRENT: current(page.active, "projects"),
    MOBILE_SKILLS_ACTIVE_CLASS: activeClass(page.active, "skills"),
    MOBILE_SKILLS_CURRENT: current(page.active, "skills"),
    MOBILE_PROJECTS_ACTIVE_CLASS: activeClass(page.active, "projects"),
    MOBILE_PROJECTS_CURRENT: current(page.active, "projects"),
    FOOTER_HOME_CURRENT: current(page.active, "home"),
    FOOTER_SKILLS_CURRENT: current(page.active, "skills"),
    FOOTER_PROJECTS_CURRENT: current(page.active, "projects"),
    IMPRINT_CURRENT: current(page.active, "imprint"),
    PRIVACY_CURRENT: current(page.active, "privacy")
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
