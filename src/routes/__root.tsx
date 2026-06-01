import type { ReactNode } from "react";
import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { AppProviders } from "../providers/AppProviders";
import appCss from "../styles/app.css?url";

function NotFound() {
  return (
    <main className="mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">That route does not exist.</p>
      <Link to="/" className="mt-4 inline-block underline">
        Back home
      </Link>
    </main>
  );
}

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "JS/TS Learning Platform" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <AppProviders>
        <Outlet />
      </AppProviders>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
