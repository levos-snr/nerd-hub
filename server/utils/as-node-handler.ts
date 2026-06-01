import { defineEventHandler, type H3Event } from "nitro/h3";
import type { IncomingMessage, ServerResponse } from "node:http";

export type NodeApiHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => void | Promise<void>;

export function asNodeHandler(handler: NodeApiHandler) {
  return defineEventHandler(async (event: H3Event) => {
    const node = event.node;
    if (!node) {
      throw new Error("Node server context is unavailable");
    }
    await handler(node.req as IncomingMessage, node.res as ServerResponse);
  });
}
