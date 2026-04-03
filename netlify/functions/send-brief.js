const { createNetlifyHandler } = require("../../server/handlers/http");
const { handleSendBrief } = require("../../server/handlers/send-brief");

exports.handler = createNetlifyHandler({
  methods: ["POST"],
  handler: handleSendBrief,
});
