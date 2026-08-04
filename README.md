# beckerbyte

Privates, nichtkommerzielles Creative-Tech-Portfolio von Julian Becker.

[Website öffnen](https://www.beckerbyte.com/) · [Projekte ansehen](https://www.beckerbyte.com/projekte) · [Kontakt](https://www.beckerbyte.com/kontakt)

## Über das Projekt

beckerbyte dokumentiert reale Lern- und Freizeitprojekte in Webentwicklung, Systemintegration, Programmierung und Motion Design. Die mehrseitige Informationsarchitektur, die visuelle Systemwelt und alle Interaktionen funktionieren ohne externe Laufzeit-Frameworks.

## Technik

| Bereich | Umsetzung |
| --- | --- |
| Oberfläche | Semantisches HTML, CSS und Vanilla JavaScript |
| Bewegung | Progressive Video-Layer und leichtgewichtiges WebGL |
| Build | Abhängigkeitsfreier Node.js-Generator |
| Qualität | Struktur-, Link- und Build-Checks |
| Bereitstellung | Statische Website über GitHub Pages und Cloudflare |

## Lokal ausführen

Vorausgesetzt werden Node.js und npm.

```bash
npm ci
npm run build
npm run check
```

Die kanonischen Routen werden als Verzeichnisse mit `index.html` erzeugt. Frühere `.html`-Adressen bleiben als clientseitige Fallback-Weiterleitungen bestehen.

## Projektstruktur

```text
assets/css/site.css       globales Designsystem
assets/js/site.js         Navigation, Reveal, Videos und Formularzustände
assets/js/system-world.js progressive WebGL-Systemwelt
assets/media/system/      responsive lokale Video- und Poster-Assets
src/site-data.mjs         Fakten, Skills und Projekte
src/layout.mjs            gemeinsame Seitenstruktur
src/pages.mjs             Seitenausgaben
scripts/build.mjs         statischer Generator
scripts/check.mjs         Konsistenzprüfung
```

## Sicherheit und Datenschutz

Die Website ist statisch und enthält kein eigenes Backend oder Tracking. Das Kontaktformular wird über Forminit (ehemals Getform) übermittelt. Details stehen in der [Datenschutzerklärung](https://www.beckerbyte.com/datenschutz).

## Kontakt

- E-Mail: [kontakt@beckerbyte.com](mailto:kontakt@beckerbyte.com)
- GitHub: [beckerbyte](https://github.com/beckerbyte)
- LinkedIn: [beckerbyte](https://www.linkedin.com/in/beckerbyte/)

Dieses Repository und die Website dienen privaten, nichtkommerziellen Zwecken.
