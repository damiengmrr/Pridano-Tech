const { test, expect } = require('@playwright/test');

/* L’animation d’arrivée a son propre test : ailleurs, elle est considérée comme déjà vue. */
test.beforeEach(async ({ page }, info) => {
  if (!info.title.startsWith('intro')) await page.addInitScript(() => sessionStorage.setItem('pt-intro', '1'));
});

const routes = ['/', '/sites-web', '/saas', '/realisations', '/crm', '/a-propos', '/contact', '/devis', '/mentions-legales', '/confidentialite'];
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
  await dialog.getByRole('link', { name: /SaaS & logiciels/ }).click();
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

test('Transformation : étapes pilotables sans défilement (mobile)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const section = page.locator('#transformation');
  await section.scrollIntoViewIfNeeded();
  await section.getByRole('button', { name: /Un outil commun/ }).click();
  await expect(section.getByRole('button', { name: /Un outil commun/ })).toHaveAttribute('aria-pressed', 'true', { timeout: 4000 });
  await expect(section.locator('[data-tf-state]')).toHaveText('Un outil commun.');
});

test('hero : visuel statique immédiat, scène WebGL ensuite, aucune dépendance au canvas pour le texte', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.hero-poster img')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Des sites');
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
  expect(await page.locator('#transformation').evaluate((el) => el.classList.contains('is-pinned'))).toBe(false);
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
