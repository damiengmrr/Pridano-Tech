const PROJECT_TYPE_OPTIONS = [
  {
    id: "site_vitrine",
    label: "Site vitrine",
    keywords: ["site vitrine", "landing page", "landing", "vitrine", "portfolio", "site simple"],
  },
  {
    id: "site_pro",
    label: "Site professionnel avance",
    keywords: ["site pro", "site professionnel", "site avance", "site corporate", "site web"],
  },
  {
    id: "refonte",
    label: "Refonte d'existant",
    keywords: ["refonte", "refaire", "reprise", "migration", "moderniser", "existant"],
  },
  {
    id: "saas",
    label: "SaaS",
    keywords: ["saas", "software", "abonnement"],
  },
  {
    id: "plateforme",
    label: "Plateforme",
    keywords: ["plateforme", "marketplace", "portail", "ecosysteme"],
  },
  {
    id: "outil_interne",
    label: "Outil interne",
    keywords: ["outil interne", "outil metier", "backoffice interne", "intranet", "ops"],
  },
  {
    id: "automatisation",
    label: "Automatisation",
    keywords: ["automatisation", "workflow", "n8n", "zapier", "make", "process", "pipeline"],
  },
  {
    id: "integration_ia",
    label: "Integration IA",
    keywords: ["integration ia", "assistant ia", "chatbot", "llm", "rag", "gpt", "intelligence artificielle"],
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    keywords: ["e-commerce", "ecommerce", "boutique", "catalogue", "commande", "checkout"],
  },
];

const SECTOR_RULES = [
  { label: "Sante", keywords: ["sante", "medical", "medecin", "clinique", "care"] },
  { label: "Immobilier", keywords: ["immobilier", "agence", "promotion", "bien", "property"] },
  { label: "E-commerce", keywords: ["e-commerce", "ecommerce", "boutique", "retail", "catalogue"] },
  { label: "Education", keywords: ["education", "formation", "ecole", "elearning", "edtech"] },
  { label: "Finance / assurance", keywords: ["finance", "banque", "assurance", "fintech"] },
  { label: "RH / recrutement", keywords: ["rh", "recrutement", "talent", "hr"] },
  { label: "Industrie / logistique", keywords: ["industrie", "logistique", "supply", "usine", "manufacturing"] },
  { label: "B2B / services", keywords: ["b2b", "services", "cabinet", "conseil", "agency", "agence"] },
  { label: "SaaS / tech", keywords: ["saas", "tech", "logiciel", "startup", "software"] },
];

const FEATURE_RULES = [
  { label: "Qualification de leads", keywords: ["qualification", "lead", "prospect", "scoring", "routing"] },
  { label: "Pages services / offre", keywords: ["offre", "services", "presentation", "landing"] },
  { label: "Prise de contact / devis", keywords: ["devis", "contact", "lead", "qualification", "rdv"] },
  { label: "Prise de rendez-vous", keywords: ["rdv", "booking", "reservation", "agenda"] },
  { label: "CMS / contenu", keywords: ["cms", "contenu", "blog", "actualite"] },
  { label: "Comptes utilisateurs", keywords: ["compte", "login", "connexion", "auth"] },
  { label: "Dashboard / reporting", keywords: ["dashboard", "reporting", "kpi", "tableau de bord"] },
  { label: "Paiement / abonnement", keywords: ["paiement", "stripe", "checkout", "abonnement"] },
  { label: "Workflow metier", keywords: ["workflow", "process", "validation", "operations", "metier"] },
  { label: "Espace client", keywords: ["espace client", "portail client", "client portal"] },
  { label: "Base documentaire / recherche", keywords: ["documentation", "knowledge base", "recherche", "rag"] },
  { label: "Back-office / administration", keywords: ["back-office", "back office", "admin", "administration"] },
];

const AI_RULES = [
  { label: "Assistant / chatbot", keywords: ["assistant", "chatbot", "copilot", "agent"] },
  { label: "Generation de contenu", keywords: ["generation", "redaction", "contenu", "copy"] },
  { label: "Analyse / resume", keywords: ["resume", "analyse", "synthese", "classification"] },
  { label: "Recherche documentaire / RAG", keywords: ["rag", "knowledge", "base documentaire", "recherche"] },
  { label: "Qualification / tri", keywords: ["qualification", "scoring", "tri", "routing"] },
  { label: "Automatisation intelligente", keywords: ["agent", "orchestration", "decision", "workflow intelligent"] },
];

