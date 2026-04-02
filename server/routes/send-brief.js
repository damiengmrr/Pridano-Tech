const express = require("express");
const { sendBriefEmail } = require("../lib/resend");
const { buildBriefEmail, parseBriefSubmission } = require("../utils/brief-email");

const router = express.Router();

async function handleSendBrief(request, response) {
  console.log(
    `[send-brief] ${request.method} ${request.originalUrl} received from ${
      request.ip || "unknown-ip"
    }`,
  );

  const submission = parseBriefSubmission(request.body);

  if (submission.missingFields.length > 0) {
    console.warn("[send-brief] validation failed:", submission.missingFields);
    return response.status(400).json({
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

    return response.json({
      ok: true,
      message: "Le brief a bien ete envoye a notre equipe.",
      emailId: result?.id || null,
    });
  } catch (error) {
    if (error.code === "RESEND_API_KEY_MISSING" || error.message === "RESEND_API_KEY_MISSING") {
      console.error("[send-brief] RESEND_API_KEY missing");
      return response.status(500).json({
        ok: false,
        message:
          "Le service email n'est pas configure cote serveur. Ajoutez RESEND_API_KEY puis reessayez.",
      });
    }

    console.error("[send-brief] send failed:", error);

    return response.status(502).json({
      ok: false,
      message:
        "L'envoi du brief a echoue cote serveur. Merci de reessayer dans un instant.",
    });
  }
}

router.post("/api/send-brief", handleSendBrief);
router.post("/api/quote/submit", handleSendBrief);

module.exports = {
  sendBriefRouter: router,
};
