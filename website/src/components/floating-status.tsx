import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, ChevronDown, Sparkles } from "lucide-react";
import { agentTasks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function FloatingStatus() {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % agentTasks.length), 4200);
    return () => clearInterval(t);
  }, []);

  const task = agentTasks[index]!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 220, damping: 22 }}
      className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6"
    >
      <div className="glass-strong rounded-2xl px-3 py-2.5 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <span className="relative grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-brand">
            <Sparkles className="size-4 text-background" />
            <span
              className="absolute inset-0 rounded-xl border border-primary/60"
              style={{ animation: "pulse-ring 2.4s ease-out infinite" }}
            />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Agent status
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={task}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="truncate text-[13px] font-medium"
              >
                {task}
                <span className="ml-1 inline-flex gap-0.5 align-middle">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="inline-block size-1 rounded-full bg-primary"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: d * 0.18 }}
                    />
                  ))}
                </span>
              </motion.p>
            </AnimatePresence>
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle agent detail"
            className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </button>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2.5 flex items-center gap-4 border-t border-border/70 pt-2.5 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Activity className="size-3 text-[color:var(--success)]" />
                  Queue 4
                </span>
                <span>Cycle 2,481</span>
                <span>Next post ~38m</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
