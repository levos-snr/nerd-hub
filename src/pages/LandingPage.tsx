import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { useAuth } from "../hooks/useAuth";
import "../styles/landing.css";

const JS_TOPICS = [
  "JS Tutorial", "JS Syntax", "JS Operators", "JS If Conditions",
  "JS Loops", "JS Strings", "JS Functions", "JS Objects",
  "JS Arrays", "JS Scope", "JS Classes", "JS Async",
  "JS Modules", "JS DOM", "JS Web API", "JS AJAX",
  "JS JSON", "JS Advanced", "JS Debugging", "JS Projects",
];

const TS_TOPICS = [
  "TS Introduction", "TS Simple Types", "TS Inference", "TS Special Types",
  "TS Arrays", "TS Tuples", "TS Object Types", "TS Functions",
  "TS Classes", "TS Enums", "TS Generics", "TS Utility Types",
  "TS Union Types", "TS Mapped Types", "TS Decorators", "TS Async",
  "TS React", "TS Node.js", "TS Best Practices", "TS Capstone",
];

export function LandingPage() {
  const { user } = useAuth();
  const [activeTrack, setActiveTrack] = useState<"js" | "ts">("js");

  return (
    <AppShell user={user} variant="marketing">
      <div className="landing">

        <section className="land-hero">
          {/* background */}
          <div className="land-blob land-blob-1" />
          <div className="land-blob land-blob-2" />
          <div className="land-blob land-blob-3" />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="land-eyebrow">
              <span className="land-eyebrow-dot" />
              Free · No credit card · Start in seconds
            </div>

            <h1 className="land-h1">
              Level up from&nbsp;
              <span className="land-h1-serif">zero to deployed</span>
              <br />
              with JS &amp; TS together.
            </h1>

            <p className="land-lead">
              Stop context-switching between courses. nerdStack weaves JavaScript
              and TypeScript into one cohesive path — so every new concept clicks
              with the last.
            </p>

            <div className="land-cta-row">
              <Link to="/signup" className="land-btn-primary">
                Start learning free →
              </Link>
              <Link to="/dashboard" className="land-btn-ghost">
                Explore dashboard
              </Link>
            </div>
          </div>
        </section>

        <div className="land-proof">
          {[
            { num: "120+", label: "Lessons" },
            { num: "JS + TS", label: "Both tracks" },
            { num: "XP", label: "Progression system" },
            { num: "Live", label: "Code sandbox" },
            { num: "Free", label: "To get started" },
          ].map(({ num, label }) => (
            <div className="land-proof-item" key={label}>
              <span className="land-proof-num">{num}</span>
              <span className="land-proof-label">{label}</span>
            </div>
          ))}
        </div>

        {/*   bento  */}
        <section className="land-features">
          <p className="land-section-label">What you get</p>
          <h2 className="land-section-title">Everything to go from learner&nbsp;→&nbsp;builder</h2>
          <p className="land-section-sub">
            No fluff. Real code, real feedback, and a path that keeps you moving forward.
          </p>

          <div className="land-bento">
            <div className="land-card land-card--wide land-card--js">
              <div className="land-card-icon">⚡</div>
              <p className="land-card-title">Interleaved JS + TS path</p>
              <p className="land-card-body">
                Most courses teach JS and TS separately. Ours alternate them so
                every TypeScript concept immediately reinforces what you just wrote
                in JavaScript. The result? Concepts stick 2× faster.
              </p>
            </div>

            <div className="land-card land-card--code">
              <div className="land-card-icon">🖥️</div>
              <p className="land-card-title">In-browser code editor</p>
              <p className="land-card-body">
                Write, run, and get instant test feedback without leaving the lesson.
                No setup, no installs.
              </p>
            </div>

            {/* Quizzes */}
            <div className="land-card land-card--quiz">
              <div className="land-card-icon">🧠</div>
              <p className="land-card-title">Quizzes gate the next module</p>
              <p className="land-card-body">
                You only move forward when you're genuinely ready. No skipping —
                just real comprehension checks.
              </p>
            </div>

            <div className="land-card land-card--xp">
              <div className="land-card-icon">🏆</div>
              <p className="land-card-title">XP &amp; progression</p>
              <p className="land-card-body">
                Earn XP for every lesson and challenge you complete. Watch your level
                climb as your skills grow.
              </p>
            </div>

            <div className="land-card land-card--ts">
              <div className="land-card-icon">🔷</div>
              <p className="land-card-title">TypeScript from day&nbsp;one</p>
              <p className="land-card-body">
                Not an afterthought — TS is woven in from lesson 2. By the end you'll
                think in types naturally.
              </p>
            </div>

            <div className="land-card land-card--admin">
              <div className="land-card-icon">⚙️</div>
              <p className="land-card-title">Production stack</p>
              <p className="land-card-body">
                TanStack Router, Better Auth, Neon Postgres, Vercel — the same stack
                the pros use.
              </p>
            </div>
          </div>
        </section>

        <section className="land-syllabus">
          <p className="land-section-label">The curriculum</p>
          <h2 className="land-section-title">Over 100 topics, two tracks</h2>
          <p className="land-section-sub">
            Flip between JavaScript and TypeScript to see what's waiting for you.
          </p>

          <div className="land-track-tabs">
            <button
              className={`land-track-tab land-track-tab--js${activeTrack === "js" ? " land-track-tab--active" : ""}`}
              onClick={() => setActiveTrack("js")}
            >
              JavaScript
            </button>
            <button
              className={`land-track-tab land-track-tab--ts${activeTrack === "ts" ? " land-track-tab--active" : ""}`}
              onClick={() => setActiveTrack("ts")}
            >
              TypeScript
            </button>
          </div>

          <div className={`land-pills${activeTrack === "js" ? " land-pills--js" : ""}`}>
            {(activeTrack === "js" ? JS_TOPICS : TS_TOPICS).map((t) => (
              <span className="land-pill" key={t}>{t}</span>
            ))}
          </div>
        </section>

        <section style={{ padding: "0 1.5rem 4rem", maxWidth: 1100, margin: "0 auto" }}>
          <p className="land-section-label">Feel the vibe</p>
          <h2 className="land-section-title">Lessons that feel like pair programming</h2>
          <p className="land-section-sub">
            Each topic has an explanation, a runnable example, and a hands-on challenge.
          </p>

          <div className="land-terminal">
            <div className="land-terminal-bar">
              <span className="land-term-dot land-term-dot-r" />
              <span className="land-term-dot land-term-dot-y" />
              <span className="land-term-dot land-term-dot-g" />
              <span style={{ marginLeft: 8, fontSize: "0.72rem", color: "var(--muted)" }}>
                challenge.ts — nerdStack
              </span>
            </div>
            <div className="land-terminal-body">
              <div><span className="term-line-comment">{"// Challenge: type a generic identity function"}</span></div>
              <div><span className="term-line-comment">{"// Hint: use <T> to preserve the input type"}</span></div>
              <div>&nbsp;</div>
              <div>
                <span className="term-line-kw">function </span>
                <span className="term-line-fn">identity</span>
                <span style={{ color: "#e2e8f0" }}>{"<T>(value: T): T {"}</span>
              </div>
              <div style={{ paddingLeft: "1.5rem" }}>
                <span className="term-line-kw">return </span>
                <span style={{ color: "#e2e8f0" }}>value;</span>
              </div>
              <div><span style={{ color: "#e2e8f0" }}>{"}"}</span></div>
              <div>&nbsp;</div>
              <div>
                <span className="term-line-kw">const </span>
                <span style={{ color: "#e2e8f0" }}>result = </span>
                <span className="term-line-fn">identity</span>
                <span style={{ color: "#e2e8f0" }}>(</span>
                <span className="term-line-str">"hello nerdStack"</span>
                <span style={{ color: "#e2e8f0" }}>);</span>
              </div>
              <div>&nbsp;</div>
              <div><span className="term-line-pass">✓ All 3 tests passed · +50 XP earned</span></div>
            </div>
          </div>
        </section>

        <div className="land-cta-banner">
          <h2 className="land-cta-banner-title">
            Ready to write your first line?
          </h2>
          <p className="land-cta-banner-sub">
            Join free and start your first lesson in under 60 seconds.
          </p>
          <div className="land-cta-row">
            <Link to="/signup" className="land-btn-primary">
              Create free account →
            </Link>
            <Link to="/signin" className="land-btn-ghost">
              Already have an account
            </Link>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
