const path = require("node:path");
const express = require("express");
const { config } = require("./server/config/env");
const { createExpressHandler } = require("./server/handlers/http");
const {
  handleHealth,
  handleQuoteChat,
  handleQuoteQualify,
  handleQuoteSummary,
} = require("./server/handlers/quote");
const { sendBriefRouter } = require("./server/routes/send-brief");

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

  app.get("/api/health", createExpressHandler(handleHealth));
  app.post("/api/quote/qualify", createExpressHandler(handleQuoteQualify));
  app.post("/api/quote/summary", createExpressHandler(handleQuoteSummary));
  app.post("/api/quote/chat", createExpressHandler(handleQuoteChat));

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
