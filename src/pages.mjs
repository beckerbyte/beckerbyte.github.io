import { normalizeInternalPath, projects, site, skills, timeline, workPrinciples } from "./site-data.mjs";
import { action, breadcrumbs, layout, pageIntro, scene, tags } from "./layout.mjs";

const siteSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.owner,
  url: site.origin,
  email: `mailto:${site.email}`,
  sameAs: site.socials.map(({ href }) => href),
  knowsAbout: ["Webentwicklung", "Systemintegration", "Python", "Java", "SQL", "Arduino", "Motion Design"]
};

const projectModule = (project, featured = false) => `
  <article class="project-module${featured ? " project-module--featured" : ""}" data-reveal>
    <div class="project-module__media">
      ${scene(project.scene, `${project.title}: abstrakte Systemdarstellung`, { compact: true })}
      <span class="project-module__number">${project.index}</span>
      <span class="project-module__status">${project.status}</span>
    </div>
    <div class="project-module__body">
      <p class="eyebrow">${project.category}</p>
      <h3><a href="${normalizeInternalPath(`/projekte/${project.slug}`)}">${project.title}</a></h3>
      <p>${project.summary}</p>
      ${tags(project.tools.slice(0, featured ? 6 : 4))}
      <a class="text-link" href="${normalizeInternalPath(`/projekte/${project.slug}`)}">Fallstudie öffnen <span aria-hidden="true">→</span></a>
    </div>
  </article>`;

const home = layout({
  active: "home",
  title: "beckerbyte – Creative Tech Portfolio von Julian Becker",
  description: site.description,
  route: "/",
  sceneName: "home",
  schema: siteSchema,
  body: `
    <section class="home-hero frame-story" data-frame-story="home">
      <div class="hero-stage">
        ${scene("home", "Abstrakte vernetzte Systemwelt", { priority: true })}
        <div class="shell home-hero__inner">
          <div class="home-hero__signal" data-reveal>
            <span class="status-dot" aria-hidden="true"></span>
            Privates Portfolio · ${site.location}
          </div>
          <div class="home-hero__copy" data-reveal>
            <p class="eyebrow">Creative Tech · Web · Systeme</p>
            <h1>Ich verbinde<br><em>Code, Systeme</em><br>und Bewegung.</h1>
            <p class="lede">Ich bin Julian Becker. Diese Website dokumentiert, wie aus technischen Lernfeldern verständliche, visuelle und funktionierende Systeme werden.</p>
            <div class="button-row">
              ${action("/projekte/", "Projekte erkunden")}
              ${action("/profil/", "Profil ansehen", "secondary")}
            </div>
          </div>
          <div class="home-hero__legend">
            <span><b>01</b> Struktur</span><span><b>02</b> Logik</span><span><b>03</b> Bewegung</span>
          </div>
        </div>
        <a class="scroll-cue" href="#orientation"><span>System betreten</span><i aria-hidden="true"></i></a>
      </div>
    </section>

    <section class="orientation section" id="orientation">
      <div class="shell orientation__grid">
        <div class="section-heading" data-reveal>
          <p class="eyebrow">Orientierung / 01</p>
          <h2>Ein Portfolio als<br>verbundenes System.</h2>
        </div>
        <div class="orientation__copy" data-reveal>
          <p class="large-copy">Webentwicklung, Systemintegration, Programmierung und Motion Design stehen hier nicht nebeneinander. Sie beeinflussen sich.</p>
          <p>Die Seiten zeigen reale Lernwege, zwei veröffentlichte Projekte und die Werkzeuge dahinter – mit klaren Übergängen statt isolierter Themenkästen.</p>
        </div>
        <ol class="system-map">
          <li data-reveal><a href="/profil/"><span>01</span><strong>Profil</strong><small>Weg, Haltung, Erfahrung</small><i>→</i></a></li>
          <li data-reveal><a href="/skills/"><span>02</span><strong>Skills &amp; Erfahrung</strong><small>Felder, Tools, Verbindungen</small><i>→</i></a></li>
          <li data-reveal><a href="/projekte/"><span>03</span><strong>Projekte</strong><small>Reale Arbeiten im Detail</small><i>→</i></a></li>
          <li data-reveal><a href="/kontakt/"><span>04</span><strong>Kontakt</strong><small>Gedanken austauschen</small><i>→</i></a></li>
        </ol>
      </div>
    </section>

    <section class="section section--projects">
      <div class="shell">
        <div class="section-heading section-heading--split" data-reveal>
          <div><p class="eyebrow">Ausgewählte Projekte / 02</p><h2>Gebaut, geprüft,<br>weitergedacht.</h2></div>
          <p>Zwei reale Projekte. Keine Platzhalter, keine erfundenen Kundenarbeiten – dafür nachvollziehbare Ziele, Entscheidungen und Werkzeuge.</p>
        </div>
        <div class="project-stack">
          ${projects.map((project, index) => projectModule(project, index === 0)).join("\n")}
        </div>
        <div class="section-action" data-reveal>${action("/projekte/", "Projektarchiv öffnen", "secondary")}</div>
      </div>
    </section>

    <section class="section skill-signal">
      <div class="shell skill-signal__grid">
        <div data-reveal><p class="eyebrow">Arbeitsfelder / 03</p><h2>Von der Oberfläche bis zum physischen Signal.</h2></div>
        <div class="skill-signal__list">
          ${skills.map((skill) => `<a href="${normalizeInternalPath(`/skills/#${skill.id}`)}" data-reveal><span>${skill.index}</span><strong>${skill.title.replaceAll("&", "&amp;")}</strong><small>${skill.statement}</small><i aria-hidden="true">→</i></a>`).join("\n")}
        </div>
      </div>
    </section>

    <section class="contact-portal">
      ${scene("contact", "Abstraktes Signalportal für Kontakt", { compact: true })}
      <div class="shell contact-portal__inner" data-reveal>
        <p class="eyebrow">Offener Kanal / 04</p>
        <h2>Ein Gedanke,<br>ein Projekt oder<br>einfach Austausch?</h2>
        <p>Schreib mir direkt oder nutze das Kontaktformular. Ich freue mich über konkrete Fragen ebenso wie über fachlichen Austausch.</p>
        ${action("/kontakt/", "Kontakt aufnehmen")}
      </div>
    </section>`
});

