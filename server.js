const path = require("node:path");
const express = require("express");
const { config } = require("./server/config/env");
const { sendBriefRouter } = require("./server/routes/send-brief");
const {
  advanceBriefConversation,
  generateQualification,
  generateSummary,
  startBriefConversation,
} = require("./server/lib/groq");

const MIN_PROJECT_DESCRIPTION_LENGTH = 8;

function createApp() {
  const app = express();
  const publicDir = path.join(__dirname, "public");
  const imageDir = path.join(publicDir, "assets", "images");
  const documentDir = path.join(publicDir, "assets", "documents");

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false }));

  app.use(express.static(publicDir));
  app.use(express.static(imageDir));
  app.use(express.static(documentDir));

  app.get("/api/health", (_request, response) => {
    response.json({
      ok: true,
      groqConfigured: Boolean(config.groqApiKey),
      quoteSubmissionConfigured: Boolean(config.resendApiKey),
      resendConfigured: Boolean(config.resendApiKey),
      port: config.port,
      sendBriefRoute: "/api/send-brief",
    });
  });

  app.post("/api/quote/qualify", async (request, response) => {
    const projectDescription = String(request.body?.projectDescription || "").trim();

    if (projectDescription.length < MIN_PROJECT_DESCRIPTION_LENGTH) {
      return response.status(400).json({
        ok: false,
        message: "Ajoutez juste quelques mots de plus pour lancer l'analyse.",
      });
    }

    const result = await generateQualification(projectDescription);
    return response.json({ ok: true, ...result });
  });

  app.post("/api/quote/summary", async (request, response) => {
    const projectDescription = String(request.body?.projectDescription || "").trim();
    const answers = request.body?.answers || {};

    if (projectDescription.length < MIN_PROJECT_DESCRIPTION_LENGTH) {
      return response.status(400).json({
        ok: false,
        message: "Le brief initial est encore trop court pour produire une synthese utile.",
      });
    }

    const result = await generateSummary({ projectDescription, answers });
    return response.json({ ok: true, ...result });
  });

  app.post("/api/quote/chat", async (request, response) => {
    const projectDescription = String(request.body?.projectDescription || "").trim();
    const brief = request.body?.brief || {};
    const activeField = request.body?.activeField || null;
    const userMessage = String(request.body?.userMessage || "").trim();
    const history = Array.isArray(request.body?.history) ? request.body.history : [];
    const action = request.body?.action || "continue";

    if (projectDescription.length < MIN_PROJECT_DESCRIPTION_LENGTH) {
      return response.status(400).json({
        ok: false,
        message: "Ajoutez juste quelques mots de plus pour lancer la conversation.",
      });
    }

    if (action === "start") {
      const result = await startBriefConversation(projectDescription);
      return response.json({ ok: true, ...result });
    }

    if (!userMessage) {
      return response.status(400).json({
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

    return response.json({ ok: true, ...result });
  });

  app.use(sendBriefRouter);

  app.use((request, response) => {
    response.status(404).json({
      ok: false,
      message: `Route introuvable: ${request.originalUrl}`,
    });
  });

  return app;
}

function formatListeningUrl() {
  try {
    const configured = new URL(config.siteUrl);

    if (
      configured.hostname === "localhost" ||
      configured.hostname === "127.0.0.1" ||
      configured.hostname === "::1"
    ) {
      configured.port = String(config.port);
      return configured.toString().replace(/\/$/, "");
    }

    return config.siteUrl;
  } catch {
    return `http://localhost:${config.port}`;
  }
}

function startServer() {
  const app = createApp();
  const server = app.listen(config.port);

  server.on("listening", () => {
    console.log(`[server] Pridano Tech listening on ${formatListeningUrl()}`);
    console.log(`[server] PID ${process.pid}`);
    console.log(`[server] Route POST /api/send-brief active`);
    console.log(
      `[server] Resend configured: ${config.resendApiKey ? "yes" : "no"} | recipient: ${config.leadNotificationEmail}`,
    );
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `[server] Port ${config.port} deja utilise. Fermez l'ancien serveur ou changez PORT dans .env/.env.local.`,
      );
    } else {
      console.error("[server] Echec au demarrage du serveur:", error);
    }

    process.exitCode = 1;
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = {
  createApp,
  startServer,
};
