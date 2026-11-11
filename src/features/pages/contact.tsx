"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarCheck, Mail, MapPin, MessageCircle, Navigation, Phone, Send, Clock } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonRed, PageHero, PaperCard, SectionHeading } from "@/components/site/bits";
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
    () => data.branches.filter((b) => b.mapEmbedUrl.startsWith("https://www.google.com/maps/embed")),
    [data.branches]
  );

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
    "min-h-11 w-full rounded-[10px] border border-ink/15 bg-porcelain px-4 text-sm text-ink placeholder:text-stone-deep/60 transition focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/15";

  return (
    <>
      <PageHero title={str(hero, "title")} subtitle={str(hero, "subtitle")} crumb={L("Contact", "አግኙን")} />

      <section className="section-pad bg-porcelain-flat">
        <div className="container-x grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* heading + contact details as hairline rows */}
          <div>
            <Reveal>
              <SectionHeading align="left" eyebrow={str(intro, "eyebrow")} title={str(intro, "title")} subtitle={str(intro, "text")} />
            </Reveal>

            <StaggerGroup className="mt-10 divide-y divide-ink/12 border-y border-ink/12">
              {[
                { icon: Phone, label: L("Call us", "ይደውሉልን"), value: settings.phone, href: `tel:${settings.phoneIntl}` },
                { icon: Mail, label: L("Email", "ኢሜይል"), value: settings.email, href: `mailto:${settings.email}` },
                { icon: MessageCircle, label: L("WhatsApp", "ዋትስአፕ"), value: L("Chat now", "አሁን ይንገሩ"), href: `https://wa.me/251116390354` },
                { icon: CalendarCheck, label: L("Book online", "በመስመር ላይ ይያዙ"), value: L("5 min", "5 ደቂቃ"), action: () => navigate("/book") },
              ].map((a, i) => (
                <StaggerItem key={i}>
                  {a.href ? (
                    <a href={a.href} target={a.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="group flex items-center gap-4 py-5">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/12 text-crimson transition-colors duration-300 group-hover:border-crimson/40">
                        <a.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-deep">{a.label}</span>
                        <span className="mt-0.5 block truncate text-sm font-bold text-ink transition-colors group-hover:text-crimson">{a.value}</span>
                      </span>
                    </a>
                  ) : (
                    <button onClick={a.action} className="group flex w-full items-center gap-4 py-5 text-left">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/12 text-crimson transition-colors duration-300 group-hover:border-crimson/40">
                        <a.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-deep">{a.label}</span>
                        <span className="mt-0.5 block truncate text-sm font-bold text-ink transition-colors group-hover:text-crimson">{a.value}</span>
                      </span>
                    </button>
                  )}
                </StaggerItem>
              ))}
            </StaggerGroup>

            {/* branch rows */}
            {data.branches.map((b, i) => (
              <Reveal key={b.id} delay={i * 0.06} className="mt-8 border-t border-ink/12 pt-8 last:border-b last:pb-8">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="h3 text-ink">{L(b.nameEn, b.nameAm)}</h3>
                    {b.established && <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-stone-deep">{b.established}</p>}
                  </div>
                  <span className={cn("shrink-0 pt-1 text-[0.62rem] font-bold uppercase tracking-[0.18em]", activeBranch === i ? "text-crimson" : "text-stone-deep")}>
                    {activeBranch === i ? L("Selected", "የተመረጠ") : L("Branch", "ቅርንጫፍ")}
                  </span>
                </div>
                <p className="mt-3 flex gap-2.5 text-sm text-stone-deep">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-crimson" aria-hidden="true" />
                  {L(b.addressEn, b.addressAm)}
                </p>
                <p className="mt-2 flex gap-2.5 text-sm text-stone-deep">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-crimson" aria-hidden="true" />
                  {L(b.hours || settings.hoursEn, b.hoursAm || settings.hoursAm)}
                </p>
                {validBranches.some((vb) => vb.id === b.id) && (
                  <button
                    onClick={() => setActiveBranch(i)}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:text-crimson"
                  >
                    <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                    {L("Show on map", "ካርታ ላይ ይመልከቱ")}
                  </button>
                )}
              </Reveal>
            ))}
          </div>

          {/* form on paper card */}
          <Reveal>
            <PaperCard hover={false} className="h-full p-7 shadow-plate sm:p-9">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* honeypot */}
                <input type="text" {...register("website")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-deep">{t("form.name")} *</label>
                    <input id="c-name" {...register("name")} className={inputCls} placeholder={L("Your full name", "ሙሉ ስምዎ")} autoComplete="name" />
                    {errors.name && <p className="mt-1.5 text-xs text-crimson-deep">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-deep">{t("form.phone")} *</label>
                    <input id="c-phone" {...register("phone")} className={inputCls} placeholder="09…" dir="ltr" autoComplete="tel" inputMode="tel" />
                    {errors.phone && <p className="mt-1.5 text-xs text-crimson-deep">{errors.phone.message}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-deep">{t("form.email")}</label>
                    <input id="c-email" type="email" {...register("email")} className={inputCls} placeholder="name@email.com" autoComplete="email" />
                    {errors.email && <p className="mt-1.5 text-xs text-crimson-deep">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-dept" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-deep">{t("form.department")}</label>
                    <select id="c-dept" {...register("department")} className={cn(inputCls, "appearance-none")}>
                      <option value="">{L("General enquiry", "አጠቃላይ ጥያቄ")}</option>
                      {data.services.map((s) => (
                        <option key={s.id} value={s.titleEn}>{L(s.titleEn, s.titleAm)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="c-msg" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-deep">{t("form.message")} *</label>
                  <textarea id="c-msg" rows={5} {...register("message")} className={cn(inputCls, "resize-y")} placeholder={L("How can we help?", "እንዴት ልንረዳዎት እንችላለን?")} />
                  {errors.message && <p className="mt-1.5 text-xs text-crimson-deep">{errors.message.message}</p>}
                </div>
                <ButtonRed type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {isSubmitting ? t("form.sending") : t("form.send")}
                </ButtonRed>
              </form>
            </PaperCard>
          </Reveal>
        </div>
      </section>

      {/* map */}
      <section className="bg-porcelain-deep pb-20">
        <div className="container-x">
          {validBranches.length > 0 && (
            <Reveal>
              <div className="overflow-hidden rounded-[10px] border border-ink/12 bg-white shadow-warm-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/12 px-6 py-4">
                  <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-ink">
                    {L("Find us", "ያግኙን")} — {L(validBranches[activeBranch]?.nameEn || "", validBranches[activeBranch]?.nameAm || "")}
                  </h2>
                  {validBranches.length > 1 && (
                    <div className="flex gap-1 rounded-full border border-ink/12 bg-porcelain p-1" role="tablist" aria-label="Choose branch map">
                      {validBranches.map((b, i) => (
                        <button
                          key={b.id}
                          role="tab"
                          aria-selected={activeBranch === i}
                          onClick={() => setActiveBranch(i)}
                          className={cn(
                            "rounded-full px-4 py-1.5 text-xs font-bold transition",
                            activeBranch === i ? "bg-ink text-porcelain" : "text-stone-deep hover:text-ink"
                          )}
                        >
                          {L(b.nameEn, b.nameAm).split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <iframe
                  key={validBranches[activeBranch]?.id}
                  src={validBranches[activeBranch]?.mapEmbedUrl}
                  title={`${validBranches[activeBranch]?.nameEn} location map`}
                  className="h-[420px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </Reveal>
          )}

          {/* hours strip */}
          <Reveal className="mt-8">
            <PaperCard hover={false} className="flex flex-col items-center justify-between gap-3 p-6 text-center sm:flex-row sm:text-left">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-crimson" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-ink">{str(hours, "title")}</p>
                  <p className="text-xs text-stone-deep">{str(hours, "text")}</p>
                </div>
              </div>
              <ButtonRed onClick={() => navigate("/book")}>
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {t("common.bookNow")}
              </ButtonRed>
            </PaperCard>
          </Reveal>
        </div>
      </section>
    </>
  );
}
