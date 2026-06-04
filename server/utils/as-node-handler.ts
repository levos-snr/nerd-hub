import { defineEventHandler, toRequest, type H3Event } from "nitro/h3";
import type { IncomingMessage, ServerResponse } from "node:http";

export type WebApiHandler = (request: Request) => Promise<Response>;

export type NodeApiHandler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;

export function asWebHandler(handler: WebApiHandler) {
  return defineEventHandler(async (event: H3Event) => {
    const request = toRequest(event);
    return handler(request);
  });
}
