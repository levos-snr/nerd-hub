import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

type Props = {
  moduleTitle: string;
  track: string;
  moduleId: string;
  ctaLabel?: string;
};

export function ContinueCard({ moduleTitle, track, moduleId, ctaLabel = "Resume module" }: Props) {
  return (
    <motion.section
      className="glass relative overflow-hidden p-6"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />
      <p className="badge mb-2">{track}</p>
      <h2 className="mb-2 text-xl font-semibold">{ctaLabel}</h2>
      <p className="mb-4 text-[var(--muted)]">{moduleTitle}</p>
      <Link to="/learn/$moduleId" params={{ moduleId }} className="btn btn-primary">
        {ctaLabel} →
      </Link>
    </motion.section>
  );
}
