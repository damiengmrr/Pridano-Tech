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
        "Le brief est incomplet. Merci de verifier les informations essentielles avant l'envoi.",
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
      message: "Le brief a bien ete envoye a notre equipe.",
      emailId: result?.id || null,
    });
  } catch (error) {
    if (error.code === "RESEND_API_KEY_MISSING" || error.message === "RESEND_API_KEY_MISSING") {
      console.error("[send-brief] RESEND_API_KEY missing");
      return json(500, {
        ok: false,
        message:
          "Le service email n'est pas configure cote serveur. Ajoutez RESEND_API_KEY puis reessayez.",
      });
    }

    console.error("[send-brief] send failed:", error);

    return json(502, {
      ok: false,
      message:
        "L'envoi du brief a echoue cote serveur. Merci de reessayer dans un instant.",
    });
  }
}

module.exports = {
  handleSendBrief,
};
