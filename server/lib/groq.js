const {
  advanceFallbackConversation,
  buildFallbackConversationStart,
  buildFallbackSummary,
  buildQuestionMeta,
  fallbackQuestions,
  inferProjectType,
  sanitizeBrief,
} = require("../utils/project-brief");
const { config } = require("../config/env");

function parseJsonContent(content) {
  const raw = String(content || "").trim();

  try {
    return JSON.parse(raw);
  } catch (error) {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    if (start !== -1 && end !== -1) {
      return JSON.parse(raw.slice(start, end + 1));
    }

    throw error;
  }
}

async function runGroqJson({ systemPrompt, userPrompt, maxCompletionTokens = 1600 }) {
  if (!config.groqApiKey) {
    throw new Error("GROQ_API_KEY_MISSING");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.groqModel,
      temperature: 0.35,
      max_completion_tokens: maxCompletionTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GROQ_REQUEST_FAILED:${response.status}:${details}`);
  }

  const payload = await response.json();
  return parseJsonContent(payload.choices?.[0]?.message?.content);
}

async function generateQualification(projectDescription) {
  try {
    const aiResponse = await runGroqJson({
      systemPrompt:
        "Tu es un consultant senior en cadrage produit digital pour un studio qui livre des sites, SaaS, plateformes, outils internes, automatisations et integrations IA. Tu reponds uniquement en JSON valide, en francais, sans texte hors JSON. Tu produis des questions vraiment utiles pour prequalifier un projet cote dev, produit et business.",
      userPrompt: JSON.stringify({
        task: "Analyse ce brief et genere des questions de cadrage.",
        expected_shape: {
          projectType: "string",
          detectedNeeds: ["string"],
          questions: [
            {
              id: "snake_case",
              label: "question courte en francais",
              why: "pourquoi cette question est utile",
              placeholder: "exemple de reponse attendue",
              quickReplies: ["suggestion contextuelle"],
            },
          ],
        },
        rules: [
          "Retourner entre 3 et 6 questions maximum",
          "Questions professionnelles, courtes et actionnables",
          "Pas de questions redondantes",
          "Donner un id stable en snake_case",
          "Adapter les questions au type de projet detecte",
          "Quand c'est pertinent, fournir 3 a 6 quick replies contextuelles et non generiques",
          "Ne pas promettre une estimation budgetaire automatique",
        ],
        projectDescription,
      }),
      maxCompletionTokens: 1200,
    });

    const questions = Array.isArray(aiResponse.questions)
      ? aiResponse.questions.filter((question) => question?.id && question?.label).slice(0, 6)
      : [];

    if (questions.length < 3) {
      throw new Error("GROQ_RESPONSE_INCOMPLETE");
    }

    return {
      mode: "ai",
      projectType: aiResponse.projectType || inferProjectType(projectDescription),
      detectedNeeds: Array.isArray(aiResponse.detectedNeeds) ? aiResponse.detectedNeeds : [],
      questions,
    };
  } catch (error) {
    return {
      mode: "fallback",
      projectType: inferProjectType(projectDescription),
      detectedNeeds: ["Cadrage standard active"],
      questions: fallbackQuestions(projectDescription),
      error: error.message,
    };
  }
}

async function generateSummary({ projectDescription, answers }) {
  try {
    const aiResponse = await runGroqJson({
      systemPrompt:
        "Tu es un product strategist senior pour un studio digital. Tu reponds uniquement en JSON valide, en francais. Tu transformes un brief et des reponses de discovery en synthese exploitable cote produit, technique et estimation.",
      userPrompt: JSON.stringify({
        task: "Produis une synthese de brief exploitable commercialement et techniquement.",
        expected_shape: {
          summary: {
            projectType: "string",
            sector: "string",
            primaryGoal: "string",
            targetAudience: "string",
            currentState: "string",
            keyFeatures: ["string"],
            aiNeeds: ["string"],
            automationNeeds: ["string"],
            backOfficeNeeds: "string",
            constraints: ["string"],
            timeline: "string",
            budget: "string",
            stackSignals: ["string"],
            summary: "string",
          },
        },
        rules: [
          "Ne pas inventer de details tres precis non mentionnes",
          "Rester concret et business-oriented",
          "Retourner des tableaux courts et propres",
          "Le champ summary doit resumer le besoin en 3 a 5 phrases maximum",
        ],
        projectDescription,
        answers,
      }),
      maxCompletionTokens: 1600,
    });

    if (!aiResponse.summary) {
      throw new Error("GROQ_SUMMARY_INCOMPLETE");
    }

    return {
      mode: "ai",
      summary: aiResponse.summary,
    };
  } catch (error) {
    return {
      mode: "fallback",
      summary: buildFallbackSummary({ projectDescription, answers }),
      error: error.message,
    };
  }
}

async function startBriefConversation(projectDescription) {
  try {
    const aiResponse = await runGroqJson({
      systemPrompt:
        "Tu es un assistant senior de cadrage projet pour un studio digital premium. Tu reponds uniquement en JSON valide, en francais. Tu dois lancer une conversation courte, fluide et utile qui construit progressivement un brief exploitable cote dev et produit. Ton ton est naturel, direct, professionnel et humain. Tu dois prequalifier des sites, SaaS, plateformes, outils internes, automatisations et integrations IA.",
      userPrompt: JSON.stringify({
        task: "A partir de ce brief initial, cree un premier dossier projet et pose la prochaine question la plus utile.",
        expected_shape: {
          assistantMessage: "string",
          brief: {
            projectType: "string",
            sector: "string",
            primaryGoal: "string",
            targetAudience: "string",
            currentState: "string",
            keyFeatures: ["string"],
            aiNeeds: "string",
            automationNeeds: "string",
            backOfficeNeeds: "string",
            constraints: "string",
            timeline: "string",
            budget: "string",
            summary: "string",
          },
          nextField: "string",
          nextQuestion: "string",
          quickReplies: ["string"],
          inputPlaceholder: "string",
          isComplete: "boolean",
          progress: "number",
        },
        rules: [
          "Pose une seule question a la fois",
          "Le brief doit etre partiellement pre-rempli si le texte le permet",
          "L'assistantMessage doit etre court et naturel, puis amener la prochaine question",
          "nextField doit correspondre a un champ du brief",
          "Utiliser des champs utiles pour un studio digital: type de projet, secteur, cible, etat actuel, fonctionnalites, IA, integrations, back-office, contraintes, delai, budget",
          "La premiere question doit donner une vraie direction de cadrage",
          "Les quickReplies doivent etre contextuelles a la question, pas generiques, et laisser la place a une reponse libre",
          "Montrer qu'une reponse courte peut suffire",
        ],
        projectDescription,
      }),
      maxCompletionTokens: 1700,
    });

    if (!aiResponse.brief || !aiResponse.assistantMessage) {
      throw new Error("GROQ_BRIEF_START_INCOMPLETE");
    }

    const brief = sanitizeBrief(aiResponse.brief, projectDescription);
    const meta = aiResponse.nextField
      ? buildQuestionMeta(aiResponse.nextField, brief, projectDescription)
      : null;

    return {
      mode: "ai",
      assistantMessage: aiResponse.assistantMessage,
      brief,
      nextField: aiResponse.nextField || null,
      nextQuestion: aiResponse.nextQuestion || "",
      quickReplies: Array.isArray(aiResponse.quickReplies) && aiResponse.quickReplies.length
        ? aiResponse.quickReplies.slice(0, 6)
        : meta?.quickReplies || [],
      inputPlaceholder: aiResponse.inputPlaceholder || meta?.placeholder || "",
      isComplete: Boolean(aiResponse.isComplete),
      progress: Number(aiResponse.progress) || 0,
    };
  } catch (error) {
    return {
      ...buildFallbackConversationStart(projectDescription),
      error: error.message,
    };
  }
}

async function advanceBriefConversation({
  projectDescription,
  brief,
  activeField,
  userMessage,
  history = [],
}) {
  try {
    const aiResponse = await runGroqJson({
      systemPrompt:
        "Tu es un assistant senior de cadrage projet pour un studio digital premium. Tu reponds uniquement en JSON valide, en francais. Tu mets a jour un brief projet a partir d'une conversation, puis tu poses au maximum une question suivante. Tu aides a construire un dossier clair pour des devs et des profils produit, pas un chat gadget. Les reponses courtes sont valides si elles apportent une info exploitable.",
      userPrompt: JSON.stringify({
        task: "Mets a jour le dossier projet apres la reponse utilisateur et propose la prochaine meilleure question.",
        expected_shape: {
          assistantMessage: "string",
          brief: {
            projectType: "string",
            sector: "string",
            primaryGoal: "string",
            targetAudience: "string",
            currentState: "string",
            keyFeatures: ["string"],
            aiNeeds: "string",
            automationNeeds: "string",
            backOfficeNeeds: "string",
            constraints: "string",
            timeline: "string",
            budget: "string",
            summary: "string",
          },
          nextField: "string",
          nextQuestion: "string",
          quickReplies: ["string"],
          inputPlaceholder: "string",
          isComplete: "boolean",
          progress: "number",
        },
        rules: [
          "Mettre a jour le champ actif si la reponse utilisateur le permet",
          "Ne poser qu'une seule question suivante",
          "Si le brief est suffisamment clair, marquer isComplete a true et inviter a relire le dossier",
          "Faire ressortir le type de projet, le contexte business, la maturite, le perimetre, l'IA, les integrations, le back-office, les contraintes et le delai",
          "Les quickReplies doivent changer selon la question en cours",
          "Pas de phrases longues ni de style conversationnel artificiel",
          "Rassurer sans surjouer et accepter les reponses courtes",
        ],
        projectDescription,
        activeField,
        userMessage,
        brief,
        history,
      }),
      maxCompletionTokens: 1700,
    });

    if (!aiResponse.brief || !aiResponse.assistantMessage) {
      throw new Error("GROQ_BRIEF_TURN_INCOMPLETE");
    }

    const nextBrief = sanitizeBrief(aiResponse.brief, projectDescription);
    const meta = aiResponse.nextField
      ? buildQuestionMeta(aiResponse.nextField, nextBrief, projectDescription)
      : null;

    return {
      mode: "ai",
      assistantMessage: aiResponse.assistantMessage,
      brief: nextBrief,
      nextField: aiResponse.nextField || null,
      nextQuestion: aiResponse.nextQuestion || "",
      quickReplies: Array.isArray(aiResponse.quickReplies) && aiResponse.quickReplies.length
        ? aiResponse.quickReplies.slice(0, 6)
        : meta?.quickReplies || [],
      inputPlaceholder: aiResponse.inputPlaceholder || meta?.placeholder || "",
      isComplete: Boolean(aiResponse.isComplete),
      progress: Number(aiResponse.progress) || 0,
    };
  } catch (error) {
    return {
      ...advanceFallbackConversation({
        projectDescription,
        brief,
        activeField,
        userMessage,
      }),
      error: error.message,
    };
  }
}

module.exports = {
  advanceBriefConversation,
  generateQualification,
  generateSummary,
  startBriefConversation,
};
