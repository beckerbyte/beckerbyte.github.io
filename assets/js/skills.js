const skillsHero = document.querySelector("[data-skills-parallax]");

if (skillsHero) {
  const skillsHeroReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let skillsHeroFrame = null;

  const clampSkillsHero = (value, minimum = 0, maximum = 1) =>
    Math.min(Math.max(value, minimum), maximum);

  const updateSkillsHero = () => {
    skillsHeroFrame = null;

    if (skillsHeroReducedMotion.matches) {
      skillsHero.style.setProperty("--skills-hero-progress", "0");
      return;
    }

    const rect = skillsHero.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const travel = Math.max(
      rect.height - viewportHeight * 0.42,
      viewportHeight * 0.72,
      1
    );
    const progress = clampSkillsHero(-rect.top / travel);

    skillsHero.style.setProperty(
      "--skills-hero-progress",
      progress.toFixed(4)
    );
  };

  const requestSkillsHeroUpdate = () => {
    if (skillsHeroFrame !== null) return;
    skillsHeroFrame = window.requestAnimationFrame(updateSkillsHero);
  };

  window.addEventListener("scroll", requestSkillsHeroUpdate, { passive: true });
  window.addEventListener("resize", requestSkillsHeroUpdate);
  skillsHeroReducedMotion.addEventListener("change", requestSkillsHeroUpdate);
  requestSkillsHeroUpdate();
}


const webDesignPreview = document.querySelector("[data-design-preview]");
const webDesignButtons = [...document.querySelectorAll("[data-design-option]")];

if (webDesignPreview && webDesignButtons.length > 0) {
  const designKicker = webDesignPreview.querySelector("[data-design-kicker]");
  const designTitle = webDesignPreview.querySelector("[data-design-title]");
  const designCopy = webDesignPreview.querySelector("[data-design-copy]");
  const designLink = webDesignPreview.querySelector("[data-design-link]");

  const webDesigns = {
    portfolio: {
      kicker: "PORTFOLIO · CLEAN · PERSONAL",
      title: "Digitale Arbeiten, klar präsentiert.",
      copy: "Projekte, Kompetenzen und Persönlichkeit in einer ruhigen, fokussierten Oberfläche.",
      linkLabel: "Portfolio öffnen →",
      href: "projekte.html#portfolio-project"
    },
    studio: {
      kicker: "CREATIVE STUDIO · MOTION · BRAND",
      title: "Ideen mit Bewegung und Charakter.",
      copy: "Eine expressive Startseite für visuelle Arbeiten, Markenwelten und Motion Design.",
      linkLabel: "Motion entdecken →",
      href: "#creative"
    },
    systems: {
      kicker: "SYSTEM HUB · NETWORK · DATA",
      title: "Technik und Abläufe auf einen Blick.",
      copy: "Ein strukturiertes Dashboard für Netzwerke, Daten, Automatisierung und Systemstatus.",
      linkLabel: "Systeme ansehen →",
      href: "#systems"
    }
  };

  const activateWebDesign = (button) => {
    const design = webDesigns[button.dataset.designOption];
    if (!design) return;

    webDesignButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    webDesignPreview.dataset.designTheme = button.dataset.designOption;
    designKicker && (designKicker.textContent = design.kicker);
    designTitle && (designTitle.textContent = design.title);
    designCopy && (designCopy.textContent = design.copy);

    if (designLink) {
      designLink.textContent = design.linkLabel;
      designLink.href = design.href;
    }

    webDesignPreview.classList.remove("is-changing");
    void webDesignPreview.offsetWidth;
    webDesignPreview.classList.add("is-changing");
  };

  webDesignButtons.forEach((button, index) => {
    button.addEventListener("click", () => activateWebDesign(button));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + webDesignButtons.length) % webDesignButtons.length;
      }
      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % webDesignButtons.length;
      }
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = webDesignButtons.length - 1;

      webDesignButtons[nextIndex].focus();
      activateWebDesign(webDesignButtons[nextIndex]);
    });
  });
}


