"use client";

import React, { useState } from "react";
import { Facebook, Linkedin, Mail, MapPin, Phone, Send, Clock } from "lucide-react";
import Image from "next/image";
import { A, useSite } from "./site-context";
import { EcgDivider } from "./bits";
import { PageBackdrop } from "./page-backdrop";
import { Reveal } from "./motion";
import { toast } from "sonner";

const SOCIALS = [
  { key: "facebook", label: "Facebook", hrefKey: "facebook", Icon: Facebook },
  { key: "tiktok", label: "TikTok", hrefKey: "tiktok", Icon: null },
  { key: "google", label: "Google", hrefKey: "google", Icon: null },
  { key: "linkedin", label: "LinkedIn", hrefKey: "linkedin", Icon: Linkedin },
] as const;

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
    </svg>
  );
}

export function Footer() {
  const { settings, data, section, t, L, navigate } = useSite();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const footer = section("footer", "main");
  const disclaimer = section("footer", "disclaimer");
  const year = "2026";

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, website: "" }),
      });
      if (!res.ok) throw new Error();
      setEmail("");
      toast.success(t("news.thanks"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="relative mt-auto overflow-hidden bg-[#0d0c0e]">
      {/* footer-top photographic band — faint dusk photo melting into ink */}
      <PageBackdrop
        config={data.backdrops?.["band.footer-top"]}
        slotKey="band.footer-top"
        edge="none"
        className="absolute inset-0"
      />
      {/* glowing top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand/8 to-transparent" aria-hidden="true" />

      <div className="container-x relative pb-10 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.8fr_0.9fr_1.25fr]">
          {/* brand */}
          <Reveal>
            <div>
              <Image src={settings.logoUrl || "/logo.png"} alt="Universe Medical Center logo" width={200} height={64} className="h-14 w-auto object-contain" />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-ice-dim">{footer.tagline as string}</p>
              <div className="mt-6 flex gap-2.5">
                {SOCIALS.map(({ label, hrefKey, Icon }) => {
                  const href = settings.socials[hrefKey] || "#";
                  return (
                    <a
                      key={hrefKey}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-ice-dim transition-all hover:-translate-y-0.5 hover:border-cyan/50 hover:text-cyan hover:shadow-[0_8px_24px_-8px_rgba(227,32,43,0.45)]"
                    >
                      {Icon ? <Icon className="h-4 w-4" /> : label === "TikTok" ? <TikTokIcon className="h-4 w-4" /> : <GoogleIcon className="h-4 w-4" />}
                    </a>
                  );
                })}
                <a
                  href={`mailto:${settings.email}`}
                  aria-label="Email"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-ice-dim transition-all hover:-translate-y-0.5 hover:border-cyan/50 hover:text-cyan"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* quick links */}
          <Reveal delay={0.08}>
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-ice">{footer.quickTitle as string}</h3>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  { label: t("nav.home"), href: "/" },
                  { label: t("nav.about"), href: "/about" },
                  { label: t("nav.doctors"), href: "/doctors" },
                  { label: t("nav.packages"), href: "/packages" },
                  { label: t("nav.blog"), href: "/blog" },
                  { label: t("nav.resources"), href: "/resources" },
                  { label: t("nav.contact"), href: "/contact" },
                ].map((l) => (
                  <li key={l.href}>
                    <A href={l.href} className="group inline-flex items-center gap-2 text-ice-dim transition hover:text-cyan">
                      <span className="h-px w-0 bg-cyan transition-all duration-300 group-hover:w-4" />
                      {l.label}
                    </A>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* services */}
          <Reveal delay={0.14}>
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-ice">{footer.servicesTitle as string}</h3>
              <ul className="mt-5 space-y-2.5 text-sm">
                {data.services.slice(0, 6).map((s) => (
                  <li key={s.id}>
                    <A href={`/services/${s.slug}`} className="group inline-flex items-center gap-2 text-ice-dim transition hover:text-cyan">
                      <span className="h-px w-0 bg-cyan transition-all duration-300 group-hover:w-4" />
                      {L(s.titleEn, s.titleAm)}
                    </A>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* contact + newsletter */}
          <Reveal delay={0.2}>
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-ice">{footer.contactTitle as string}</h3>
              <ul className="mt-5 space-y-4 text-sm text-ice-dim">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                  <span>{settings.addressAddis}</span>
                </li>
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                  <span>{settings.addressAmbo}</span>
                </li>
                <li>
                  <a href={`tel:${settings.phoneIntl}`} className="flex gap-3 transition hover:text-cyan">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                    <span dir="ltr">{settings.phone}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${settings.email}`} className="flex gap-3 transition hover:text-cyan">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                    <span>{settings.email}</span>
                  </a>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                  <span>{L(settings.hoursEn, settings.hoursAm)}</span>
                </li>
              </ul>

              <div className="mt-7">
                <p className="font-display text-sm font-semibold text-ice">{footer.newsletterTitle as string}</p>
                <p className="mt-1.5 text-xs text-ice-dim">{footer.newsletterText as string}</p>
                <form onSubmit={subscribe} className="mt-3 flex overflow-hidden rounded-full border border-white/12 bg-white/5 backdrop-blur focus-within:border-cyan/50">
                  <label htmlFor="footer-newsletter" className="sr-only">{t("news.placeholder")}</label>
                  <input
                    id="footer-newsletter"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("news.placeholder")}
                    className="w-full bg-transparent px-4 py-2.5 text-sm text-ice placeholder:text-ice-dim/60 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 bg-brand px-4 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#B5121C] disabled:opacity-60"
                  >
                    <Send className="h3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">{t("news.subscribe")}</span>
                  </button>
                </form>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ECG divider */}
        <div className="mt-14 text-cyan/50">
          <EcgDivider />
        </div>

        {/* disclaimer */}
        <p className="mt-2 text-center text-[0.72rem] leading-relaxed text-ice-dim/70">{disclaimer.text as string}</p>

        {/* bottom bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-6 text-xs text-ice-dim sm:flex-row">
          <p>
            {footer.copyright as string}
          </p>
          <div className="flex items-center gap-4">
            <A href="/privacy" className="transition hover:text-cyan">{L("Privacy Policy", "የግላዊነት ፖሊሲ")}</A>
            <span className="text-ice-dim/40">·</span>
            <A href="/terms" className="transition hover:text-cyan">{L("Terms", "ውሎች")}</A>
            <span className="text-ice-dim/40">·</span>
            <a
              href={(footer.creditUrl as string) || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ice/80 transition hover:text-cyan"
            >
              {footer.creditLabel as string}
            </a>
          </div>
        </div>
      </div>

      {/* mobile spacer for bottom action bar */}
      <div className="h-[64px] lg:hidden" aria-hidden="true" />
    </footer>
  );
}
