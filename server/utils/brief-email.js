const REQUIRED_BRIEF_FIELDS = [
  "projectType",
  "primaryGoal",
  "targetAudience",
  "currentState",
  "timeline",
  "summary",
];

const REQUIRED_CONTACT_FIELDS = ["name", "email"];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function splitList(value = "") {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 8);
  }

  return [...new Set(
    String(value)
      .split(/\n|,|;|•|-/)
      .map((item) => item.trim())
      .filter(Boolean),
  )].slice(0, 8);
}

function normalizeText(value = "") {
  return String(value || "").trim();
}

function isFilled(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return normalizeText(value).length > 0;
}

function normalizeBrief(rawBrief = {}) {
  return {
    projectType: normalizeText(rawBrief.projectType),
    sector: normalizeText(rawBrief.sector),
    primaryGoal: normalizeText(rawBrief.primaryGoal),
    targetAudience: normalizeText(rawBrief.targetAudience || rawBrief.audience),
    currentState: normalizeText(rawBrief.currentState),
    keyFeatures: splitList(rawBrief.keyFeatures),
    aiNeeds: normalizeText(rawBrief.aiNeeds),
    automationNeeds: normalizeText(rawBrief.automationNeeds),
    backOfficeNeeds: normalizeText(rawBrief.backOfficeNeeds),
    constraints: normalizeText(rawBrief.constraints),
    timeline: normalizeText(rawBrief.timeline),
    budget: normalizeText(rawBrief.budget),
    summary: normalizeText(rawBrief.summary),
  };
}

function normalizeContact(rawContact = {}) {
  return {
    name: normalizeText(rawContact.name),
    company: normalizeText(rawContact.company),
    email: normalizeText(rawContact.email),
    phone: normalizeText(rawContact.phone),
    budgetRange: normalizeText(rawContact.budgetRange),
    consent: Boolean(rawContact.consent),
  };
}

function validateEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getMissingFields(brief, contact, projectDescription) {
  const missing = [];

  if (!normalizeText(projectDescription)) {
    missing.push("description du projet");
  }

  REQUIRED_CONTACT_FIELDS.forEach((field) => {
    if (!isFilled(contact[field])) {
      missing.push(`contact.${field}`);
    }
  });

  REQUIRED_BRIEF_FIELDS.forEach((field) => {
    if (!isFilled(brief[field])) {
      missing.push(`brief.${field}`);
    }
  });

  if (!contact.consent) {
    missing.push("contact.consent");
  }

  return missing;
}

function renderFieldRow(label, value, options = {}) {
  const detail = options.detail ? `<div style="margin-top:6px;color:#5d6d84;font-size:14px;line-height:1.55;">${escapeHtml(options.detail)}</div>` : "";

  return `
    <tr>
      <td style="width:220px;padding:14px 16px;vertical-align:top;border-top:1px solid #e7edf6;color:#20314b;font-weight:700;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:14px 16px;vertical-align:top;border-top:1px solid #e7edf6;color:#152235;line-height:1.6;">
        ${escapeHtml(value || "Non renseigne")}
        ${detail}
      </td>
    </tr>
  `;
}

function renderList(items = [], emptyLabel) {
  if (!items.length) {
    return `<p style="margin:0;color:#5d6d84;line-height:1.6;">${escapeHtml(emptyLabel)}</p>`;
  }

  return `
    <ul style="margin:0;padding-left:20px;color:#152235;line-height:1.7;">
      ${items
        .map((item) => `<li style="margin:0 0 6px;">${escapeHtml(item)}</li>`)
        .join("")}
    </ul>
  `;
}

function renderSection(title, content) {
  return `
    <section style="margin-top:24px;border:1px solid #e7edf6;border-radius:18px;background:#ffffff;overflow:hidden;">
      <div style="padding:14px 18px;background:#f7faff;border-bottom:1px solid #e7edf6;">
        <h2 style="margin:0;font-size:16px;font-family:Arial,sans-serif;color:#20314b;">${escapeHtml(title)}</h2>
      </div>
      <div style="padding:0 0 2px;">
        ${content}
      </div>
    </section>
  `;
}

