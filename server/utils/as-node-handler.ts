import type { IncomingMessage, ServerResponse } from "node:http";

export type WebApiHandler = (request: Request) => Promise<Response>;
export type NodeApiHandler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;

export function asWebHandler(handler: WebApiHandler): WebApiHandler {
  return handler;
}
