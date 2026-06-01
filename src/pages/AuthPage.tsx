import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { signIn, signUp } from "../features/auth/client";
import { LoadingButton } from "../components/ui/LoadingButton";
import { useAuth } from "../hooks/useAuth";

type Mode = "signin" | "signup";

export function AuthPage({ mode, afterAuthTo = "/dashboard" }: { mode: Mode; afterAuthTo?: string }) {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [name, setName] = useState("Learner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") await signUp(name, email, password);
      else await signIn(email, password);
      await refresh();
      navigate({ to: afterAuthTo });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell user={user} variant="marketing">
      <div className="mx-auto max-w-md glass p-6">
        <h1 className="mb-2 text-2xl font-bold">{mode === "signup" ? "Create account" : "Welcome back"}</h1>
        <p className="mb-4 text-sm text-[var(--muted)]">Secure auth powered by Better Auth + Postgres sessions.</p>
        {mode === "signup" ? (
          <input className="input mb-3" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        ) : null}
        <input className="input mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input mb-4" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
        <LoadingButton className="w-full" loading={loading} onClick={() => void submit()}>
          {mode === "signup" ? "Sign up" : "Sign in"}
        </LoadingButton>
        <p className="mt-4 text-sm text-[var(--muted)]">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <Link to={mode === "signup" ? "/signin" : "/signup"} className="text-white underline">
            {mode === "signup" ? "Sign in" : "Create account"}
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
