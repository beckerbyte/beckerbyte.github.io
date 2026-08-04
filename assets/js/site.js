const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const narrowScreen = window.matchMedia("(max-width: 47.99rem)");
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const saveData = Boolean(connection?.saveData);

root.dataset.motion = reducedMotion.matches ? "reduced" : "full";
root.classList.add("has-js");

const header = document.querySelector("[data-site-header]");
let lastScroll = window.scrollY;
let scrollTick = false;

const updateScrollState = () => {
  const current = window.scrollY;
  root.style.setProperty("--scroll", String(current));
  header?.classList.toggle("is-compact", current > 20);
  header?.classList.toggle("is-hidden", current > lastScroll && current > 180 && !document.querySelector("[data-mobile-nav][open]"));
  lastScroll = current;
  scrollTick = false;
};

window.addEventListener("scroll", () => {
  if (!scrollTick) requestAnimationFrame(updateScrollState);
  scrollTick = true;
}, { passive: true });
updateScrollState();

window.addEventListener("pointermove", (event) => {
  root.style.setProperty("--mx", String((event.clientX / window.innerWidth - .5) * 2));
  root.style.setProperty("--my", String((event.clientY / window.innerHeight - .5) * 2));
}, { passive: true });

const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    reveal.unobserve(entry.target);
  });
}, { rootMargin: "0px 0px -8%", threshold: .08 });

document.querySelectorAll("[data-reveal]").forEach((element, index) => {
  element.style.transitionDelay = reducedMotion.matches ? "0ms" : `${Math.min(index % 4, 3) * 55}ms`;
  reveal.observe(element);
});

document.querySelectorAll("[data-mobile-nav]").forEach((details) => {
  details.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => details.removeAttribute("open")));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") details.removeAttribute("open");
  });
});

const chooseFormat = () => {
  if (narrowScreen.matches) return "mobile";
  if (window.matchMedia("(max-width: 74.99rem)").matches) return "tablet";
  return "desktop";
};

const prepareVideo = (video) => {
  if (saveData || reducedMotion.matches || video.dataset.loaded) return;
  const sceneName = video.dataset.atmosphere;
  const format = chooseFormat();
  const rootPath = `/assets/media/system/${sceneName}/${sceneName}-${format}`;
  const webm = document.createElement("source");
  webm.src = `${rootPath}.webm`;
  webm.type = "video/webm";
  const mp4 = document.createElement("source");
  mp4.src = `${rootPath}.mp4`;
  mp4.type = "video/mp4";
  video.append(webm, mp4);
  video.dataset.loaded = "true";
  video.load();
  video.addEventListener("playing", () => video.classList.add("is-playing"), { once: true });
  video.play().catch(() => {});
};

const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting) {
      prepareVideo(video);
      if (video.dataset.loaded) video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, { rootMargin: "30% 0px", threshold: .01 });

document.querySelectorAll("[data-atmosphere]").forEach((video) => videoObserver.observe(video));

document.addEventListener("visibilitychange", () => {
  document.querySelectorAll("[data-atmosphere]").forEach((video) => {
    if (document.hidden) video.pause();
  });
});

document.querySelectorAll("[data-contact-form]").forEach((form) => {
  const textarea = form.querySelector("textarea");
  const count = form.querySelector("[data-character-count]");
  const status = form.querySelector("[data-form-status]");
  textarea?.addEventListener("input", () => { count.textContent = String(textarea.value.length); });
  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      status.textContent = "Bitte prüfe die markierten Pflichtfelder.";
      form.reportValidity();
      return;
    }
    status.textContent = "Nachricht wird sicher übermittelt …";
    form.querySelector("button[type='submit']")?.setAttribute("aria-disabled", "true");
  });
});

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target || link.hasAttribute("download")) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname || reducedMotion.matches) return;
    event.preventDefault();
    root.classList.add("is-leaving");
    window.setTimeout(() => { window.location.href = url.href; }, 220);
  });
});

document.querySelectorAll("[data-current-year]").forEach((year) => { year.textContent = String(new Date().getFullYear()); });
