"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Cinematic hero backdrop — "Porcelain & Crimson" edition.
 * No particles, no grid: a slow warm gradient (ink → oxblood), the logo's
 * circle motif as a huge faint outline, and a single crimson ECG line that
 * draws itself across the frame. When a poster photo exists it takes the
 * stage under a warm ink/oxblood grade.
 */
export function HeroScene({ posterUrl }: { posterUrl?: string }) {
  const [reduced, setReduced] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const showPoster = !!posterUrl && !posterFailed;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* base: slow warm gradient */}
      <div className="bg-warm-drift absolute inset-0" />

      {/* optional clinic photography, warm-graded */}
      {showPoster && (
        <motion.div
          className="absolute inset-0"
          initial={reduced ? { scale: 1 } : { scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={posterUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            onError={() => setPosterFailed(true)}
          />
        </motion.div>
      )}

      {/* ink → oxblood cinematic grade — strictly warm */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(17,16,18,0.96) 0%, rgba(17,16,18,0.82) 34%, rgba(42,16,21,0.55) 62%, rgba(74,15,24,0.42) 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-48" style={{ background: "linear-gradient(180deg, transparent, rgba(17,16,18,0.92))" }} />
      <div className="absolute inset-x-0 top-0 h-28" style={{ background: "linear-gradient(180deg, rgba(17,16,18,0.55), transparent)" }} />

      {/* logo circle motif — huge faint outlines */}
      <div className="pointer-events-none absolute -right-[12rem] top-1/2 hidden -translate-y-1/2 md:block">
        <motion.div
          className="h-[42rem] w-[42rem] rounded-full border border-porcelain/10"
          initial={reduced ? {} : { scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        />
        <motion.div
          className="absolute inset-8 rounded-full border border-porcelain/6"
          initial={reduced ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
        />
      </div>

      {/* the ECG line — draws once, then breathes */}
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="absolute bottom-[16%] left-0 h-36 w-full md:h-48"
      >
        <path
          d="M0 110 h520 l26-34 36 62 30-88 26 52 h150 l20-26 30 44 24-34 18 16 H1440"
          fill="none"
          stroke="#E3202B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.75"
          style={
            reduced
              ? undefined
              : { strokeDasharray: 2600, strokeDashoffset: 2600, animation: "hero-ecg 4.2s cubic-bezier(0.4,0,0.2,1) 0.9s forwards" }
          }
        />
        {/* heartbeat node */}
        <circle cx="680" cy="110" r="4" fill="#E3202B" className={reduced ? "" : "pulse-dot"} />
      </svg>
    </div>
  );
}
