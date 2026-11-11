"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUp, CalendarCheck, MapPinned, Phone } from "lucide-react";
import { lenisRef, useSite } from "./site-context";

/** Back-to-top with crimson progress ring on ink (desktop) + mobile sticky action bar. */
export function FloatingControls() {
  const { t, navigate, settings } = useSite();
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });
  const R = 20;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = useRingOffset(smooth, CIRC);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* back to top — hidden on mobile (bottom bar instead) */}
      <AnimatePresence>
        {visible && (
          <motion.button
            key="backtotop"
            onClick={() => {
              lenisRef.current?.scrollTo(0, { duration: 1.3 });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group fixed bottom-7 right-7 z-[95] hidden h-12 w-12 items-center justify-center rounded-full lg:inline-flex"
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.85 }}
            transition={{ duration: 0.3 }}
            aria-label={t("top")}
            data-cursor="link"
          >
            <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="24" cy="24" r={R} fill="rgba(17,16,18,0.9)" stroke="rgba(247,244,239,0.16)" strokeWidth="2.5" />
              <motion.circle
                cx="24"
                cy="24"
                r={R}
                fill="none"
                stroke="#E3202B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                style={{ strokeDashoffset: dashOffset }}
              />
            </svg>
            <ArrowUp className="relative h-4.5 w-4.5 text-porcelain transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* mobile bottom action bar — ink with crimson marks */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-[95] grid grid-cols-3 border-t border-porcelain/10 bg-ink lg:hidden"
        aria-label="Quick actions"
      >
        <a
          href={`tel:${settings.phoneIntl}`}
          className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-porcelain/85 transition active:bg-porcelain/6"
        >
          <Phone className="h-4.5 w-4.5 text-crimson" aria-hidden="true" />
          {t("common.callNow").split(" ").slice(0, 2).join(" ")}
        </a>
        <button
          onClick={() => navigate("/book")}
          className="relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 bg-crimson text-[0.68rem] font-semibold uppercase tracking-wider text-white transition active:bg-crimson-deep"
        >
          <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
          {t("common.bookNow").split(" ").slice(0, 2).join(" ")}
        </button>
        <button
          onClick={() => navigate("/contact")}
          className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-porcelain/85 transition active:bg-porcelain/6"
        >
          <MapPinned className="h-4.5 w-4.5 text-crimson" aria-hidden="true" />
          {t("common.directions")}
        </button>
      </nav>
    </>
  );
}

/** Convert 0..1 progress to stroke-dashoffset. */
function useRingOffset(progress: ReturnType<typeof useSpring>, circumference: number) {
  const [offset, setOffset] = React.useState(circumference);
  React.useEffect(() => {
    return progress.on("change", (v) => setOffset(circumference * (1 - Math.min(1, Math.max(0, v)))));
  }, [progress, circumference]);
  return offset;
}