const profile = layout({
  active: "profile",
  title: "Profil – Julian Becker | beckerbyte",
  description: "Profil, Lernweg und Arbeitsweise von Julian Becker: Systemintegration, Webentwicklung, Programmierung und Motion Design.",
  route: "/profil/",
  sceneName: "profile",
  schema: siteSchema,
  body: `
    ${pageIntro({ index: "01", kicker: "Profil · Julian Becker", title: "Technik verstehen.<br><em>Zusammenhänge bauen.</em>", copy: "Mein Weg verbindet Systemintegration mit Webentwicklung, Code, Daten und visueller Bewegung. Nicht als fertige Schubladen, sondern als fortlaufendes Lernsystem.", sceneName: "profile", sceneLabel: "Räumliche Darstellung eines wachsenden technischen Systems" })}
    <section class="section profile-intro">
      <div class="shell profile-intro__grid">
        <div data-reveal><p class="eyebrow">Position / 01</p><h2>Zwischen Infrastruktur und Interface.</h2></div>
        <div class="prose-large" data-reveal>
          <p>Ich bin Julian Becker aus Hockenheim. Mich interessiert, wie technische Ebenen ineinandergreifen: Was passiert unter einer Oberfläche? Wie werden Daten verständlich? Wann hilft Bewegung beim Erklären?</p>
          <p>Seit 2025 führt mich eine Umschulung zum Fachinformatiker für Systemintegration tiefer in Infrastruktur, Netzwerke und Abläufe. Parallel entwickle ich eigene Web- und Python-Projekte weiter.</p>
        </div>
      </div>
    </section>
    <section class="section timeline-section">
      <div class="shell">
        <div class="section-heading section-heading--split" data-reveal><div><p class="eyebrow">Entwicklung / 02</p><h2>Der Weg durch<br>die Ebenen.</h2></div><p>Jeder Abschnitt erweitert das System um einen neuen Blickwinkel.</p></div>
        <ol class="timeline">
          ${timeline.map((item) => `<li id="jahr-${item.year.toLowerCase()}" data-reveal><div class="timeline__year">${item.year}</div><div class="timeline__body"><h3>${item.title}</h3><p>${item.copy}</p>${tags(item.tags)}</div></li>`).join("\n")}
        </ol>
      </div>
    </section>
    <section class="section principles">
      <div class="shell principles__grid">
        <div class="principles__sticky" data-reveal><p class="eyebrow">Arbeitsweise / 03</p><h2>Wie ich an Technik herangehe.</h2><p>Ein paar Regeln, die sich durch meine Projekte und Lernschritte ziehen.</p></div>
        <ol>
          ${workPrinciples.map((item) => `<li data-reveal><span>${item.index}</span><div><h3>${item.title}</h3><p>${item.copy}</p></div></li>`).join("\n")}
        </ol>
      </div>
    </section>
    <section class="next-chapter"><div class="shell" data-reveal><p class="eyebrow">Nächste Ebene</p><h2>Die Felder hinter dem Weg.</h2>${action("/skills/", "Skills & Erfahrung öffnen")}</div></section>`
});

