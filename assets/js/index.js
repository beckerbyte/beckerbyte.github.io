const typingCode = document.getElementById("typing-code");
const typingCursor = document.getElementById("typing-cursor");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const systemCanvas = document.getElementById("system-canvas");

if (systemCanvas) {
  const context = systemCanvas.getContext("2d", { alpha: true });
  const stage = systemCanvas.closest("[data-system-stage]");
  const stateLabel = stage?.querySelector("[data-system-state]");
  const metricLabel = stage?.querySelector("[data-system-metric]");
  const hero = document.querySelector("[data-hero-parallax]");
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const hardwareThreads = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let isVisible = true;
  let lastFrame = 0;
  let frameRequest = null;

  const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);

  const random = (() => {
    let seed = 73129;
    return () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  })();

  const sourceNodes = Array.from({ length: 28 }, (_, index) => {
    if (index === 0) {
      return { x: 0, y: 0, z: 0, size: 58, group: 0 };
    }

    const layer = 0.48 + random() * 0.7;
    const angle = random() * Math.PI * 2;
    return {
      x: Math.cos(angle) * 220 * layer,
      y: (random() - 0.5) * 330 * layer,
      z: Math.sin(angle) * 210 * layer,
      size: 10 + random() * 23,
      group: index % 3
    };
  });

  const edges = sourceNodes.slice(1).map((_, index) => [0, index + 1]);
  for (let index = 1; index < sourceNodes.length - 2; index += 2) {
    edges.push([index, index + 2]);
  }

  const rotatePoint = (point, rotationX, rotationY) => {
    const cosineY = Math.cos(rotationY);
    const sineY = Math.sin(rotationY);
    const x1 = point.x * cosineY - point.z * sineY;
    const z1 = point.x * sineY + point.z * cosineY;
    const cosineX = Math.cos(rotationX);
    const sineX = Math.sin(rotationX);

    return {
      x: x1,
      y: point.y * cosineX - z1 * sineX,
      z: point.y * sineX + z1 * cosineX
    };
  };

  const projectPoint = (point) => {
    const camera = Math.max(width, height) * 0.88;
    const scale = camera / Math.max(camera + point.z, 60);
    return {
      x: width * 0.5 + point.x * scale,
      y: height * 0.52 + point.y * scale,
      z: point.z,
      scale
    };
  };

  const drawModule = (node, projected, rotationX, rotationY, opacity) => {
    const half = node.size * 0.5;
    const corners = [];

    for (const x of [-half, half]) {
      for (const y of [-half, half]) {
        for (const z of [-half, half]) {
          const rotated = rotatePoint({ x: node.x + x, y: node.y + y, z: node.z + z }, rotationX, rotationY);
          corners.push(projectPoint(rotated));
        }
      }
    }

    const linePairs = [
      [0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3],
      [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]
    ];
    const colors = ["134, 239, 172", "125, 211, 252", "228, 228, 231"];
    const color = colors[node.group];

    context.lineWidth = node.group === 0 ? 1.25 : 0.8;
    context.strokeStyle = `rgba(${color}, ${opacity})`;
    context.beginPath();
    for (const [from, to] of linePairs) {
      context.moveTo(corners[from].x, corners[from].y);
      context.lineTo(corners[to].x, corners[to].y);
    }
    context.stroke();

    const radius = Math.max(1.4, 2.8 * projected.scale);
    context.fillStyle = `rgba(${color}, ${Math.min(opacity * 1.8, 0.92)})`;
    context.shadowColor = `rgba(${color}, 0.8)`;
    context.shadowBlur = node.group === 0 ? 18 : 8;
    context.beginPath();
    context.arc(projected.x, projected.y, radius, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  };

  const renderSystem = (timestamp = 0) => {
    frameRequest = null;
    if (!context || !isVisible || document.hidden) return;

    const compact = width < 640;
    const medium = width < 940;
    const lowPower = hardwareThreads <= 4 || memory <= 4;
    const framesPerSecond = compact || lowPower ? 30 : 45;
    const minimumDelay = 1000 / framesPerSecond;

    if (!reducedMotion && timestamp - lastFrame < minimumDelay) {
      frameRequest = window.requestAnimationFrame(renderSystem);
      return;
    }
    lastFrame = timestamp;

    pointer.x += (pointer.targetX - pointer.x) * 0.045;
    pointer.y += (pointer.targetY - pointer.y) * 0.045;

    const heroRect = hero?.getBoundingClientRect();
    const scrollProgress = reducedMotion || !heroRect
      ? 0.26
      : clamp(-heroRect.top / Math.max(window.innerHeight * 0.82, 1), 0, 1);
    const nodeLimit = compact ? 13 : medium || lowPower ? 19 : 28;
    const sceneScale = compact ? 0.67 : medium ? 0.82 : 1;
    const spread = sceneScale * (0.74 + scrollProgress * 0.38);
    const time = reducedMotion ? 1200 : timestamp;
    const rotationY = time * 0.00011 + pointer.x * 0.24 + scrollProgress * 0.68;
    const rotationX = -0.16 + pointer.y * 0.14 - scrollProgress * 0.17;
    const activeNodes = sourceNodes.slice(0, nodeLimit).map((node) => {
      const groupLift = scrollProgress * (node.group - 1) * (compact ? 34 : 58);
      const transformed = {
        ...node,
        x: node.x * spread,
        y: node.y * spread + groupLift,
        z: node.z * spread + scrollProgress * (node.group === 0 ? -28 : 18)
      };
      const rotated = rotatePoint(transformed, rotationX, rotationY);
      return { source: transformed, rotated, projected: projectPoint(rotated) };
    });

    context.clearRect(0, 0, width, height);
    const glow = context.createRadialGradient(width * 0.53, height * 0.48, 0, width * 0.53, height * 0.48, width * 0.46);
    glow.addColorStop(0, "rgba(74, 222, 128, 0.075)");
    glow.addColorStop(0.45, "rgba(14, 165, 233, 0.028)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    const activeEdges = edges.filter(([from, to]) => from < nodeLimit && to < nodeLimit);
    for (let index = 0; index < activeEdges.length; index += 1) {
      const [fromIndex, toIndex] = activeEdges[index];
      const from = activeNodes[fromIndex].projected;
      const to = activeNodes[toIndex].projected;
      const depthOpacity = clamp(0.26 - (from.z + to.z) / 2400, 0.06, 0.34);
      const accent = index % 3 === 0 ? "125, 211, 252" : "134, 239, 172";

      context.strokeStyle = `rgba(${accent}, ${depthOpacity})`;
      context.lineWidth = 0.8;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();

      if (!reducedMotion && index % (compact ? 5 : 3) === 0) {
        const pulse = (time * 0.00018 + index * 0.137) % 1;
        const pulseX = from.x + (to.x - from.x) * pulse;
        const pulseY = from.y + (to.y - from.y) * pulse;
        context.fillStyle = `rgba(${accent}, 0.88)`;
        context.shadowColor = `rgba(${accent}, 0.9)`;
        context.shadowBlur = 10;
        context.beginPath();
        context.arc(pulseX, pulseY, 1.25, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
      }
    }

    [...activeNodes]
      .sort((a, b) => b.rotated.z - a.rotated.z)
      .forEach(({ source, rotated, projected }, index) => {
        const opacity = clamp(0.24 - rotated.z / 1900 + (index === 0 ? 0.22 : 0), 0.11, 0.56);
        drawModule(source, projected, rotationX, rotationY, opacity);
      });

    if (stateLabel) {
      stateLabel.textContent = scrollProgress > 0.68
        ? "SYSTEM ROUTED"
        : scrollProgress > 0.32
          ? "LINKS ACTIVE"
          : "CORE ONLINE";
    }
    if (metricLabel) metricLabel.textContent = `${nodeLimit - 1} NODES`;

    if (!reducedMotion) frameRequest = window.requestAnimationFrame(renderSystem);
  };

  const resizeSystem = () => {
    const bounds = systemCanvas.getBoundingClientRect();
    width = Math.max(bounds.width, 1);
    height = Math.max(bounds.height, 1);
    const compact = width < 640;
    const lowPower = hardwareThreads <= 4 || memory <= 4;
    pixelRatio = Math.min(window.devicePixelRatio || 1, compact ? 1.2 : lowPower ? 1.35 : 1.6);
    systemCanvas.width = Math.round(width * pixelRatio);
    systemCanvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (reducedMotion) renderSystem(1200);
  };

  systemCanvas.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" && event.buttons === 0) return;
    const bounds = systemCanvas.getBoundingClientRect();
    pointer.targetX = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
    pointer.targetY = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
  });

  systemCanvas.addEventListener("pointerleave", () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  });

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible && !frameRequest) frameRequest = window.requestAnimationFrame(renderSystem);
  }, { rootMargin: "160px" });

  visibilityObserver.observe(systemCanvas);
  new ResizeObserver(resizeSystem).observe(systemCanvas);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && isVisible && !frameRequest) {
      frameRequest = window.requestAnimationFrame(renderSystem);
    }
  });
  resizeSystem();
  frameRequest = window.requestAnimationFrame(renderSystem);
}

