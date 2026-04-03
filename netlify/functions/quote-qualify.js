const { createNetlifyHandler } = require("../../server/handlers/http");
const { handleQuoteQualify } = require("../../server/handlers/quote");

exports.handler = createNetlifyHandler({
  methods: ["POST"],
  handler: handleQuoteQualify,
});
