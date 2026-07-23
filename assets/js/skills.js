const motionScene = document.querySelector("[data-motion-scene]");

if (motionScene) {
  const motionPercent = motionScene.querySelector("[data-motion-percent]");
  const motionPhases = [...motionScene.querySelectorAll("[data-ae-phase]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pinnedLayout = window.matchMedia("(min-width: 900px) and (min-height: 720px)");
  let motionFrame = null;

  const clamp = (value, minimum = 0, maximum = 1) =>
    Math.min(Math.max(value, minimum), maximum);

  const range = (progress, start, end) =>
    clamp((progress - start) / (end - start));

  const updateMotionScene = () => {
    motionFrame = null;

    if (reducedMotion.matches || !pinnedLayout.matches) {
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
  pinnedLayout.addEventListener("change", requestMotionUpdate);
  requestMotionUpdate();
}
