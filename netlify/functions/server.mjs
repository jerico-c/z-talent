import app from "../../dist/server/server.js";

const methodsWithoutBody = new Set(["GET", "HEAD"]);

function getRequestUrl(event) {
  if (event.rawUrl) return event.rawUrl;
  const protocol = event.headers?.["x-forwarded-proto"] || "https";
  const host = event.headers?.host || event.headers?.Host || "localhost";
  return `${protocol}://${host}${event.path || "/"}`;
}

function getRequestBody(event) {
  if (methodsWithoutBody.has(event.httpMethod)) return undefined;
  if (!event.body) return undefined;
  return event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;
}

export async function handler(event, context) {
  const request = new Request(getRequestUrl(event), {
    method: event.httpMethod,
    headers: event.headers,
    body: getRequestBody(event),
  });
  const response = await app.fetch(request, process.env, context);
  const body = Buffer.from(await response.arrayBuffer()).toString("base64");

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers),
    body,
    isBase64Encoded: true,
  };
}
