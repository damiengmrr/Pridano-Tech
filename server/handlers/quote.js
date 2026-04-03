const { config } = require("../config/env");
const {
  advanceBriefConversation,
  generateQualification,
  generateSummary,
  startBriefConversation,
} = require("../lib/groq");
const { json } = require("./http");

const MIN_PROJECT_DESCRIPTION_LENGTH = 8;

function getProjectDescription(body) {
  return String(body?.projectDescription || "").trim();
}

function getObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}

async function handleHealth() {
  return json(200, {
    ok: true,
    groqConfigured: Boolean(config.groqApiKey),
    quoteSubmissionConfigured: Boolean(config.resendApiKey),
    resendConfigured: Boolean(config.resendApiKey),
    port: config.port,
    sendBriefRoute: "/api/send-brief",
  });
}

async function handleQuoteQualify({ body }) {
  const projectDescription = getProjectDescription(body);

  if (projectDescription.length < MIN_PROJECT_DESCRIPTION_LENGTH) {
    return json(400, {
      ok: false,
      message: "Ajoutez juste quelques mots de plus pour lancer l'analyse.",
    });
  }

  const result = await generateQualification(projectDescription);
  return json(200, { ok: true, ...result });
}

async function handleQuoteSummary({ body }) {
  const projectDescription = getProjectDescription(body);
  const answers = getObject(body?.answers);

  if (projectDescription.length < MIN_PROJECT_DESCRIPTION_LENGTH) {
    return json(400, {
      ok: false,
      message: "Le brief initial est encore trop court pour produire une synthese utile.",
    });
  }

  const result = await generateSummary({ projectDescription, answers });
  return json(200, { ok: true, ...result });
}

async function handleQuoteChat({ body }) {
  const projectDescription = getProjectDescription(body);
  const brief = getObject(body?.brief);
  const activeField = body?.activeField || null;
  const userMessage = String(body?.userMessage || "").trim();
  const history = Array.isArray(body?.history) ? body.history : [];
  const action = body?.action || "continue";

  if (projectDescription.length < MIN_PROJECT_DESCRIPTION_LENGTH) {
    return json(400, {
      ok: false,
      message: "Ajoutez juste quelques mots de plus pour lancer la conversation.",
    });
  }

  if (action === "start") {
    const result = await startBriefConversation(projectDescription);
    return json(200, { ok: true, ...result });
  }

  if (!userMessage) {
    return json(400, {
      ok: false,
      message: "Votre reponse est vide. Ajoutez simplement quelques mots pour continuer.",
    });
  }

  const result = await advanceBriefConversation({
    projectDescription,
    brief,
    activeField,
    userMessage,
    history,
  });

  return json(200, { ok: true, ...result });
}

module.exports = {
  handleHealth,
  handleQuoteChat,
  handleQuoteQualify,
  handleQuoteSummary,
};
