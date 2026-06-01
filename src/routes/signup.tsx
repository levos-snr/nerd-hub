import { createFileRoute } from "@tanstack/react-router";
import { GuestOnlyGate } from "../components/auth/GuestOnlyGate";
import { AuthPage } from "../pages/AuthPage";

export const Route = createFileRoute("/signup")({
  component: () => (
    <GuestOnlyGate>
      <AuthPage mode="signup" afterAuthTo="/dashboard" />
    </GuestOnlyGate>
  ),
});