const skillsPage = layout({
  active: "skills",
  title: "Skills & Erfahrung – beckerbyte",
  description: "Skills und Erfahrung von Julian Becker in Webentwicklung, Systemintegration, Python, Java, SQL, Arduino und Motion Design.",
  route: "/skills/",
  sceneName: "skills",
  body: `
    ${pageIntro({ index: "02", kicker: "Skills & Erfahrung", title: "Fünf Felder.<br><em>Ein technisches System.</em>", copy: "Werkzeuge werden interessant, wenn sie eine Aufgabe lösen und sich mit anderen Ebenen verbinden. Diese Übersicht zeigt den aktuellen Stand – nicht ein erfundenes Expertenprofil.", sceneName: "skills", sceneLabel: "Fünf vernetzte technische Module" })}
    <section class="section skills-system">
      <div class="shell">
        <div class="skills-system__legend" data-reveal><span>Feld</span><span>Fokus</span><span>Werkzeuge</span><span>Verbindung</span></div>
        <ol>
          ${skills.map((skill) => `<li id="${skill.id}" data-reveal>
            <span class="skill-index">${skill.index}</span>
            <div class="skill-title"><p class="eyebrow">${skill.title.replaceAll("&", "&amp;")}</p><h2>${skill.statement}</h2></div>
            <p class="skill-copy">${skill.copy}</p>
            ${tags(skill.tools)}
            <a class="skill-project" href="${skill.projectHref}">Passende Projekte <span aria-hidden="true">→</span></a>
          </li>`).join("\n")}
        </ol>
      </div>
    </section>
    <section class="section connection-section">
      <div class="shell connection-section__grid">
        <div data-reveal><p class="eyebrow">Verbindungen / 06</p><h2>Die Übergänge sind der eigentliche Skill.</h2></div>
        <div class="connection-lines" data-reveal>
          <p><span>HTML + CSS</span><i></i><span>sichtbare Struktur</span></p>
          <p><span>Python + Daten</span><i></i><span>überprüfbare Logik</span></p>
          <p><span>Netzwerk + Prozess</span><i></i><span>stabile Abläufe</span></p>
          <p><span>Motion + Interface</span><i></i><span>verständliche Zustände</span></p>
        </div>
      </div>
    </section>
    <section class="next-chapter"><div class="shell" data-reveal><p class="eyebrow">In Anwendung</p><h2>Wo die Werkzeuge zusammenkommen.</h2>${action("/projekte/", "Projekte ansehen")}</div></section>`
});

