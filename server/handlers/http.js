const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
};

function json(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      ...JSON_HEADERS,
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  };
}

function parseJsonBody(body) {
  if (body == null || body === "") {
    return {};
  }

  if (typeof body === "object") {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    const parseError = new Error("INVALID_JSON_BODY");
    parseError.code = "INVALID_JSON_BODY";
    parseError.cause = error;
    throw parseError;
  }
}

function sendExpressJson(response, result) {
  response.status(result.statusCode || 200);

  Object.entries(result.headers || {}).forEach(([key, value]) => {
    response.setHeader(key, value);
  });

  return response.send(result.body);
}

function createExpressHandler(handler) {
  return async (request, response) => {
    try {
      const result = await handler({
        body: request.body,
        method: request.method,
        path: request.originalUrl,
        ip: request.ip,
        headers: request.headers,
      });

      return sendExpressJson(response, result);
    } catch (error) {
      console.error("[http] Express handler failed:", error);

      return sendExpressJson(
        response,
        json(500, {
          ok: false,
          message: "Une erreur serveur est survenue.",
        }),
      );
    }
  };
}

function parseNetlifyBody(event) {
  if (!event.body) {
    return {};
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  return parseJsonBody(rawBody);
}

function createNetlifyHandler({ methods = ["GET"], handler }) {
  const allowHeader = methods.join(", ");

  return async (event, context) => {
    if (!methods.includes(event.httpMethod)) {
      return json(
        405,
        {
          ok: false,
          message: `Methode non autorisee: ${event.httpMethod}`,
        },
        { Allow: allowHeader },
      );
    }

    let body = {};

    try {
      body = parseNetlifyBody(event);
    } catch (error) {
      return json(400, {
        ok: false,
        message: "Corps JSON invalide.",
      });
    }

    try {
      return await handler({
        body,
        method: event.httpMethod,
        path: event.path,
        ip:
          event.headers["x-nf-client-connection-ip"] ||
          event.headers["client-ip"] ||
          event.headers["x-forwarded-for"] ||
          "",
        headers: event.headers,
        event,
        context,
      });
    } catch (error) {
      console.error("[http] Netlify handler failed:", error);

      return json(500, {
        ok: false,
        message: "Une erreur serveur est survenue.",
      });
    }
  };
}

module.exports = {
  createExpressHandler,
  createNetlifyHandler,
  json,
  parseJsonBody,
};
