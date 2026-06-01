import { motion } from "framer-motion";

type Props = {
  name: string;
  started: boolean;
  progressPct: number;
};

export function WelcomeBanner({ name, started, progressPct }: Props) {
  return (
    <motion.section
      className="welcome-banner mb-8 overflow-hidden rounded-2xl border border-[var(--border)] p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 via-transparent to-indigo-500/10" />
      <p className="text-sm text-[var(--accent)]">Hey {name.split(" ")[0] || "learner"} 👋</p>
      <h2 className="mt-1 text-2xl font-bold">
        {started ? "Keep your streak alive today!" : "Ready to learn JS & TypeScript?"}
      </h2>
      <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
        {started
          ? `You're ${progressPct}% through the path. Complete one lesson or coding task today to grow your day streak.`
          : "Start with the first module — read the lesson, pass the coding tests, then take the quiz."}
      </p>
    </motion.section>
  );
}