const projectsPage = layout({
  active: "projects",
  title: "Projekte – beckerbyte",
  description: "Projektarchiv von beckerbyte mit dem Portfolio und Text Analyzer Pro – inklusive Zielen, Vorgehen, Funktionen und Technologien.",
  route: "/projekte/",
  sceneName: "archive",
  body: `
    ${pageIntro({ index: "03", kicker: "Projektarchiv", title: "Reale Arbeit.<br><em>Offen dokumentiert.</em>", copy: "Dieses Archiv zeigt ausschließlich veröffentlichte eigene Projekte. Jede Fallstudie beschreibt den tatsächlichen Stand, die verwendeten Werkzeuge und die Entscheidungen dahinter.", sceneName: "archive", sceneLabel: "Abstraktes Archiv mit zwei aktiven Projektmodulen" })}
    <section class="section archive-intro"><div class="shell section-heading section-heading--split" data-reveal><div><p class="eyebrow">Archiv / 02 Einträge</p><h2>Zwei Projekte,<br>zwei Blickwinkel.</h2></div><p>Eine Website als wachsendes System. Eine Python-Anwendung für sichtbare Textdaten.</p></div></section>
    <section class="archive-projects"><div class="shell project-stack">${projects.map((project, index) => projectModule(project, index === 0)).join("\n")}</div></section>
    <section class="section archive-note"><div class="shell archive-note__inner" data-reveal><span>Hinweis</span><p>Das Portfolio dokumentiert Lern- und Freizeitprojekte. Es werden keine Kundenreferenzen oder entgeltlichen Leistungen dargestellt.</p>${action("/kontakt/", "Fachlich austauschen", "secondary")}</div></section>`
});

const projectDetail = (project) => layout({
  active: "projects",
  title: `${project.title} – Projekt | beckerbyte`,
  description: project.summary,
  route: normalizeInternalPath(`/projekte/${project.slug}`),
  sceneName: project.scene,
  schema: {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.summary,
    author: { "@type": "Person", name: site.owner },
    codeRepository: project.repo,
    url: `${site.origin}${normalizeInternalPath(`/projekte/${project.slug}`)}`
  },
  body: `
    <section class="project-hero frame-story" data-frame-story="${project.scene}">
      <div class="hero-stage">
        ${scene(project.scene, `${project.title}: räumliche Projektdarstellung`, { priority: true })}
        <div class="shell project-hero__inner">
          ${breadcrumbs([{ label: "Start", href: "/" }, { label: "Projekte", href: "/projekte/" }, { label: project.title }])}
          <div class="project-hero__copy" data-reveal>
            <p class="eyebrow">${project.category} · ${project.status}</p>
            <h1>${project.title}</h1>
            <p class="lede">${project.summary}</p>
            ${tags(project.tools)}
          </div>
          <span class="project-hero__number" aria-hidden="true">${project.index}</span>
        </div>
      </div>
    </section>
    <section class="section case-study">
      <div class="shell case-study__grid">
        <aside data-reveal><p class="eyebrow">Projektindex</p><nav aria-label="Fallstudienabschnitte"><a href="#ziel">01 · Ziel</a><a href="#vorgehen">02 · Vorgehen</a><a href="#funktionen">03 · Funktionen</a><a href="#zugang">04 · Zugang</a></nav></aside>
        <div class="case-study__content">
          <section id="ziel" data-reveal><span>01</span><p class="eyebrow">Ziel</p><h2>Worum es ging.</h2><p>${project.goal}</p></section>
          <section id="vorgehen" data-reveal><span>02</span><p class="eyebrow">Vorgehen</p><h2>Wie das System aufgebaut ist.</h2><p>${project.approach}</p></section>
          <section id="funktionen" data-reveal><span>03</span><p class="eyebrow">Funktionen</p><h2>Was tatsächlich enthalten ist.</h2><ol class="feature-list">${project.features.map((feature, index) => `<li><b>${String(index + 1).padStart(2, "0")}</b><span>${feature}</span></li>`).join("")}</ol></section>
          <section id="zugang" data-reveal><span>04</span><p class="eyebrow">Zugang</p><h2>Code und Ergebnis.</h2><div class="button-row">${action(project.repo, "Repository öffnen", "primary", true)}${project.live ? action(project.live, "Live ansehen", "secondary", true) : ""}${project.download ? action(project.download, "Download", "secondary", true) : ""}</div><p class="case-study__note">Externe Links öffnen GitHub beziehungsweise die veröffentlichte Website.</p></section>
        </div>
      </div>
    </section>
    <section class="project-next"><div class="shell" data-reveal><p class="eyebrow">Weiter im Archiv</p><h2>${projects.find((item) => item.slug !== project.slug).title}</h2>${action(normalizeInternalPath(`/projekte/${projects.find((item) => item.slug !== project.slug).slug}`), "Nächste Fallstudie")}</div></section>`
});

