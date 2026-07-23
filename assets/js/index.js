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
