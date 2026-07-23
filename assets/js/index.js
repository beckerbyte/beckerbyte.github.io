const typingCode = document.getElementById("typing-code");
const typingCursor = document.getElementById("typing-cursor");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (typingCode && typingCursor && !reducedMotion) {
  const codeSegments = [
    { text: "const", className: "text-sky-300" },
    { text: " developer = {\n  name: " },
    { text: "\"beckerbyte\"", className: "text-green-300" },
    { text: ",\n  focus: [\n    " },
    { text: "\"Webentwicklung\"", className: "text-green-300" },
    { text: ",\n    " },
    { text: "\"Systemintegration\"", className: "text-green-300" },
    { text: ",\n    " },
    { text: "\"Creative Tech\"", className: "text-green-300" },
    { text: "\n  ],\n  mindset: " },
    { text: "\"build useful things\"", className: "text-green-300" },
    { text: "\n};" }
  ];

  typingCode.textContent = "";

  const wait = (milliseconds) =>
    new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  const characterDelay = (character) => {
    if (character === "\n") return 150;
    if ([",", ":", "{", "}", "[", "]", ";"].includes(character)) return 65;
    if (character === " ") return 12;
    return 24 + Math.random() * 24;
  };

  const typeCode = async () => {
    await wait(1050);

    for (const segment of codeSegments) {
      const target = document.createElement("span");

      if (segment.className) {
        target.className = segment.className;
      }

      typingCode.appendChild(target);

      for (const character of segment.text) {
        target.textContent += character;
        await wait(characterDelay(character));
      }
    }

    typingCursor.classList.add("is-finished");
  };

  typeCode();
}


const codeCard = document.getElementById("code-card");
const codeCardStage = document.getElementById("code-card-stage");
const codeCardBackdrop = document.getElementById("code-card-backdrop");
const codeCardClose = document.getElementById("code-card-close");
const codeCardMinimize = document.getElementById("code-card-minimize");
const codeCardMaximize = document.getElementById("code-card-maximize");
const codeCardReopen = document.getElementById("code-card-reopen");