const contact = layout({
  active: "contact",
  title: "Kontakt – beckerbyte",
  description: "Kontakt zu Julian Becker über E-Mail, Formular, GitHub, LinkedIn oder Discord.",
  route: "/kontakt/",
  sceneName: "contact",
  body: `
    ${pageIntro({ index: "04", kicker: "Kontakt", title: "Ein offener Kanal<br><em>für gute Fragen.</em>", copy: "Du möchtest dich über Technik, ein Projekt oder einen Lernweg austauschen? Schreib mir über das Formular oder direkt per E-Mail.", sceneName: "contact", sceneLabel: "Abstraktes Portal für einen offenen Kommunikationskanal" })}
    <section class="section contact-section">
      <div class="shell contact-section__grid">
        <div class="contact-details" data-reveal>
          <p class="eyebrow">Direkter Kontakt / 01</p>
          <h2>So erreichst du mich.</h2>
          <a class="contact-mail" href="mailto:${site.email}">${site.email} <span aria-hidden="true">↗</span></a>
          <p>Für technische Fragen, Feedback zu den Projekten oder fachlichen Austausch.</p>
          <div class="contact-socials">${site.socials.map((item) => `<a href="${item.href}" target="_blank" rel="noopener noreferrer"><span>${item.label}</span><i aria-hidden="true">↗</i></a>`).join("\n")}</div>
        </div>
        <form class="contact-form" action="https://getform.io/f/bgdlryza" method="post" accept-charset="UTF-8" data-contact-form data-reveal>
          <div class="form-heading"><p class="eyebrow">Nachricht / 02</p><h2>Was möchtest du besprechen?</h2></div>
          <div class="form-row">
            <label><span>Name</span><input type="text" name="name" autocomplete="name" required maxlength="100"><small>Wie darf ich dich ansprechen?</small></label>
            <label><span>E-Mail</span><input type="email" name="email" autocomplete="email" required maxlength="200"><small>Für meine Antwort.</small></label>
          </div>
          <label><span>Betreff</span><input type="text" name="subject" required maxlength="160"></label>
          <label><span>Nachricht</span><textarea name="message" rows="8" required maxlength="5000"></textarea><small><span data-character-count>0</span> / 5000 Zeichen</small></label>
          <label class="honeypot" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
          <input type="hidden" name="_gotcha" value="">
          <div class="form-consent">
            <input id="privacy-consent" type="checkbox" name="privacy-consent" required>
            <label for="privacy-consent">Ich habe die <a href="/datenschutz/">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Angaben zur Beantwortung der Anfrage zu.</label>
          </div>
          <div class="form-submit"><button class="button button--primary" type="submit">Nachricht senden <span aria-hidden="true">↗</span></button><p role="status" aria-live="polite" data-form-status>Alle Pflichtfelder sind markiert.</p></div>
        </form>
      </div>
    </section>`
});

const legalIntro = (title, copy) => `<section class="legal-hero"><div class="shell">${breadcrumbs([{ label: "Start", href: "/" }, { label: title }])}<p class="eyebrow">Rechtliches</p><h1>${title}</h1><p class="lede">${copy}</p></div></section>`;