const AUTOMATION_RULES = [
  { label: "Qualification de leads", keywords: ["qualification", "lead", "prospect", "scoring", "routing"] },
  { label: "Connexion CRM", keywords: ["crm", "hubspot", "pipedrive", "salesforce"] },
  { label: "Connexion Airtable / Notion", keywords: ["airtable", "notion"] },
  { label: "Connexion ERP / metier", keywords: ["erp", "metier", "facturation"] },
  { label: "Email / relances", keywords: ["email", "relance", "notification", "mailing"] },
  { label: "Reporting / exports", keywords: ["reporting", "export", "csv", "report"] },
  { label: "Synchronisation de donnees", keywords: ["sync", "synchronisation", "webhook", "api"] },
];

const FIELD_SEQUENCE = [
  "projectType",
  "sector",
  "primaryGoal",
  "targetAudience",
  "currentState",
  "keyFeatures",
  "aiNeeds",
  "automationNeeds",
  "backOfficeNeeds",
  "constraints",
  "timeline",
  "budget",
];

const REQUIRED_FIELD_SEQUENCE = FIELD_SEQUENCE.filter((field) => field !== "budget");

function normalizeText(value = "") {
  return String(value).trim().toLowerCase();
}

function uniqueList(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function splitList(value = "") {
  return uniqueList(
    String(value)
      .split(/\n|,|;|•|-/)
      .map((item) => item.trim())
      .filter(Boolean),
  ).slice(0, 8);
}

function isFilled(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return String(value || "").trim().length > 0;
}

function pickMatches(source, rules) {
  const text = normalizeText(source);

  return rules
    .filter((rule) => rule.keywords.some((keyword) => text.includes(keyword)))
    .map((rule) => rule.label);
}

function findProjectTypeOption(source = "") {
  const text = normalizeText(source);

  return PROJECT_TYPE_OPTIONS.find((option) =>
    option.keywords.some((keyword) => text.includes(keyword)),
  );
}

function inferProjectType(projectDescription = "") {
  const text = normalizeText(projectDescription);

  if (!text) {
    return "";
  }

  if (/(refonte|refaire|reprise|migration|moderniser|existant)/.test(text)) {
    return "Refonte d'existant";
  }

  if (/(saas|software)/.test(text)) {
    return "SaaS";
  }

  if (/(plateforme|marketplace|portail)/.test(text)) {
    return "Plateforme";
  }

  if (/(outil interne|outil metier|intranet|backoffice interne)/.test(text)) {
    return "Outil interne";
  }

  if (/(automatisation|automatiser|workflow|zapier|make|n8n)/.test(text)) {
    return "Automatisation";
  }

  if (/(assistant ia|chatbot|rag|llm|gpt|copilot|intelligence artificielle)/.test(text)) {
    return "Integration IA";
  }

  if (/(e-commerce|ecommerce|boutique|catalogue|checkout)/.test(text)) {
    return "E-commerce";
  }

  if (/(site|landing|portfolio|vitrine)/.test(text)) {
    if (/(espace client|compte|dashboard|simulation|multi-page|cms|admin)/.test(text)) {
      return "Site professionnel avance";
    }

    return "Site vitrine";
  }

  const detected = findProjectTypeOption(projectDescription);
  return detected ? detected.label : "Projet digital sur mesure";
}

function inferSector(source = "") {
  const matches = pickMatches(source, SECTOR_RULES);
  return matches[0] || "";
}

function inferAudienceFromText(source = "") {
  const text = normalizeText(source);

  if (/(equipe interne|interne|operations|ops|collaborateurs)/.test(text)) {
    return "Equipe interne / operations";
  }

  if (/(prospects|leads|clients b2b|entreprises|decideurs|commerciaux)/.test(text)) {
    return "Prospects et clients B2B";
  }

  if (/(grand public|patients|utilisateurs finaux|particuliers|consommateurs)/.test(text)) {
    return "Utilisateurs finaux";
  }

  if (/(clients|utilisateurs|membres|partenaires)/.test(text)) {
    return "Clients, utilisateurs et parties prenantes";
  }

  return "";
}

function inferCurrentState(source = "") {
  const text = normalizeText(source);

  if (/(partir de zero|from scratch|demarrer de zero|nouveau projet)/.test(text)) {
    return "On part de zero";
  }

  if (/(prototype|mvp|version beta|poc)/.test(text)) {
    return "Il existe deja une premiere base ou un prototype";
  }

  if (/(refonte|refaire|reprise|migration|moderniser)/.test(text)) {
    return "Il faut refaire ou reprendre un existant";
  }

  if (/(site actuel|outil actuel|produit existant|existe deja)/.test(text)) {
    return "Oui, il existe deja";
  }

  return "";
}

function inferTimeline(source = "") {
  const text = normalizeText(source);

  if (!text) {
    return "";
  }

  if (/(urgent|asap|des que possible|vite|rapidement)/.test(text)) {
    return "Le plus vite possible";
  }

  if (/(1 mois|2 semaines|3 semaines|4 semaines)/.test(text)) {
    return "Sous 1 a 2 mois";
  }

  if (/(trimestre|q1|q2|q3|q4|ce trimestre)/.test(text)) {
    return "Sous 1 trimestre";
  }

  return "";
}

function inferBudget(source = "") {
  const text = String(source || "").trim();
  const amountMatch = text.match(/(\d[\d\s.,]*)\s?(k|K|€|euros?)/);

  if (amountMatch) {
    return amountMatch[0].replace(/\s+/g, " ");
  }

  return "";
}

function inferBackOfficeNeed(source = "") {
  const text = normalizeText(source);

  if (/(admin leger|petit back-office|admin simple)/.test(text)) {
    return "Oui, admin leger";
  }

  if (/(back-office|back office|administration|admin|dashboard de gestion)/.test(text)) {
    return "Oui, back-office complet";
  }

  if (/(pas de back-office|sans admin|pas besoin d'admin)/.test(text)) {
    return "Non, pas de back-office specifique";
  }

  return "";
}

function inferFeatureList(source = "") {
  return pickMatches(source, FEATURE_RULES).slice(0, 6);
}

function inferAiNeed(source = "") {
  const matches = pickMatches(source, AI_RULES);
  return matches[0] || "";
}

function inferAutomationNeed(source = "") {
  const matches = pickMatches(source, AUTOMATION_RULES);
  return matches[0] || "";
}

function detectProjectProfile(brief = {}, projectDescription = "") {
  const projectType = normalizeText(brief.projectType || inferProjectType(projectDescription));

  if (projectType.includes("saas")) {
    return "saas";
  }

  if (projectType.includes("plateforme")) {
    return "plateforme";
  }

  if (projectType.includes("outil interne")) {
    return "outil_interne";
  }

  if (projectType.includes("automatisation")) {
    return "automatisation";
  }

  if (projectType.includes("integration ia")) {
    return "integration_ia";
  }

  if (projectType.includes("refonte")) {
    return "refonte";
  }

  if (projectType.includes("e-commerce")) {
    return "ecommerce";
  }

  if (projectType.includes("site professionnel")) {
    return "site_pro";
  }

  if (projectType.includes("site vitrine")) {
    return "site_vitrine";
  }

  return "custom";
}

function getSequenceForProfile(profile = "custom") {
  const sharedStart = ["projectType", "sector", "primaryGoal", "targetAudience", "currentState"];
  const sharedEnd = ["constraints", "timeline", "budget"];

  switch (profile) {
    case "site_vitrine":
    case "site_pro":
    case "refonte":
    case "ecommerce":
      return [...sharedStart, "keyFeatures", "backOfficeNeeds", "aiNeeds", "automationNeeds", ...sharedEnd];
    case "saas":
    case "plateforme":
    case "outil_interne":
      return [...sharedStart, "keyFeatures", "backOfficeNeeds", "automationNeeds", "aiNeeds", ...sharedEnd];
    case "automatisation":
      return [...sharedStart, "automationNeeds", "keyFeatures", "aiNeeds", "backOfficeNeeds", ...sharedEnd];
    case "integration_ia":
      return [...sharedStart, "aiNeeds", "keyFeatures", "automationNeeds", "backOfficeNeeds", ...sharedEnd];
    default:
      return [...sharedStart, "keyFeatures", "aiNeeds", "automationNeeds", "backOfficeNeeds", ...sharedEnd];
  }
}

function createEmptyBrief(projectDescription = "") {
  const seeded = {
    projectType: "",
    sector: "",
    primaryGoal: "",
    targetAudience: "",
    currentState: "",
    keyFeatures: [],
    aiNeeds: "",
    automationNeeds: "",
    backOfficeNeeds: "",
    constraints: "",
    timeline: "",
    budget: "",
    summary: "",
  };

  return enrichBriefFromText(seeded, projectDescription, { fillOnlyEmpty: true });
}

function sanitizeBrief(brief = {}, projectDescription = "") {
  const seed = createEmptyBrief(projectDescription);

  return {
    ...seed,
    ...brief,
    keyFeatures: Array.isArray(brief.keyFeatures)
      ? uniqueList(brief.keyFeatures.map((item) => String(item || "").trim()).filter(Boolean)).slice(0, 8)
      : splitList(brief.keyFeatures),
  };
}

function enrichBriefFromText(brief = {}, source = "", options = {}) {
  const safeBrief = { ...brief };
  const { fillOnlyEmpty = true } = options;
  const assign = (field, value) => {
    if (!value) {
      return;
    }

    if (!fillOnlyEmpty || !isFilled(safeBrief[field])) {
      safeBrief[field] = value;
    }
  };

  assign("projectType", inferProjectType(source));
  assign("sector", inferSector(source));
  assign("targetAudience", inferAudienceFromText(source));
  assign("currentState", inferCurrentState(source));
  assign("timeline", inferTimeline(source));
  assign("budget", inferBudget(source));
  assign("backOfficeNeeds", inferBackOfficeNeed(source));
  assign("aiNeeds", inferAiNeed(source));
  assign("automationNeeds", inferAutomationNeed(source));

  safeBrief.keyFeatures = uniqueList([
    ...safeBrief.keyFeatures,
    ...inferFeatureList(source),
  ]).slice(0, 8);

  return safeBrief;
}

function mapFieldValue(field, value, brief = {}, projectDescription = "") {
  const cleaned = String(value || "").trim();

  if (!cleaned) {
    return field === "keyFeatures" ? [] : "";
  }

  switch (field) {
    case "projectType":
      return inferProjectType(cleaned) || cleaned;
    case "sector":
      return inferSector(cleaned) || cleaned;
    case "currentState":
      return inferCurrentState(cleaned) || cleaned;
    case "keyFeatures":
      return splitList(cleaned);
    case "aiNeeds":
      if (/^non\b|pas de besoin ia|aucun besoin ia/.test(normalizeText(cleaned))) {
        return "Pas de besoin IA prioritaire a ce stade";
      }
      return cleaned;
    case "automationNeeds":
      if (/^non\b|aucune integration|pas d'integration|pas d'automatisation/.test(normalizeText(cleaned))) {
        return "Aucune automatisation ou integration prioritaire a ce stade";
      }
      return cleaned;
    case "backOfficeNeeds":
      if (/^non\b|pas necessaire|pas de back/.test(normalizeText(cleaned))) {
        return "Non, pas de back-office specifique";
      }
      return inferBackOfficeNeed(cleaned) || cleaned;
    case "timeline":
      return inferTimeline(cleaned) || cleaned;
    case "budget":
      return inferBudget(cleaned) || cleaned;
    default:
      return cleaned;
  }
}

function buildProjectTypeReplies() {
  return [
    "Site vitrine",
    "Site professionnel avance",
    "SaaS",
    "Plateforme",
    "Outil interne",
    "Automatisation",
    "Integration IA",
    "Refonte d'existant",
  ];
}

function buildQuestionMeta(field, brief = {}, projectDescription = "") {
  const safeBrief = sanitizeBrief(brief, projectDescription);
  const profile = detectProjectProfile(safeBrief, projectDescription);
  const projectLabel = safeBrief.projectType
    ? safeBrief.projectType.toLowerCase()
    : "ce projet";

  const specs = {
    projectType: {
      question: "Quel type de projet voulez-vous cadrer ?",
      placeholder: "Ex. un SaaS B2B, une refonte de site, un outil interne ou une automatisation.",
      quickReplies: buildProjectTypeReplies(),
    },
    sector: {
      question: "Dans quel secteur d'activite s'inscrit le projet ?",
      placeholder: "Ex. sante, immobilier, education, services B2B, logistique, finance...",
      quickReplies: ["Sante", "Immobilier", "E-commerce", "Education", "B2B / services", "Autre"],
    },
    primaryGoal: {
      question:
        profile === "site_vitrine" || profile === "site_pro" || profile === "refonte"
          ? "Quel est l'objectif principal du projet : generer des leads, mieux presenter l'offre, convertir ou autre ?"
          : profile === "saas" || profile === "plateforme"
            ? "Quel probleme metier ce produit doit-il resoudre en priorite ?"
            : profile === "automatisation"
              ? "Quel gain attendez-vous en priorite de cette automatisation ?"
              : profile === "integration_ia"
                ? "Qu'est-ce que l'IA doit apporter concretement au produit ou au process ?"
                : "Quel est l'objectif principal du projet ?",
      placeholder:
        profile === "site_vitrine" || profile === "site_pro" || profile === "refonte"
          ? "Ex. mieux presenter l'offre, generer plus de demandes qualifiees, rassurer avant un appel."
          : "Ex. faire gagner du temps, fluidifier un process, lancer un MVP, centraliser une operation cle.",
      quickReplies:
        profile === "site_vitrine" || profile === "site_pro" || profile === "refonte"
          ? ["Generer des leads", "Mieux presenter l'offre", "Augmenter la conversion", "Refondre l'image", "Lancer une nouvelle offre"]
          : profile === "saas" || profile === "plateforme"
            ? ["Valider un MVP", "Resoudre un probleme metier", "Structurer une offre produit", "Monetiser un service", "Moderniser un existant"]
            : profile === "automatisation"
              ? ["Gagner du temps", "Fiabiliser un process", "Reduire le manuel", "Mieux suivre les donnees", "Automatiser les relances"]
              : ["Clarifier le besoin", "Lancer un MVP", "Ameliorer l'existant", "Industrialiser un process"],
    },
    targetAudience: {
      question:
        profile === "outil_interne" || profile === "automatisation"
          ? "Qui utilisera la solution au quotidien ?"
          : "A qui le produit ou le site s'adresse-t-il en priorite ?",
      placeholder: "Ex. prospects B2B, clients existants, equipe interne, partenaires, grand public...",
      quickReplies:
        profile === "outil_interne" || profile === "automatisation"
          ? ["Equipe interne", "Equipe commerciale", "Operations", "Support / SAV", "Direction / management"]
          : ["Prospects B2B", "Clients existants", "Grand public", "Equipes internes", "Partenaires"],
    },
    currentState: {
      question: "Le projet existe-t-il deja ou faut-il partir de zero ?",
      placeholder: "Ex. on a deja un site, un prototype, un outil existant ou juste une idee.",
      quickReplies: [
        "Non, on part de zero",
        "Oui, il existe deja",
        "Il faut refaire l'existant",
        "On a deja un prototype / MVP",
      ],
    },
    keyFeatures: {
      question:
        profile === "site_vitrine" || profile === "site_pro" || profile === "refonte"
          ? `Pour lancer ${projectLabel}, qu'est-ce qu'il faut absolument retrouver dedans ?`
          : profile === "saas" || profile === "plateforme" || profile === "outil_interne"
            ? "Quelles sont les fonctionnalites coeur du MVP ou de la premiere version ?"
            : profile === "automatisation"
              ? "Quelles actions ou etapes faut-il absolument couvrir dans le workflow ?"
              : profile === "integration_ia"
                ? "Quelles fonctionnalites doivent encadrer l'usage de l'IA dans le produit ?"
                : "Quelles fonctionnalites importantes avez-vous deja identifiees ?",
      placeholder:
        profile === "site_vitrine" || profile === "site_pro" || profile === "refonte"
          ? "Ex. pages services, cas clients, formulaire de devis, prise de RDV, CMS, espace client."
          : profile === "automatisation"
            ? "Ex. recuperer des donnees, enrichir, router, notifier, synchroniser, produire un reporting."
            : "Ex. comptes utilisateurs, dashboard, admin, paiement, reporting, workflow, portail client.",
      quickReplies:
        profile === "site_vitrine" || profile === "site_pro" || profile === "refonte"
          ? ["Pages services / offre", "Prise de contact / devis", "Prise de rendez-vous", "CMS / contenu", "Espace client", "Back-office / administration"]
          : profile === "saas" || profile === "plateforme" || profile === "outil_interne"
            ? ["Comptes utilisateurs", "Dashboard / reporting", "Workflow metier", "Paiement / abonnement", "Back-office / administration", "Notifications"]
            : profile === "automatisation"
              ? ["Qualification de leads", "Synchronisation de donnees", "Relances / notifications", "Reporting / exports", "Traitement documentaire", "Validation metier"]
              : ["Assistant / chatbot", "Recherche documentaire", "Analyse / resume", "Qualification / tri", "Dashboard / reporting"],
    },
    aiNeeds: {
      question:
        profile === "integration_ia"
          ? "Quel role l'IA doit-elle jouer concretement dans le produit ou le process ?"
          : "Y a-t-il un besoin IA dans le projet ? Si oui, pour quoi faire concretement ?",
      placeholder: "Ex. assistant, generation, resume, qualification, recherche documentaire, aide interne.",
      quickReplies: [
        "Assistant / chatbot",
        "Generation de contenu",
        "Analyse / resume",
        "Qualification / tri",
        "Pas de besoin IA",
        "A definir ensemble",
      ],
    },
    automationNeeds: {
      question:
        profile === "automatisation"
          ? "Quels outils, sources de donnees ou actions faut-il connecter / automatiser ?"
          : "Faut-il connecter d'autres outils, APIs ou automatisations ?",
      placeholder: "Ex. HubSpot, Notion, Airtable, Stripe, ERP, emails, webhooks, API metier.",
      quickReplies: [
        "Connexion CRM",
        "Connexion Airtable / Notion",
        "Connexion ERP / metier",
        "Email / relances",
        "Synchronisation de donnees",
        "Aucune integration prioritaire",
      ],
    },
    backOfficeNeeds: {
      question: "Avez-vous besoin d'un espace d'administration ou d'un back-office ?",
      placeholder: "Ex. gestion de contenus, pilotage des comptes, moderation, suivi des operations.",
      quickReplies: ["Oui, back-office complet", "Oui, admin leger", "Non, pas necessaire", "A definir ensemble"],
    },
    constraints: {
      question: "Y a-t-il des contraintes importantes a garder en tete ?",
      placeholder: "Ex. delai de lancement, stack imposee, reprise d'existant, securite, contenus, conformité, equipe interne.",
      quickReplies: [
        "Lancement rapide",
        "Reprise d'un existant",
        "Integration a une stack existante",
        "Contraintes de securite / conformite",
        "Contenus a produire",
      ],
    },
    timeline: {
      question: "Y a-t-il un delai, une date de lancement ou un niveau d'urgence ?",
      placeholder: "Ex. idealement sous 6 semaines, avant un salon, pas de date fixe, MVP ce trimestre.",
      quickReplies: ["Le plus vite possible", "Sous 1 a 2 mois", "Sous 1 trimestre", "Pas de date fixe"],
    },
    budget: {
      question: "Si vous avez deja un ordre de grandeur budgetaire, vous pouvez me le partager.",
      placeholder: "Ex. 5 a 10k, 15k+, a definir selon le perimetre, pas encore cadre.",
      quickReplies: ["Moins de 5k", "5 a 10k", "10 a 20k", "20k+", "A definir ensemble"],
    },
  };

  return specs[field] || {
    question: `Pouvez-vous preciser ${field} ?`,
    placeholder: "Ajoutez ici la reponse la plus utile pour cadrer le besoin.",
    quickReplies: [],
  };
}

function getFieldPrompt(field, brief = {}, projectDescription = "") {
  return buildQuestionMeta(field, brief, projectDescription).question;
}

function computeProgress(brief = {}, projectDescription = "") {
  const safeBrief = sanitizeBrief(brief, projectDescription);
  const filled = REQUIRED_FIELD_SEQUENCE.filter((field) => isFilled(safeBrief[field])).length;
  return Math.round((filled / REQUIRED_FIELD_SEQUENCE.length) * 100);
}

function getNextMissingField(brief = {}, projectDescription = "") {
  const safeBrief = sanitizeBrief(brief, projectDescription);
  const profile = detectProjectProfile(safeBrief, projectDescription);
  const sequence = getSequenceForProfile(profile);

  return sequence.find((field) => !isFilled(safeBrief[field])) || null;
}

function summarizeBriefDraft(brief, projectDescription = "") {
  const safeBrief = sanitizeBrief(brief, projectDescription);
  const parts = [];

  if (safeBrief.projectType) {
    parts.push(
      safeBrief.sector
        ? `Projet de ${safeBrief.projectType.toLowerCase()} dans ${safeBrief.sector.toLowerCase()}.`
        : `Projet de ${safeBrief.projectType.toLowerCase()}.`,
    );
  }

  if (safeBrief.primaryGoal) {
    parts.push(`Objectif principal : ${safeBrief.primaryGoal}.`);
  }

  if (safeBrief.targetAudience || safeBrief.currentState) {
    const audiencePart = safeBrief.targetAudience ? `Cible : ${safeBrief.targetAudience}` : "";
    const statePart = safeBrief.currentState ? `etat actuel : ${safeBrief.currentState}` : "";
    parts.push([audiencePart, statePart].filter(Boolean).join(" ; ") + ".");
  }

  if (safeBrief.keyFeatures.length) {
    parts.push(`Perimetre prioritaire : ${safeBrief.keyFeatures.slice(0, 4).join(", ")}.`);
  }

  const stackParts = [safeBrief.aiNeeds, safeBrief.automationNeeds, safeBrief.backOfficeNeeds].filter(Boolean);
  if (stackParts.length) {
    parts.push(`Cadrage produit / technique : ${stackParts.join(" ; ")}.`);
  }

  const deliveryParts = [safeBrief.constraints, safeBrief.timeline, safeBrief.budget].filter(Boolean);
  if (deliveryParts.length) {
    parts.push(`Cadre projet : ${deliveryParts.join(" ; ")}.`);
  }

  return (
    parts.join(" ").trim() ||
    `Projet digital a cadrer a partir du brief initial : ${projectDescription || "description a completer"}.`
  );
}

function applyAnswerToBrief({ brief = {}, activeField, userMessage = "", projectDescription = "" }) {
  const safeBrief = sanitizeBrief(brief, projectDescription);
  const value = String(userMessage || "").trim();

  if (!value) {
    safeBrief.summary = summarizeBriefDraft(safeBrief, projectDescription);
    return safeBrief;
  }

  const nextBrief = enrichBriefFromText(safeBrief, value, { fillOnlyEmpty: true });

  if (activeField) {
    if (activeField === "keyFeatures") {
      nextBrief.keyFeatures = uniqueList([
        ...nextBrief.keyFeatures,
        ...mapFieldValue(activeField, value, nextBrief, projectDescription),
      ]).slice(0, 8);
    } else {
      nextBrief[activeField] = mapFieldValue(activeField, value, nextBrief, projectDescription);
    }
  }

  if (!nextBrief.primaryGoal && activeField === "projectType") {
    nextBrief.primaryGoal = "";
  }

  nextBrief.summary = summarizeBriefDraft(nextBrief, projectDescription);
  return nextBrief;
}

function buildAssistantLead(brief = {}, projectDescription = "") {
  const safeBrief = sanitizeBrief(brief, projectDescription);
  const profile = detectProjectProfile(safeBrief, projectDescription);

  if (profile === "saas" || profile === "plateforme") {
    return "Je vois l'orientation produit. On va cadrer le besoin comme un MVP exploitable, pas comme une liste d'idees.";
  }

  if (profile === "automatisation") {
    return "Je pose le cadre en mode operations : objectif, flux, outils a connecter et niveau d'automatisation attendu.";
  }

  if (profile === "integration_ia") {
    return "Je vais surtout qualifier l'usage concret de l'IA, son role metier et le contexte produit autour.";
  }

  if (profile === "site_vitrine" || profile === "site_pro" || profile === "refonte") {
    return "Je vais cadrer le besoin comme un vrai projet digital : objectif, cible, contenu utile, conversion et contraintes.";
  }

  return "Je pose une base de brief exploitable cote dev et produit, puis on affine point par point.";
}

function buildFallbackConversationStart(projectDescription = "") {
  const brief = sanitizeBrief(createEmptyBrief(projectDescription), projectDescription);
  brief.summary = summarizeBriefDraft(brief, projectDescription);
  const nextField = getNextMissingField(brief, projectDescription);
  const meta = nextField ? buildQuestionMeta(nextField, brief, projectDescription) : null;

  return {
    mode: "fallback",
    assistantMessage: buildAssistantLead(brief, projectDescription),
    brief,
    nextField,
    nextQuestion: meta?.question || "",
    quickReplies: meta?.quickReplies || [],
    inputPlaceholder: meta?.placeholder || "",
    isComplete: !nextField,
    progress: computeProgress(brief, projectDescription),
  };
}

function advanceFallbackConversation({
  projectDescription = "",
  brief = {},
  activeField,
  userMessage = "",
}) {
  const updatedBrief = applyAnswerToBrief({
    brief,
    activeField,
    userMessage,
    projectDescription,
  });

  const nextField = getNextMissingField(updatedBrief, projectDescription);
  const meta = nextField ? buildQuestionMeta(nextField, updatedBrief, projectDescription) : null;
  const isComplete = !nextField;

  return {
    mode: "fallback",
    assistantMessage: isComplete
      ? "Le brief est maintenant assez cadre pour etre relu, complete si besoin puis envoye."
      : "C'est note. J'integre ca au dossier et je continue avec la question la plus utile pour la suite.",
    brief: updatedBrief,
    nextField,
    nextQuestion: meta?.question || "",
    quickReplies: meta?.quickReplies || [],
    inputPlaceholder: meta?.placeholder || "",
    isComplete,
    progress: computeProgress(updatedBrief, projectDescription),
  };
}

function fallbackQuestions(projectDescription = "") {
  const start = buildFallbackConversationStart(projectDescription);
  const questions = [];
  let brief = start.brief;
  let currentField = start.nextField;

  while (currentField && questions.length < 5) {
    const meta = buildQuestionMeta(currentField, brief, projectDescription);
    questions.push({
      id: currentField,
      label: meta.question,
      why: `Permet de mieux cadrer ${currentField} dans le brief final.`,
      placeholder: meta.placeholder,
      quickReplies: meta.quickReplies,
    });

    brief[currentField] =
      currentField === "keyFeatures"
        ? ["A preciser"]
        : currentField === "budget"
          ? "A definir"
          : "A preciser";
    currentField = getNextMissingField(brief, projectDescription);
  }

  return questions;
}

function collectConstraints(brief = {}) {
  const constraints = [];

  if (brief.constraints) {
    constraints.push(brief.constraints);
  }

  if (brief.currentState && brief.currentState.toLowerCase().includes("existant")) {
    constraints.push("Reprise d'un existant a anticiper");
  }

  if (brief.timeline) {
    constraints.push(`Delai : ${brief.timeline}`);
  }

  return uniqueList(constraints);
}

function buildFallbackSummary({ projectDescription = "", answers = {} }) {
  const combinedText = `${projectDescription} ${Object.values(answers).join(" ")}`;
  const brief = sanitizeBrief(
    {
      projectType: answers.projectType || inferProjectType(combinedText),
      sector: answers.sector || inferSector(combinedText),
      primaryGoal: answers.primaryGoal || answers.business_goal || "",
      targetAudience: answers.targetAudience || answers.target_audience || inferAudienceFromText(combinedText),
      currentState: answers.currentState || inferCurrentState(combinedText),
      keyFeatures: answers.keyFeatures || answers.must_have_scope || inferFeatureList(combinedText),
      aiNeeds: answers.aiNeeds || answers.ai_automation_expectations || inferAiNeed(combinedText),
      automationNeeds:
        answers.automationNeeds || answers.integrationNeeds || inferAutomationNeed(combinedText),
      backOfficeNeeds: answers.backOfficeNeeds || inferBackOfficeNeed(combinedText),
      constraints: answers.constraints || "",
      timeline: answers.timeline || inferTimeline(combinedText),
      budget: answers.budget || inferBudget(combinedText),
    },
    projectDescription,
  );

  brief.summary = summarizeBriefDraft(brief, projectDescription);

  return {
    projectType: brief.projectType,
    sector: brief.sector,
    primaryGoal: brief.primaryGoal,
    targetAudience: brief.targetAudience,
    currentState: brief.currentState,
    keyFeatures: brief.keyFeatures,
    aiNeeds: asList(brief.aiNeeds),
    automationNeeds: asList(brief.automationNeeds),
    backOfficeNeeds: brief.backOfficeNeeds,
    constraints: collectConstraints(brief),
    timeline: brief.timeline,
    budget: brief.budget,
    stackSignals: uniqueList([
      ...brief.keyFeatures.filter((item) => /admin|dashboard|compte|paiement|cms/i.test(item)),
      brief.aiNeeds,
      brief.automationNeeds,
      brief.backOfficeNeeds,
    ]).filter(Boolean),
    summary: brief.summary,
  };
}

function asList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  const text = String(value || "").trim();
  return text ? [text] : [];
}

module.exports = {
  applyAnswerToBrief,
  buildFallbackConversationStart,
  buildFallbackSummary,
  buildQuestionMeta,
  computeProgress,
  createEmptyBrief,
  fallbackQuestions,
  getFieldPrompt,
  getNextMissingField,
  inferProjectType,
  sanitizeBrief,
  summarizeBriefDraft,
  advanceFallbackConversation,
};
