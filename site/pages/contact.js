const { brand, projectTypes } = require('../data/brand');
const { icon, pt, btn, label, link } = require('../lib/html');
const { breadcrumb } = require('../components/sections');
const { directContacts } = require('../components/layout');

function field({ id, name, labelText, type = 'text', required = false, autocomplete = '', max = 200, hint = '', textarea = false, min = 0, optional = '' }) {
  const req = required ? ' required aria-required="true"' : '';
  const control = textarea
    ? `<textarea class="input" id="${id}" name="${name}" rows="6" maxlength="${max}"${min ? ` minlength="${min}"` : ''}${req} aria-describedby="${id}-error${hint ? ` ${id}-hint` : ''}"></textarea>`
    : `<input class="input" id="${id}" name="${name}" type="${type}" maxlength="${max}"${autocomplete ? ` autocomplete="${autocomplete}"` : ''}${req} aria-describedby="${id}-error${hint ? ` ${id}-hint` : ''}">`;
  return `<div class="field">
<label for="${id}">${labelText}${required ? ' <span class="req" aria-hidden="true">*</span>' : optional}</label>
${control}
${hint ? `<p class="field-hint" id="${id}-hint">${hint}</p>` : ''}
<p class="field-error" id="${id}-error" hidden></p>
</div>`;
}

function form() {
  const choices = projectTypes.map(([value, text], i) => `<label class="choice"><input type="radio" name="projectType" value="${value}"${i === 0 ? ' required' : ''}><span>${text}</span></label>`).join('');
  return `<form class="contact-form" id="formulaire" data-contact-form action="/api/contact" method="post" novalidate aria-describedby="form-intro">
<p class="contact-form-step" id="form-intro">Votre projet <span class="index-num">01 — Faisons connaissance</span></p>
<fieldset class="choices" aria-describedby="projectType-error">
<legend>Vous souhaitez… <span class="req" aria-hidden="true">*</span></legend>
${choices}
<p class="field-error" id="projectType-error" hidden></p>
</fieldset>
<div class="form-row">
${field({ id: 'name', name: 'name', labelText: 'Votre nom', required: true, autocomplete: 'name', max: 120 })}
${field({ id: 'company', name: 'company', labelText: 'Entreprise', autocomplete: 'organization', max: 160 })}
</div>
<div class="form-row">
${field({ id: 'email', name: 'email', labelText: 'Email professionnel', type: 'email', required: true, autocomplete: 'email', max: 254 })}
${field({ id: 'phone', name: 'phone', labelText: 'Téléphone', type: 'tel', autocomplete: 'tel', max: 40, optional: ' <span class="muted">(facultatif)</span>' })}
</div>
${field({ id: 'message', name: 'message', labelText: 'Parlez-nous de votre projet', required: true, textarea: true, max: 6000, min: 15 })}
<div class="hp-field" aria-hidden="true"><label for="website">Votre site personnel</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
<div class="field">
<label class="check" for="consent"><input type="checkbox" id="consent" name="consent" required aria-required="true" aria-describedby="consent-error"><span>J’accepte que Pridano utilise ces informations pour répondre à ma demande. <a href="/confidentialite">Politique de confidentialité</a>. <span class="req" aria-hidden="true">*</span></span></label>
<p class="field-error" id="consent-error" hidden></p>
</div>
<p class="form-status" role="status" aria-live="polite" data-form-status hidden></p>
${btn({ type: 'submit', label: 'Parler de votre projet', cls: 'btn--block', attrs: 'data-submit disabled' })}
<p class="field-hint">Les champs marqués * sont nécessaires. Aucun envoi avant votre validation.</p>
<noscript><p class="noscript-note">Activez JavaScript pour utiliser le formulaire, ou écrivez à <a href="mailto:${brand.email}">${brand.email}</a>.</p></noscript>
</form>`;
}

module.exports = {
  title: 'Contact — Parlons de votre site ou logiciel',
  description: 'Un projet de création ou de refonte de site web ? Contactez Pridano à Montpellier. Présentez votre besoin pour démarrer la discussion.',
  crumb: 'Contact',
  schemaType: 'ContactPage',
  headerCta: { href: '/devis', label: 'Devis guidé', short: 'Devis guidé' },
  body: () => `<section class="contact" data-index-label="Contact">
<div class="wrap contact-grid">
<div class="contact-intro">
${breadcrumb('Contact')}
${label('Le premier pas, simplement')}
<h1 class="h1">${pt('Tout commence par un échange.')}</h1>
<p class="lead">Un nouveau site, une refonte, une idée de logiciel. Racontez-nous ce que vous avez en tête.</p>
<div class="contact-direct">
${directContacts()}
<p class="contact-city">${icon('pin')}${brand.city}, ${brand.country}</p>
${brand.bookingUrl ? `<div class="btn-row">${btn({ href: brand.bookingUrl, label: 'Prendre rendez-vous', variant: 'ghost', track: 'prise-rdv' })}</div>` : ''}
</div>
<div class="contact-next">
<h2 class="label label--plain">Et ensuite ?</h2>
<ol role="list">
<li><span class="index-num">01</span>Nous prenons connaissance de votre besoin.</li>
<li><span class="index-num">02</span>Nous échangeons pour préciser le projet.</li>
<li><span class="index-num">03</span>Vous recevez une proposition adaptée.</li>
</ol>
</div>
<p class="contact-alt">${link({ href: '/devis', label: 'Vous préférez construire un brief guidé ?' })}</p>
</div>
<div class="contact-card">${form()}</div>
</div>
</section>`,
};
