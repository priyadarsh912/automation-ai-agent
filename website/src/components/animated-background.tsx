import { motion } from "motion/react";

const PARTICLES = [
  { left: "8%", top: "22%", size: 4, delay: 0, dur: 14 },
  { left: "18%", top: "68%", size: 3, delay: 1.4, dur: 18 },
  { left: "31%", top: "38%", size: 5, delay: 0.7, dur: 16 },
  { left: "44%", top: "12%", size: 3, delay: 2.1, dur: 20 },
  { left: "57%", top: "72%", size: 4, delay: 1.1, dur: 15 },
  { left: "66%", top: "28%", size: 3, delay: 2.8, dur: 19 },
  { left: "78%", top: "55%", size: 5, delay: 0.3, dur: 17 },
  { left: "88%", top: "18%", size: 3, delay: 1.9, dur: 21 },
  { left: "93%", top: "78%", size: 4, delay: 2.4, dur: 13 },
  { left: "24%", top: "88%", size: 3, delay: 0.9, dur: 22 },
];

export function AnimatedBackground({ dense = false }: { dense?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-[0.55]" />
      <div
        className="absolute -left-[15%] -top-[25%] size-[70vw] rounded-full blur-[120px] opacity-40"
        style={{
          background: "radial-gradient(circle, var(--violet), transparent 65%)",
          animation: "mesh-drift 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-[20%] top-[10%] size-[60vw] rounded-full blur-[130px] opacity-30"
        style={{
          background: "radial-gradient(circle, var(--indigo), transparent 65%)",
          animation: "mesh-drift 28s ease-in-out infinite reverse",
        }}
      />
      {dense && (
        <div
          className="absolute left-[25%] top-[55%] size-[55vw] rounded-full blur-[140px] opacity-25"
          style={{
            background: "radial-gradient(circle, var(--cyan), transparent 60%)",
            animation: "mesh-drift 34s ease-in-out infinite",
          }}
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_20%,var(--background)_78%)]" />
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-foreground/40"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
