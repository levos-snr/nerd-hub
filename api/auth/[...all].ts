import { toNodeHandler } from "better-auth/node";
import { auth } from "../../src/features/auth/auth.server.js";
import type { IncomingMessage, ServerResponse } from "node:http";

const handler = toNodeHandler(auth);

export default async function authHandler(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    await handler(req, res);
  } catch (err) {
    console.error("[auth] handler crash:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: String(err) }));
  }
}

export const config = { api: { bodyParser: false } };
