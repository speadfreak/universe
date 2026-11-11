"use client";

import React from "react";
import {
  Stethoscope, Microscope, HeartHandshake, Clock, ScanHeart, UserRoundCheck, HandCoins,
  FlaskConical, MonitorSmartphone, Siren, CalendarCheck, MessagesSquare, Stethoscope as StethIcon,
  ShieldCheck, Sparkles, PhoneCall, MapPin, Mail, ArrowUpRight, ArrowRight, ChevronDown, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { A } from "./site-context";
import { Reveal, SplitWords } from "./motion";

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

/**
 * Primary CTA — solid crimson, 10px radius, white text, and a small
 * arrow disc that slides on hover. No glow, no cold shadow.
 */
export function ButtonRed({ href, children, className, onClick, type = "button", disabled, arrow = true }: { href?: string; children: React.ReactNode; className?: string; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; arrow?: boolean }) {
  const cls = cn(
    "group inline-flex min-h-11 items-center justify-center gap-3 rounded-[10px] bg-crimson px-6 py-3 font-body text-sm font-semibold tracking-wide text-white transition-colors duration-300 hover:bg-crimson-deep active:translate-y-px disabled:pointer-events-none disabled:opacity-55",
    className
  );
  const inner = (
    <>
      <span className="inline-flex items-center gap-2">{children}</span>
      {arrow && (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/18 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:bg-white/25" aria-hidden="true">
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      )}
    </>
  );
  if (href) {
    return (
      <A href={href} className={cls}>
        {inner}
      </A>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

/**
 * Secondary CTA — quiet outline (ink on porcelain / porcelain on ink),
 * hover fills subtly. Flat surfaces only, no blur.
 */
export function ButtonGhost({ href, children, className, onClick, onDark = false }: { href?: string; children: React.ReactNode; className?: string; onClick?: () => void; onDark?: boolean }) {
  const cls = cn(
    "group inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[10px] border px-6 py-3 font-body text-sm font-semibold tracking-wide transition-all duration-300 active:translate-y-px",
    onDark
      ? "border-porcelain/30 text-porcelain hover:border-porcelain/70 hover:bg-porcelain/6"
      : "border-ink/22 text-ink hover:border-ink/60 hover:bg-ink/4",
    className
  );
  const inner = (
    <>
      <span className="inline-flex items-center gap-2">{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
    </>
  );
  if (href) return <A href={href} className={cls}>{inner}</A>;
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

/** Animated underline text link — the editorial secondary action. */
export function LinkUnderline({ href, children, className, onDark = false, onClick }: { href: string; children: React.ReactNode; className?: string; onDark?: boolean; onClick?: () => void }) {
  return (
    <A
      href={href}
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center gap-2 pb-1 font-body text-sm font-semibold",
        onDark ? "text-porcelain" : "text-ink",
        className
      )}
    >
      {children}
      <span
        className={cn(
          "absolute inset-x-0 bottom-0 h-[1.5px] origin-left scale-x-100 transition-transform duration-300",
          onDark ? "bg-porcelain/40" : "bg-ink/25",
          "group-hover:bg-crimson"
        )}
        aria-hidden="true"
      />
    </A>
  );
}

/* ── Section heading — numbered, hairline-ruled, editorial ── */

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  dark = false,
  index,
  emphasizeLast = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  dark?: boolean; // porcelain text for ink sections
  index?: string; // "01" style numbered section label
  emphasizeLast?: boolean; // final word set in italic serif crimson
  className?: string;
}) {
  const words = title.split(" ");
  const last = emphasizeLast && words.length > 1 ? words.pop()! : null;
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left", dark && "on-dark", className)}>
      {eyebrow && (
        <Reveal>
          <p className={cn("eyebrow mb-4 inline-flex items-center gap-3", dark ? "text-porcelain/60" : "text-stone-deep")}>
            {index && <span className="num-serif text-crimson" style={{ fontSize: "0.85rem" }}>{index}</span>}
            <span className={cn("inline-block h-px w-9", dark ? "bg-porcelain/25" : "bg-ink/20")} aria-hidden="true" />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <h2 className={cn("h1", dark ? "text-porcelain" : "text-ink")}>
        <SplitWords text={words.join(" ")} />
        {last && (
          <>
            {" "}
            <span className="word-accent">
              <SplitWords text={last} />
            </span>
          </>
        )}
      </h2>
      {subtitle && (
        <Reveal delay={0.12}>
          <p className={cn("mt-4 text-[1.02rem] leading-relaxed", dark ? "text-porcelain/70" : "text-stone-deep")}>{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ── ECG divider — a decisive crimson line, no glow ──────── */

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
          opacity="0.85"
        />
      </svg>
    </div>
  );
}

/* ── Editorial card — porcelain/bone surface + hairline ──── */

export function PaperCard({ children, className, hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={cn("paper-card p-6", !hover && "hover:transform-none hover:border-inherit hover:shadow-none", className)}>
      {children}
    </div>
  );
}

/** Editorial card: porcelain/bone surface + hairline, hover = crimson hairline + lift */

/* ── JSON-LD ─────────────────────────────────────────────── */

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ── Page hero banner (inner pages) — editorial ink ──────── */

export function PageHero({
  title,
  subtitle,
  crumb,
}: {
  title: string;
  subtitle?: string;
  crumb: string;
}) {
  return (
    <section className="bg-ink-vignette grain on-dark relative overflow-hidden pb-16 pt-36 sm:pb-24 sm:pt-44">
      {/* huge faint circle motif from the logo */}
      <div
        className="pointer-events-none absolute -right-40 top-10 hidden h-[30rem] w-[30rem] rounded-full border border-porcelain/8 md:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-28 hidden h-[30rem] w-[30rem] rounded-full border border-porcelain/5 md:block"
        aria-hidden="true"
      />
      <div className="container-x relative">
        <Reveal>
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-porcelain/55">
            <A href="/" className="transition hover:text-porcelain">Home</A>
            <span className="h-1 w-1 rounded-full bg-crimson" aria-hidden="true" />
            <span className="text-porcelain">{crumb}</span>
          </nav>
        </Reveal>
        <div className="rule rule-on-dark mb-8 max-w-3xl" aria-hidden="true" />
        <h1 className="h-display max-w-3xl text-porcelain">
          <SplitWords text={title} />
        </h1>
        {subtitle && (
          <Reveal delay={0.15}>
            <p className="lead lead-on-dark mt-6 max-w-xl">{subtitle}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