const systemsScene = document.querySelector("[data-system-scene]");
const systemCards = [...document.querySelectorAll("[data-system-card]")];

if (systemsScene && systemCards.length > 0) {
  const systemTrack = systemsScene.querySelector(".systems-lab__grid");
  const systemStatus = systemsScene.querySelector("[data-system-status]");
  const systemCount = systemsScene.querySelector("[data-system-count]");
  const systemDialog = systemsScene.querySelector("[data-system-dialog]");
  const systemClose = systemsScene.querySelector("[data-system-close]");
  const systemExpandButtons = [...systemsScene.querySelectorAll("[data-system-expand]")];
  const systemDetailPanels = [...systemsScene.querySelectorAll("[data-system-detail]")];
  const systemDots = [...systemsScene.querySelectorAll("[data-system-dot]")];
  const mobileSystemLayout = window.matchMedia("(max-width: 767px)");
  let lastSystemTrigger = null;
  let systemFrame = null;

  const systemStates = {
    network: "Netzwerk aktiv",
    database: "Datenbank synchronisiert",
    automation: "Hardware verbunden"
  };

  const activateSystemCard = (card) => {
    const index = systemCards.indexOf(card);
    if (index < 0) return;

    systemCards.forEach((item) => {
      const active = item === card;
      item.classList.toggle("is-active", active);

      if (active) {
        item.setAttribute("aria-current", "true");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    if (systemStatus) {
      systemStatus.textContent =
        systemStates[card.dataset.systemCard] || "System aktiv";
    }

    if (systemCount) {
      systemCount.textContent =
        `${String(index + 1).padStart(2, "0")} / ${String(systemCards.length).padStart(2, "0")}`;
    }

    systemDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };

  const openSystemDetail = (key, trigger) => {
    if (!systemDialog) return;

    systemDetailPanels.forEach((panel) => {
      const active = panel.dataset.systemDetail === key;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });

    systemDialog.dataset.systemTheme = key;
    lastSystemTrigger = trigger;
    document.documentElement.classList.add("system-detail-open");

    if (typeof systemDialog.showModal === "function") {
      if (!systemDialog.open) systemDialog.showModal();
    } else {
      systemDialog.setAttribute("open", "");
    }
  };

  const closeSystemDetail = () => {
    if (!systemDialog) return;

    if (typeof systemDialog.close === "function" && systemDialog.open) {
      systemDialog.close();
    } else {
      systemDialog.removeAttribute("open");
      document.documentElement.classList.remove("system-detail-open");
      lastSystemTrigger?.focus();
    }
  };

  const updateVisibleSystemCard = () => {
    systemFrame = null;
    if (!mobileSystemLayout.matches || !systemTrack) return;

    const trackRect = systemTrack.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    let closestCard = systemCards[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    systemCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestCard = card;
      }
    });

    activateSystemCard(closestCard);
  };

  const requestSystemUpdate = () => {
    if (systemFrame !== null) return;
    systemFrame = window.requestAnimationFrame(updateVisibleSystemCard);
  };

  systemExpandButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const key = button.dataset.systemExpand;
      const card = systemCards.find((item) => item.dataset.systemCard === key);
      if (card) activateSystemCard(card);
      openSystemDetail(key, button);
    });
  });

  systemClose?.addEventListener("click", closeSystemDetail);
  systemDialog?.addEventListener("click", (event) => {
    if (event.target === systemDialog) closeSystemDetail();
  });
  systemDialog?.addEventListener("close", () => {
    document.documentElement.classList.remove("system-detail-open");
    lastSystemTrigger?.focus();
  });

  systemCards.forEach((card, index) => {
    card.addEventListener("pointerenter", () => activateSystemCard(card));
    card.addEventListener("focusin", () => activateSystemCard(card));
    card.addEventListener("click", () => activateSystemCard(card));
    card.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + systemCards.length) % systemCards.length;
      }
      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % systemCards.length;
      }
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = systemCards.length - 1;

      systemCards[nextIndex].focus();
      activateSystemCard(systemCards[nextIndex]);
    });
  });

  systemTrack?.addEventListener("scroll", requestSystemUpdate, { passive: true });
  mobileSystemLayout.addEventListener("change", () => {
    activateSystemCard(systemCards[0]);
    requestSystemUpdate();
  });

  activateSystemCard(systemCards[0]);
  requestSystemUpdate();
}


