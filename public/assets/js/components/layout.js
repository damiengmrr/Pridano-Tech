import { companyDetails, footerGroups, siteNavigation } from "../site-data.js";

function renderNavigation(currentPage) {
  return siteNavigation
    .map(
      (item) => `
        <a href="${item.href}" class="nav-link ${item.id === currentPage ? "is-active" : ""}">
          ${item.label}
        </a>
      `,
    )
    .join("");
}

function renderFooterGroups() {
  return footerGroups
    .map(
      (group) => `
        <div class="footer-group">
          <p class="footer-title">${group.title}</p>
          <div class="footer-links">
            ${group.links
              .map(
                (link) => `
                  <a href="${link.href}" class="footer-link">${link.label}</a>
                `,
              )
              .join("")}
          </div>
        </div>
      `,
    )
    .join("");
}

export function renderSiteChrome(currentPage) {
  const headerRoot = document.querySelector("[data-site-header]");
  const footerRoot = document.querySelector("[data-site-footer]");
  const year = new Date().getFullYear();

  if (headerRoot) {
    headerRoot.innerHTML = `
      <header class="site-header" data-header>
        <div class="shell nav-shell">
          <a href="/index.html" class="brand-mark">
            <img src="/assets/images/pridano-logo.png" alt="Pridano Tech" width="42" height="42" />
            <span>
              <strong>Pridano Tech</strong>
              <small>Studio digital</small>
            </span>
          </a>

          <nav class="desktop-nav" aria-label="Navigation principale">
            ${renderNavigation(currentPage)}
          </nav>

          <div class="nav-actions">
            <a href="/devis.html" class="btn btn-primary nav-cta">Demander un devis</a>
            <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" data-menu-toggle>
              <span class="sr-only">Ouvrir le menu</span>
              <i data-lucide="menu"></i>
            </button>
          </div>
        </div>

        <div id="mobile-nav" class="mobile-nav" data-mobile-nav hidden>
          <div class="shell mobile-nav-inner">
            ${renderNavigation(currentPage)}
            <a href="/devis.html" class="btn btn-primary">Demander un devis</a>
          </div>
        </div>
      </header>
    `;
  }

  if (footerRoot) {
    footerRoot.innerHTML = `
      <footer class="site-footer">
        <div class="shell footer-shell">
          <div class="footer-intro">
            <p class="eyebrow">Pridano Tech</p>
            <h2>Moins de bruit. Plus de clarté.</h2>
            <p>${companyDetails.positioning}</p>
            <a href="mailto:${companyDetails.email}" class="footer-email">${companyDetails.email}</a>
          </div>

          <div class="footer-grid">
            ${renderFooterGroups()}

            <div class="footer-group">
              <p class="footer-title">Contact</p>
              <div class="footer-links">
                <span class="footer-meta">${companyDetails.city} · France</span>
                <span class="footer-meta">Cadrage, UX/UI, front premium, produit, IA</span>
                <a href="/confidentialite.html" class="footer-link">Politique de confidentialité</a>
              </div>
            </div>
          </div>
        </div>

        <div class="shell footer-bottom">
          <span>${companyDetails.name} · ${year}</span>
          <span>Refonte web, produit et IA utile.</span>
        </div>
      </footer>
    `;
  }
}
