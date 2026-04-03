const { createNetlifyHandler } = require("../../server/handlers/http");
const { handleQuoteSummary } = require("../../server/handlers/quote");

exports.handler = createNetlifyHandler({
  methods: ["POST"],
  handler: handleQuoteSummary,
});
