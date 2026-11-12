"use client";

import { useEffect, useRef } from "react";

/**
 * Soft glowing cursor ring — desktop pointers only.
 *
 * Resilience rules (fixes "cursor disappears / can't click" reports):
 *  - Only engages when (pointer: fine) AND (hover: hover) AND no
 *    reduced-motion — real desktop mice, never touch or device emulation.
 *  - Watches all three media queries live: toggling DevTools device mode,
 *    plugging a mouse, or OS pointer changes flip the custom cursor off and
 *    instantly restore the native one.
 *  - Any real touch (first finger) kills it for the rest of the session.
 *  - The ring/dot are pointer-events: none, so they can never intercept a
 *    click; the CSS guard in globals.css also restores `cursor: auto` on
 *    coarse pointers even if JS state leaked.
 */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const hover = window.matchMedia("(hover: hover)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let active = false;
    let raf = 0;
    let stopFns: Array<() => void> = [];

    const start = () => {
      const ring = ringRef.current;
      const dot = dotRef.current;
      if (!ring || !dot) return;

      document.documentElement.classList.add("cursor-native-off");

      let mx = window.innerWidth / 2;
      let my = window.innerHeight / 2;
      let rx = mx;
      let ry = my;
      let visible = false;

      const onMove = (e: MouseEvent) => {
        mx = e.clientX;
        my = e.clientY;
        if (!visible) {
          visible = true;
          ring.style.opacity = "1";
          dot.style.opacity = "1";
        }
        dot.style.transform = `translate(${mx}px, ${my}px)`;
      };

      const loop = () => {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        raf = requestAnimationFrame(loop);
      };

      const onOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const interactive = target.closest("a, button, [data-cursor], input, textarea, select, [role='button']");
        ring.classList.toggle("is-active", !!interactive);
      };

      const onLeave = () => {
        ring.style.opacity = "0";
        dot.style.opacity = "0";
        visible = false;
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseover", onOver, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);
      raf = requestAnimationFrame(loop);

      stopFns.push(() => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseover", onOver);
        document.documentElement.removeEventListener("mouseleave", onLeave);
        cancelAnimationFrame(raf);
        ring.style.opacity = "0";
        dot.style.opacity = "0";
        ring.classList.remove("is-active");
        document.documentElement.classList.remove("cursor-native-off");
      });
    };

    const stop = () => {
      stopFns.forEach((fn) => fn());
      stopFns = [];
    };

    const evaluate = () => {
      const ok = fine.matches && hover.matches && !reduced.matches;
      if (ok && !active) {
        active = true;
        start();
      } else if (!ok && active) {
        active = false;
        stop();
      }
    };

    const onChange = () => evaluate();
    [fine, hover, reduced].forEach((mq) => mq.addEventListener("change", onChange));
    evaluate();

    // First real touch → hand control back to the native cursor for good.
    const onTouch = () => {
      if (active) {
        active = false;
        stop();
      }
      [fine, hover, reduced].forEach((mq) => mq.removeEventListener("change", onChange));
    };
    window.addEventListener("touchstart", onTouch, { once: true, passive: true });

    return () => {
      [fine, hover, reduced].forEach((mq) => mq.removeEventListener("change", onChange));
      window.removeEventListener("touchstart", onTouch);
      stop();
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring hidden md:block" style={{ opacity: 0 }} aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot hidden md:block" style={{ opacity: 0 }} aria-hidden="true" />
    </>
  );
}
