const { createNetlifyHandler } = require('../../server/handlers/http');
const { handleContact } = require('../../server/handlers/contact');
exports.handler = createNetlifyHandler({ methods: ['POST'], handler: handleContact });
