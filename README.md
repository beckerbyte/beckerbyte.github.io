# beckerbyte

**Privates, nichtkommerzielles Portfolio von Julian Becker**

[Website öffnen](https://www.beckerbyte.com/) · [Projekte ansehen](https://www.beckerbyte.com/projekte.html) · [Kontakt](mailto:kontakt@beckerbyte.com)

## Über das Projekt

beckerbyte dokumentiert meine Arbeit und Lernfortschritte in den Bereichen Webentwicklung, Systemintegration und Creative Tech. Die Website dient als persönliches Portfolio, Experimentierfläche und Ausgangspunkt für fachlichen Austausch sowie nichtkommerzielle Kooperationen.

## Schwerpunkte

- zugängliche und responsive Benutzeroberflächen
- wartbare Websites ohne unnötige Laufzeit-Abhängigkeiten
- wiederverwendbare Layouts und automatisierte Builds
- Datenschutz und sichere Grundeinstellungen

## Technik

| Bereich | Umsetzung |
| --- | --- |
| Oberfläche | HTML5, CSS3 und Vanilla JavaScript |
| Styling | Tailwind CSS, lokal kompiliert |
| Templates | Gemeinsame Header- und Footer-Partials |
| Build | Abhängigkeitsarmer Node.js-Build |
| Qualität | Reproduzierbarkeitsprüfung und Dependency-Audit über GitHub Actions |
| Bereitstellung | Statische Website über Cloudflare Pages |

Im Browser werden weder ein JavaScript-Framework noch Tailwind über ein externes CDN geladen.

## Lokal ausführen

Vorausgesetzt werden Node.js und npm.

```bash
git clone https://github.com/beckerbyte/beckerbyte.github.io.git
cd beckerbyte.github.io
npm ci
npm run build
```

Anschließend kann `index.html` über einen lokalen Webserver geöffnet werden.

### Verfügbare Befehle

```bash
npm run build       # CSS und HTML erzeugen
npm run build:css   # Tailwind CSS kompilieren
npm run build:html  # Seiten aus Templates generieren
npm run check       # Build ausführen und generierte Dateien prüfen
```

Nach Änderungen in `src/pages/`, `src/partials/` oder an den Tailwind-Klassen müssen die generierten Dateien gemeinsam mit den Quellen committed werden.

## Projektstruktur

```text
.
├── .github/workflows/   # Automatisierte Prüfungen
├── assets/
│   ├── css/
│   │   └── pages/       # Seitenspezifische Styles
│   ├── img/             # Bilder und Icons
│   └── js/              # Gemeinsame und seitenspezifische Skripte
├── scripts/
│   └── build.mjs        # HTML-Generator
├── src/
│   ├── pages/           # Seitenquellen
│   └── partials/        # Gemeinsamer Header und Footer
├── _headers             # Sicherheits-Header für Cloudflare Pages
├── index.html           # Generierte Startseite
├── package.json
└── README.md
```

## Sicherheit und Datenschutz

Die Website ist statisch und enthält kein eigenes Backend oder eine Datenbank. Zu den technischen Schutzmaßnahmen gehören:

- Content Security Policy und weitere Browser-Sicherheitsheader
- lokal erzeugtes CSS statt Tailwind Play CDN
- eingeschränkte GitHub-Actions-Berechtigungen
- fest angegebene Versionen beziehungsweise Commit-SHAs für Build-Abhängigkeiten
- automatisierte Build- und Schwachstellenprüfungen

Hinweise zur Verarbeitung von Kontaktdaten stehen in der [Datenschutzerklärung](https://www.beckerbyte.com/datenschutz.html).

## Kontakt

- E-Mail: [kontakt@beckerbyte.com](mailto:kontakt@beckerbyte.com)
- LinkedIn: [Julian Becker](https://www.linkedin.com/in/julian-becker-8125b42b7/)

---

Dieses Repository und die Website dienen privaten, nichtkommerziellen Zwecken.
