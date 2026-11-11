"use client";

import React, { useEffect, useRef } from "react";

/**
 * Cinematic hero canvas — drifting glow particles with soft connecting
 * energy + subtle parallax. GPU-light: capped DPR, particle count scales
 * with viewport, pauses when hidden, static fallback for reduced motion.
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    type P = { x: number; y: number; r: number; vx: number; vy: number; hue: number; a: number };
    let particles: P[] = [];
    let w = 0;
    let h = 0;
    let scrollY = 0;

    const seed = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(72, Math.max(26, Math.floor(w / 22)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.7 + Math.random() * 2.1,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.14 - 0.05,
        hue: Math.random() > 0.72 ? 356 : 349, // crimson or ember
        a: 0.25 + Math.random() * 0.5,
      }));
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const parallax = Math.min(scrollY * 0.12, 120);

      // links
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 90 * 90) {
            const alpha = (1 - Math.sqrt(d2) / 90) * 0.10;
            ctx.strokeStyle = `rgba(227, 32, 43, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - parallax * 0.4);
            ctx.lineTo(q.x, q.y - parallax * 0.4);
            ctx.stroke();
          }
        }
      }
      // dots
      for (const p of particles) {
        const py = p.y - parallax * (0.5 + p.a);
        ctx.beginPath();
        ctx.arc(p.x, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 82%, 60%, ${p.a})`;
        ctx.shadowColor = `hsla(${p.hue}, 82%, 60%, 0.9)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const step = () => {
      if (!running) return;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    seed();
    if (reduced) {
      draw(); // static single frame
    } else {
      raf = requestAnimationFrame(step);
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    const onResize = () => {
      seed();
      if (reduced) draw();
    };
    window.addEventListener("resize", onResize);
    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running && !reduced) raf = requestAnimationFrame(step);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
