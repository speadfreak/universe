"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarCheck, Mail, MapPin, MessageCircle, Navigation, Phone, Send, Clock } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonRed, GlassCard, PageHero, SectionHeading } from "@/components/site/bits";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion";
import { str } from "@/lib/content-schema";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const { data, section, settings, L, t, navigate } = useSite();
  const hero = section("contact", "hero");
  const intro = section("contact", "intro");
  const hours = section("contact", "hours");
  const [activeBranch, setActiveBranch] = useState(0);

  const validBranches = useMemo(
    () =>
      data.branches.filter((b) => {
        const u = b.mapEmbedUrl;
        return (
          u.startsWith("https://www.google.com/maps/embed") ||
          (u.startsWith("https://maps.google.com/maps?") || u.startsWith("https://www.google.com/maps?")) && u.includes("output=embed")
        );
      }),
    [data.branches]
  );

  /** Street-view link for the currently selected branch. */
  const directionsUrl = useMemo(() => {
    const b = validBranches[activeBranch];
    if (!b) return "https://www.google.com/maps";
    const q = b.mapEmbedUrl.includes("?") ? (b.mapEmbedUrl.split("?")[1] || "").split("&").find((p) => p.startsWith("q=")) : null;
    return q ? `https://www.google.com/maps?${q}` : `https://www.google.com/maps/search/${encodeURIComponent(b.addressEn)}`;
  }, [validBranches, activeBranch]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof contactSchema>, unknown, ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { department: "", email: "" },
  });

  async function onSubmit(values: ContactInput) {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new Error(body?.error?.message || "failed");
      }
      toast.success(t("form.sent"));
      reset();
    } catch {
      toast.error(t("common.error"));
    }
  }

  const inputCls =
    "min-h-11 w-full rounded-xl border border-white/12 bg-white/5 px-4 text-sm text-ice placeholder:text-ice-dim/55 backdrop-blur transition focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/20";

  return (
    <>
      <PageHero title={str(hero, "title")} subtitle={str(hero, "subtitle")} slot="hero.contact" crumb={L("Contact", "አግኙን")} />

      <section className="bg-mesh-dark grain relative section-pad">
        <div className="container-x grid gap-12 lg:grid-cols-[1.15fr_1fr]">
          {/* form */}
          <Reveal>
            <GlassCard className="h-full p-7 sm:p-9">
              <SectionHeading align="left" eyebrow={str(intro, "eyebrow")} title={str(intro, "title")} />
              <p className="mt-4 text-sm leading-relaxed text-ice-dim">{str(intro, "text")}</p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
                {/* honeypot */}
                <input type="text" {...register("website")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ice-dim">{t("form.name")} *</label>
                    <input id="c-name" {...register("name")} className={inputCls} placeholder={L("Your full name", "ሙሉ ስምዎ")} autoComplete="name" />
                    {errors.name && <p className="mt-1.5 text-xs text-clinic-red">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ice-dim">{t("form.phone")} *</label>
                    <input id="c-phone" {...register("phone")} className={inputCls} placeholder="09…" dir="ltr" autoComplete="tel" inputMode="tel" />
                    {errors.phone && <p className="mt-1.5 text-xs text-clinic-red">{errors.phone.message}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ice-dim">{t("form.email")}</label>
                    <input id="c-email" type="email" {...register("email")} className={inputCls} placeholder="name@email.com" autoComplete="email" />
                    {errors.email && <p className="mt-1.5 text-xs text-clinic-red">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-dept" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ice-dim">{t("form.department")}</label>
                    <select id="c-dept" {...register("department")} className={cn(inputCls, "appearance-none")}>
                      <option value="" className="bg-navy">{L("General enquiry", "አጠቃላይ ጥያቄ")}</option>
                      {data.services.map((s) => (
                        <option key={s.id} value={s.titleEn} className="bg-navy">{L(s.titleEn, s.titleAm)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="c-msg" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ice-dim">{t("form.message")} *</label>
                  <textarea id="c-msg" rows={5} {...register("message")} className={cn(inputCls, "resize-y")} placeholder={L("How can we help?", "እንዴት ልንረዳዎት እንችላለን?")} />
                  {errors.message && <p className="mt-1.5 text-xs text-clinic-red">{errors.message.message}</p>}
                </div>
                <ButtonRed type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {isSubmitting ? t("form.sending") : t("form.send")}
                </ButtonRed>
              </form>
            </GlassCard>
          </Reveal>

          {/* quick actions + branches */}
          <div className="space-y-6">
            <StaggerGroup className="grid grid-cols-2 gap-4">
              {[
                { icon: Phone, label: L("Call us", "ይደውሉልን"), value: settings.phone, href: `tel:${settings.phoneIntl}` },
                { icon: Mail, label: L("Email", "ኢሜይል"), value: settings.email, href: `mailto:${settings.email}` },
                { icon: MessageCircle, label: L("WhatsApp", "ዋትስአፕ"), value: L("Chat now", "አሁን ይንገሩ"), href: `https://wa.me/251116390354` },
                { icon: CalendarCheck, label: L("Book online", "በመስመር ላይ ይያዙ"), value: L("5 min", "5 ደቂቃ"), action: () => navigate("/book") },
              ].map((a, i) => (
                <StaggerItem key={i}>
                  {a.href ? (
                    <a href={a.href} target={a.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="glass group flex h-full min-h-24 flex-col justify-between rounded-2xl p-4 transition hover:-translate-y-1 hover:border-cyan/35">
                      <a.icon className="h-5 w-5 text-cyan" aria-hidden="true" />
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-ice-dim">{a.label}</p>
                        <p className="mt-0.5 truncate text-sm font-bold text-ice">{a.value}</p>
                      </div>
                    </a>
                  ) : (
                    <button onClick={a.action} className="glass group flex h-full min-h-24 w-full flex-col justify-between rounded-2xl p-4 text-left transition hover:-translate-y-1 hover:border-cyan/35">
                      <a.icon className="h-5 w-5 text-cyan" aria-hidden="true" />
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-ice-dim">{a.label}</p>
                        <p className="mt-0.5 text-sm font-bold text-ice">{a.value}</p>
                      </div>
                    </button>
                  )}
                </StaggerItem>
              ))}
            </StaggerGroup>

            {/* branch cards */}
            {data.branches.map((b, i) => (
              <Reveal key={b.id} delay={i * 0.06}>
                <GlassCard>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-[1.05rem] font-bold text-ice">{L(b.nameEn, b.nameAm)}</h3>
                      {b.established && <p className="mt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-clinic-red">{b.established}</p>}
                    </div>
                    <span className="rounded-full bg-brand/15 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-cyan">
                      {activeBranch === i ? L("Selected", "የተመረጠ") : L("Branch", "ቅርንጫፍ")}
                    </span>
                  </div>
                  <p className="mt-3 flex gap-2.5 text-sm text-ice-dim">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                    {L(b.addressEn, b.addressAm)}
                  </p>
                  <p className="mt-2 flex gap-2.5 text-sm text-ice-dim">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                    {L(b.hours || settings.hoursEn, b.hoursAm || settings.hoursAm)}
                  </p>
                  {validBranches.some((vb) => vb.id === b.id) && (
                    <button
                      onClick={() => setActiveBranch(i)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan transition hover:bg-cyan/10"
                    >
                      <Navigation className="h3.5 w-3.5" aria-hidden="true" />
                      {L("Show on map", "ካርታ ላይ ይመልከቱ")}
                    </button>
                  )}
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* map — cinematic Google iframe with warm frame */}
      <section className="relative bg-navy/60 pb-4 pt-0">
        <div className="container-x">
          {validBranches.length > 0 && (
            <Reveal>
              <div className="glass overflow-hidden rounded-3xl border-white/10 shadow-plate">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-6 py-4">
                  <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-ice">
                    {L("Find us", "ያግኙን")} — {L(validBranches[activeBranch]?.nameEn || "", validBranches[activeBranch]?.nameAm || "")}
                  </h2>
                  {validBranches.length > 1 && (
                    <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1" role="tablist" aria-label="Choose branch map">
                      {validBranches.map((b, i) => (
                        <button
                          key={b.id}
                          role="tab"
                          aria-selected={activeBranch === i}
                          onClick={() => setActiveBranch(i)}
                          className={cn(
                            "rounded-full px-4 py-1.5 text-xs font-bold transition",
                            activeBranch === i ? "bg-brand text-white" : "text-ice-dim hover:text-ice"
                          )}
                        >
                          {L(b.nameEn, b.nameAm).split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <iframe
                    key={validBranches[activeBranch]?.id}
                    src={validBranches[activeBranch]?.mapEmbedUrl}
                    title={`${validBranches[activeBranch]?.nameEn} location map`}
                    className="h-[460px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  {/* address chip + directions */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent p-5">
                    <p className="pointer-events-auto max-w-md rounded-2xl glass px-4 py-3 text-sm font-semibold text-ice">
                      <MapPin className="mr-2 inline h-4 w-4 text-crimson" aria-hidden="true" />
                      {L(validBranches[activeBranch]?.addressEn || "", validBranches[activeBranch]?.addressAm || "")}
                    </p>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-clinic-red px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white transition hover:bg-crimson-deep"
                    >
                      <Navigation className="h-4 w-4" aria-hidden="true" />
                      {L("Open in Google Maps", "በጎግል ካርታ ይክፈቱ")}
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* hours strip */}
          <Reveal className="mt-8 pb-10">
            <div className="glass flex flex-col items-center justify-between gap-3 rounded-2xl px-7 py-5 text-center sm:flex-row sm:text-left">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-cyan" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-ice">{str(hours, "title")}</p>
                  <p className="text-xs text-ice-dim">{str(hours, "text")}</p>
                </div>
              </div>
              <ButtonRed onClick={() => navigate("/book")}>
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {t("common.bookNow")}
              </ButtonRed>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
