export const site = {
  name: "beckerbyte",
  owner: "Julian Becker",
  origin: "https://www.beckerbyte.com",
  email: "kontakt@beckerbyte.com",
  location: "Hockenheim",
  description: "Privates Creative-Tech-Portfolio von Julian Becker: Webentwicklung, Systemintegration, Programmierung und Motion Design als zusammenhängendes Lernsystem.",
  socials: [
    { label: "GitHub", href: "https://github.com/beckerbyte" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/beckerbyte/" },
    { label: "Discord", href: "https://discord.com/users/270226761256534027" }
  ]
};

export const nav = [
  { key: "profile", label: "Profil", href: "/profil" },
  { key: "skills", label: "Skills & Erfahrung", href: "/skills" },
  { key: "projects", label: "Projekte", href: "/projekte" },
  { key: "contact", label: "Kontakt", href: "/kontakt" }
];

export const timeline = [
  {
    year: "Aktuell",
    title: "Programmierung, Daten und Hardware",
    copy: "Python, Java und SQL bilden den aktuellen Programmierfokus. HeidiSQL, Cisco Packet Tracer und Arduino ergänzen das Lernen um Datenbanken, Netzwerke und physische Systeme.",
    tags: ["Python", "Java", "SQL", "HeidiSQL", "Cisco Packet Tracer", "Arduino"]
  },
  {
    year: "2025",
    title: "Umschulung Fachinformatik Systemintegration",
    copy: "Berufliche Neuorientierung mit einem praxisnahen Blick auf Infrastruktur, technische Abläufe und das Zusammenspiel verschiedener Systeme.",
    tags: ["Systemintegration", "Netzwerke", "Prozesse"]
  },
  {
    year: "2023",
    title: "Webentwicklung als eigener Arbeitsraum",
    copy: "HTML, CSS, JavaScript und Visual Studio Code werden zu einem regelmäßigen Workflow für verständliche, responsive Interfaces.",
    tags: ["HTML", "CSS", "JavaScript", "VS Code"]
  },
  {
    year: "2021",
    title: "Motion als zusätzliche Denkebene",
    copy: "Adobe After Effects erweitert den technischen Blick um Timing, räumliche Komposition und visuelle Bewegung.",
    tags: ["After Effects", "Motion", "Komposition"]
  }
];

export const skills = [
  {
    id: "web",
    index: "01",
    title: "Web",
    statement: "Interfaces, die ihre Struktur zeigen.",
    copy: "Semantisches HTML, responsive CSS-Systeme und JavaScript-Interaktion bilden gemeinsam verständliche Oberflächen.",
    tools: ["HTML", "CSS", "JavaScript", "Tailwind CSS", "VS Code"],
    projectHref: "/projekte/beckerbyte-portfolio"
  },
  {
    id: "systems",
    index: "02",
    title: "Systems",
    statement: "Technik im Zusammenhang betrachten.",
    copy: "Netzwerke, Datenbanken und Prozesskontext werden nicht isoliert, sondern als verbundene Abläufe verstanden.",
    tools: ["Cisco Packet Tracer", "HeidiSQL", "SAP", "Flexus Mobile Solutions"],
    projectHref: "/projekte"
  },
  {
    id: "code-data",
    index: "03",
    title: "Code & Data",
    statement: "Logik wird überprüfbar, wenn Daten sichtbar werden.",
    copy: "Python, Java und SQL dienen als aktuelle Lernfelder für Logik, Datenverarbeitung und nachvollziehbare Programme.",
    tools: ["Python", "Java", "SQL"],
    projectHref: "/projekte/text-analyzer"
  },
  {
    id: "hardware",
    index: "04",
    title: "Hardware",
    statement: "Code endet nicht am Bildschirm.",
    copy: "Arduino verbindet Programmabläufe mit Sensoren, Ausgängen und konkreten Reaktionen physischer Komponenten.",
    tools: ["Arduino", "Sensorik", "Automatisierung"],
    projectHref: "/projekte"
  },
  {
    id: "creative",
    index: "05",
    title: "Creative Tech",
    statement: "Bewegung erklärt räumliche Zusammenhänge.",
    copy: "Motion Design und technische Gestaltung machen Zustände, Übergänge und Hierarchien visuell erfahrbar.",
    tools: ["Adobe After Effects", "Motion Graphics", "Visuelle Systeme"],
    projectHref: "/projekte/beckerbyte-portfolio"
  }
];

export const projects = [
  {
    slug: "beckerbyte-portfolio",
    index: "01",
    title: "beckerbyte.com",
    category: "Web · Portfolio",
    status: "Aktiv",
    scene: "portfolio",
    summary: "Eine private Portfolio-Website, die Webentwicklung, Systemintegration und visuelle Gestaltung in einer eigenen digitalen Umgebung verbindet.",
    goal: "Ein persönlicher Ort sollte reale Lernfelder und Projekte nachvollziehbar zeigen, ohne wie eine Agentur oder ein fertiges Produktversprechen aufzutreten.",
    approach: "Die Website wird als statische, responsive Oberfläche mit semantischem HTML, CSS, JavaScript und einer kleinen Build-Pipeline entwickelt. GitHub Pages stellt sie bereit; Cloudflare übernimmt die Auslieferung.",
    features: [
      "Mehrseitige Informationsarchitektur",
      "Responsive Navigation und zugängliche Interaktionen",
      "Canvas-, 3D- und Scroll-Experimente",
      "Kontaktformular über Forminit",
      "Lokale Medien- und Designassets"
    ],
    tools: ["HTML", "CSS", "JavaScript", "WebGL", "GitHub Pages", "Cloudflare"],
    repo: "https://github.com/beckerbyte/beckerbyte.github.io",
    live: "https://www.beckerbyte.com/",
    download: null,
    relatedSkill: "/skills#web"
  },
  {
    slug: "text-analyzer",
    index: "02",
    title: "Text Analyzer Pro",
    category: "Python · Desktop GUI",
    status: "Repository",
    scene: "analyzer",
    summary: "Eine Python-Desktopanwendung, die Texte analysiert, Ergebnisse sichtbar zusammenfasst und Wortfrequenzen grafisch ausgibt.",
    goal: "Textverarbeitung, reguläre Ausdrücke, GUI-Entwicklung und einfache Datenvisualisierung sollten in einem überschaubaren Lernprojekt zusammenkommen.",
    approach: "Die Oberfläche basiert auf Tkinter. Python ermittelt Zeichen, Wörter, Sätze, durchschnittliche Wortlänge, häufige Wörter und einen Flesch-Wert. Pillow bindet das Projektlogo ein; Matplotlib zeichnet ein Histogramm der zehn häufigsten Wörter.",
    features: [
      "Zeichen-, Wort- und Satzanzahl",
      "Durchschnittliche Wortlänge und Flesch-Lesbarkeitswert",
      "Fünf häufigste Wörter im Ergebnis",
      "Histogramm der zehn häufigsten Wörter",
      "Export der Analyse als Textdatei",
      "Tkinter-Oberfläche mit Splash-Screen"
    ],
    tools: ["Python", "Tkinter", "RegEx", "Counter", "Pillow", "Matplotlib"],
    repo: "https://github.com/beckerbyte/Text-Analyzer",
    live: null,
    download: "https://github.com/beckerbyte/beckerbyte.github.io/releases/latest/download/Text-Analyzer.zip",
    relatedSkill: "/skills#code-data"
  }
];

export const workPrinciples = [
  { index: "01", title: "Kontext vor Code", copy: "Erst verstehen, welches Problem, welcher Ablauf und welche Grenze tatsächlich existieren." },
  { index: "02", title: "Struktur vor Effekt", copy: "Inhalte und Bedienung müssen ohne Animation funktionieren. Bewegung macht Zusammenhänge anschließend klarer." },
  { index: "03", title: "Klein bauen, sauber prüfen", copy: "Ein nachvollziehbarer Baustein ist wertvoller als eine große, unkontrollierte Abhängigkeit." },
  { index: "04", title: "Lernen dokumentieren", copy: "Projekte zeigen nicht nur ein Ergebnis, sondern auch den aktuellen Stand und die nächsten offenen Fragen." }
];
