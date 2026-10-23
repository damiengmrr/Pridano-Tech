/* Comportements propres à certaines pages : onglets produit, formulaire de contact, brief guidé, 404. */
import { $, $$, reduceMotion, finePointer } from '../core.js';

/* Mesure d’audience (Umami, sans cookie) : événements de conversion, ignorés si l’outil est absent. */
export function track(name, data) {
  try {
    window.umami?.track(name, data);
  } catch {
    /* mesure indisponible : sans effet sur le parcours */
  }
}

/* Onglets accessibles (motif ARIA « tabs ») : flèches, Début, Fin, activation manuelle. */
export function initTheater() {
  const root = $('[data-theater]');
  if (!root) return;
  const tabs = $$('[role="tab"]', root);
  const panels = $$('[role="tabpanel"]', root);
  const select = (i, focus = true) => {
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(j === i));
      t.tabIndex = j === i ? 0 : -1;
    });
    panels.forEach((p, j) => {
      p.hidden = j !== i;
      if (j === i) {
        p.classList.remove('is-entering');
        void p.offsetWidth;
        p.classList.add('is-entering');
      }
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, false));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select((keys[e.key] + tabs.length) % tabs.length);
    });
  });
}

const MESSAGES = {
  projectType: 'Choisissez le type de projet.',
  name: 'Indiquez votre nom.',
  email: 'Indiquez une adresse email valide, par exemple nom@entreprise.fr.',
  message: 'Décrivez votre projet en quelques mots (15 caractères minimum).',
  consent: 'Votre accord est nécessaire pour que nous puissions vous répondre.',
};

/* Formulaire de contact : validation accessible, envoi JSON vers /api/contact (contrat inchangé). */
export function initContactForm() {
  const form = $('[data-contact-form]');
  if (!form) return;
  const submit = $('[data-submit]', form);
  const status = $('[data-form-status]', form);
  submit.disabled = false;

  const projet = new URLSearchParams(location.search).get('projet');
  const preset = projet && form.querySelector(`input[name="projectType"][value="${CSS.escape(projet)}"]`);
  if (preset) preset.checked = true;

  const setError = (name, message) => {
    const el = $(`#${name}-error`, form);
    const field = name === 'projectType' ? null : form.elements[name];
    if (el) {
      el.textContent = message || '';
      el.hidden = !message;
    }
    if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  const validate = () => {
    const data = new FormData(form);
    const errors = {};
    if (!data.get('projectType')) errors.projectType = MESSAGES.projectType;
    if (!String(data.get('name') || '').trim()) errors.name = MESSAGES.name;
    const email = String(data.get('email') || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = MESSAGES.email;
    if (String(data.get('message') || '').trim().length < 15) errors.message = MESSAGES.message;
    if (!form.elements.consent.checked) errors.consent = MESSAGES.consent;
    for (const key of Object.keys(MESSAGES)) setError(key, errors[key]);
    return errors;
  };

  const show = (state, message) => {
    status.hidden = false;
    status.dataset.state = state;
    status.textContent = message;
  };

  for (const name of ['name', 'email', 'message']) {
    form.elements[name].addEventListener('blur', () => {
      if (form.elements[name].getAttribute('aria-invalid') === 'true') validate();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = validate();
    const first = Object.keys(errors)[0];
    if (first) {
      show('error', 'Merci de vérifier votre nom, votre email, votre message et votre accord pour être recontacté.');
      const target = first === 'projectType' ? form.querySelector('input[name="projectType"]') : form.elements[first];
      target?.focus();
      return;
    }
    const data = new FormData(form);
    const payload = {
      projectType: data.get('projectType'),
      name: String(data.get('name') || '').trim(),
      company: String(data.get('company') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      message: String(data.get('message') || '').trim(),
      website: String(data.get('website') || ''),
      consent: form.elements.consent.checked,
    };
    submit.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    show('pending', 'Envoi en cours…');
    try {
      const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || 'L’envoi est momentanément indisponible.');
      const done = document.createElement('div');
      done.className = 'form-done';
      done.setAttribute('tabindex', '-1');
      done.innerHTML = '<span class="form-done-mark" aria-hidden="true"></span><h2 class="h3"></h2><p>Nous prenons connaissance de votre besoin.</p><p><a class="link" href="/realisations">Découvrir nos réalisations</a></p>';
      done.querySelector('h2').textContent = result.message || 'Votre demande a bien été transmise.';
      form.replaceWith(done);
      done.focus();
      track('contact-envoye', { projet: payload.projectType });
    } catch (error) {
      show('error', `${error.message} Vous pouvez aussi écrire à pridanotech@gmail.com.`);
      submit.disabled = false;
    } finally {
      submit.removeAttribute('aria-busy');
    }
  });
}

/* Brief guidé : icônes locales (remplace la bibliothèque distante), moteur conservé, modale accessible. */
const ICONS = {
  sparkles: 'M12 3.5 13.8 10l6.7 2-6.7 2L12 20.5 10.2 14l-6.7-2 6.7-2Z',
  'user-round': 'M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 7.5c.8-3.4 3.6-5.5 7-5.5s6.2 2.1 7 5.5',
  activity: 'M3 12h4l3 7 4-14 3 7h4',
  'shield-check': 'M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6Zm-3.2 9.2 2.2 2.2 4.4-4.6',
  'alert-circle': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5.5m0 3v.01',
  'arrow-up-right': 'M7 17 17 7m-8.5 0H17v8.5',
  x: 'm6 6 12 12M18 6 6 18',
};

function createIcons() {
  for (const el of $$('i[data-lucide]')) {
    const d = ICONS[el.dataset.lucide];
    if (!d) continue;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'lucide-icon');
    svg.innerHTML = `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    el.replaceWith(svg);
  }
}

export async function initQuote() {
  if (!$('[data-quote-app]')) return;
  window.lucide = { createIcons };
  window.PridanoApp = { refreshIcons: createIcons };
  const { initPage } = await import('../quote/quote.js');
  initPage();
  createIcons();

  /* La modale de relecture garde le focus et le rend à l’élément d’origine à la fermeture. */
  const modal = $('[data-review-modal]');
  let opener = null;
  new MutationObserver(() => {
    if (!modal.hidden) {
      opener = document.activeElement;
      requestAnimationFrame(() => $('input, textarea, button', modal.querySelector('.review-modal-card'))?.focus());
    } else if (opener) {
      opener.focus?.();
      opener = null;
    }
  }).observe(modal, { attributes: true, attributeFilter: ['hidden'] });
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = $$('a[href], button:not([disabled]), input, textarea, select', modal.querySelector('.review-modal-card')).filter((el) => el.offsetParent !== null);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  const success = $('[data-quote-success]');
  new MutationObserver(() => {
    if (success.hidden) return;
    success.focus();
    track('brief-envoye');
  }).observe(success, { attributes: true, attributeFilter: ['hidden'] });
}

/* 404 : le point égaré suit le pointeur de loin, sans jamais tout à fait rejoindre le symbole. */
export function initLost() {
  const root = $('[data-lost]');
  const dot = root && $('[data-lost-dot]', root);
  if (!dot || reduceMotion.matches || !finePointer.matches) return;
  root.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    dot.style.setProperty('--lx', `${(x * 60).toFixed(1)}px`);
    dot.style.setProperty('--ly', `${(y * 40).toFixed(1)}px`);
  }, { passive: true });
}
