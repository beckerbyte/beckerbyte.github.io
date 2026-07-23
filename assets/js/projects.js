
const projectsHero = document.querySelector("[data-projects-hero]");

if (projectsHero) {
  const projectsHeroReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  let projectsHeroFrame = null;
  let projectsHeroProgress = "";
  let projectsHeroExit = "";

  const clampProjectsHero = (value, minimum = 0, maximum = 1) =>
    Math.min(Math.max(value, minimum), maximum);

  const updateProjectsHero = () => {
    projectsHeroFrame = null;

    if (projectsHeroReducedMotion.matches) {
      projectsHero.style.setProperty("--projects-progress", "0");
      projectsHero.style.setProperty("--projects-exit", "0");
      return;
    }

    const rect = projectsHero.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollDistance = Math.max(rect.height - viewportHeight, 1);
    const earlyStart = viewportHeight * 0.14;
    const progress = clampProjectsHero(
      (earlyStart - rect.top) / (scrollDistance + earlyStart)
    );
    /*
     * Finish the transition before the pinned scene releases. Otherwise its
     * last semi-transparent frame overlaps the first project cards.
     */
    const exit = clampProjectsHero((progress - 0.68) / 0.28);

    const nextProgress = progress.toFixed(4);
    const nextExit = exit.toFixed(4);

    if (nextProgress !== projectsHeroProgress) {
      projectsHeroProgress = nextProgress;
      projectsHero.style.setProperty("--projects-progress", nextProgress);
    }

    if (nextExit !== projectsHeroExit) {
      projectsHeroExit = nextExit;
      projectsHero.style.setProperty("--projects-exit", nextExit);
    }
  };

  const requestProjectsHeroUpdate = () => {
    if (projectsHeroFrame !== null) return;
    projectsHeroFrame = window.requestAnimationFrame(updateProjectsHero);
  };

  window.addEventListener("scroll", requestProjectsHeroUpdate, {
    passive: true
  });
  window.addEventListener("resize", requestProjectsHeroUpdate);
  projectsHeroReducedMotion.addEventListener(
    "change",
    requestProjectsHeroUpdate
  );
  requestProjectsHeroUpdate();
}

const parallaxCards = [...document.querySelectorAll("[data-parallax-card]")].map(
  (card) => ({
    card,
    preview: card.querySelector("[data-parallax-preview]")
  })
);
const projectsReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);
const projectsDesktop = window.matchMedia("(min-width: 768px)");

if (parallaxCards.length > 0 && !projectsReducedMotion.matches) {
  let projectsFrame = null;

  const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);

  const updateProjectsParallax = () => {
    projectsFrame = null;

    const viewportHeight = window.innerHeight;
    let focusedCard = null;
    let focusedDistance = Number.POSITIVE_INFINITY;
    const cardMeasurements = [];
    const useCardTransforms = projectsDesktop.matches;

    for (const { card, preview } of parallaxCards) {
      const cardRect = card.getBoundingClientRect();
      cardMeasurements.push({ card, cardRect });
      const cardCenter = cardRect.top + cardRect.height / 2;
      const distanceFromCenter = cardCenter - viewportHeight / 2;
      const normalizedDistance = clamp(
        distanceFromCenter / (viewportHeight * 0.72),
        -1,
        1
      );
      const focus = 1 - Math.abs(normalizedDistance);

      if (useCardTransforms) {
        card.style.setProperty(
          "--card-shift-y",
          `${(normalizedDistance * 20).toFixed(2)}px`
        );
        card.style.setProperty(
          "--card-rotate",
          `${(normalizedDistance * -1.25).toFixed(3)}deg`
        );
        card.style.setProperty(
          "--card-scale",
          (1 + focus * 0.008).toFixed(4)
        );

        preview?.style.setProperty(
          "--preview-shift-y",
          `${(normalizedDistance * -11).toFixed(2)}px`
        );
      }

      const absoluteDistance = Math.abs(distanceFromCenter);
      if (absoluteDistance < focusedDistance) {
        focusedDistance = absoluteDistance;
        focusedCard = card;
      }
    }

    for (const { card, cardRect } of cardMeasurements) {
      const isVisible =
        cardRect.bottom > viewportHeight * 0.12 &&
        cardRect.top < viewportHeight * 0.88;

      card.classList.toggle(
        "is-focused",
        isVisible && card === focusedCard
      );
    }
  };

  const requestProjectsUpdate = () => {
    if (projectsFrame !== null) return;
    projectsFrame = window.requestAnimationFrame(updateProjectsParallax);
  };

  const handleProjectsBreakpoint = () => {
    if (!projectsDesktop.matches) {
      for (const { card, preview } of parallaxCards) {
        card.style.removeProperty("--card-shift-y");
        card.style.removeProperty("--card-rotate");
        card.style.removeProperty("--card-scale");
        preview?.style.removeProperty("--preview-shift-y");
      }
    }

    requestProjectsUpdate();
  };

  window.addEventListener("scroll", requestProjectsUpdate, { passive: true });
  window.addEventListener("resize", requestProjectsUpdate);
  projectsDesktop.addEventListener("change", handleProjectsBreakpoint);
  requestProjectsUpdate();
}
