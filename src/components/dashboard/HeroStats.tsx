import { motion } from "framer-motion";

type Stat = { label: string; value: string | number; accent?: string };

export function HeroStats({ stats, loading }: { stats: Stat[]; loading: boolean }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.article
          key={stat.label}
          className="stat-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.35 }}
        >
          <p className="text-sm text-[var(--muted)]">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.accent ?? ""}`}>
            {loading ? "…" : stat.value}
          </p>
        </motion.article>
      ))}
    </section>
  );
}
