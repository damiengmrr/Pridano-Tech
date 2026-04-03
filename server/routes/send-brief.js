const express = require("express");
const { createExpressHandler } = require("../handlers/http");
const { handleSendBrief } = require("../handlers/send-brief");

const router = express.Router();

router.post("/api/send-brief", createExpressHandler(handleSendBrief));
router.post("/api/quote/submit", createExpressHandler(handleSendBrief));

module.exports = {
  sendBriefRouter: router,
};
