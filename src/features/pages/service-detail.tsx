"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, ArrowLeft, CalendarCheck, CircleCheckBig } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonRed, GlassCard, IconFor, JsonLd, PageHero, SectionHeading } from "@/components/site/bits";
import { Reveal, SplitWords } from "@/components/site/motion";
import { FaqAccordion } from "@/components/site/cards";
import ReactMarkdown from "react-markdown";
import type { ServiceDTO } from "@/lib/site-types";

export default function ServiceDetailPage({ slug }: { slug: string }) {
  const { data, L, navigate } = useSite();
  const service = data.services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <section className="flex min-h-[70vh] items-center bg-mesh-dark pt-24">
        <div className="container-x text-center">
          <h1 className="h1 text-ice">Service not found</h1>
          <ButtonRed className="mt-8" onClick={() => navigate("/services")}>
            <ArrowLeft className="h-4 w-4" /> All services
          </ButtonRed>
        </div>
      </section>
    );
  }

  const related = data.services.filter((s) => s.id !== service.id).slice(0, 3);

  const physicianSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: service.titleEn,
    description: service.excerptEn,
    procedureType: "https://schema.org/TherapeuticProcedure",
    provider: { "@type": "MedicalClinic", name: "Universe Medical Center" },
  };

  return (
    <>
      <JsonLd data={physicianSchema} />
      <PageHero slot={`hero.service.${slug}`} title={L(service.titleEn, service.titleAm)} subtitle={L(service.taglineEn, service.taglineAm) || L(service.excerptEn, service.excerptAm)} crumb={L("Services", "አገልግሎቶች")} />

      <section className="relative section-pad bg-mesh-dark">
        <div className="container-x grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          {/* main column */}
          <div>
            <Reveal>
              <div className="glass border-glow flex items-start gap-4 rounded-2xl p-6">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan/20 bg-gradient-to-br from-brand/25 to-cyan/10 text-cyan">
                  <IconFor name={service.icon} className="h-6 w-6" />
                </span>
                <p className="text-[0.95rem] leading-relaxed text-ice/90">{L(service.excerptEn, service.excerptAm)}</p>
              </div>
            </Reveal>

            {service.image && (
              <Reveal delay={0.08} className="mt-8">
                <div className="relative aspect-[16/8] overflow-hidden rounded-2xl border border-white/8">
                  <Image src={service.image} alt={service.titleEn} fill sizes="(max-width:1024px) 100vw, 60vw" className="object-cover" />
                </div>
              </Reveal>
            )}

            <Reveal delay={0.1} className="mt-10 md-content">
              <ReactMarkdown>{L(service.bodyEn, service.bodyAm) || L(service.excerptEn, service.excerptAm)}</ReactMarkdown>
            </Reveal>

            {/* what's included */}
            {service.features.length > 0 && (
              <div className="mt-12">
                <SectionHeading align="left" title={L("What's included", "የሚካተቱ")} />
                <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                  {service.features.map((f, i) => (
                    <Reveal as="li" key={i} delay={i * 0.05}>
                      <div className="glass flex items-start gap-3 rounded-xl p-4 text-sm text-ice/90">
                        <CircleCheckBig className="mt-0.5 h-4.5 w-4.5 shrink-0 text-cyan" aria-hidden="true" />
                        {L(f.en, f.am)}
                      </div>
                    </Reveal>
                  ))}
                </ul>
              </div>
            )}

            {/* process */}
            {service.process.length > 0 && (
              <div className="mt-14">
                <SectionHeading align="left" title={L("How it works", "እንዴት እንደሚሰራ")} />
                <ol className="mt-7 space-y-4">
                  {service.process.map((p, i) => (
                    <Reveal as="li" key={i} delay={i * 0.06}>
                      <div className="glass flex gap-4 rounded-xl p-5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 font-display text-sm font-bold text-cyan">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="pt-1.5 text-sm leading-relaxed text-ice/85">{L(p.en, p.am)}</p>
                      </div>
                    </Reveal>
                  ))}
                </ol>
              </div>
            )}

            {/* what to expect */}
            {service.expect.length > 0 && (
              <div className="mt-14">
                <SectionHeading align="left" title={L("What to expect", "ምን እንደሚጠብቁዎት")} />
                <ul className="mt-7 space-y-3">
                  {service.expect.map((e, i) => (
                    <Reveal as="li" key={i} delay={i * 0.05} className="flex items-start gap-3 text-sm leading-relaxed text-ice-dim">
                      <span className="pulse-dot mt-1.5 inline-blockh h-2 w-2 shrink-0 rounded-full bg-clinic-red" aria-hidden="true" />
                      {L(e.en, e.am)}
                    </Reveal>
                  ))}
                </ul>
              </div>
            )}

            {/* service faqs */}
            {service.faqs.length > 0 && (
              <div className="mt-14">
                <SectionHeading align="left" title={L("Service FAQs", "የአገልግሎት ጥያቄዎች")} />
                <div className="mt-7">
                  <FaqAccordion
                    faqs={service.faqs.map((f, i) => ({
                      id: `sf-${i}`,
                      questionEn: f.q.en,
                      questionAm: f.q.am,
                      answerEn: f.a.en,
                      answerAm: f.a.am,
                      category: "service",
                    }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* sticky sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <GlassCard className="text-center">
              <h2 className="h3 text-ice">{L("Ready to book?", "ለመያዝ ተዘጋጅተዋል?")}</h2>
              <p className="mt-2 text-sm text-ice-dim">
                {L("Choose a time that works for you — online or by phone.", "በመስመር ላይ ወይም በስልክ ተስማሚ ሰዓት ይምረጡ።")}
              </p>
              <ButtonRed
                className="mt-6 w-full"
                onClick={() => {
                  try {
                    window.sessionStorage.setItem("umc-prefill-service", service.id);
                  } catch {
                    /* ignore */
                  }
                  navigate("/book");
                }}
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {L("Book this service", "ይህን አገልግሎት ይያዙ")}
              </ButtonRed>
              <div className="mt-5 border-t border-white/8 pt-5 text-left">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ice-dim">{L("Other services", "ሌሎች አገልግሎቶች")}</p>
                <ul className="space-y-2">
                  {related.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => navigate(`/services/${r.slug}`)}
                        className="group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-ice/80 transition hover:bg-white/5 hover:text-cyan"
                      >
                        {L(r.titleEn, r.titleAm)}
                        <ArrowRight className="h3.5 w-3.5 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          </aside>
        </div>
      </section>
    </>
  );
}
