import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthenticatedGate } from "../components/auth/AuthenticatedGate";

export const Route = createFileRoute("/learn")({
  component: () => (
    <AuthenticatedGate>
      <Outlet />
    </AuthenticatedGate>
  ),
});
