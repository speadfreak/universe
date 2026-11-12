"use client";

import React from "react";
import {
  Stethoscope, Microscope, HeartHandshake, Clock, ScanHeart, UserRoundCheck, HandCoins,
  FlaskConical, MonitorSmartphone, Siren, CalendarCheck, MessagesSquare, Stethoscope as StethIcon,
  ShieldCheck, Sparkles, PhoneCall, MapPin, Mail, ArrowUpRight, ChevronDown, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { A, useSite } from "./site-context";
import { Reveal, SplitWords } from "./motion";
import { PageBackdrop } from "./page-backdrop";

const ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  stethoscope: Stethoscope,
  microscope: Microscope,
  "heart-handshake": HeartHandshake,
  clock: Clock,
  "scan-heart": ScanHeart,
  "user-round-check": UserRoundCheck,
  "hand-coins": HandCoins,
  "flask-conical": FlaskConical,
  "monitor-smartphone": MonitorSmartphone,
  siren: Siren,
  "calendar-check": CalendarCheck,
  messages: MessagesSquare,
  shield: ShieldCheck,
  sparkles: Sparkles,
  phone: PhoneCall,
  pin: MapPin,
  mail: Mail,
  arrow: ArrowUpRight,
  star: Star,
  "calendar-check-2": CalendarCheck,
  "stethoscope-2": StethIcon,
};

export function IconFor({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] || Stethoscope;
  return <Cmp className={className} strokeWidth={1.7} />;
}

/* ── Buttons ─────────────────────────────────────────────── */

type BtnProps = {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function ButtonRed({ href, children, className, onClick, type = "button", disabled }: { href?: string; children: React.ReactNode; className?: string; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  const cls = cn(
    "group relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-clinic-red px-7 py-3 font-display text-sm font-semibold text-white transition-all duration-300 glow-red hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100",
    className
  );
  if (href) {
    return (
      <A href={href} className={cls}>
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </A>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

export function ButtonGlass({ href, children, className, onClick, light }: { href?: string; children: React.ReactNode; className?: string; onClick?: () => void; light?: boolean }) {
  const cls = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-7 py-3 font-display text-sm font-semibold backdrop-blur-md transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]",
    light
      ? "border border-navy/15 bg-white/70 text-navy hover:bg-white"
      : "glass text-ice hover:border-cyan/40 hover:text-cyan",
    className
  );
  if (href) return <A href={href} className={cls}>{children}</A>;
  return <button type="button" onClick={onClick} className={cls}>{children}</button>;
}

/* ── Section heading ─────────────────────────────────────── */

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  dark?: boolean; // dark text for bright sections
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow && (
        <Reveal>
          <p className={cn("eyebrow mb-3 inline-flex items-center gap-2", dark ? "text-brand" : "text-cyan")}>
            <span className={cn("inline-block h-px w-8", dark ? "bg-brand/60" : "bg-cyan/60")} />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <h2 className={cn("h1", dark ? "text-navy" : "text-ice")}>
        <SplitWords text={title} />
      </h2>
      {subtitle && (
        <Reveal delay={0.12}>
          <p className={cn("mt-4 text-[1.02rem] leading-relaxed", dark ? "text-navy/70" : "text-ice-dim")}>{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ── ECG divider ─────────────────────────────────────────── */

export function EcgDivider({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none relative h-8 w-full overflow-hidden", className)} aria-hidden="true">
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="h-full w-full">
        <path
          d="M0 20 h420 l12-12 16 26 14-34 10 20 h90 l10-10 14 22 12-18 8 8 H1200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="ecg-line"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

/* ── Glass card ──────────────────────────────────────────── */

export function GlassCard({ children, className, hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div
      className={cn(
        "glass border-glow rounded-2xl p-6 transition-all duration-500",
        hover && "hover:-translate-y-1.5 hover:border-cyan/35 hover:shadow-[0_18px_60px_-20px_rgba(227,32,43,0.35)]",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ── JSON-LD ─────────────────────────────────────────────── */

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ── Page hero banner (inner pages) — photographic PageBackdrop ──── */

export function PageHero({
  slot,
  title,
  subtitle,
  crumb,
}: {
  /** Backdrop slot key, e.g. "hero.about" or "hero.service.<slug>". */
  slot: string;
  title: string;
  subtitle?: string;
  crumb: string;
}) {
  const { data } = useSite();
  return (
    <PageBackdrop
      config={data.backdrops?.[slot]}
      slotKey={slot}
      as="section"
      priority
      edge="curve"
      className="pb-20 pt-36 sm:pb-24 sm:pt-44"
      childClassName="container-x"
    >
      <Reveal>
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ice-dim">
          <A href="/" className="transition hover:text-crimson">Home</A>
          <ChevronDown className="h-3 w-3 -rotate-90" aria-hidden="true" />
          <span className="text-crimson">{crumb}</span>
        </nav>
      </Reveal>
      <h1 className="h-display max-w-3xl text-ice">
        <SplitWords text={title} />
      </h1>
      {subtitle && (
        <Reveal delay={0.15}>
          <p className="lead mt-5 max-w-xl">{subtitle}</p>
        </Reveal>
      )}
    </PageBackdrop>
  );
}