if (
  codeCard &&
  codeCardStage &&
  codeCardBackdrop &&
  codeCardClose &&
  codeCardMinimize &&
  codeCardMaximize &&
  codeCardReopen
) {
  let isMaximized = false;
  let isMinimized = false;
  let isClosed = false;
  let isAnimating = false;

  const waitForTransition = (duration = 590) =>
    new Promise((resolve) => window.setTimeout(resolve, duration));

  const playSwoosh = () => {
    codeCard.classList.remove("is-swooshing");
    void codeCard.offsetWidth;
    codeCard.classList.add("is-swooshing");

    window.setTimeout(() => {
      codeCard.classList.remove("is-swooshing");
    }, 720);
  };

  const updateControls = () => {
    const maximizeLabel = isMaximized
      ? "Code-Karte verkleinern"
      : "Code-Karte vergrößern";

    codeCardMaximize.setAttribute("aria-expanded", String(isMaximized));
    codeCardMaximize.setAttribute("aria-label", maximizeLabel);
    codeCardMaximize.setAttribute("title", maximizeLabel);

    const minimizeLabel = isMinimized
      ? "Code-Karte wiederherstellen"
      : "Code-Karte minimieren";

    codeCardMinimize.setAttribute("aria-label", minimizeLabel);
    codeCardMinimize.setAttribute("title", minimizeLabel);
  };

  const maximizeCard = async () => {
    if (isAnimating || isMaximized || isClosed) return;

    isAnimating = true;

    if (isMinimized) {
      codeCard.classList.remove("is-minimized");
      isMinimized = false;
      await waitForTransition(440);
    }

    const startRect = codeCard.getBoundingClientRect();
    codeCardStage.style.minHeight = `${startRect.height}px`;

    codeCard.style.top = `${startRect.top}px`;
    codeCard.style.left = `${startRect.left}px`;
    codeCard.style.width = `${startRect.width}px`;
    codeCard.style.height = `${startRect.height}px`;

    document.body.appendChild(codeCard);
    codeCard.classList.add("is-floating");

    void codeCard.offsetWidth;

    isMaximized = true;
    document.body.classList.add("code-card-open");
    codeCardBackdrop.classList.add("is-visible");
    codeCard.classList.add("is-maximized");
    updateControls();
    playSwoosh();

    await waitForTransition();
    isAnimating = false;
    codeCardMaximize.focus({ preventScroll: true });
  };

  const restoreCard = async () => {
    if (isAnimating || !isMaximized) return;

    isAnimating = true;
    const targetRect = codeCardStage.getBoundingClientRect();

    const normalCardHeight = window.matchMedia("(max-width: 640px)").matches
      ? 460
      : 480;

    codeCard.classList.remove("is-maximized");
    codeCard.style.top = `${targetRect.top}px`;
    codeCard.style.left = `${targetRect.left}px`;
    codeCard.style.width = `${targetRect.width}px`;
    codeCard.style.height = `${normalCardHeight}px`;

    isMaximized = false;
    codeCardBackdrop.classList.remove("is-visible");
    updateControls();
    playSwoosh();

    await waitForTransition();

    codeCard.classList.remove("is-floating");
    codeCard.removeAttribute("style");
    codeCardStage.prepend(codeCard);
    codeCardStage.style.removeProperty("min-height");
    document.body.classList.remove("code-card-open");
    isAnimating = false;
    codeCardMaximize.focus({ preventScroll: true });
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      restoreCard();
    } else {
      maximizeCard();
    }
  };

  const toggleMinimize = async () => {
    if (isAnimating || isClosed) return;

    // Aus der Vollansicht führt der erste Klick nur zurück zur festen Normalgröße.
    // Erst ein weiterer Klick minimiert die Karte auf die Fensterleiste.
    if (isMaximized) {
      await restoreCard();
      return;
    }

    isMinimized = !isMinimized;
    codeCard.classList.toggle("is-minimized", isMinimized);
    updateControls();
    playSwoosh();
  };

  const closeCard = async () => {
    if (isAnimating || isClosed) return;

    if (isMaximized) {
      await restoreCard();
    }

    isClosed = true;
    isMinimized = false;
    codeCard.classList.remove("is-minimized");
    codeCard.classList.add("is-closed");
    playSwoosh();

    await waitForTransition(340);

    codeCard.hidden = true;
    codeCardStage.classList.add("is-closed");
    codeCard.classList.remove("is-closed");
    updateControls();
    codeCardReopen.focus({ preventScroll: true });
  };

  const reopenCard = () => {
    if (!isClosed) return;

    isClosed = false;
    codeCard.hidden = false;
    codeCardStage.classList.remove("is-closed");
    codeCard.classList.add("is-closed");

    requestAnimationFrame(() => {
      codeCard.classList.remove("is-closed");
      playSwoosh();
    });
  };

  codeCardMaximize.addEventListener("click", toggleMaximize);
  codeCardMinimize.addEventListener("click", toggleMinimize);
  codeCardClose.addEventListener("click", closeCard);
  codeCardReopen.addEventListener("click", reopenCard);
  codeCardBackdrop.addEventListener("click", restoreCard);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMaximized) {
      restoreCard();
    }
  });

  updateControls();
}

const timeline = document.getElementById("timeline");

