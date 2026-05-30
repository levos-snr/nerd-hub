import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { signIn, signUp } from "../features/auth/client";
import { useAuth } from "../providers/AuthProvider";

type Mode = "signin" | "signup";

export function AuthPage({ mode }: { mode: Mode }) {
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
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-md glass p-6">
        <h1 className="mb-2 text-2xl font-bold">{mode === "signup" ? "Create account" : "Welcome back"}</h1>
        <p className="mb-4 text-sm text-[var(--muted)]">Secure auth powered by Better Auth + Postgres sessions.</p>
        {mode === "signup" ? (
          <input className="input mb-3" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        ) : null}
        <input className="input mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input mb-4" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}
        <button className="btn btn-primary w-full" disabled={loading} onClick={() => void submit()}>
          {loading ? "Please wait..." : mode === "signup" ? "Sign up" : "Sign in"}
        </button>
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
