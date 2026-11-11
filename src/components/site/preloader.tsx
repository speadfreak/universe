"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";
import { easeOut } from "./motion";

/**
 * Signature preloader — the logo draws itself, the heartbeat dot pulses,
 * an ECG line sweeps the screen and progress counts up, then the curtain
 * splits into the hero. Shows once per session; skips for reduced motion;
 * max ~3.4s; skippable.
 */
export function Preloader({ enabled, logoUrl }: { enabled: boolean; logoUrl: string }) {
  const [phase, setPhase] = useState<"off" | "show" | "exit">("off");
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function finish() {
    window.sessionStorage.setItem("umc-preloaded", "1");
    document.documentElement.style.overflow = "";
    setPhase("exit");
    window.setTimeout(() => setPhase("off"), 820);
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reducedMotion);
    const seen = window.sessionStorage.getItem("umc-preloaded");
    if (!enabled || seen) return;

    setPhase("show");
    document.documentElement.style.overflow = "hidden";

    if (reducedMotion) {
      timers.current.push(
        window.setTimeout(() => finish(), 900)
      );
      return () => clearTimers();
    }

    const controls = animate(0, 100, {
      duration: 2.3,
      ease: [0.3, 0.9, 0.4, 1],
      onUpdate: (v) => setProgress(Math.round(v)),
      onComplete: () => {
        timers.current.push(window.setTimeout(() => finish(), 420));
      },
    });
    const safety = window.setTimeout(() => finish(), 3400);

    return () => {
      clearTimers();
      controls.stop();
      window.clearTimeout(safety);
    };
     
  }, [enabled]);

  const skip = () => {
    if (phase !== "show") return;
    finish();
  };

  const show = phase !== "off";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          role="status"
          aria-label="Loading Universe Medical Center"
        >
          {/* curtain halves */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-ink"
            initial={{ y: 0 }}
            animate={phase === "exit" ? { y: "-100%" } : { y: 0 }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-ink"
            initial={{ y: 0 }}
            animate={phase === "exit" ? { y: "100%" } : { y: 0 }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
          />

          {/* content */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "exit" ? 0 : 1, scale: phase === "exit" ? 0.94 : 1 }}
            transition={{ duration: 0.32, ease: "easeIn" }}
          >
            {/* ECG sweep */}
            <svg
              viewBox="0 0 900 140"
              className="absolute left-1/2 top-1/2 w-[min(92vw,900px)] -translate-x-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <path
                d="M0 70 h250 l18-22 24 46 20-58 16 34 h70 l14-20 20 34 16-26 12 12 H900"
                fill="none"
                stroke="#38D6FF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeOpacity={reduced ? 0.5 : 0.85}
                className={reduced ? "" : "ecg-line"}
                style={{ filter: "drop-shadow(0 0 8px rgba(56,214,255,0.55))" }}
              />
            </svg>

            {/* logo recreation */}
            <motion.svg
              viewBox="0 0 200 200"
              className="relative h-[34vmin] max-h-[210px] min-h-[150px] w-auto"
              initial="hidden"
              animate="show"
              aria-hidden="true"
            >
              <defs>
                <filter id="pre-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="3.4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* stethoscope circle draws itself */}
              <motion.circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="6.5"
                strokeLinecap="round"
                pathLength={1}
                variants={{
                  hidden: { strokeDasharray: 1, strokeDashoffset: 1, rotate: 115, opacity: 0 },
                  show: {
                    strokeDashoffset: 0.06,
                    opacity: 1,
                    transition: { duration: 1.25, ease: "easeInOut" },
                  },
                }}
                style={{ originX: "100px", originY: "100px" }}
              />

              {/* red U draws */}
              <motion.path
                d="M58 56 v50 a34 34 0 0 0 68 0 V56"
                fill="none"
                stroke="#E31E24"
                strokeWidth="17"
                strokeLinecap="round"
                pathLength={1}
                variants={{
                  hidden: { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 },
                  show: { strokeDashoffset: 0, opacity: 1, transition: { duration: 0.75, delay: 0.9, ease: "easeOut" } },
                }}
                filter="url(#pre-glow)"
              />

              {/* white M draws */}
              <motion.path
                d="M116 148 V58 l30 46 30-46 V148"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="15"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                variants={{
                  hidden: { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 },
                  show: { strokeDashoffset: 0, opacity: 1, transition: { duration: 0.75, delay: 1.25, ease: "easeOut" } },
                }}
                filter="url(#pre-glow)"
              />

              {/* medical cross node */}
              <motion.g
                variants={{
                  hidden: { scale: 0, opacity: 0 },
                  show: { scale: 1, opacity: 1, transition: { duration: 0.5, delay: 1.75, ease: easeOut } },
                }}
                style={{ originX: "100px", originY: "44px" }}
              >
                <circle cx="100" cy="44" r="10" fill="#E31E24" />
                <path d="M100 38.5 v11 M94.5 44 h11" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
              </motion.g>

              {/* heartbeat dot + ripples */}
              <motion.g
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { delay: 1.9, duration: 0.4 } },
                }}
              >
                <circle cx="150" cy="126" r="9" fill="#E31E24" className="pulse-dot" />
                <motion.circle
                  cx="150"
                  cy="126"
                  r="9"
                  fill="none"
                  stroke="#E31E24"
                  strokeWidth="2"
                  animate={reduced ? {} : { r: [9, 22], opacity: [0.9, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 2, ease: "easeOut" }}
                />
              </motion.g>
            </motion.svg>

            {/* wordmark */}
            <motion.div
              className="mt-6 text-center"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03, delayChildren: 1.55 } } }}
              aria-hidden="true"
            >
              <div className="flex justify-center">
                {"UNIVERSE".split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    className="font-display text-[clamp(1.3rem,4.4vmin,2rem)] font-bold tracking-[0.32em] text-white"
                    variants={{
                      hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
                      show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: easeOut } },
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </div>
              <motion.div
                className="mt-1 font-display text-[clamp(0.95rem,3vmin,1.3rem)] font-medium tracking-[0.06em] text-clinic-red"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
                }}
              >
                Medical Center
              </motion.div>
            </motion.div>

            {/* progress */}
            {!reduced && (
              <motion.div
                className="mt-8 flex items-center gap-3 font-display text-sm tracking-[0.3em] text-ice-dim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="tabular-nums">{String(progress).padStart(3, "0")}%</span>
              </motion.div>
            )}
          </motion.div>

          {/* skip */}
          {phase === "show" && (
            <button
              onClick={skip}
              className="absolute right-5 top-5 z-20 rounded-full border border-white/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-ice-dim transition hover:border-cyan/50 hover:text-cyan"
            >
              Skip
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
