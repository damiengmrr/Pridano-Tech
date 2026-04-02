const FIELD_LABELS = {
  projectType: "le type de projet",
  sector: "le secteur d'activite",
  primaryGoal: "l'objectif principal",
  targetAudience: "la cible prioritaire",
  currentState: "l'etat du projet",
  keyFeatures: "les fonctionnalites prioritaires",
  aiNeeds: "le besoin IA",
  automationNeeds: "les automatisations et integrations",
  backOfficeNeeds: "le besoin de back-office",
  constraints: "les contraintes",
  timeline: "le delai",
  budget: "le budget indicatif",
};

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
];

const REVIEW_SEQUENCE = [...FIELD_SEQUENCE, "budget"];

const PREVIEW_SECTIONS = [
  { key: "projectType", label: "Type de projet" },
  { key: "sector", label: "Secteur" },
  { key: "primaryGoal", label: "Objectif" },
  { key: "targetAudience", label: "Cible" },
  { key: "currentState", label: "Etat du projet" },
  { key: "keyFeatures", label: "Fonctionnalites" },
  { key: "techScope", label: "IA / integrations" },
  { key: "delivery", label: "Cadre" },
];

const INITIAL_ASSISTANT_MESSAGE =
  "Expliquez simplement le projet. Je vais le qualifier comme un brief utile pour un studio digital, puis vous pourrez tout relire avant l'envoi.";
const INITIAL_STATUS_MESSAGE =
  "Commencez par une phrase simple. Je vais ensuite orienter la qualification selon le type de projet.";
const MIN_START_MESSAGE_LENGTH = 8;
const INITIAL_QUICK_REPLIES = [
  "Site vitrine",
  "Site professionnel avance",
  "SaaS",
  "Plateforme",
  "Outil interne",
  "Automatisation",
  "Integration IA",
  "Refonte d'existant",
];
const INITIAL_PLACEHOLDER =
  "Ex. On veut lancer un SaaS pour automatiser la qualification de prospects B2B.";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function splitList(value = "") {
  return [...new Set(
    String(value)
      .split(/\n|,|;|•|-/)
      .map((item) => item.trim())
      .filter(Boolean),
  )].slice(0, 8);
}

function createEmptyBrief() {
  return {
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
}

function normalizeBrief(brief = {}) {
  return {
    ...createEmptyBrief(),
    ...brief,
    keyFeatures: Array.isArray(brief.keyFeatures)
      ? brief.keyFeatures.filter(Boolean).slice(0, 8)
      : splitList(brief.keyFeatures),
  };
}

function isFilled(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return String(value || "").trim().length > 0;
}

function getFilledFieldCount(brief) {
  return FIELD_SEQUENCE.filter((field) => isFilled(brief[field])).length;
}

function getCompletionScore(brief) {
  return Math.round((getFilledFieldCount(brief) / FIELD_SEQUENCE.length) * 100);
}

function getPreviewValue(key, brief) {
  if (key === "techScope") {
    return [brief.aiNeeds, brief.automationNeeds, brief.backOfficeNeeds].filter(Boolean).join(" · ");
  }

  if (key === "delivery") {
    return [brief.constraints, brief.timeline, brief.budget].filter(Boolean).join(" · ");
  }

  const value = brief[key];

  if (Array.isArray(value)) {
    return value.join(" · ");
  }

  return String(value || "").trim();
}

function summarizeBrief(brief) {
  const parts = [];

  if (brief.projectType) {
    parts.push(
      brief.sector
        ? `Projet de ${brief.projectType.toLowerCase()} dans ${brief.sector.toLowerCase()}.`
        : `Projet de ${brief.projectType.toLowerCase()}.`,
    );
  }

  if (brief.primaryGoal) {
    parts.push(`Objectif : ${brief.primaryGoal}.`);
  }

  if (brief.targetAudience || brief.currentState) {
    parts.push(
      [brief.targetAudience ? `Cible : ${brief.targetAudience}` : "", brief.currentState ? `etat : ${brief.currentState}` : ""]
        .filter(Boolean)
        .join(" ; ") + ".",
    );
  }

  if (brief.keyFeatures.length) {
    parts.push(`Priorites de lancement : ${brief.keyFeatures.slice(0, 4).join(", ")}.`);
  }

  const scopeParts = [brief.aiNeeds, brief.automationNeeds, brief.backOfficeNeeds].filter(Boolean);
  if (scopeParts.length) {
    parts.push(`Scope technique : ${scopeParts.join(" ; ")}.`);
  }

  const frameParts = [brief.constraints, brief.timeline, brief.budget].filter(Boolean);
  if (frameParts.length) {
    parts.push(`Cadre projet : ${frameParts.join(" ; ")}.`);
  }

  return parts.join(" ").trim();
}

function getStageLabel({ started, isComplete, completion }) {
  if (!started) {
    return "A demarrer";
  }

  if (isComplete) {
    return "Pret a relire";
  }

  if (completion >= 75) {
    return "Bien cadre";
  }

  if (completion >= 40) {
    return "En qualification";
  }

  return "Ouvert";
}

function getRemainingLabel(missingCount, isComplete) {
  if (isComplete || missingCount <= 0) {
    return "Brief pret a relire";
  }

  return `${missingCount} point${missingCount > 1 ? "s" : ""} utiles a cadrer`;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.message || "Une erreur serveur est survenue.");
  }

  return json;
}

