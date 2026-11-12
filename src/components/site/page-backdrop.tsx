"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BackdropImage, BackdropPublic } from "@/lib/backdrops";

/**
 * PageBackdrop — the photographic background system used by every page hero
 * and full-bleed mid-page band.
 *
 * Layers, bottom to top:
 *   1. Photograph (next/image, art-directed desktop/mobile crop, focal point)
 *   2. Warm grade — ink→oxblood gradient, darkest where the text sits
 *   3. Warmth tint · 3% film grain · soft vignette
 *   4. Curved bottom edge that melts into the next section
 *   5. Content on top (children)
 *
 * Modes: single · slideshow (crossfade ≤4 images) · kenburns (slow zoom) ·
 * gradient (tasteful warm fallback with a faint logo-circle outline).
 * Everything is reduced-motion safe and auto-clamps contrast toward WCAG AA.
 */

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export type PageBackdropProps = {
  config?: BackdropPublic;
  slotKey: string;
  /** Wrapper element. */
  as?: "div" | "section" | "article" | "footer" | "header";
  className?: string;
  /** Classes for the content wrapper on top of the photo. */
  childClassName?: string;
  children?: React.ReactNode;
  /** Curved bottom edge into the next section ("none" for pinned/absolute use). */
  edge?: "curve" | "none";
  /** CSS color the curve paints with — match the next section's background. */
  edgeFill?: string;
  /** next/image priority — heroes above the fold. */
  priority?: boolean;
  ariaLabel?: string;
  /** Extra fade under the content (home hero melts into the marquee). */
  bottomFade?: boolean;
};

/** Fallback when the payload carries no config for a key (DB down etc.). */
const SAFE_DEFAULT: BackdropPublic = {
  mode: "gradient",
  images: [],
  darkness: 0.62,
  warmth: 0.42,
  textSide: "left",
  parallax: false,
};

function objectPositionOf(img: BackdropImage, mobile: boolean): string {
  const f = mobile ? (img.mobileFocal ?? img.focal) : img.focal;
  const x = f?.x ?? 0.5;
  const y = f?.y ?? 0.42;
  return `${Math.round(x * 100)}% ${Math.round(y * 100)}%`;
}

