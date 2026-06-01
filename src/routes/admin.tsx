import { createFileRoute } from "@tanstack/react-router";
import { AuthenticatedGate } from "../components/auth/AuthenticatedGate";
import { AdminPage } from "../pages/AdminPage";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AuthenticatedGate adminOnly>
      <AdminPage />
    </AuthenticatedGate>
  ),
});