export function initPage() {
  const root = document.querySelector("[data-quote-app]");

  if (!root) {
    return;
  }

  const chatLog = root.querySelector("[data-chat-log]");
  const chatStatus = root.querySelector("[data-chat-status]");
  const composerInput = root.querySelector("[data-composer-input]");
  const sendButton = root.querySelector("[data-send-message]");
  const resetButton = root.querySelector("[data-reset-conversation]");
  const healthPill = root.querySelector("[data-assistant-health]");
  const progressLabel = root.querySelector("[data-brief-progress-label]");
  const progressBar = root.querySelector("[data-brief-progress-bar]");
  const nextFieldLabel = root.querySelector("[data-next-field-label]");
  const stageLabel = root.querySelector("[data-brief-stage-label]");
  const remainingLabel = root.querySelector("[data-brief-remaining]");
  const summaryPreview = root.querySelector("[data-brief-summary-preview]");
  const previewList = root.querySelector("[data-brief-preview-list]");
  const emptyNote = root.querySelector("[data-brief-empty-note]");
  const suggestionGroup = root.querySelector("[data-suggestion-group]");
  const reviewButtons = [...root.querySelectorAll("[data-open-review]")];
  const regenerateSummaryButton = root.querySelector("[data-regenerate-summary]");
  const submitButton = root.querySelector("[data-submit-brief]");
  const submitFeedback = root.querySelector("[data-submit-feedback]");
  const reviewModal = root.querySelector("[data-review-modal]");
  const closeReviewButtons = [...root.querySelectorAll("[data-close-review]")];
  const successPanel = document.querySelector("[data-quote-success]");
  const successMessage = document.querySelector("[data-success-message]");
  const successSummary = document.querySelector("[data-success-summary]");
  const briefFields = [...root.querySelectorAll("[data-brief-field]")];
  const reviewButtonDefaults = new Map(
    reviewButtons.map((button) => [button, button.textContent.trim()]),
  );
  const submitButtonDefaultLabel = submitButton ? submitButton.innerHTML.trim() : "";

  const contactName = root.querySelector("#contactName");
  const contactCompany = root.querySelector("#contactCompany");
  const contactEmail = root.querySelector("#contactEmail");
  const contactPhone = root.querySelector("#contactPhone");
  const contactBudget = root.querySelector("#contactBudget");
  const contactConsent = root.querySelector("#contactConsent");
  const contactFields = [
    contactName,
    contactCompany,
    contactEmail,
    contactPhone,
    contactBudget,
    contactConsent,
  ].filter(Boolean);

  const state = {
    started: false,
    projectDescription: "",
    currentField: null,
    pendingQuestion: "",
    quickReplies: [...INITIAL_QUICK_REPLIES],
    inputPlaceholder: INITIAL_PLACEHOLDER,
    isComplete: false,
    mode: "pending",
    isSending: false,
    isSubmittingBrief: false,
    conversation: [
      {
        role: "assistant",
        content: INITIAL_ASSISTANT_MESSAGE,
      },
    ],
    brief: createEmptyBrief(),
    summaryManuallyEdited: false,
  };

  function setStatus(message, isError = false) {
    chatStatus.className = `wizard-status${isError ? " is-error" : ""}`;
    chatStatus.innerHTML = escapeHtml(message);
  }

  function setLoading(message) {
    chatStatus.className = "wizard-status";
    chatStatus.innerHTML = `<span class="loading-dots"><span></span><span></span><span></span></span> ${escapeHtml(
      message,
    )}`;
  }

  function setSubmitFeedback(message = "", tone = "info") {
    if (!submitFeedback) {
      return;
    }

    submitFeedback.hidden = !message;
    submitFeedback.className = `review-submit-status${tone ? ` is-${tone}` : ""}`;
    submitFeedback.textContent = message;
  }

  function openReviewModal() {
    if (!state.started) {
      setStatus("Commencez par decrire le projet pour ouvrir le brief.", true);
      composerInput.focus();
      return;
    }

    syncBriefFromInputs();
    setSubmitFeedback("");
    reviewModal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeReviewModal() {
    reviewModal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function renderChat() {
    chatLog.innerHTML = state.conversation
      .map(
        (message) => `
          <article class="message ${message.role}">
            <span class="message-role">
              <i data-lucide="${message.role === "assistant" ? "sparkles" : "user-round"}"></i>
              ${message.role === "assistant" ? "Assistant" : "Vous"}
            </span>
            <p>${escapeHtml(message.content).replaceAll("\n", "<br />")}</p>
          </article>
        `,
      )
      .join("");

    chatLog.scrollTop = chatLog.scrollHeight;

    if (window.PridanoApp?.refreshIcons) {
      window.PridanoApp.refreshIcons();
    }
  }

  function renderPreviewList(brief) {
    const items = PREVIEW_SECTIONS.map((section) => ({
      label: section.label,
      value: getPreviewValue(section.key, brief),
    })).filter((section) => section.value);

    previewList.innerHTML = items
      .map(
        (item) => `
          <article class="brief-preview-item">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </article>
        `,
      )
      .join("");

    emptyNote.hidden = items.length > 0;
  }

  function renderQuickReplies() {
    const replies = state.quickReplies.filter(Boolean).slice(0, 8);

    suggestionGroup.innerHTML = replies
      .map(
        (reply) => `
          <button
            class="prompt-chip"
            type="button"
            data-quick-reply="${escapeHtml(reply)}"
          >
            ${escapeHtml(reply)}
          </button>
        `,
      )
      .join("");

    suggestionGroup.hidden = replies.length === 0;

    suggestionGroup.querySelectorAll("[data-quick-reply]").forEach((button) => {
      button.addEventListener("click", () => {
        const reply = button.getAttribute("data-quick-reply") || "";
        handleQuickReply(reply);
      });
    });
  }

  function renderBrief() {
    const brief = normalizeBrief(state.brief);
    const completion = getCompletionScore(brief);
    const filledCount = getFilledFieldCount(brief);
    const missingCount = FIELD_SEQUENCE.length - filledCount;

    briefFields.forEach((field) => {
      const key = field.dataset.briefField;

      if (key === "keyFeatures") {
        field.value = brief.keyFeatures.join("\n");
      } else {
        field.value = brief[key] || "";
      }
    });

    progressLabel.textContent = `${completion}%`;
    progressBar.style.width = `${completion}%`;
    stageLabel.textContent = getStageLabel({
      started: state.started,
      isComplete: state.isComplete,
      completion,
    });
    remainingLabel.textContent = getRemainingLabel(missingCount, state.isComplete);
    summaryPreview.textContent =
      brief.summary || "Le resume apparaitra ici au fil de la conversation.";

    if (!state.started) {
      nextFieldLabel.textContent =
        "Commencez par decrire le projet. Le cadrage s'orientera ensuite selon le type de besoin.";
    } else if (state.isComplete) {
      nextFieldLabel.textContent =
        "Le brief est assez clair pour etre relu, ajuste puis transmis.";
    } else if (state.pendingQuestion) {
      nextFieldLabel.textContent = state.pendingQuestion;
    } else if (state.currentField) {
      nextFieldLabel.textContent = `Prochaine zone utile : ${FIELD_LABELS[state.currentField]}.`;
    } else {
      nextFieldLabel.textContent = "Le brief se structure au fil de l'echange.";
    }

    composerInput.placeholder = state.inputPlaceholder || INITIAL_PLACEHOLDER;
    renderQuickReplies();
    renderPreviewList(brief);

    reviewButtons.forEach((button) => {
      button.disabled = !state.started;
      button.textContent = reviewButtonDefaults.get(button) || "Relire / ajuster";
    });

    root.classList.toggle("is-started", state.started);
    root.classList.toggle("is-complete", state.isComplete);
  }

  function applyLocalSummary(force = false) {
    if (!state.summaryManuallyEdited || force) {
      state.brief.summary = summarizeBrief(normalizeBrief(state.brief));
    }
  }

  function syncBriefFromInputs(changedField) {
    const nextBrief = normalizeBrief(state.brief);

    briefFields.forEach((field) => {
      const key = field.dataset.briefField;
      const value = field.value.trim();

      if (key === "keyFeatures") {
        nextBrief.keyFeatures = splitList(value);
      } else {
        nextBrief[key] = value;
      }
    });

    state.brief = nextBrief;

    if (changedField === "summary") {
      state.summaryManuallyEdited = true;
    } else {
      applyLocalSummary();
    }

    renderBrief();
  }

  function serializeHistory() {
    return state.conversation.map((message) => ({
      role: message.role,
      content: message.content,
    }));
  }

  function pushAssistantTurn(payload) {
    state.mode = payload.mode || state.mode;
    state.currentField = payload.nextField || null;
    state.pendingQuestion = payload.nextQuestion || "";
    state.quickReplies = Array.isArray(payload.quickReplies)
      ? payload.quickReplies.filter(Boolean).slice(0, 8)
      : [];
    state.inputPlaceholder = payload.inputPlaceholder || state.inputPlaceholder || INITIAL_PLACEHOLDER;
    state.isComplete = Boolean(payload.isComplete);
    state.brief = normalizeBrief(payload.brief || state.brief);
    applyLocalSummary();

    const assistantContent = payload.nextQuestion
      ? `${payload.assistantMessage}\n\n${payload.nextQuestion}`
      : payload.assistantMessage;

    state.conversation.push({
      role: "assistant",
      content: assistantContent,
    });

    renderChat();
    renderBrief();

    if (state.isComplete) {
      setStatus("Le brief est pret. Relisez-le, ajustez si besoin, puis envoyez-le.");
      return;
    }

    setStatus(
      state.mode === "ai"
        ? "Le brief se qualifie au fil de l'echange."
        : "Assistant local actif. Le brief continue de se structurer.",
    );
  }

  async function startConversation(initialMessage) {
    setLoading("Je pose la premiere base du brief...");

    const payload = await postJson("/api/quote/chat", {
      action: "start",
      projectDescription: initialMessage,
    });

    state.projectDescription = initialMessage;
    state.started = true;
    state.conversation.push({ role: "user", content: initialMessage });
    pushAssistantTurn(payload);
  }

  async function continueConversation(userMessage) {
    setLoading("J'integre cette reponse au brief...");

    const payload = await postJson("/api/quote/chat", {
      action: "continue",
      projectDescription: state.projectDescription,
      brief: state.brief,
      activeField: state.currentField,
      userMessage,
      history: serializeHistory(),
    });

    state.conversation.push({ role: "user", content: userMessage });
    pushAssistantTurn(payload);
  }

  function resetConversation() {
    state.started = false;
    state.projectDescription = "";
    state.currentField = null;
    state.pendingQuestion = "";
    state.quickReplies = [...INITIAL_QUICK_REPLIES];
    state.inputPlaceholder = INITIAL_PLACEHOLDER;
    state.isComplete = false;
    state.mode = "pending";
    state.isSending = false;
    state.isSubmittingBrief = false;
    state.summaryManuallyEdited = false;
    state.brief = createEmptyBrief();
    state.conversation = [
      {
        role: "assistant",
        content: INITIAL_ASSISTANT_MESSAGE,
      },
    ];

    composerInput.value = "";
    composerInput.placeholder = INITIAL_PLACEHOLDER;
    contactName.value = "";
    contactCompany.value = "";
    contactEmail.value = "";
    contactPhone.value = "";
    contactBudget.value = "";
    contactConsent.checked = false;
    setSubmitFeedback("");
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      submitButton.innerHTML = submitButtonDefaultLabel;
    }
    closeReviewModal();
    renderChat();
    renderBrief();
    setStatus(INITIAL_STATUS_MESSAGE);
  }

  async function submitMessage(message) {
    if (!message) {
      setStatus("Ajoutez au moins quelques mots pour continuer.", true);
      composerInput.focus();
      return;
    }

    if (!state.started && message.length < MIN_START_MESSAGE_LENGTH) {
      setStatus("Ajoutez juste quelques mots de plus pour lancer le brief.", true);
      composerInput.focus();
      return;
    }

    state.isSending = true;
    sendButton.disabled = true;

    try {
      if (!state.started) {
        await startConversation(message);
      } else {
        await continueConversation(message);
      }

      composerInput.value = "";
      composerInput.focus();
    } catch (error) {
      setStatus(error.message || "La conversation a rencontre un souci. Vous pouvez reessayer.", true);
    } finally {
      state.isSending = false;
      sendButton.disabled = false;
    }
  }

  async function handleSend() {
    const message = composerInput.value.trim();
    await submitMessage(message);
  }

  async function handleQuickReply(reply) {
    if (state.isSending || state.isSubmittingBrief) {
      return;
    }

    composerInput.value = reply;
    await submitMessage(reply);
  }

  function validateContact() {
    if (!contactName.value.trim()) {
      setSubmitFeedback("Ajoutez votre nom complet avant l'envoi.", "error");
      setStatus("Le nom du contact principal est requis.", true);
      contactName.focus();
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.value.trim())) {
      setSubmitFeedback("Ajoutez une adresse email valide pour recevoir la suite.", "error");
      setStatus("Merci de renseigner une adresse email valide.", true);
      contactEmail.focus();
      return false;
    }

    if (!contactConsent.checked) {
      setSubmitFeedback("Le consentement est requis pour transmettre le brief.", "error");
      setStatus("Le consentement est necessaire pour envoyer le brief.", true);
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (state.isSubmittingBrief) {
      return;
    }

    syncBriefFromInputs();

    if (!validateContact()) {
      return;
    }

    setSubmitFeedback("Envoi du brief a notre equipe...", "loading");
    setLoading("J'envoie le brief...");
    state.isSubmittingBrief = true;
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    submitButton.innerHTML =
      'Envoi en cours <span class="loading-dots"><span></span><span></span><span></span></span>';

    try {
      const result = await postJson("/api/send-brief", {
        projectDescription: state.projectDescription,
        summary: normalizeBrief(state.brief),
        brief: normalizeBrief(state.brief),
        conversation: serializeHistory(),
        contact: {
          name: contactName.value.trim(),
          company: contactCompany.value.trim(),
          email: contactEmail.value.trim(),
          phone: contactPhone.value.trim(),
          budgetRange: contactBudget.value.trim(),
          consent: contactConsent.checked,
        },
      });

      setSubmitFeedback("Brief envoye avec succes.", "success");
      closeReviewModal();
      root.hidden = true;
      successPanel.hidden = false;
      if (successMessage) {
        successMessage.textContent =
          result.message || "Notre equipe a bien recu votre brief par email.";
      }
      successSummary.textContent = state.brief.summary || summarizeBrief(state.brief);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitFeedback(
        error.message || "L'envoi du brief a echoue. Verifiez les informations puis reessayez.",
        "error",
      );
      setStatus(error.message || "L'envoi a echoue. Vous pouvez corriger puis reessayer.", true);
    } finally {
      state.isSubmittingBrief = false;
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      submitButton.innerHTML = submitButtonDefaultLabel;
    }
  }

  sendButton.addEventListener("click", handleSend);
  resetButton.addEventListener("click", resetConversation);
  submitButton.addEventListener("click", handleSubmit);

  if (regenerateSummaryButton) {
    regenerateSummaryButton.addEventListener("click", () => {
      state.summaryManuallyEdited = false;
      applyLocalSummary(true);
      renderBrief();
      setStatus("La synthese a ete regeneree a partir du brief courant.");
    });
  }

  reviewButtons.forEach((button) => {
    button.addEventListener("click", openReviewModal);
  });

  closeReviewButtons.forEach((button) => {
    button.addEventListener("click", closeReviewModal);
  });

  briefFields.forEach((field) => {
    field.addEventListener("input", () => {
      setSubmitFeedback("");
      syncBriefFromInputs(field.dataset.briefField);
    });
  });

  contactFields.forEach((field) => {
    const eventName = field.type === "checkbox" ? "change" : "input";
    field.addEventListener(eventName, () => {
      setSubmitFeedback("");
    });
  });

  composerInput.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !reviewModal.hidden) {
      closeReviewModal();
    }
  });

  fetch("/api/health")
    .then((response) => response.json())
    .then((payload) => {
      if (!healthPill) {
        return;
      }

      healthPill.innerHTML = payload.groqConfigured
        ? `<i data-lucide="activity"></i> Assistant IA connecte`
        : `<i data-lucide="shield-check"></i> Assistant local`;
      if (window.PridanoApp?.refreshIcons) {
        window.PridanoApp.refreshIcons();
      }
    })
    .catch(() => {
      if (!healthPill) {
        return;
      }

      healthPill.innerHTML = `<i data-lucide="alert-circle"></i> Etat assistant indisponible`;
      if (window.PridanoApp?.refreshIcons) {
        window.PridanoApp.refreshIcons();
      }
    });

  renderChat();
  renderBrief();
  setStatus(INITIAL_STATUS_MESSAGE);
}