const motionScene = document.querySelector("[data-motion-scene]");

if (motionScene) {
  const motionPercent = motionScene.querySelector("[data-motion-percent]");
  const motionPhases = [...motionScene.querySelectorAll("[data-ae-phase]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionLayout = window.matchMedia("(min-height: 560px)");
  let motionFrame = null;

  const clamp = (value, minimum = 0, maximum = 1) =>
    Math.min(Math.max(value, minimum), maximum);

  const range = (progress, start, end) =>
    clamp((progress - start) / (end - start));

  const updateMotionScene = () => {
    motionFrame = null;

    if (reducedMotion.matches || !motionLayout.matches) {
      motionScene.style.setProperty("--motion-progress", "1");
      motionScene.style.setProperty("--ae-depth", "1");
      motionScene.style.setProperty("--ae-reveal", "1");
      motionScene.style.setProperty("--ae-light", "0.8");
      motionScene.style.setProperty("--ae-finish", "1");
      motionPercent && (motionPercent.textContent = "100%");
      motionPhases.forEach((phase) => phase.classList.add("is-active"));
      return;
    }

    const rect = motionScene.getBoundingClientRect();
    const scrollDistance = Math.max(rect.height - window.innerHeight, 1);
    const progress = clamp(-rect.top / scrollDistance);
    const depth = range(progress, 0.04, 0.34);
    const reveal = range(progress, 0.22, 0.52);
    const light = range(progress, 0.42, 0.72);
    const finish = range(progress, 0.7, 0.96);

    motionScene.style.setProperty("--motion-progress", progress.toFixed(4));
    motionScene.style.setProperty("--ae-depth", depth.toFixed(4));
    motionScene.style.setProperty("--ae-reveal", reveal.toFixed(4));
    motionScene.style.setProperty("--ae-light", light.toFixed(4));
    motionScene.style.setProperty("--ae-finish", finish.toFixed(4));

    if (motionPercent) {
      motionPercent.textContent = `${Math.round(progress * 100)}%`;
    }

    const activePhase = Math.min(Math.floor(progress * 4) + 1, 4);
    motionPhases.forEach((phase) => {
      phase.classList.toggle(
        "is-active",
        Number(phase.dataset.aePhase) <= activePhase
      );
    });
  };

  const requestMotionUpdate = () => {
    if (motionFrame !== null) return;
    motionFrame = window.requestAnimationFrame(updateMotionScene);
  };

  window.addEventListener("scroll", requestMotionUpdate, { passive: true });
  window.addEventListener("resize", requestMotionUpdate);
  reducedMotion.addEventListener("change", requestMotionUpdate);
  motionLayout.addEventListener("change", requestMotionUpdate);
  requestMotionUpdate();
}


const webTabs = [...document.querySelectorAll("[data-web-tab]")];
const webPanels = [...document.querySelectorAll("[data-web-panel]")];

if (webTabs.length > 0 && webPanels.length > 0) {
  const activateWebTab = (selectedTab) => {
    const target = selectedTab.dataset.webTab;

    webTabs.forEach((tab) => {
      const active = tab === selectedTab;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    webPanels.forEach((panel) => {
      const active = panel.dataset.webPanel === target;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  };

  webTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateWebTab(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + webTabs.length) % webTabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % webTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = webTabs.length - 1;

      webTabs[nextIndex].focus();
      activateWebTab(webTabs[nextIndex]);
    });
  });

  activateWebTab(webTabs.find((tab) => tab.classList.contains("is-active")) || webTabs[0]);
}
