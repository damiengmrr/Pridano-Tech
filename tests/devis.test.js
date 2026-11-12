/*
 * Devis guidé multi-besoins (mode local, sans IA ni envoi réel) : parcours adapté aux besoins
 * cochés, comportement inchangé sans besoin, email complet, anti-doublon.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildFallbackConversationStart, advanceFallbackConversation, alignNextField } = require('../server/utils/project-brief');
const { parseBriefSubmission, buildBriefEmail } = require('../server/utils/brief-email');
const { createSendBriefHandler } = require('../server/handlers/send-brief');
const { normalizeNeeds, needsLabel } = require('../site/data/needs');

const run = (description, services, answer = (field) => `Réponse pour ${field}`) => {
  let turn = buildFallbackConversationStart(description, services);
  const asked = [];
  for (let i = 0; turn.nextField && i < 20; i++) {
    asked.push(turn.nextField);
    turn = advanceFallbackConversation({ projectDescription: description, brief: turn.brief, activeField: turn.nextField, userMessage: answer(turn.nextField) });
  }
  return { asked, turn };
};

test('besoins : normalisation (inconnus ignorés, ordre du catalogue, projet complet en dernier)', () => {
  assert.deepEqual(normalizeNeeds(['projet-complet', 'inconnu', 'agent-ia', 'site-vitrine', 'agent-ia']), ['site-vitrine', 'agent-ia', 'projet-complet']);
  assert.deepEqual(normalizeNeeds('refonte,maintenance'), ['refonte', 'maintenance']);
  assert.equal(needsLabel(['site-vitrine', 'agent-ia']), 'Site vitrine + Agent IA');
  assert.equal(needsLabel(['site-vitrine', 'projet-complet']), 'Projet numérique complet : Site vitrine');
});

test('plusieurs besoins : une question ciblée par besoin, puis délai et budget, sans doublon', () => {
  const { asked, turn } = run('Je lance une boulangerie', ['site-vitrine', 'e-commerce', 'automatisation']);
  assert.deepEqual(asked.filter((f) => f.startsWith('service:')), ['service:site-vitrine', 'service:e-commerce', 'service:automatisation']);
  assert.deepEqual(asked.slice(-2), ['timeline', 'budget']);
  assert.equal(new Set(asked).size, asked.length);
  assert.ok(!asked.includes('keyFeatures') && !asked.includes('aiNeeds'), 'questions génériques remplacées par les questions ciblées');
  assert.equal(turn.isComplete, true);
  assert.equal(turn.brief.projectType, 'Site vitrine + Site e-commerce + Automatisation');
  assert.equal(turn.brief.serviceDetails.automatisation, 'Réponse pour service:automatisation');
  assert.match(turn.brief.summary, /Besoins : Site vitrine, Site e-commerce, Automatisation/);
});

test('projet complet : « ce qui existe déjà », puis les priorités, puis le budget', () => {
  const start = buildFallbackConversationStart('Création de mon entreprise de paysagisme', ['projet-complet', 'site-vitrine']);
  const { asked } = run('Création de mon entreprise de paysagisme', ['projet-complet', 'site-vitrine']);
  assert.ok(asked.indexOf('currentState') < asked.indexOf('service:projet-complet'));
  assert.ok(asked.indexOf('service:projet-complet') < asked.indexOf('budget'));
  const brief = { ...start.brief, sector: 'x', primaryGoal: 'x', targetAudience: 'x' };
  const turn = advanceFallbackConversation({ projectDescription: 'x', brief, activeField: 'targetAudience', userMessage: 'Particuliers' });
  assert.equal(turn.nextField, 'currentState');
  assert.match(turn.nextQuestion, /Qu'avez-vous déjà/);
});

test('sans besoin coché : parcours d’origine inchangé', () => {
  const start = buildFallbackConversationStart('On veut un site vitrine pour notre cabinet');
  assert.equal(start.brief.projectType, 'Site vitrine');
  assert.deepEqual(start.brief.services, []);
  assert.ok(!run('On veut un site vitrine pour notre cabinet', []).asked.some((f) => f.startsWith('service:')));
});

test('mode IA : une question hors parcours est remplacée par la prochaine question attendue', () => {
  const { brief } = buildFallbackConversationStart('Projet', ['agent-ia']);
  const filled = { ...brief, sector: 'a', primaryGoal: 'b', targetAudience: 'c', currentState: 'd' };
  assert.deepEqual(alignNextField(filled, 'Projet', 'keyFeatures'), { field: 'service:agent-ia', replaced: true });
  assert.deepEqual(alignNextField(filled, 'Projet', 'service:agent-ia'), { field: 'service:agent-ia', replaced: false });
  assert.deepEqual(alignNextField({ sector: '' }, 'Projet', 'keyFeatures'), { field: 'keyFeatures', replaced: false });
});

const submission = (overrides = {}) => ({
  submissionId: 'abc12345-test',
  projectDescription: 'Je lance une boulangerie',
  brief: { projectType: 'Site vitrine + Agent IA', primaryGoal: 'Vendre', targetAudience: 'Quartier', currentState: 'Rien', timeline: 'Sous 1 mois', summary: 'Résumé', services: ['agent-ia', 'site-vitrine', 'inconnu'], serviceDetails: { 'agent-ia': 'Répondre aux questions', 'site-vitrine': '5 pages', inconnu: 'x' } },
  contact: { name: 'Test', email: 'test@example.com', consent: true },
  ...overrides,
});

test('email : besoins sélectionnés et précisions, référence de la demande', () => {
  const parsed = parseBriefSubmission(submission());
  assert.deepEqual(parsed.missingFields, []);
  assert.deepEqual(parsed.brief.services, ['site-vitrine', 'agent-ia']);
  const email = buildBriefEmail(parsed);
  assert.match(email.html, /Besoins selectionnes/);
  assert.match(email.html, /Répondre aux questions/);
  assert.match(email.text, /- Agent IA: Répondre aux questions/);
  assert.match(email.text, /Reference de la demande: abc12345-test/);
  assert.ok(!email.text.includes('inconnu'));
});

test('anti-doublon : un second envoi de la même demande n’envoie pas un second email', async () => {
  let sent = 0;
  const handler = createSendBriefHandler(async () => {
    sent += 1;
    return { id: `email-${sent}` };
  });
  const body = submission({ submissionId: `dup-${Date.now()}` });
  const first = await handler({ body, method: 'POST', path: '/api/send-brief' });
  const second = await handler({ body, method: 'POST', path: '/api/send-brief' });
  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  assert.equal(sent, 1);
  const other = await handler({ body: submission({ submissionId: `autre-${Date.now()}` }), method: 'POST', path: '/api/send-brief' });
  assert.equal(other.statusCode, 200);
  assert.equal(sent, 2);
});
