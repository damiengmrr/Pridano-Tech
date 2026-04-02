import { renderSiteChrome } from "./components/layout.js";
import { initRevealAnimations } from "./utils/reveal.js";

function initHeader() {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  const syncHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      mobileNav.hidden = isOpen;
      mobileNav.classList.toggle("is-open", !isOpen);
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuButton.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
        mobileNav.classList.remove("is-open");
      });
    });
  }
}

function initPageController(page) {
  const pageModules = {
    quote: () => import("./pages/quote.js"),
  };

  const loader = pageModules[page];
  if (!loader) {
    return Promise.resolve();
  }

  return loader().then((module) => {
    if (typeof module.initPage === "function") {
      module.initPage();
    }
  });
}

function refreshIcons() {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
}

function initCodeTyping() {
  const root = document.querySelector("[data-code-typing]");

  if (!root) {
    return;
  }

  const lines = [...root.querySelectorAll("[data-code-line]")];

  if (!lines.length) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    lines.forEach((line) => {
      line.textContent = line.dataset.text || "";
      line.parentElement?.classList.add("is-complete");
    });
    root.classList.add("is-complete");
    return;
  }

  lines.forEach((line) => {
    line.textContent = "";
  });

  let currentLineIndex = 0;

  const typeNextLine = () => {
    const line = lines[currentLineIndex];

    if (!line) {
      root.classList.add("is-complete");
      return;
    }

    const container = line.parentElement;
    const text = line.dataset.text || "";
    let characterIndex = 0;

    container?.classList.add("is-active");

    const tick = () => {
      line.textContent = text.slice(0, characterIndex);

      if (characterIndex < text.length) {
        characterIndex += 1;
        const currentCharacter = text.charAt(characterIndex - 1);
        const delay = /[{}:,]/.test(currentCharacter) ? 72 : 32;
        window.setTimeout(tick, delay);
        return;
      }

      container?.classList.remove("is-active");
      container?.classList.add("is-complete");
      currentLineIndex += 1;
      window.setTimeout(typeNextLine, 120);
    };

    tick();
  };

  window.setTimeout(typeNextLine, 180);
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentPage = document.body.dataset.page || "home";

  renderSiteChrome(currentPage);
  initHeader();
  initRevealAnimations();
  initCodeTyping();
  refreshIcons();
  await initPageController(currentPage);
  refreshIcons();
});

window.PridanoApp = {
  refreshIcons,
};
