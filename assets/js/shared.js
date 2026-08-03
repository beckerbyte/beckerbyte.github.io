const menuButton = document.getElementById("menu-button");
const mobileMenu = document.getElementById("mobile-menu");
const sharedReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


const siteHeader = document.querySelector("header.fixed");
const headerHideDistance = 14;
const headerShowDistance = 6;

if (siteHeader) {
  siteHeader.classList.add("site-header");

  let lastHeaderScrollY = Math.max(window.scrollY, 0);
  let headerDirection = 0;
  let headerDirectionDistance = 0;
  let headerFrame = null;

  const showSiteHeader = () => {
    siteHeader.classList.remove("is-hidden");
  };

  const updateSiteHeader = () => {
    headerFrame = null;

    const currentScrollY = Math.max(window.scrollY, 0);
    siteHeader.classList.toggle("is-compact", currentScrollY > 24);
    const delta = currentScrollY - lastHeaderScrollY;
    const menuIsOpen = mobileMenu && !mobileMenu.classList.contains("hidden");
    const headerHasFocus = siteHeader.contains(document.activeElement);

    if (currentScrollY <= 32 || menuIsOpen || headerHasFocus) {
      showSiteHeader();
      headerDirection = 0;
      headerDirectionDistance = 0;
      lastHeaderScrollY = currentScrollY;
      return;
    }

    if (Math.abs(delta) < 1) {
      lastHeaderScrollY = currentScrollY;
      return;
    }

    const nextDirection = delta > 0 ? 1 : -1;

    if (nextDirection !== headerDirection) {
      headerDirection = nextDirection;
      headerDirectionDistance = 0;
    }

    headerDirectionDistance += Math.abs(delta);

    if (headerDirection > 0 && headerDirectionDistance >= headerHideDistance) {
      siteHeader.classList.add("is-hidden");
      headerDirectionDistance = 0;
    } else if (headerDirection < 0 && headerDirectionDistance >= headerShowDistance) {
      showSiteHeader();
      headerDirectionDistance = 0;
    }

    lastHeaderScrollY = currentScrollY;
  };

  const requestHeaderUpdate = () => {
    if (headerFrame !== null) return;
    headerFrame = window.requestAnimationFrame(updateSiteHeader);
  };

  window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
  siteHeader.addEventListener("focusin", showSiteHeader);
  updateSiteHeader();
}

const sectionNavigation = [...document.querySelectorAll("[data-nav-section]")]
  .filter((link) => document.getElementById(link.dataset.navSection));

if (sectionNavigation.length && "IntersectionObserver" in window) {
  const sections = sectionNavigation
    .map((link) => document.getElementById(link.dataset.navSection))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    sectionNavigation.forEach((link) => {
      const isActive = link.dataset.navSection === visible.target.id;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-35% 0px -50%", threshold: [0, 0.25, 0.6] });

  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll("[data-fallback-next]").forEach((image) => {
  image.addEventListener("error", () => {
    image.classList.add("hidden");
    image.nextElementSibling?.classList.remove("hidden");
  });
});

const closeMobileMenu = ({ restoreFocus = false } = {}) => {
  if (!mobileMenu || !menuButton) return;
  mobileMenu.classList.add("hidden");
  mobileMenu.inert = true;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Navigation öffnen");
  document.documentElement.classList.remove("mobile-menu-open");
  if (restoreFocus) menuButton.focus();
};

menuButton?.addEventListener("click", () => {
  if (!mobileMenu) return;
  const isOpen = !mobileMenu.classList.contains("hidden");

  if (isOpen) {
    closeMobileMenu();
    return;
  }

  mobileMenu.classList.remove("hidden");
  mobileMenu.inert = false;
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Navigation schließen");
  document.documentElement.classList.add("mobile-menu-open");
  siteHeader?.classList.remove("is-hidden");
  window.requestAnimationFrame(() => mobileMenu.querySelector("a")?.focus());
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

document.addEventListener("pointerdown", (event) => {
  if (
    mobileMenu &&
    menuButton &&
    !mobileMenu.classList.contains("hidden") &&
    !mobileMenu.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    closeMobileMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu({ restoreFocus: true });
  }
});

window.addEventListener("resize", () => {
  if (window.matchMedia("(min-width: 768px)").matches) closeMobileMenu();
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
