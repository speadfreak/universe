"use client";

import React, { useState } from "react";
import { Facebook, Linkedin, Mail, MapPin, Phone, ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import { A, useSite } from "./site-context";
import { EcgDivider } from "./bits";
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
    <footer className="on-dark relative mt-auto overflow-hidden" style={{ background: "linear-gradient(180deg, #111012 0%, #2a1015 55%, #4a0f18 100%)" }}>
      {/* crimson ECG divider at the top edge */}
      <div className="text-crimson" aria-hidden="true">
        <EcgDivider className="h-7 opacity-80" />
      </div>

      <div className="container-x relative pb-10 pt-14">
        {/* big serif statement */}
        <Reveal>
          <p className="font-display text-[clamp(2rem,5.4vw,4rem)] leading-[1.05] tracking-[-0.02em] text-porcelain">
            {settings.tagline || "Better Care for Better Health"}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.35fr_0.8fr_0.9fr_1.25fr] lg:gap-0">
          {/* brand */}
          <Reveal className="lg:pr-10">
            <div>
              <Image src={settings.logoUrl || "/logo.png"} alt="Universe Medical Center logo" width={200} height={64} className="h-14 w-auto object-contain" />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-porcelain/60">{footer.tagline as string}</p>
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
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-porcelain/15 text-porcelain/65 transition-all hover:border-crimson hover:text-porcelain"
                    >
                      {Icon ? <Icon className="h-4 w-4" /> : label === "TikTok" ? <TikTokIcon className="h-4 w-4" /> : <GoogleIcon className="h-4 w-4" />}
                    </a>
                  );
                })}
                <a
                  href={`mailto:${settings.email}`}
                  aria-label="Email"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-porcelain/15 text-porcelain/65 transition-all hover:border-crimson hover:text-porcelain"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* quick links */}
          <Reveal delay={0.08} className="lg:border-l lg:border-porcelain/10 lg:px-8">
            <div>
              <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-porcelain/45">{footer.quickTitle as string}</h3>
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
                    <A href={l.href} className="group inline-flex items-center gap-2 text-porcelain/65 transition hover:text-porcelain">
                      <span className="h-px w-0 bg-crimson transition-all duration-300 group-hover:w-4" aria-hidden="true" />
                      {l.label}
                    </A>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* services */}
          <Reveal delay={0.14} className="lg:border-l lg:border-porcelain/10 lg:px-8">
            <div>
              <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-porcelain/45">{footer.servicesTitle as string}</h3>
              <ul className="mt-5 space-y-2.5 text-sm">
                {data.services.slice(0, 6).map((s) => (
                  <li key={s.id}>
                    <A href={`/services/${s.slug}`} className="group inline-flex items-center gap-2 text-porcelain/65 transition hover:text-porcelain">
                      <span className="h-px w-0 bg-crimson transition-all duration-300 group-hover:w-4" aria-hidden="true" />
                      {L(s.titleEn, s.titleAm)}
                    </A>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* contact + newsletter */}
          <Reveal delay={0.2} className="lg:border-l lg:border-porcelain/10 lg:pl-8">
            <div>
              <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-porcelain/45">{footer.contactTitle as string}</h3>
              <ul className="mt-5 space-y-4 text-sm text-porcelain/65">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-crimson" aria-hidden="true" />
                  <span>{settings.addressAddis}</span>
                </li>
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-crimson" aria-hidden="true" />
                  <span>{settings.addressAmbo}</span>
                </li>
                <li>
                  <a href={`tel:${settings.phoneIntl}`} className="flex gap-3 transition hover:text-porcelain">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-crimson" aria-hidden="true" />
                    <span dir="ltr">{settings.phone}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${settings.email}`} className="flex gap-3 transition hover:text-porcelain">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-crimson" aria-hidden="true" />
                    <span>{settings.email}</span>
                  </a>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-crimson" aria-hidden="true" />
                  <span>{L(settings.hoursEn, settings.hoursAm)}</span>
                </li>
              </ul>

              <div className="mt-7">
                <p className="text-sm font-semibold text-porcelain">{footer.newsletterTitle as string}</p>
                <p className="mt-1.5 text-xs text-porcelain/55">{footer.newsletterText as string}</p>
                <form onSubmit={subscribe} className="mt-3 flex items-center overflow-hidden rounded-[10px] border border-porcelain/18 transition focus-within:border-crimson/70">
                  <label htmlFor="footer-newsletter" className="sr-only">{t("news.placeholder")}</label>
                  <input
                    id="footer-newsletter"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("news.placeholder")}
                    className="w-full bg-transparent px-4 py-2.5 text-sm text-porcelain placeholder:text-porcelain/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    aria-label={t("news.subscribe")}
                    className="group inline-flex h-11 w-12 shrink-0 items-center justify-center bg-crimson text-white transition hover:bg-crimson-deep disabled:opacity-60"
                  >
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                </form>
              </div>
            </div>
          </Reveal>
        </div>

        {/* disclaimer */}
        <p className="mt-12 text-center text-[0.72rem] leading-relaxed text-porcelain/40">{disclaimer.text as string}</p>

        {/* bottom bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-porcelain/10 pt-6 text-xs text-porcelain/50 sm:flex-row">
          <p>
            {footer.copyright as string}
          </p>
          <div className="flex items-center gap-4">
            <A href="/privacy" className="transition hover:text-porcelain">{L("Privacy Policy", "የግላዊነት ፖሊሲ")}</A>
            <span className="text-porcelain/30">·</span>
            <A href="/terms" className="transition hover:text-porcelain">{L("Terms", "ውሎች")}</A>
            <span className="text-porcelain/30">·</span>
            <a
              href={(footer.creditUrl as string) || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-porcelain/75 transition hover:text-porcelain"
            >
              {(footer.creditLabel as string) || "Developed by Joseph James"}
            </a>
          </div>
        </div>
      </div>

      {/* mobile spacer for bottom action bar */}
      <div className="h-[64px] lg:hidden" aria-hidden="true" />
    </footer>
  );
}
