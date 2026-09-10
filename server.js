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
const { handleContact } = require("./server/handlers/contact");

function createApp() {
  const app = express();
  const publicDir = path.join(__dirname, "public");
  const imageDir = path.join(publicDir, "assets", "images");
  const documentDir = path.join(publicDir, "assets", "documents");

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false }));

  const aliases = { '/index.html': '/', '/services.html': '/sites-web', '/projets.html': '/realisations', '/about.html': '/a-propos', '/confidentialite.html': '/confidentialite' };
  const pages = ['sites-web', 'realisations', 'saas', 'crm', 'a-propos', 'contact', 'mentions-legales', 'confidentialite'];
  app.use((request, response, next) => {
    const target = aliases[request.path];
    if (target) return response.redirect(301, target + (request.originalUrl.includes('?') ? request.originalUrl.slice(request.originalUrl.indexOf('?')) : ''));
    next();
  });
  pages.forEach(page => {
    app.get(`/${page}.html`, (request, response) => response.redirect(301, `/${page}` + (request.originalUrl.includes('?') ? request.originalUrl.slice(request.originalUrl.indexOf('?')) : '')));
    app.get(`/${page}`, (request, response) => response.sendFile(path.join(publicDir, `${page}.html`)));
  });
  app.use(express.static(publicDir));
  app.use(express.static(imageDir));
  app.use(express.static(documentDir));

  app.get("/api/health", createExpressHandler(handleHealth));
  app.post("/api/quote/qualify", createExpressHandler(handleQuoteQualify));
  app.post("/api/quote/summary", createExpressHandler(handleQuoteSummary));
  app.post("/api/quote/chat", createExpressHandler(handleQuoteChat));
  app.post("/api/contact", createExpressHandler(handleContact));

  app.use(sendBriefRouter);

  app.use((request, response) => {
    if (!request.path.startsWith('/api/')) return response.status(404).sendFile(path.join(publicDir, '404.html'));
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
