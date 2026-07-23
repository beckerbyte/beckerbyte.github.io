const menuButton = document.getElementById("menu-button");
const mobileMenu = document.getElementById("mobile-menu");
const sharedReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-fallback-next]").forEach((image) => {
  image.addEventListener("error", () => {
    image.classList.add("hidden");
    image.nextElementSibling?.classList.remove("hidden");
  });
});

const closeMobileMenu = () => {
  mobileMenu?.classList.add("hidden");
  menuButton?.setAttribute("aria-expanded", "false");
};

menuButton?.addEventListener("click", () => {
  const isOpen = !mobileMenu?.classList.contains("hidden");
  mobileMenu?.classList.toggle("hidden");
  menuButton.setAttribute("aria-expanded", String(!isOpen));
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

const year = document.getElementById("year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const siteParallax = document.querySelector("[data-site-parallax]");

if (siteParallax && !sharedReducedMotion) {
  let siteParallaxFrame = null;

  const updateSiteParallax = () => {
    siteParallaxFrame = null;

    const viewportHeight = window.innerHeight;
    const pageTravel = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
    const pageProgress = Math.min(Math.max(window.scrollY / pageTravel, 0), 1);
    const introTravel = Math.max(Math.min(viewportHeight * 0.68, pageTravel), 1);
    const introProgress = Math.min(Math.max(window.scrollY / introTravel, 0), 1);

    siteParallax.style.setProperty("--hero-progress", introProgress.toFixed(4));
    siteParallax.style.setProperty("--page-progress", pageProgress.toFixed(4));
  };

  const requestSiteParallaxUpdate = () => {
    if (siteParallaxFrame !== null) return;
    siteParallaxFrame = window.requestAnimationFrame(updateSiteParallax);
  };

  window.addEventListener("scroll", requestSiteParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestSiteParallaxUpdate);
  requestSiteParallaxUpdate();
}