if (timeline && !reducedMotion) {
  const timelineItems = [...timeline.querySelectorAll(".timeline-item")];
  const desktopTimeline = window.matchMedia("(min-width: 768px)");
  let timelineFrame = null;

  const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);

  const updateTimeline = () => {
    timelineFrame = null;

    const viewportHeight = window.innerHeight;
    const timelineRect = timeline.getBoundingClientRect();
    const progressStart = viewportHeight * 0.7;
    const progressDistance = Math.max(
      timelineRect.height - viewportHeight * 0.4,
      1
    );
    const progress = clamp(
      (progressStart - timelineRect.top) / progressDistance,
      0,
      1
    );

    timeline.style.setProperty("--timeline-progress", progress.toFixed(4));

    let activeItem = null;
    let activeDistance = Number.POSITIVE_INFINITY;

    for (const item of timelineItems) {
      const card = item.querySelector(".timeline-card");
      if (!card) continue;

      const cardRect = card.getBoundingClientRect();
      const distanceFromCenter =
        cardRect.top + cardRect.height / 2 - viewportHeight / 2;
      const normalizedDistance = clamp(
        distanceFromCenter / (viewportHeight * 0.62),
        -1,
        1
      );
      const focus = 1 - Math.abs(normalizedDistance);

      if (desktopTimeline.matches) {
        const horizontalDirection = card.classList.contains("timeline-card--left")
          ? 1
          : -1;

        card.style.setProperty(
          "--timeline-shift-x",
          `${(horizontalDirection * focus * 12).toFixed(2)}px`
        );
        card.style.setProperty(
          "--timeline-shift-y",
          `${(normalizedDistance * 16).toFixed(2)}px`
        );
        card.style.setProperty(
          "--timeline-scale",
          (1 + focus * 0.012).toFixed(4)
        );
      } else {
        card.style.removeProperty("--timeline-shift-x");
        card.style.removeProperty("--timeline-shift-y");
        card.style.removeProperty("--timeline-scale");
      }

      const absoluteDistance = Math.abs(distanceFromCenter);
      if (absoluteDistance < activeDistance) {
        activeDistance = absoluteDistance;
        activeItem = item;
      }
    }

    const timelineIsVisible =
      timelineRect.bottom > 0 && timelineRect.top < viewportHeight;

    for (const item of timelineItems) {
      item.classList.toggle(
        "is-active",
        timelineIsVisible && item === activeItem
      );
    }
  };

  const requestTimelineUpdate = () => {
    if (timelineFrame !== null) return;
    timelineFrame = window.requestAnimationFrame(updateTimeline);
  };

  window.addEventListener("scroll", requestTimelineUpdate, { passive: true });
  window.addEventListener("resize", requestTimelineUpdate);
  desktopTimeline.addEventListener("change", requestTimelineUpdate);
  requestTimelineUpdate();
}


const heroParallax = document.querySelector("[data-hero-parallax]");
const siteParallax = document.querySelector("[data-site-parallax]");

if (heroParallax && !reducedMotion) {
  const heroPinnedLayout = window.matchMedia("(min-width: 900px) and (min-height: 700px)");
  let heroFrame = null;

  const clampHero = (value, minimum = 0, maximum = 1) =>
    Math.min(Math.max(value, minimum), maximum);

  const updateHeroParallax = () => {
    heroFrame = null;

    const rect = heroParallax.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const travel = Math.max(rect.height - viewportHeight, 1);

    const progress = heroPinnedLayout.matches
      ? clampHero(-rect.top / travel)
      : clampHero((viewportHeight * 0.18 - rect.top) / Math.max(rect.height, 1));

    const exit = clampHero((progress - 0.76) / 0.24);
    const pageTravel = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
    const pageProgress = clampHero(window.scrollY / pageTravel);

    heroParallax.style.setProperty("--hero-progress", progress.toFixed(4));
    heroParallax.style.setProperty("--hero-exit", exit.toFixed(4));

    if (siteParallax) {
      siteParallax.style.setProperty("--hero-progress", progress.toFixed(4));
      siteParallax.style.setProperty("--page-progress", pageProgress.toFixed(4));
    }
  };

  const requestHeroUpdate = () => {
    if (heroFrame !== null) return;
    heroFrame = window.requestAnimationFrame(updateHeroParallax);
  };

  window.addEventListener("scroll", requestHeroUpdate, { passive: true });
  window.addEventListener("resize", requestHeroUpdate);
  heroPinnedLayout.addEventListener("change", requestHeroUpdate);
  requestHeroUpdate();
}
