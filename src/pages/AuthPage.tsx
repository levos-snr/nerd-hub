import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { signIn, signUp } from "../features/auth/client";
import { useAuth } from "../hooks/useAuth";
import "../styles/auth.css";
import { Code2 } from "lucide-react";

type Mode = "signin" | "signup";

export function AuthPage({
  mode,
  afterAuthTo = "/dashboard",
}: {
  mode: Mode;
  afterAuthTo?: string;
}) {
  const navigate = useNavigate();
  const { refresh } = useAuth();
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
    <div className="auth-page-root">
      <div className="auth-card">
        {/*-- Left  --*/}
        <div className="auth-panel-left">
          <div className="auth-brand flex gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-black">
              <Code2 size={20} />
            </span>
            nerdStack
            <span className="auth-brand-dot">.</span>
            dev
          </div>
          <div className="auth-panel-copy">
            <p className="auth-panel-headline">
              Build real skills,
              <br />
              ship real things.
            </p>
            <p className="auth-panel-sub">
              Hands-on courses, live feedback, and real projects that move the needle.
            </p>
          </div>
          <div className="auth-panel-badge">
            <span className="auth-panel-badge-dot" />
            Secure auth — Better Auth + Postgres
          </div>
        </div>

        {/*-- Right panel-- */}
        <div className="auth-panel-right">
          {/* Mode toggle */}
          <div className="auth-mode-toggle">
            <Link
              to="/signin"
              className={`auth-mode-btn${mode === "signin" ? " auth-mode-btn--active" : ""}`}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className={`auth-mode-btn${mode === "signup" ? " auth-mode-btn--active" : ""}`}
            >
              Create account
            </Link>
          </div>

          <h1 className="auth-form-title">
            {mode === "signup" ? "Join for free" : "Welcome back"}
          </h1>
          <p className="auth-form-sub">
            {mode === "signup"
              ? "Create an account and start building today."
              : "Sign in to continue your progress."}
          </p>

          {mode === "signup" && (
            <div className="auth-field">
              <label className="auth-label">Full name</label>
              <input
                className="auth-input"
                placeholder="Learner"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            className={`auth-submit${loading ? " auth-submit--loading" : ""}`}
            disabled={loading}
            onClick={() => void submit()}
          >
            {loading ? (
              <>
                <span className="auth-spinner" aria-hidden="true" />
                Please wait…
              </>
            ) : mode === "signup" ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </button>

          <p className="auth-switch">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <Link to={mode === "signup" ? "/signin" : "/signup"} className="auth-switch-link">
              {mode === "signup" ? "Sign in" : "Create account"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
