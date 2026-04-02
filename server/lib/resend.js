const { Resend } = require("resend");
const { config } = require("../config/env");

async function sendBriefEmail({ subject, html, text, replyTo }) {
  if (!process.env.RESEND_API_KEY) {
    const error = new Error("RESEND_API_KEY_MISSING");
    error.code = "RESEND_API_KEY_MISSING";
    throw error;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: config.resendFromEmail,
    to: [config.leadNotificationEmail],
    subject,
    html,
    text,
    replyTo: replyTo || undefined,
  });

  if (error) {
    const requestError = new Error(error.message || "RESEND_SEND_FAILED");
    requestError.code = error.name || "RESEND_SEND_FAILED";
    throw requestError;
  }

  return data;
}

module.exports = {
  sendBriefEmail,
};
