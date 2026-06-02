import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { NodeApiHandler } from "../../server/utils/as-node-handler";

export async function runNodeHandler(handler: NodeApiHandler, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const headers: IncomingMessage["headers"] = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? Buffer.alloc(0)
      : Buffer.from(await request.arrayBuffer());

  return new Promise((resolve, reject) => {
    const req = new Readable({
      read() {
        if (body.length > 0) {
          this.push(body);
        }
        this.push(null);
      },
    }) as IncomingMessage;

    req.method = request.method;
    req.url = `${url.pathname}${url.search}`;
    req.headers = headers;

    let statusCode = 200;
    const outHeaders = new Headers();

    const res = {
      statusCode: 200,
      setHeader(name: string, value: string | number | readonly string[]) {
        outHeaders.set(name, Array.isArray(value) ? value.join(", ") : String(value));
      },
      getHeader(name: string) {
        return outHeaders.get(name) ?? undefined;
      },
      writeHead(code: number, hdrs?: Record<string, string | string[] | number>) {
        statusCode = code;
        if (hdrs) {
          for (const [key, val] of Object.entries(hdrs)) {
            outHeaders.set(key, Array.isArray(val) ? val.join(", ") : String(val));
          }
        }
      },
      end(payload?: string | Buffer) {
        const body: BodyInit | null =
          payload == null ? null : typeof payload === "string" ? payload : new Uint8Array(payload);
        resolve(
          new Response(body, {
            status: statusCode,
            headers: outHeaders,
          }),
        );
      },
    } as ServerResponse;

    Promise.resolve(handler(req, res)).catch(reject);
  });
}
