const projectsHero = document.querySelector(".projects-hero");
const parallaxLayers = [...document.querySelectorAll("[data-parallax-layer]")];
const parallaxCards = [...document.querySelectorAll("[data-parallax-card]")];
const projectsReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);
const projectsDesktop = window.matchMedia("(min-width: 768px)");

if (
  projectsHero &&
  parallaxLayers.length > 0 &&
  parallaxCards.length > 0 &&
  !projectsReducedMotion.matches
) {
  let projectsFrame = null;

  const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);

  const updateProjectsParallax = () => {
    projectsFrame = null;

    const viewportHeight = window.innerHeight;
    const heroRect = projectsHero.getBoundingClientRect();
    const heroTravel = clamp(-heroRect.top, 0, heroRect.height);

    for (const layer of parallaxLayers) {
      const depth = Number(layer.dataset.depth || 0);
      layer.style.setProperty(
        "--parallax-y",
        `${(heroTravel * depth).toFixed(2)}px`
      );
    }

    let focusedCard = null;
    let focusedDistance = Number.POSITIVE_INFINITY;

    for (const card of parallaxCards) {
      const preview = card.querySelector("[data-parallax-preview]");
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.top + cardRect.height / 2;
      const distanceFromCenter = cardCenter - viewportHeight / 2;
      const normalizedDistance = clamp(
        distanceFromCenter / (viewportHeight * 0.72),
        -1,
        1
      );
      const focus = 1 - Math.abs(normalizedDistance);

      if (projectsDesktop.matches) {
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
      } else {
        card.style.removeProperty("--card-shift-y");
        card.style.removeProperty("--card-rotate");
        card.style.removeProperty("--card-scale");
        preview?.style.removeProperty("--preview-shift-y");
      }

      const absoluteDistance = Math.abs(distanceFromCenter);
      if (absoluteDistance < focusedDistance) {
        focusedDistance = absoluteDistance;
        focusedCard = card;
      }
    }

    for (const card of parallaxCards) {
      const cardRect = card.getBoundingClientRect();
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

  window.addEventListener("scroll", requestProjectsUpdate, { passive: true });
  window.addEventListener("resize", requestProjectsUpdate);
  projectsDesktop.addEventListener("change", requestProjectsUpdate);
  requestProjectsUpdate();
}
