import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { GuestOnlyGate } from "../components/auth/GuestOnlyGate";
import { AuthPage } from "../pages/AuthPage";

const signinSearchSchema = z.object({
  redirect: z.string().optional(),
});

function safeRedirect(path: string | undefined): string {
  if (path && path.startsWith("/") && !path.startsWith("//")) return path;
  return "/dashboard";
}

export const Route = createFileRoute("/signin")({
  validateSearch: signinSearchSchema,
  component: SignInRoute,
});

function SignInRoute() {
  const { redirect } = Route.useSearch();
  const target = safeRedirect(redirect);

  return (
    <GuestOnlyGate redirectTo={target}>
      <AuthPage mode="signin" afterAuthTo={target} />
    </GuestOnlyGate>
  );
}
