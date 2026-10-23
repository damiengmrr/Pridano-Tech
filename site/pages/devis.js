/*
 * Brief guidé assisté par IA. Le moteur (public/assets/js/quote.js) et les routes
 * /api/quote/* et /api/send-brief sont conservés ; seule l’interface est redessinée.
 * Les attributs data-* et identifiants ci-dessous sont lus par quote.js : ne pas les renommer.
 */
const { icon, pt, label } = require('../lib/html');
const { breadcrumb } = require('../components/sections');

const briefField = (id, key, text, { input = false, placeholder = '' } = {}) => `<div class="brief-field">
<label for="${id}">${text}</label>
${input ? `<input class="input" id="${id}" data-brief-field="${key}" type="text">` : `<textarea class="input" id="${id}" data-brief-field="${key}"${placeholder ? ` placeholder="${placeholder}"` : ''}></textarea>`}
</div>`;

const chips = ['Site vitrine', 'SaaS', 'Plateforme', 'Automatisation', 'Intégration IA'];

module.exports = {
  title: 'Devis intelligent',
  description: 'Décrivez votre projet, échangez avec l’assistant IA de cadrage et construisez un brief éditable avant l’envoi.',
  crumb: 'Devis guidé',
  headerCta: { href: '/contact', label: 'Nous contacter', short: 'Nous contacter' },
  page: 'quote',
  body: () => `<section class="devis" data-index-label="Devis guidé">
<div class="wrap">
<header class="devis-head">
${breadcrumb('Devis guidé')}
${label('Devis guidé')}
<h1 class="h1">${pt('Décrivez le projet. Le brief se construit en quelques échanges.')}</h1>
<p class="lead">Une phrase suffit pour démarrer. L’assistant clarifie le besoin, structure le brief, puis vous relisez avant l’envoi.</p>
<ol class="devis-steps" role="list"><li><span>01</span>Décrire</li><li><span>02</span>Préciser</li><li><span>03</span>Relire</li><li><span>04</span>Envoyer</li></ol>
</header>
<div class="quote-assistant" data-quote-app>
<div class="quote-body">
<section class="chat-panel" aria-labelledby="chat-title">
<div class="chat-head">
<div><p class="label label--plain">Conversation</p><h2 class="h4" id="chat-title">Assistant projet</h2></div>
<span class="pill-status" data-assistant-health role="status"><i data-lucide="activity"></i> Vérification…</span>
</div>
<p class="chat-status" data-chat-status aria-live="polite">Commencez par une phrase simple. Je vais ensuite orienter la qualification selon le type de projet.</p>
<div class="chat-log" data-chat-log aria-live="polite" aria-relevant="additions">
<article class="message assistant"><span class="message-role"><i data-lucide="sparkles"></i> Assistant</span><p>Expliquez simplement le projet. Je vais le qualifier comme un brief utile pour un studio digital, puis vous pourrez tout relire avant l’envoi.</p></article>
</div>
<div class="composer">
<div class="conversation-tips" data-suggestion-group>${chips.map((c) => `<button class="prompt-chip" type="button" data-quick-reply="${c}">${c}</button>`).join('')}</div>
<label class="visually-hidden" for="composer">Votre message à l’assistant</label>
<textarea class="input composer-input" id="composer" data-composer-input rows="3" placeholder="Ex. On veut lancer un SaaS pour automatiser la qualification de prospects B2B."></textarea>
<div class="composer-footer">
<p class="composer-note">Cliquez sur une réponse rapide ou écrivez librement. Le brief reste toujours éditable.</p>
<div class="composer-actions">
<button class="btn btn--ghost btn--sm" type="button" data-reset-conversation><span class="btn-label">Recommencer</span></button>
<button class="btn btn--primary btn--sm" type="button" data-send-message><span class="btn-label">Envoyer</span><span class="btn-icon" aria-hidden="true">${icon('arrow-up-right')}</span></button>
</div>
</div>
</div>
</section>
<aside class="brief-panel" aria-labelledby="brief-title">
<div class="brief-head"><div><p class="label label--plain">Dossier</p><h2 class="h4" id="brief-title">Brief en construction</h2></div><strong class="brief-progress-value" data-brief-progress-label>0%</strong></div>
<div class="brief-progress" aria-hidden="true"><span data-brief-progress-bar></span></div>
<div class="brief-card">
<div class="brief-state-row"><span class="brief-state-pill" data-brief-stage-label>À démarrer</span><span class="brief-remaining" data-brief-remaining>11 points utiles à cadrer</span></div>
<p class="card-label">Prochaine étape</p>
<p class="brief-focus-text" data-next-field-label>Commencez par quelques mots sur le projet.</p>
</div>
<div class="brief-card">
<div class="brief-card-head"><p class="card-label">Synthèse</p><button class="brief-inline-link" type="button" data-open-review disabled>Modifier</button></div>
<p class="brief-summary-preview" data-brief-summary-preview>Le résumé apparaîtra ici au fil de la conversation.</p>
</div>
<div class="brief-card">
<div class="brief-card-head"><p class="card-label">Infos captées</p><button class="brief-inline-link" type="button" data-open-review disabled>Voir tout</button></div>
<div class="brief-preview-list" data-brief-preview-list></div>
<p class="brief-empty-note" data-brief-empty-note>Le dossier reste compact au départ, puis se remplit au fil des réponses.</p>
</div>
<button class="btn btn--primary btn--block" type="button" data-open-review disabled><span class="btn-label">Relire / ajuster</span><span class="btn-icon" aria-hidden="true">${icon('arrow')}</span></button>
</aside>
</div>
<section class="review-modal" data-review-modal hidden role="dialog" aria-modal="true" aria-labelledby="review-title">
<div class="review-modal-backdrop" data-close-review></div>
<div class="review-modal-card">
<button class="review-close" type="button" data-close-review aria-label="Fermer la relecture">${icon('close')}</button>
<div class="review-modal-head">
${label('Relecture')}
<h2 class="h3" id="review-title">Relire, ajuster puis envoyer</h2>
<p>Vous pouvez relire et modifier chaque champ avant validation. Une fois envoyé, le brief part à notre équipe par email.</p>
</div>
<div class="review-grid">
<fieldset class="brief-group"><legend>Essentiel</legend>
${briefField('briefProjectType', 'projectType', 'Type de projet', { input: true })}
${briefField('briefSector', 'sector', 'Secteur d’activité', { input: true })}
${briefField('briefPrimaryGoal', 'primaryGoal', 'Objectif principal')}
${briefField('briefTargetAudience', 'targetAudience', 'Cible')}
</fieldset>
<fieldset class="brief-group"><legend>État & périmètre</legend>
${briefField('briefCurrentState', 'currentState', 'État du projet actuel')}
${briefField('briefFeatures', 'keyFeatures', 'Fonctionnalités attendues', { placeholder: 'Une ligne par fonctionnalité ou priorité' })}
${briefField('briefBackOfficeNeeds', 'backOfficeNeeds', 'Besoin de back-office')}
</fieldset>
<fieldset class="brief-group"><legend>Technique</legend>
${briefField('briefAiNeeds', 'aiNeeds', 'Besoin IA')}
${briefField('briefAutomationNeeds', 'automationNeeds', 'Automatisations / intégrations')}
</fieldset>
<fieldset class="brief-group"><legend>Cadre</legend>
${briefField('briefConstraints', 'constraints', 'Contraintes')}
<div class="form-row">${briefField('briefTimeline', 'timeline', 'Délai', { input: true })}${briefField('briefBudget', 'budget', 'Budget indicatif', { input: true })}</div>
</fieldset>
<fieldset class="brief-group brief-group--wide"><legend>Synthèse</legend>
${briefField('briefSummary', 'summary', 'Résumé global éditable')}
<button class="btn btn--ghost btn--sm" type="button" data-regenerate-summary><span class="btn-label">Régénérer la synthèse</span></button>
</fieldset>
</div>
<section class="review-contact" aria-labelledby="review-contact-title">
<div>${label('Validation finale')}<h3 class="h4" id="review-contact-title">Dernière étape avant l’envoi</h3><p class="small">Relisez le brief, corrigez ce que vous voulez, puis ajoutez vos coordonnées. Rien n’est envoyé tant que vous ne validez pas.</p><p class="muted small">Vous gardez la main jusqu’au clic final sur « Envoyer le brief ». Une fois validé, le dossier est transmis par email à notre équipe.</p></div>
<div class="form-row">
<div class="brief-field"><label for="contactName">Nom complet</label><input class="input" id="contactName" type="text" autocomplete="name"></div>
<div class="brief-field"><label for="contactCompany">Société</label><input class="input" id="contactCompany" type="text" autocomplete="organization"></div>
</div>
<div class="form-row">
<div class="brief-field"><label for="contactEmail">Email</label><input class="input" id="contactEmail" type="email" autocomplete="email"></div>
<div class="brief-field"><label for="contactPhone">Téléphone</label><input class="input" id="contactPhone" type="tel" autocomplete="tel"></div>
</div>
<div class="brief-field"><label for="contactBudget">Ordre de grandeur budgétaire</label><select class="input" id="contactBudget"><option value="">Je préfère en discuter</option><option>Moins de 2 000 €</option><option>2 000 à 5 000 €</option><option>5 000 à 10 000 €</option><option>10 000 € et plus</option></select></div>
<label class="check" for="contactConsent"><input id="contactConsent" type="checkbox"><span>J’accepte que ces informations soient utilisées pour me recontacter dans le cadre de cette demande. <a href="/confidentialite">Politique de confidentialité</a>.</span></label>
<div class="btn-row review-actions">
<button class="btn btn--ghost btn--sm" type="button" data-close-review><span class="btn-label">Retour</span></button>
<button class="btn btn--primary" type="button" data-submit-brief><span class="btn-label">Envoyer le brief</span><span class="btn-icon" aria-hidden="true">${icon('arrow-up-right')}</span></button>
</div>
<p class="form-status" data-submit-feedback hidden aria-live="polite"></p>
</section>
</div>
</section>
</div>
<article class="quote-success" data-quote-success hidden tabindex="-1">
${label('Brief envoyé')}
<h2 class="h2">${pt('Le brief a bien été transmis.')}</h2>
<p data-success-message>Notre équipe a bien reçu votre brief par email.</p>
<p class="muted" data-success-summary></p>
<div class="btn-row"><a class="btn btn--primary" href="/"><span class="btn-label">Retour à l’accueil</span><span class="btn-icon" aria-hidden="true">${icon('arrow')}</span></a><a class="btn btn--ghost" href="/sites-web"><span class="btn-label">Voir les services</span><span class="btn-icon" aria-hidden="true">${icon('arrow')}</span></a></div>
</article>
</div>
</section>`,
};
