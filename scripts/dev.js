const { startServer } = require("../server");

process.on("uncaughtException", (error) => {
  console.error("[dev] Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[dev] Unhandled rejection:", reason);
  process.exit(1);
});

const server = startServer();

function shutdown(signal) {
  console.log(`[dev] ${signal} recu, arret du serveur...`);
  server.close((error) => {
    if (error) {
      console.error("[dev] Erreur pendant l'arret du serveur:", error);
      process.exit(1);
      return;
    }

    console.log("[dev] Serveur arrete proprement.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
