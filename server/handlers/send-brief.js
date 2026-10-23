const { sendBriefEmail } = require("../lib/resend");
const { buildBriefEmail, parseBriefSubmission } = require("../utils/brief-email");
const { json } = require("./http");

async function handleSendBrief({ body, method, path, ip }) {
  console.log(`[send-brief] ${method} ${path} received from ${ip || "unknown-ip"}`);

  const submission = parseBriefSubmission(body);

  if (submission.missingFields.length > 0) {
    console.warn("[send-brief] validation failed:", submission.missingFields);
    return json(400, {
      ok: false,
      message:
        "Le brief est incomplet. Merci de vérifier les informations essentielles avant l’envoi.",
      missingFields: submission.missingFields,
    });
  }

  try {
    const email = buildBriefEmail(submission);
    const result = await sendBriefEmail({
      ...email,
      replyTo: submission.contact.email,
    });

    console.log("[send-brief] email sent successfully:", result?.id || "no-id");

    return json(200, {
      ok: true,
      message: "Le brief a bien été envoyé à notre équipe.",
      emailId: result?.id || null,
    });
  } catch (error) {
    if (error.code === "RESEND_API_KEY_MISSING" || error.message === "RESEND_API_KEY_MISSING") {
      console.error("[send-brief] RESEND_API_KEY missing");
      return json(500, {
        ok: false,
        message:
          "Le service d’envoi est momentanément indisponible. Vous pouvez écrire directement à pridanotech@gmail.com.",
      });
    }

    console.error("[send-brief] send failed:", error);

    return json(502, {
      ok: false,
      message:
        "L’envoi du brief a échoué côté serveur. Merci de réessayer dans un instant.",
    });
  }
}

module.exports = {
  handleSendBrief,
};