function buildConversationDigest(conversation = []) {
  return conversation
    .filter((message) => message && message.role && message.content)
    .slice(-6)
    .map((message) => {
      const role = message.role === "assistant" ? "Assistant" : "Client";
      const content = normalizeText(message.content).replace(/\s+/g, " ");
      return `${role}: ${content}`;
    });
}

function buildNeedStatus(detail, emptyDetail) {
  if (!detail) {
    return {
      value: "Non",
      detail: emptyDetail,
    };
  }

  return {
    value: "Oui",
    detail,
  };
}

function buildBriefEmail({ brief, contact, projectDescription, conversation = [] }) {
  const subjectLabel = brief.projectType || contact.company || contact.name || "Projet";
  const aiStatus = buildNeedStatus(brief.aiNeeds, "Aucune integration IA demandee a ce stade.");
  const backOfficeStatus = buildNeedStatus(
    brief.backOfficeNeeds,
    "Pas de besoin back-office explicite mentionne.",
  );
  const conversationDigest = buildConversationDigest(conversation);
  const quickSummary = [
    brief.projectType ? `Type : ${brief.projectType}` : "",
    brief.sector ? `Secteur : ${brief.sector}` : "",
    brief.timeline ? `Delai : ${brief.timeline}` : "",
    brief.budget || contact.budgetRange ? `Budget : ${brief.budget || contact.budgetRange}` : "",
  ].filter(Boolean);

  const html = `
    <div style="margin:0;padding:24px;background:#f4f6fb;font-family:Arial,sans-serif;color:#152235;">
      <div style="max-width:860px;margin:0 auto;">
        <div style="padding:28px 28px 24px;border-radius:24px;background:linear-gradient(135deg,#173b92 0%,#2256d3 100%);color:#ffffff;box-shadow:0 18px 44px rgba(27,44,75,0.12);">
          <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.78;">PridanoTech · Nouveau brief</div>
          <h1 style="margin:12px 0 10px;font-size:28px;line-height:1.2;font-family:Arial,sans-serif;">${escapeHtml(subjectLabel)}</h1>
          <p style="margin:0;font-size:15px;line-height:1.7;opacity:0.94;">
            Brief envoye depuis la page Devis. Le client a relu puis valide son dossier avant transmission a l'equipe.
          </p>
          ${quickSummary.length
            ? `<div style="margin-top:18px;font-size:14px;line-height:1.7;">${escapeHtml(
                quickSummary.join("  |  "),
              )}</div>`
            : ""}
        </div>

        ${renderSection(
          "Resume global",
          `
            <div style="padding:18px;">
              <p style="margin:0;color:#152235;font-size:15px;line-height:1.8;">
                ${escapeHtml(brief.summary || "Aucun resume fourni.")}
              </p>
            </div>
          `,
        )}

        ${renderSection(
          "Contact",
          `
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
              <tbody>
                ${renderFieldRow("Nom", contact.name)}
                ${renderFieldRow("Societe", contact.company)}
                ${renderFieldRow("Email", contact.email)}
                ${renderFieldRow("Telephone", contact.phone)}
                ${renderFieldRow("Budget partage", contact.budgetRange || brief.budget)}
              </tbody>
            </table>
          `,
        )}

        ${renderSection(
          "Cadrage projet",
          `
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
              <tbody>
                ${renderFieldRow("Type de projet", brief.projectType)}
                ${renderFieldRow("Secteur d'activite", brief.sector)}
                ${renderFieldRow("Objectif principal", brief.primaryGoal)}
                ${renderFieldRow("Cible", brief.targetAudience)}
                ${renderFieldRow("Etat du projet", brief.currentState)}
                ${renderFieldRow("Delai", brief.timeline)}
                ${renderFieldRow("Budget indicatif", brief.budget || contact.budgetRange)}
                ${renderFieldRow("Contraintes", brief.constraints)}
              </tbody>
            </table>
          `,
        )}

        ${renderSection(
          "Fonctionnalites attendues",
          `
            <div style="padding:18px;">
              ${renderList(brief.keyFeatures, "Aucune fonctionnalite detaillee pour le moment.")}
            </div>
          `,
        )}

        ${renderSection(
          "Technique et operations",
          `
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
              <tbody>
                ${renderFieldRow("Integration IA", aiStatus.value, { detail: aiStatus.detail })}
                ${renderFieldRow("Automatisations / integrations", brief.automationNeeds || "Non renseigne")}
                ${renderFieldRow("Back-office / admin", backOfficeStatus.value, {
                  detail: backOfficeStatus.detail,
                })}
              </tbody>
            </table>
          `,
        )}

        ${renderSection(
          "Contexte initial",
          `
            <div style="padding:18px;">
              <p style="margin:0;color:#152235;font-size:15px;line-height:1.8;">
                ${escapeHtml(projectDescription || "Aucune description initiale fournie.")}
              </p>
            </div>
          `,
        )}

        ${conversationDigest.length
          ? renderSection(
              "Synthese courte de la conversation",
              `
                <div style="padding:18px;">
                  ${renderList(conversationDigest, "Pas d'historique de conversation disponible.")}
                </div>
              `,
            )
          : ""}
      </div>
    </div>
  `;

  const text = [
    "Nouveau brief PridanoTech",
    "",
    `Contact: ${contact.name}${contact.company ? ` - ${contact.company}` : ""}`,
    `Email: ${contact.email}`,
    contact.phone ? `Telephone: ${contact.phone}` : "",
    "",
    `Type de projet: ${brief.projectType || "Non renseigne"}`,
    `Secteur d'activite: ${brief.sector || "Non renseigne"}`,
    `Objectif principal: ${brief.primaryGoal || "Non renseigne"}`,
    `Cible: ${brief.targetAudience || "Non renseigne"}`,
    `Etat du projet: ${brief.currentState || "Non renseigne"}`,
    `Fonctionnalites: ${brief.keyFeatures.join(" | ") || "Non renseigne"}`,
    `Integration IA: ${aiStatus.value} - ${aiStatus.detail}`,
    `Automatisations / integrations: ${brief.automationNeeds || "Non renseigne"}`,
    `Back-office / admin: ${backOfficeStatus.value} - ${backOfficeStatus.detail}`,
    `Contraintes: ${brief.constraints || "Non renseigne"}`,
    `Delai: ${brief.timeline || "Non renseigne"}`,
    `Budget indicatif: ${brief.budget || contact.budgetRange || "Non renseigne"}`,
    "",
    "Resume global:",
    brief.summary || "Non renseigne",
    "",
    "Description initiale:",
    projectDescription || "Non renseigne",
    conversationDigest.length ? "" : null,
    conversationDigest.length ? "Synthese conversation:" : null,
    ...(conversationDigest.length ? conversationDigest : []),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Nouveau brief PridanoTech - ${subjectLabel}`,
    html,
    text,
  };
}

function parseBriefSubmission(body = {}) {
  const brief = normalizeBrief(body.brief || body.summary || {});
  const contact = normalizeContact(body.contact || {});
  const projectDescription = normalizeText(body.projectDescription);
  const conversation = Array.isArray(body.conversation) ? body.conversation : [];
  const missingFields = getMissingFields(brief, contact, projectDescription);

  if (!validateEmail(contact.email)) {
    missingFields.push("contact.email_format");
  }

  return {
    brief,
    contact,
    projectDescription,
    conversation,
    missingFields: [...new Set(missingFields)],
  };
}

module.exports = {
  buildBriefEmail,
  parseBriefSubmission,
};
