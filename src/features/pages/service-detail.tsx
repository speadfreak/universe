"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, ArrowLeft, CalendarCheck } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonRed, IconFor, JsonLd, PageHero } from "@/components/site/bits";
import { Reveal } from "@/components/site/motion";
import { FaqAccordion } from "@/components/site/cards";
import ReactMarkdown from "react-markdown";
import type { ServiceDTO } from "@/lib/site-types";

export default function ServiceDetailPage({ slug }: { slug: string }) {
  const { data, L, navigate } = useSite();
  const service = data.services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <section className="bg-ink-vignette grain on-dark flex min-h-[70vh] items-center pt-24">
        <div className="container-x text-center">
          <h1 className="h1 text-porcelain">Service not found</h1>
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
      <PageHero title={L(service.titleEn, service.titleAm)} subtitle={L(service.taglineEn, service.taglineAm) || L(service.excerptEn, service.excerptAm)} crumb={L("Services", "አገልግሎቶች")} />

      <section className="bg-porcelain-flat relative section-pad">
        <div className="container-x grid gap-14 lg:grid-cols-[7fr_5fr] lg:gap-16">
          {/* main column */}
          <div>
            <Reveal>
              <div className="flex items-start gap-5">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ink/12 text-crimson">
                  <IconFor name={service.icon} className="h-5 w-5" />
                </span>
                <p className="lead">{L(service.excerptEn, service.excerptAm)}</p>
              </div>
            </Reveal>

            {service.image && (
              <Reveal delay={0.08} className="mt-9">
                <div className="relative aspect-[16/8] overflow-hidden rounded-[10px] border border-ink/10 bg-bone shadow-warm-sm">
                  <Image src={service.image} alt={service.titleEn} fill sizes="(max-width:1024px) 100vw, 60vw" className="object-cover" />
                </div>
              </Reveal>
            )}

            <Reveal delay={0.1} className="md-content mt-10">
              <ReactMarkdown>{L(service.bodyEn, service.bodyAm) || L(service.excerptEn, service.excerptAm)}</ReactMarkdown>
            </Reveal>

            {/* what's included — hairline rows with crimson indices */}
            {service.features.length > 0 && (
              <div className="mt-14">
                <div className="rule mb-8" aria-hidden="true" />
                <h2 className="h2 text-ink">{L("What's included", "የሚካተቱ")}</h2>
                <ul className="mt-7 grid border-t border-ink/12 sm:grid-cols-2 sm:gap-x-12">
                  {service.features.map((f, i) => (
                    <Reveal as="li" key={i} delay={i * 0.05} className="flex items-baseline gap-4 border-b border-ink/12 py-4 text-sm text-ink/80">
                      <span className="num-serif shrink-0 text-xs text-crimson" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {L(f.en, f.am)}
                    </Reveal>
                  ))}
                </ul>
              </div>
            )}

            {/* process — numbered hairline rows */}
            {service.process.length > 0 && (
              <div className="mt-14">
                <div className="rule mb-8" aria-hidden="true" />
                <h2 className="h2 text-ink">{L("How it works", "እንዴት እንደሚሰራ")}</h2>
                <ol className="mt-7 border-t border-ink/12">
                  {service.process.map((p, i) => (
                    <Reveal as="li" key={i} delay={i * 0.06} className="flex items-baseline gap-5 border-b border-ink/12 py-5 md:gap-8">
                      <span className="num-serif shrink-0 text-[1.35rem] leading-none text-crimson" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-[0.95rem] leading-relaxed text-stone-deep">{L(p.en, p.am)}</p>
                    </Reveal>
                  ))}
                </ol>
              </div>
            )}

            {/* what to expect — crimson pulse markers */}
            {service.expect.length > 0 && (
              <div className="mt-14">
                <div className="rule mb-8" aria-hidden="true" />
                <h2 className="h2 text-ink">{L("What to expect", "ምን እንደሚጠብቁዎት")}</h2>
                <ul className="mt-7 space-y-3.5">
                  {service.expect.map((e, i) => (
                    <Reveal as="li" key={i} delay={i * 0.05} className="flex items-start gap-3.5 text-sm leading-relaxed text-stone-deep">
                      <span className="pulse-dot mt-[0.4rem] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" aria-hidden="true" />
                      {L(e.en, e.am)}
                    </Reveal>
                  ))}
                </ul>
              </div>
            )}

            {/* service faqs */}
            {service.faqs.length > 0 && (
              <div className="mt-14">
                <div className="rule mb-8" aria-hidden="true" />
                <h2 className="h2 text-ink">{L("Service FAQs", "የአገልግሎት ጥያቄዎች")}</h2>
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

          {/* booking column — oxblood plate */}
          <aside>
            <div
              className="on-dark shadow-plate relative overflow-hidden rounded-[14px] p-7 md:p-8"
              style={{ background: "linear-gradient(140deg,#2a1015,#4A0F18)" }}
            >
              <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full border border-porcelain/10" aria-hidden="true" />
              <div className="pointer-events-none absolute -right-6 top-16 h-44 w-44 rounded-full border border-porcelain/6" aria-hidden="true" />
              <h2 className="h3 relative text-porcelain">{L("Ready to book?", "ለመያዝ ተዘጋጅተዋል?")}</h2>
              <p className="relative mt-2.5 text-sm leading-relaxed text-porcelain/70">
                {L("Choose a time that works for you — online or by phone.", "በመስመር ላይ ወይም በስልክ ተስማሚ ሰዓት ይምረጡ።")}
              </p>
              <ButtonRed
                className="relative mt-6 w-full"
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
              <div className="relative mt-6 border-t border-porcelain/12 pt-6 text-left">
                <p className="eyebrow mb-3 text-porcelain/55">{L("Other services", "ሌሎች አገልግሎቶች")}</p>
                <ul className="space-y-1">
                  {related.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => navigate(`/services/${r.slug}`)}
                        className="group flex w-full items-center justify-between gap-2 rounded-[8px] px-3 py-2.5 text-left text-sm text-porcelain/75 transition hover:bg-porcelain/8 hover:text-porcelain"
                      >
                        {L(r.titleEn, r.titleAm)}
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
