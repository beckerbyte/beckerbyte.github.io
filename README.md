# beckerbyte

Privates, nichtkommerzielles Creative-Tech-Portfolio von Julian Becker.

[Website öffnen](https://www.beckerbyte.com/) · [Projekte ansehen](https://www.beckerbyte.com/projekte/) · [Kontakt](https://www.beckerbyte.com/kontakt/)

## Über das Projekt

beckerbyte dokumentiert reale Lern- und Freizeitprojekte in Webentwicklung, Systemintegration, Programmierung und Motion Design. Die mehrseitige Informationsarchitektur, die visuelle Systemwelt und alle Interaktionen funktionieren ohne externe Laufzeit-Frameworks.

## Technik

| Bereich | Umsetzung |
| --- | --- |
| Oberfläche | Semantisches HTML, CSS und Vanilla JavaScript |
| Bewegung | Exklusive Poster-/Video-/Frame-Zustände, Scrollsequenzen und leichtgewichtiges WebGL |
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

Die versionierten Frame-Sequenzen lassen sich reproduzierbar aus den gerätespezifischen lokalen Videos erzeugen:

```bash
./scripts/generate-frames.sh
```

Die kanonischen Routen werden als Verzeichnisse mit `index.html` erzeugt und enden mit einem Slash. Frühere `.html`-Adressen werden ausschließlich über die serverseitige `_redirects`-Konfiguration permanent weitergeleitet.

## Projektstruktur

```text
assets/css/site.css       globales Designsystem
assets/js/site.js         Navigation, Reveal, Fokusführung und Formularzustände
assets/js/media-controller.js exklusiver Medienzustand und Frame-Loader
assets/js/system-world.js progressive WebGL-Effektebene
assets/media/system/      responsive lokale Video- und Poster-Assets
assets/media/frames/      seiten- und gerätespezifische Scrollsequenzen
src/site-data.mjs         Fakten, Skills und Projekte
src/layout.mjs            gemeinsame Seitenstruktur
src/pages.mjs             Seitenausgaben
scripts/build.mjs         statischer Generator
scripts/generate-frames.sh reproduzierbare Frame-Erzeugung
scripts/check.mjs         Konsistenzprüfung
```

## Sicherheit und Datenschutz

Die Website ist statisch und enthält kein eigenes Backend oder Tracking. Das Kontaktformular wird über Forminit (ehemals Getform) übermittelt. Details stehen in der [Datenschutzerklärung](https://www.beckerbyte.com/datenschutz/).

## Kontakt

- E-Mail: [kontakt@beckerbyte.com](mailto:kontakt@beckerbyte.com)
- GitHub: [beckerbyte](https://github.com/beckerbyte)
- LinkedIn: [beckerbyte](https://www.linkedin.com/in/beckerbyte/)

Dieses Repository und die Website dienen privaten, nichtkommerziellen Zwecken.