const imprint = layout({
  active: "imprint", title: "Anbieterhinweis – beckerbyte", description: "Anbieterhinweis zur privaten, nichtkommerziellen Portfolio-Website beckerbyte.", route: "/impressum/", sceneName: "legal", noindex: true,
  body: `${legalIntro("Anbieterhinweis", "Kontakt und Angaben zur privaten Portfolio-Website beckerbyte.")}<section class="legal-layout"><div class="shell legal-layout__grid"><aside>${scene("legal", "Ruhige abstrakte Systemstruktur", { compact: true })}</aside><article class="legal-copy">
    <div class="legal-lead"><p>beckerbyte ist eine private, nichtkommerzielle Portfolio-Website. Sie dient der Dokumentation eigener Lern- und Freizeitprojekte sowie dem fachlichen Austausch. Über diese Website werden keine entgeltlichen Leistungen angeboten oder vermittelt.</p></div>
    <section><span>01</span><p class="eyebrow">Verantwortlich</p><h2>Julian Becker</h2><p>Kontakt: <a href="mailto:kontakt@beckerbyte.com">kontakt@beckerbyte.com</a></p></section>
    <section><span>02</span><p class="eyebrow">Hinweis</p><h2>Nichtkommerzieller Betrieb</h2><p>Diese Seite ist kein geschäftsmäßiges Angebot im Sinne eines auf Dauer angelegten entgeltlichen digitalen Dienstes. Sollte sich die Nutzung künftig ändern, werden die Anbieterangaben vor Aufnahme einer kommerziellen Tätigkeit entsprechend ergänzt.</p></section>
    <div class="legal-next"><p>Weitere rechtliche Informationen:</p>${action("/datenschutz/", "Datenschutz", "secondary")}</div>
  </article></div></section>`
});

