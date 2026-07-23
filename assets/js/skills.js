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
