const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

const defaultPort = Number(process.env.PORT || 3000);

const config = {
  port: Number.isFinite(defaultPort) ? defaultPort : 3000,
  siteUrl: process.env.PUBLIC_SITE_URL || `http://localhost:${defaultPort}`,
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  leadNotificationEmail:
    process.env.LEAD_NOTIFICATION_EMAIL || "pridanotech@gmail.com",
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFromEmail:
    process.env.RESEND_FROM_EMAIL || "PridanoTech <onboarding@resend.dev>",
};

module.exports = { config };