const privacy = layout({
  active: "privacy", title: "Datenschutzerklärung – beckerbyte", description: "Datenschutzerklärung von beckerbyte.", route: "/datenschutz/", sceneName: "legal", noindex: true,
  body: `${legalIntro("Datenschutz", "Informationen zur Verarbeitung personenbezogener Daten auf beckerbyte.")}<section class="legal-layout"><div class="shell legal-layout__grid"><aside>${scene("legal", "Ruhige abstrakte Systemstruktur", { compact: true })}</aside><article class="legal-copy">
    <div class="legal-lead"><p>Diese private, nichtkommerzielle Website verarbeitet personenbezogene Daten nur, soweit dies für die technische Bereitstellung, Sicherheit und Beantwortung von Kontaktanfragen erforderlich ist. Es findet keine eigene Reichweitenanalyse und keine werbliche Profilbildung statt.</p></div>
    <section><span>01</span><p class="eyebrow">01</p><h2>Verantwortlicher</h2><p>Julian Becker<br>E-Mail: <a href="mailto:kontakt@beckerbyte.com">kontakt@beckerbyte.com</a></p></section>
    <section><span>02</span><p class="eyebrow">02</p><h2>Hosting und Auslieferung</h2><p>Die Website wird mit GitHub Pages bereitgestellt und über Cloudflare ausgeliefert. Beim Aufruf können insbesondere IP-Adresse, Datum und Uhrzeit, angeforderte Adresse, Referrer sowie Browser- und Geräteinformationen in technischen Protokollen verarbeitet werden. Dies dient der sicheren, stabilen und schnellen Bereitstellung der Website. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt in Betrieb, Sicherheit und Fehleranalyse.</p><p class="legal-links"><a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">Datenschutz bei GitHub ↗</a><a href="https://www.cloudflare.com/de-de/privacypolicy/" target="_blank" rel="noopener noreferrer">Datenschutz bei Cloudflare ↗</a></p></section>
    <section><span>03</span><p class="eyebrow">03</p><h2>Kontaktformular über Forminit</h2><p>Das Kontaktformular wird über Forminit, ehemals Getform, bereitgestellt. Anbieter ist UXPLUS LTD, 86–90 Paul Street, 3rd Floor, London EC2A 4NE, Vereinigtes Königreich. Beim Absenden werden Name, E-Mail-Adresse, Nachricht und technisch erforderliche Verbindungsdaten an Forminit übermittelt und dort im Auftrag des Websitebetreibers verarbeitet. Zweck ist ausschließlich die Bearbeitung der Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt in einer zuverlässigen Kontaktmöglichkeit und der Abwehr von Missbrauch. Die Daten werden gelöscht, sobald die Anfrage abschließend bearbeitet wurde und keine gesetzlichen Aufbewahrungspflichten entgegenstehen; zusätzlich gelten die im Forminit-Konto konfigurierten Speicherfristen.</p><p>Für das Vereinigte Königreich besteht ein Angemessenheitsbeschluss der Europäischen Kommission. Weitere Informationen: <a href="https://forminit.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von Forminit</a>.</p></section>
    <section><span>04</span><p class="eyebrow">04</p><h2>Kontakt per E-Mail</h2><p>Bei einer Kontaktaufnahme per E-Mail werden die mitgeteilten Daten zur Bearbeitung der Anfrage verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die Daten werden gelöscht, sobald die Anfrage abschließend bearbeitet wurde und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p></section>
    <section><span>05</span><p class="eyebrow">05</p><h2>Lokale Ressourcen</h2><p>Stylesheets, Skripte, Schriftdefinitionen und Bilder werden lokal über die eigene Website ausgeliefert. Beim Seitenaufruf wird hierfür keine zusätzliche Verbindung zu einem externen Content-Delivery-Netzwerk hergestellt.</p></section>
    <section><span>06</span><p class="eyebrow">06</p><h2>Cookies und Analyse</h2><p>Die Website setzt selbst keine Tracking- oder Werbe-Cookies ein. Eine eigene Reichweitenanalyse oder Erstellung personenbezogener Nutzungsprofile findet nicht statt. Technisch notwendige Sicherheits- und Netzwerkfunktionen der genannten Dienstleister bleiben hiervon unberührt.</p></section>
    <section><span>07</span><p class="eyebrow">07</p><h2>Rechte betroffener Personen</h2><p>Betroffene Personen haben nach Maßgabe der gesetzlichen Voraussetzungen insbesondere Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Zudem besteht ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde. Zur Ausübung der Rechte genügt eine Nachricht an die oben genannte E-Mail-Adresse.</p></section>
    <section><span>→</span><p class="eyebrow">Stand</p><p>23. Juli 2026</p></section>
    <div class="legal-next"><p>Weitere Angaben zum Betreiber:</p>${action("/impressum/", "Anbieterhinweis", "secondary")}</div>
  </article></div></section>`
});

const notFound = layout({
  active: "notfound", title: "404 – Seite nicht gefunden | beckerbyte", description: "Die angeforderte Seite wurde nicht gefunden.", route: "/404/", sceneName: "notfound", noindex: true,
  body: `<section class="not-found">${scene("notfound", "Unterbrochene abstrakte Systemverbindung", { priority: true })}<div class="shell not-found__inner"><p class="eyebrow">Fehlercode / 404</p><h1>Diese Verbindung<br><em>endet hier.</em></h1><p>Die angeforderte Adresse existiert nicht oder wurde verschoben. Über die Startseite findest du zurück ins System.</p><div class="button-row">${action("/", "Zur Startseite")}${action("/skills/", "Skills öffnen", "secondary")}${action("/projekte/", "Projekte öffnen", "secondary")}${action("/kontakt/", "Kontakt", "secondary")}</div></div></section>`
});

export const pages = {
  "index.html": home,
  "profil/index.html": profile,
  "skills/index.html": skillsPage,
  "projekte/index.html": projectsPage,
  ...Object.fromEntries(projects.map((project) => [`projekte/${project.slug}/index.html`, projectDetail(project)])),
  "kontakt/index.html": contact,
  "impressum/index.html": imprint,
  "datenschutz/index.html": privacy,
  "404/index.html": notFound,
  "404.html": notFound
};
