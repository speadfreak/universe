"use client";

import { useEffect } from "react";
import { lenisRef } from "./site-context";

/** Lenis smooth scroll synced with GSAP ScrollTrigger. Loads lazily; disabled for reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lenis: { destroy: () => void; raf: (t: number) => void; on: (ev: string, cb: () => void) => void } | null = null;
    let rafId = 0;
    let killed = false;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as unknown as { ScrollTrigger: unknown }).ScrollTrigger = ScrollTrigger;

      const instance = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.4,
      });
      lenis = instance as unknown as typeof lenis;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lenisRef.current = instance as any;
      instance.on("scroll", ScrollTrigger.update);
      const loop = (time: number) => {
        instance.raf(time);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    })();

    return () => {
      killed = true;
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