export function PageBackdrop({
  config,
  slotKey,
  as = "div",
  className,
  childClassName,
  children,
  edge = "curve",
  edgeFill = "var(--ink)",
  priority = false,
  ariaLabel,
  bottomFade = false,
}: PageBackdropProps) {
  const Tag = as;
  const cfg = config ?? SAFE_DEFAULT;
  const images = (cfg.images ?? []).filter((i) => i && i.url);

  // Reduced motion disables slideshow/kenburns/parallax entirely.
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const hasPhotos = images.length > 0 && cfg.mode !== "gradient";
  const photoMode: BackdropPublic["mode"] = hasPhotos ? (reduced ? "single" : cfg.mode) : "gradient";
  const slideshow = photoMode === "slideshow" && images.length > 1;

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (!slideshow) return;
    const t = window.setInterval(() => setSlide((s) => s + 1), 6800);
    return () => window.clearInterval(t);
  }, [slideshow]);

  // Slow scroll parallax on the photo layer (±5%).
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const useParallax = cfg.parallax && !reduced && photoMode !== "gradient";

  // Darkness is clamped so headline contrast stays AA even at slider minimum.
  const dk = Math.min(1, Math.max(0.46, cfg.darkness));
  const warm = Math.min(1, Math.max(0, cfg.warmth));
  const right = cfg.textSide === "right";
  const angle = right ? 260 : 100; // gradient direction faces the text side

  const inkAlpha = Math.min(0.97, 0.5 + dk * 0.5);
  const midAlpha = Math.min(0.92, 0.2 + dk * 0.48);
  const farAlpha = Math.min(0.8, 0.1 + dk * 0.34);
  const warmAlpha = 0.1 + warm * 0.3;
  const vignette = 0.28 + dk * 0.3;

  const active: BackdropImage | undefined = images.length > 0 ? images[slideshow ? slide % images.length : 0] : undefined;

  /* Parallax wrapper (framer transform) around a Ken Burns inner layer (CSS animation)
     — kept on separate elements so the transforms never fight. */
  const photoArt = (img: BackdropImage, mobile: boolean) => (
    <motion.div style={{ y: useParallax ? parallaxY : 0 }} className="absolute -inset-y-[6%] inset-x-0">
      <div className={cn("absolute inset-0", photoMode === "kenburns" && "backdrop-kenburns")}>
        <Image
          src={img.url}
          alt={img.alt || ""}
          fill
          priority={priority && !mobile}
          sizes={mobile ? "100vw" : "100vw"}
          className="backdrop-fade-in object-cover"
          style={{ objectPosition: objectPositionOf(img, mobile) }}
        />
      </div>
    </motion.div>
  );

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn("relative isolate overflow-hidden bg-ink", className)}
      aria-label={ariaLabel}
      data-backdrop={slotKey}
    >
      {/* ── 1 · photograph ── */}
      {active ? (
        slideshow ? (
          <AnimatePresence mode="sync">
            <motion.div
              key={active.url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.7, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {/* art-directed crops */}
              <div className="absolute inset-0 hidden md:block">{photoArt(active, false)}</div>
              <div className="absolute inset-0 md:hidden">{photoArt({ ...active, url: active.mobileUrl || active.url }, true)}</div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <>
            <div className="absolute inset-0 hidden md:block">{photoArt(active, false)}</div>
            <div className="absolute inset-0 md:hidden">{photoArt({ ...active, url: active.mobileUrl || active.url }, true)}</div>
          </>
        )
      ) : (
        /* ── tasteful warm fallback — slow ink→oxblood drift, faint logo-circle outline ── */
        <div className="absolute inset-0" aria-hidden="true">
          <div className="bg-warm-drift absolute inset-0" />
          <div className={cn("pointer-events-none absolute", right ? "-left-40" : "-right-40", "top-1/2 hidden -translate-y-1/2 lg:block")}>
            <div className="relative h-[38rem] w-[38rem] opacity-70">
              <div className="absolute inset-0 rounded-full border border-porcelain/10" />
              <div className="absolute inset-14 rounded-full border border-porcelain/6" />
              <div className={cn("absolute inset-0 rounded-full border border-dashed border-crimson/12", !reduced && "spin-slow")} />
              <div className="pulse-dot absolute -top-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-crimson/80 glow-red" />
            </div>
          </div>
        </div>
      )}

      {/* ── 2 · warm grade: ink→oxblood, darkest where the text sits ── */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: `linear-gradient(${angle}deg, rgba(17,16,18,${inkAlpha.toFixed(3)}) 0%, rgba(74,15,24,${midAlpha.toFixed(3)}) 52%, rgba(17,16,18,${farAlpha.toFixed(3)}) 100%)`,
        }}
      />

      {/* ── 3 · crimson warmth tint ── */}
      <div
        className="absolute inset-0 mix-blend-soft-light"
        aria-hidden="true"
        style={{ background: `linear-gradient(${angle}deg, rgba(227,32,43,${(warmAlpha * 1.4).toFixed(3)}) 0%, rgba(181,18,28,${warmAlpha.toFixed(3)}) 100%)` }}
      />

      {/* header-legibility fade */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/70 to-transparent" aria-hidden="true" />

      {/* ── soft vignette ── */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{ background: `radial-gradient(120% 92% at 50% 38%, transparent 52%, rgba(17,16,18,${vignette.toFixed(3)}) 100%)` }}
      />

      {/* ── 3% film grain ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
        aria-hidden="true"
        style={{ backgroundImage: GRAIN }}
      />

      {bottomFade && <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" aria-hidden="true" />}

      {/* ── 4 · curved bottom edge melting into the next section ── */}
      {edge === "curve" && (
        <svg
          viewBox="0 0 1440 84"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-[-1px] h-[54px] w-full sm:h-[70px]"
          aria-hidden="true"
        >
          <path d="M0 84 L0 44 C 300 6 720 4 1060 26 C 1220 36 1360 46 1440 44 L1440 84 Z" fill={edgeFill} />
        </svg>
      )}

      {/* ── 5 · content on top ── */}
      {children != null && <div className={cn("relative z-10", childClassName)}>{children}</div>}
    </Tag>
  );
}
