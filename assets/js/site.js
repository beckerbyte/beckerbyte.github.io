const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

root.dataset.motion = reducedMotion.matches ? "reduced" : "full";
root.classList.add("has-js");
reducedMotion.addEventListener("change", () => {
  root.dataset.motion = reducedMotion.matches ? "reduced" : "full";
});

const header = document.querySelector("[data-site-header]");
let scrollTick = false;

const updateScrollState = () => {
  const current = window.scrollY;
  root.style.setProperty("--scroll", String(current));
  header?.classList.toggle("is-compact", current > 20);
  document.querySelectorAll("[data-frame-story]").forEach((story) => {
    const rect = story.getBoundingClientRect();
    const distance = Math.max(1, story.offsetHeight - window.innerHeight);
    story.style.setProperty("--hero-progress", String(Math.min(1, Math.max(0, -rect.top / distance))));
  });
  scrollTick = false;
};

window.addEventListener("scroll", () => {
  if (!scrollTick) requestAnimationFrame(updateScrollState);
  scrollTick = true;
}, { passive: true });
updateScrollState();

window.addEventListener("pageshow", () => {
  root.classList.remove("is-leaving");
  updateScrollState();
});

if (finePointer.matches && !reducedMotion.matches) {
  window.addEventListener("pointermove", (event) => {
    root.style.setProperty("--mx", String((event.clientX / window.innerWidth - .5) * 2));
    root.style.setProperty("--my", String((event.clientY / window.innerHeight - .5) * 2));
  }, { passive: true });
}

const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    reveal.unobserve(entry.target);
  });
}, { rootMargin: "0px 0px -8%", threshold: .08 });

document.querySelectorAll("[data-reveal]").forEach((element, index) => {
  element.style.transitionDelay = reducedMotion.matches ? "0ms" : `${Math.min(index % 4, 3) * 55}ms`;
  element.dataset.revealVariant = String(index % 4);
  reveal.observe(element);
});

document.querySelectorAll("[data-mobile-nav]").forEach((details) => {
  const summary = details.querySelector("summary");
  const main = document.querySelector("main");
  const footer = document.querySelector("footer");
  let previousFocus = null;

  const close = () => details.removeAttribute("open");
  const sync = () => {
    const open = details.open;
    summary?.setAttribute("aria-expanded", String(open));
    summary?.setAttribute("aria-label", open ? "Navigation schließen" : "Navigation öffnen");
    document.body.classList.toggle("nav-open", open);
    if (open) {
      previousFocus = document.activeElement;
      main?.setAttribute("inert", "");
      footer?.setAttribute("inert", "");
      document.dispatchEvent(new Event("media:pause"));
      details.querySelector("a")?.focus();
    } else {
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      document.dispatchEvent(new Event("media:resume"));
      if (previousFocus && previousFocus !== document.body) previousFocus.focus();
    }
  };

  details.addEventListener("toggle", sync);
  details.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  window.addEventListener("keydown", (event) => {
    if (!details.open) return;
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...details.querySelectorAll("summary, a[href]")].filter((item) => !item.hidden);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  sync();
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

const normalizePathname = (pathname) => {
  if (!pathname || pathname === "/") return "/";
  if (pathname.includes(".")) return pathname;
  return `${pathname.replace(/\/+$/, "")}/`;
};

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target || link.hasAttribute("download")) return;
    const url = new URL(link.href, window.location.href);
    const currentPath = normalizePathname(window.location.pathname);
    const targetPath = normalizePathname(url.pathname);
    if (url.origin !== window.location.origin || targetPath === currentPath || reducedMotion.matches) return;
    event.preventDefault();
    root.classList.add("is-leaving");
    window.setTimeout(() => { window.location.href = url.href; }, 220);
  });
});

document.querySelectorAll("[data-current-year]").forEach((year) => { year.textContent = String(new Date().getFullYear()); });
