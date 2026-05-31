import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

type ApiHandler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;

async function loadHandler(server: ViteDevServer, relativePath: string): Promise<ApiHandler> {
  const id = path.posix.join("/", relativePath.replace(/\\/g, "/"));
  const mod = await server.ssrLoadModule(id);
  return mod.default as ApiHandler;
}

export function vercelApiDevPlugin(): Plugin {
  return {
    name: "vercel-api-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();

        try {
          const url = new URL(req.url, "http://localhost");
          const pathname = url.pathname;

          if (pathname.startsWith("/api/auth/")) {
            const handler = await loadHandler(server, "api/auth/[...all].ts");
            await handler(req, res);
            return;
          }

          if (pathname === "/api/health") {
            const handler = await loadHandler(server, "api/health.ts");
            await handler(req, res);
            return;
          }

          if (pathname === "/api/modules") {
            const handler = await loadHandler(server, "api/modules.ts");
            await handler(req, res);
            return;
          }

          if (pathname === "/api/progress") {
            const handler = await loadHandler(server, "api/progress.ts");
            await handler(req, res);
            return;
          }

          if (pathname === "/api/submit-challenge") {
            const handler = await loadHandler(server, "api/submit-challenge.ts");
            await handler(req, res);
            return;
          }

          if (pathname === "/api/submit-quiz") {
            const handler = await loadHandler(server, "api/submit-quiz.ts");
            await handler(req, res);
            return;
          }

          if (pathname === "/api/admin/modules") {
            const handler = await loadHandler(server, "api/admin/modules.ts");
            await handler(req, res);
            return;
          }

          next();
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : "API error" }));
        }
      });
    },
  };
}
