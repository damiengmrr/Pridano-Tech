const { createNetlifyHandler } = require("../../server/handlers/http");
const { handleHealth } = require("../../server/handlers/quote");

exports.handler = createNetlifyHandler({
  methods: ["GET"],
  handler: handleHealth,
});