const atmosphereVideo = document.querySelector("[data-atmosphere-video]");

if (atmosphereVideo && !reducedMotion) {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const constrainedNetwork = connection?.saveData || ["slow-2g", "2g"].includes(connection?.effectiveType);
  let videoProfile = "";
  let videoVisible = false;

  const getVideoProfile = () => {
    if (window.innerWidth <= 640) return "mobile";
    if (window.innerWidth <= 1024) return "tablet";
    return "desktop";
  };

  const configureAtmosphereVideo = () => {
    if (constrainedNetwork) return;
    const profile = getVideoProfile();
    if (profile === videoProfile) return;

    const supportsWebm = atmosphereVideo.canPlayType("video/webm; codecs=vp9") !== "";
    const extension = supportsWebm ? "webm" : "mp4";
    const source = atmosphereVideo.dataset[`${profile}${extension[0].toUpperCase()}${extension.slice(1)}`];
    const poster = atmosphereVideo.dataset[`${profile}Poster`];
    if (!source) return;

    videoProfile = profile;
    atmosphereVideo.poster = poster || "";
    atmosphereVideo.src = source;
    atmosphereVideo.load();
  };

  atmosphereVideo.addEventListener("canplay", () => {
    atmosphereVideo.classList.add("is-ready");
    if (videoVisible && !document.hidden) atmosphereVideo.play().catch(() => {});
  });
  atmosphereVideo.addEventListener("error", () => {
    atmosphereVideo.classList.remove("is-ready");
  });

  const videoObserver = new IntersectionObserver(([entry]) => {
    videoVisible = entry.isIntersecting;
    if (videoVisible) {
      configureAtmosphereVideo();
      if (!document.hidden) atmosphereVideo.play().catch(() => {});
    } else {
      atmosphereVideo.pause();
    }
  }, { rootMargin: "180px" });

  videoObserver.observe(atmosphereVideo);
  window.addEventListener("resize", configureAtmosphereVideo);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) atmosphereVideo.pause();
    else if (videoVisible) atmosphereVideo.play().catch(() => {});
  });
}

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
    const mobileTravel = Math.max(viewportHeight * 0.82, 1);

    const progress = heroPinnedLayout.matches
      ? clampHero(-rect.top / travel)
      : clampHero(-rect.top / mobileTravel);

    const exit = clampHero((progress - 0.76) / 0.24);
    heroParallax.style.setProperty("--hero-progress", progress.toFixed(4));
    heroParallax.style.setProperty("--hero-exit", exit.toFixed(4));

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

