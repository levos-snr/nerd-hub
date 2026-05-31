import { motion } from "framer-motion";

export function StreakFlame({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-3">
      <motion.span
        className="text-3xl"
        animate={{ scale: streak > 0 ? [1, 1.15, 1] : 1 }}
        transition={{ repeat: streak > 0 ? Infinity : 0, duration: 1.2 }}
        aria-hidden
      >
        🔥
      </motion.span>
      <div>
        <p className="text-sm text-[var(--muted)]">Day streak</p>
        <p className="text-2xl font-bold">{streak}</p>
        <p className="text-xs text-[var(--muted)]">Complete a lesson or exercise daily</p>
      </div>
    </div>
  );
}
