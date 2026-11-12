const { test, expect } = require('@playwright/test');

/* L’animation d’arrivée a son propre test : ailleurs, elle est considérée comme déjà vue. */
test.beforeEach(async ({ page }, info) => {
  if (!info.title.startsWith('intro')) await page.addInitScript(() => sessionStorage.setItem('pt-intro', '1'));
});

const routes = ['/', '/sites-web', '/saas', '/prestations', '/prestations/e-commerce', '/prestations/agents-ia', '/prestations/automatisations', '/prestations/maintenance', '/logiciels', '/logiciels/finance', '/logiciels/booking', '/realisations', '/crm', '/a-propos', '/contact', '/devis', '/mentions-legales', '/confidentialite'];
const sizes = [['desktop', 1440, 900], ['laptop', 1280, 800], ['tablet', 768, 1024], ['mobile', 390, 844], ['petit', 320, 640]];

for (const [name, width, height] of sizes) {
  test(`${name} (${width}px) : pages, H1, débordement, images, console`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response.status(), route).toBe(200);
      await expect(page.locator('h1'), route).toHaveCount(1);
      await expect(page.locator('h1'), route).toBeVisible();
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.9) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 30));
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} : débordement horizontal`).toBe(true);
      const broken = await page.locator('img').evaluateAll((imgs) => imgs.filter((i) => i.complete && i.currentSrc && !i.naturalWidth).map((i) => i.currentSrc));
      expect(broken, route).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test('navigation clavier : lien d’évitement, focus visible, lien principal', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Aller au contenu' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.goto('/');
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => ({ text: document.activeElement.textContent.trim(), shadow: getComputedStyle(document.activeElement).boxShadow }));
  expect(focused.shadow).not.toBe('none');
});

test('menu mobile : feuille modale, Échap, retour du focus, navigation et pré-sélection du projet', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'Menu', exact: true });
  await opener.click();
  await expect(opener).toHaveAttribute('aria-expanded', 'true');
  const dialog = page.getByRole('dialog', { name: 'Menu' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByRole('link', { name: /^Solutions/ }).click();
  await expect(page).toHaveURL(/\/prestations$/);
  await page.locator('a[href="/saas"]').first().click();
  await expect(page).toHaveURL(/\/saas$/);
  await page.getByRole('link', { name: 'Parler de mon logiciel' }).first().click();
  await expect(page).toHaveURL(/\/contact\?projet=saas/);
  await expect(page.getByRole('radio', { name: 'Créer un SaaS ou un logiciel' })).toBeChecked();
});

test('contact : validation accessible, erreur serveur sans perte de saisie, confirmation', async ({ page }) => {
  await page.goto('/contact?projet=refonte');
  await expect(page.getByRole('radio', { name: 'Refondre un site existant' })).toBeChecked();
  const submit = page.getByRole('button', { name: 'Parler de votre projet' });
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByLabel(/Votre nom/)).toBeFocused();
  await expect(page.getByLabel(/Votre nom/)).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#name-error')).toBeVisible();
  await page.getByLabel(/Votre nom/).fill('QA locale');
  await page.getByLabel(/Email professionnel/).fill('qa@example.test');
  await page.getByLabel(/Parlez-nous de votre projet/).fill('Test local du formulaire, sans envoi externe.');
  await page.getByLabel(/J’accepte que Pridano utilise/).check();
  await page.route('**/api/contact', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, message: 'L’envoi est momentanément indisponible.' }) }));
  await submit.click();
  await expect(page.locator('[data-form-status]')).toContainText('indisponible');
  await expect(page.getByLabel(/Parlez-nous de votre projet/)).toHaveValue('Test local du formulaire, sans envoi externe.');
  let payload;
  await page.route('**/api/contact', (route) => {
    payload = route.request().postDataJSON();
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await submit.click();
  await expect(page.getByRole('heading', { name: 'Votre demande a bien été transmise.' })).toBeVisible();
  expect(payload).toMatchObject({ projectType: 'refonte', name: 'QA locale', email: 'qa@example.test', consent: true, website: '' });
});

test('Business OS : onglets au clavier et captures réelles', async ({ page }) => {
  await page.goto('/crm');
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(4);
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Facturez/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: /Facturez/ })).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: /Centralisez/ })).toBeFocused();
  await expect(page.getByRole('img', { name: /Écran de connexion Pridano/ })).toBeVisible();
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: /Pilotez/ })).toHaveAttribute('aria-selected', 'true');
});

test('Sites web : les neuf couches de la démonstration au toucher', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/sites-web');
  const device = page.locator('[data-build-device]');
  for (let i = 0; i < 9; i++) {
    await page.locator(`[data-build-btn="${i}"]`).click();
    await expect(device).toHaveAttribute('data-stage', String(i));
    await expect(page.locator(`[data-build-btn="${i}"]`)).toHaveAttribute('aria-pressed', 'true');
  }
});

test('navigation rapide : méga-menu et recherche des solutions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Afficher : Solutions' }).click();
  await expect(page.locator('[data-mega-panel="solutions"]')).toBeVisible();
  await expect(page.locator('[data-mega-panel="solutions"] a.mega-link')).toHaveCount(6);
  await page.getByRole('button', { name: 'Rechercher une solution' }).click();
  const search = page.getByRole('dialog', { name: 'Trouver une solution Pridano' });
  await expect(search).toBeVisible();
  await search.getByRole('searchbox').fill('finance');
  await expect(search.locator('[data-quick-result]:visible')).toHaveCount(1);
  await expect(search.getByRole('link', { name: /Pridano Finance/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(search).toBeHidden();
});

test('hero : visuel statique immédiat, scène WebGL ensuite, aucune dépendance au canvas pour le texte', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.hero-poster img')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tout votre');
  await expect(page.getByRole('navigation', { name: 'Nos expertises' }).getByRole('listitem')).toHaveCount(3);
  /* La scène 3D démarre sur GPU ; en rendu logiciel (navigateur de test sans GPU) le visuel statique reste affiché. */
  await expect(page.locator('[data-hero]')).toHaveAttribute('data-scene', /^(webgl|static)$/, { timeout: 15000 });
  const scene = await page.locator('[data-hero]').getAttribute('data-scene');
  if (scene === 'static') await expect(page.locator('.hero-poster img')).toBeVisible();
  else await expect(page.locator('[data-hero-stage]')).toHaveClass(/is-live/);
});

test('mouvement réduit : pas de scène WebGL, contenus visibles, séquences dépliées', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForTimeout(3000);
  await expect(page.locator('[data-hero-stage]')).not.toHaveClass(/is-live/);
  await expect(page.locator('#vos-solutions')).toBeVisible();
  const hidden = await page.locator('[data-reveal]').evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== '1').length);
  expect(hidden).toBe(0);
});

test('brief guidé : moteur initialisé, saisie et réponse rapide', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/devis');
  await expect(page.locator('[data-assistant-health]')).not.toContainText('Vérification', { timeout: 10000 });
  await expect(page.locator('[data-chat-log] .message')).toHaveCount(1);
  await expect(page.locator('[data-quick-reply]').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('liens internes et ancres : tous résolus', async ({ page, request }) => {
  const checked = new Set();
  for (const route of routes) {
    await page.goto(route);
    const hrefs = await page.locator('a[href]').evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href')))]);
    for (const href of hrefs) {
      if (href.startsWith('#')) {
        if (href.length > 1) expect(await page.locator(href).count(), `${route} ${href}`).toBeGreaterThan(0);
        continue;
      }
      if (!href.startsWith('/') || checked.has(href)) continue;
      checked.add(href);
      const [path, hash] = href.split('#');
      const res = await request.get(path);
      expect(res.status(), href).toBeLessThan(400);
      if (hash) expect((await res.text()).includes(`id="${hash}"`), href).toBe(true);
    }
  }
});

test('mobile : en-tête qui se range au défilement lent, dock après le haut de page, démos jouées au doigt', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => sessionStorage.setItem('pt-intro', '1'));
  const page = await ctx.newPage();
  await page.goto('/');
  const header = page.locator('[data-header]');
  const dock = page.locator('[data-dock]');
  /* En haut de page : un seul bouton Menu (dans l’en-tête), le dock est rangé et hors du clavier. */
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toHaveCount(1);
  await expect(dock).toHaveClass(/is-tucked/);
  /* Défilement lent (4 px par image) : l’en-tête finit par se ranger, le dock sort. */
  await page.evaluate(() => window.scrollTo(0, 700));
  for (let i = 0; i < 30; i++) await page.evaluate(() => window.scrollBy(0, 4));
  await expect(header).toHaveClass(/is-hidden/);
  await expect(dock).not.toHaveClass(/is-tucked/);
  /* En remontant, l’en-tête revient. */
  for (let i = 0; i < 12; i++) await page.evaluate(() => window.scrollBy(0, -4));
  await expect(header).not.toHaveClass(/is-hidden/);
  /* Aucun carré bleu de point final hors de son mot (titres révélés mot par mot). */
  expect(await page.locator('.split .pt').evaluateAll((els) => els.filter((el) => !el.closest('.sw')).length)).toBe(0);
  /* Sites web : la démo d’une qualité se joue à l’écran, la démonstration couche par couche avance seule. */
  await page.goto('/sites-web');
  await page.locator('.q-tile').first().scrollIntoViewIfNeeded();
  await expect(page.locator('.q-tile').first()).toHaveClass(/is-play/);
  await page.locator('.build-figure').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-build-device]')).not.toHaveAttribute('data-stage', '0', { timeout: 4000 });
  await ctx.close();
});

test('intro : film complet à la première visite, version courte ensuite, Passer et Échap, jamais en mouvement réduit', async ({ page, browser }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const film = page.locator('[data-film]');
  await expect(film).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.dataset.intro)).toBe('full');
  /* Le vrai contenu est présent sous le film dès le départ. */
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.site-header')).toBeHidden();
  await page.getByRole('button', { name: 'Passer l’intro' }).click();
  await expect(film).toHaveCount(0, { timeout: 3000 });
  await expect(page.locator('.site-header')).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');

  /* Même visite : plus de film. */
  await page.reload();
  await expect(page.locator('[data-film]')).toHaveCount(0);

  /* Nouvelle visite du même visiteur : version courte, Échap pour passer. */
  const again = await page.context().newPage();
  await again.goto('/');
  await expect(again.locator('[data-film]')).toBeVisible();
  expect(await again.evaluate(() => document.documentElement.dataset.intro)).toBe('short');
  await again.keyboard.press('Escape');
  await expect(again.locator('[data-film]')).toHaveCount(0, { timeout: 3000 });
  await again.close();

  /* Défilement : le film laisse la place sans attendre. */
  const wheel = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await wheel.goto('/');
  await expect(wheel.locator('[data-film]')).toBeVisible();
  await wheel.mouse.wheel(0, 300);
  await expect(wheel.locator('[data-film]')).toHaveCount(0, { timeout: 3000 });
  await wheel.close();

  const calm = await browser.newPage({ reducedMotion: 'reduce' });
  await calm.goto('/');
  await expect(calm.locator('[data-film]')).toHaveCount(0);
  await calm.close();

  /* Sans interaction, le film se termine seul et rend la main au hero. */
  const full = await browser.newPage();
  const errors = [];
  full.on('pageerror', (e) => errors.push(e.message));
  await full.goto('/');
  await expect(full.locator('[data-film]')).toBeVisible();
  await expect(full.locator('[data-film]')).toHaveCount(0, { timeout: 10000 });
  await expect(full.locator('.hero-poster')).toBeVisible();
  expect(errors).toEqual([]);
  await full.close();

  /* Arrivée par une autre page : la visite a commencé, l’accueil s’affiche directement. */
  const deep = await browser.newPage();
  await deep.goto('/sites-web');
  await deep.goto('/');
  await expect(deep.locator('[data-film]')).toHaveCount(0);
  await deep.close();
});

test('catalogue des prestations : navigation par catégorie, page de détail, devis présélectionné', async ({ page }) => {
  await page.goto('/prestations');
  await page.getByRole('navigation', { name: 'Catégories de prestations' }).getByRole('link', { name: 'Agents IA' }).click();
  await expect(page).toHaveURL(/#agents-ia$/);
  await expect(page.locator('#agents-ia')).toBeInViewport();
  await page.locator('#agents-ia a[href$="#prestation-chatbot"]').click();
  await expect(page).toHaveURL(/\/prestations\/agents-ia#prestation-chatbot$/);
  await expect(page.locator('#prestation-chatbot')).toBeVisible();
  await page.locator('#prestation-chatbot').getByRole('link', { name: 'Demander un devis' }).click();
  await expect(page).toHaveURL(/\/devis\?besoins=agent-ia$/);
  await expect(page.locator('[data-need][value="agent-ia"]')).toBeChecked();
});

test('catalogue des logiciels : présentés « à venir », CRM relié, intérêt via le formulaire de contact', async ({ page }) => {
  await page.goto('/logiciels');
  await expect(page.locator('[data-status="disponible"]')).toHaveCount(0);
  await expect(page.locator('#logiciel-finance')).toContainText('Objectifs');
  await expect(page.locator('#logiciel-finance')).toContainText('pas un logiciel de comptabilité');
  await page.locator('#logiciel-finance').getByRole('link', { name: /Découvrir Pridano Finance/ }).click();
  await expect(page).toHaveURL(/\/logiciels\/finance$/);
  await expect(page.locator('#fonctionnalites')).toContainText('Trésorerie');
  await expect(page.locator('main')).toContainText('pas encore commercialisé');
});

test('devis guidé : plusieurs besoins, question ciblée, brouillon conservé, envoi unique et confirmation', async ({ page }) => {
  let sent = 0;
  let payload = null;
  await page.route('**/api/send-brief', async (route) => {
    sent += 1;
    payload = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, message: 'Le brief a bien été envoyé à notre équipe.' }) });
  });
  await page.goto('/devis?parcours=projet');
  await expect(page.locator('[data-need][value="projet-complet"]')).toBeChecked();
  await expect(page.locator('[data-parcours-note]')).toBeVisible();
  await page.locator('[data-need][value="e-commerce"]').check({ force: true });
  await page.locator('[data-composer-input]').fill('J’ouvre un salon de coiffure à Montpellier en mars');
  await page.locator('[data-send-message]').click();
  await expect(page.locator('.message.assistant')).toHaveCount(2);
  /* Répondre jusqu’à la question ciblée sur la boutique. */
  for (let i = 0; i < 6; i++) {
    const last = page.locator('.message.assistant').last();
    if (/Pour la boutique/.test(await last.innerText())) break;
    const count = await page.locator('.message.assistant').count();
    await page.locator('[data-composer-input]').fill('Réponse de test');
    await page.locator('[data-send-message]').click();
    await expect(page.locator('.message.assistant')).toHaveCount(count + 1);
  }
  await expect(page.locator('.message.assistant').last()).toContainText('Pour la boutique');
  /* Changement de page puis retour : la conversation est restaurée. */
  const messages = await page.locator('.message').count();
  await page.goto('/prestations');
  await page.goto('/devis');
  await expect(page.locator('.message')).toHaveCount(messages);
  await expect(page.locator('[data-need][value="e-commerce"]')).toBeChecked();
  /* Relecture : un champ par besoin, puis envoi (double clic) et confirmation après succès seulement. */
  await page.locator('[data-open-review]').last().click();
  await expect(page.locator('[data-service-field="e-commerce"]')).toBeVisible();
  await page.locator('[data-service-field="e-commerce"]').fill('Une vingtaine de produits, retrait sur place');
  for (const [id, value] of [['briefPrimaryGoal', 'Ouvrir le salon'], ['briefTargetAudience', 'Clients du quartier'], ['briefCurrentState', 'Un nom'], ['briefTimeline', 'Mars']]) {
    if (!(await page.locator(`#${id}`).inputValue())) await page.locator(`#${id}`).fill(value);
  }
  await page.locator('#contactName').fill('Test');
  await page.locator('#contactEmail').fill('test@example.com');
  await page.locator('#contactConsent').check();
  await page.locator('[data-submit-brief]').dblclick();
  await expect(page.locator('[data-quote-success]')).toBeVisible();
  expect(sent).toBe(1);
  expect(payload.brief.services).toEqual(['e-commerce', 'projet-complet']);
  expect(payload.brief.serviceDetails['e-commerce']).toBe('Une vingtaine de produits, retrait sur place');
  expect(payload.submissionId).toMatch(/^[a-z0-9-]{8,}$/i);
  expect(await page.evaluate(() => sessionStorage.getItem('pt-devis-brouillon'))).toBeNull();
});