const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

if (precisePointer.matches && !reducedMotion) {
  document.querySelectorAll("[data-project-tilt]").forEach((card) => {
    let tiltFrame = null;

    card.addEventListener("pointermove", (event) => {
      if (tiltFrame !== null) return;
      tiltFrame = window.requestAnimationFrame(() => {
        tiltFrame = null;
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.setProperty("--tilt-x", `${(-y * 1.8).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(x * 2.2).toFixed(2)}deg`);
      });
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  const submitButton = contactForm.querySelector("[data-submit-button]");
  const submitLabel = contactForm.querySelector("[data-submit-label]");
  const formStatus = contactForm.querySelector("[data-form-status]");

  contactForm.addEventListener("invalid", () => {
    if (formStatus) formStatus.textContent = "Bitte prüfe die markierten Pflichtfelder.";
  }, true);

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    submitButton?.setAttribute("disabled", "");
    if (submitLabel) submitLabel.textContent = "Wird gesendet …";
    if (formStatus) formStatus.textContent = "Die Nachricht wird sicher übertragen.";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("Form submission failed");
      contactForm.reset();
      if (formStatus) formStatus.textContent = "Danke – deine Nachricht wurde gesendet.";
      if (submitLabel) submitLabel.textContent = "Nachricht gesendet";
    } catch {
      if (formStatus) formStatus.textContent = "Die Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.";
      if (submitLabel) submitLabel.textContent = "Erneut versuchen";
      submitButton?.removeAttribute("disabled");
    }
  });
}
