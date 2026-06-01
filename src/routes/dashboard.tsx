import { createFileRoute } from "@tanstack/react-router";
import { AuthenticatedGate } from "../components/auth/AuthenticatedGate";
import { DashboardPage } from "../pages/DashboardPage";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <AuthenticatedGate>
      <DashboardPage />
    </AuthenticatedGate>
  ),
});
