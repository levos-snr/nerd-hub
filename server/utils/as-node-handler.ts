import { defineEventHandler, toWebRequest, type H3Event } from "nitro/h3";

export type WebApiHandler = (request: Request) => Promise<Response>;

export function asWebHandler(handler: WebApiHandler) {
  return defineEventHandler(async (event: H3Event) => {
    const request = toWebRequest(event);
    return handler(request);
  });
}
