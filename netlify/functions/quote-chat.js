const { createNetlifyHandler } = require("../../server/handlers/http");
const { handleQuoteChat } = require("../../server/handlers/quote");

exports.handler = createNetlifyHandler({
  methods: ["POST"],
  handler: handleQuoteChat,
});
