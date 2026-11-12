"use client";

import React from "react";
import { Download, FileText, ShieldCheck, FlaskConical, ClipboardList, Scale } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { GlassCard, JsonLd, PageHero, SectionHeading } from "@/components/site/bits";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion";
import { FaqAccordion } from "@/components/site/cards";
import { list, str } from "@/lib/content-schema";
import type { SectionData } from "@/lib/content-schema";

export default function ResourcesPage() {
  const { data, section, L } = useSite();
  const hero = section("resources", "hero");
  const bring = section("resources", "bring");
  const insurance = section("resources", "insurance");
  const lab = section("resources", "lab");
  const rights = section("resources", "rights");
  const forms = section("resources", "forms");
  const galleryHead = section("resources", "gallery");

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
      "@type": "Question",
      name: f.questionEn,
      acceptedAnswer: { "@type": "Answer", text: f.answerEn },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <PageHero title={str(hero, "title")} subtitle={str(hero, "subtitle")} slot="hero.resources" crumb={L("Patient Resources", "የታካሚ መረጃ")} />

      {/* FAQ */}
      <section className="bg-mesh-dark grain relative section-pad">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeading align="left" eyebrow={L("Answers", "መልሶች")} title={L("Frequently asked questions", "በተደጋጋሚ የሚጠየቁ ጥያቄዎች")} subtitle={L("Can't find your answer? Call us — we're happy to help.", "መልስ አላገኙም? ይደውሉልን — ለመርዳት ደስ ይላል።")} />
          </div>
          <Reveal delay={0.1}>
            <FaqAccordion faqs={data.faqs} />
          </Reveal>
        </div>
      </section>

      {/* bring / lab / rights — info cards */}
      <section className="relative section-pad bg-navy/60">
        <div className="container-x grid gap-6 lg:grid-cols-3">
          <InfoCard icon={ClipboardList} eyebrow={str(bring, "eyebrow")} title={str(bring, "title")} items={list(bring, "items").map((i) => str(i as SectionData, "text"))} />
          <InfoCard icon={FlaskConical} eyebrow={str(lab, "eyebrow")} title={str(lab, "title")} items={list(lab, "items").map((i) => str(i as SectionData, "text"))} />
          <InfoCard icon={ShieldCheck} eyebrow={str(rights, "eyebrow")} title={str(rights, "title")} items={list(rights, "items").map((i) => str(i as SectionData, "text"))} />
        </div>

        {/* insurance */}
        <Reveal className="container-x mt-6">
          <GlassCard className="flex flex-col items-start gap-5 p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow mb-2 inline-flex items-center gap-2 text-cyan">
                <Scale className="h-4 w-4" aria-hidden="true" />
                {str(insurance, "eyebrow")}
              </p>
              <h2 className="h3 text-ice">{str(insurance, "title")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ice-dim">{str(insurance, "text")}</p>
            </div>
          </GlassCard>
        </Reveal>
      </section>

      {/* forms */}
      <section className="bg-mesh-dark grain relative section-pad">
        <div className="container-x">
          <SectionHeading eyebrow={str(forms, "eyebrow")} title={str(forms, "title")} subtitle={str(forms, "subtitle")} />
          {data.gallery.filter((g) => g.type === "form").length > 0 ? (
            <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.gallery.filter((g) => g.type === "form").map((f) => (
                <StaggerItem key={f.id}>
                  <a href={f.url} download target="_blank" rel="noopener noreferrer" className="glass group flex items-center gap-4 rounded-2xl p-5 transition hover:-translate-y-1 hover:border-cyan/35">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 text-cyan">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ice">{f.title}</p>
                      <p className="text-xs text-ice-dim">{f.alt}</p>
                    </div>
                    <Download className="h-4 w-4 text-ice-dim transition group-hover:text-cyan" aria-hidden="true" />
                  </a>
                </StaggerItem>
              ))}
            </StaggerGroup>
          ) : (
            <Reveal className="mt-10">
              <div className="glass mx-auto flex max-w-xl items-center justify-center gap-4 rounded-2xl p-7 text-center">
                <FileText className="h-5 w-5 shrink-0 text-cyan" aria-hidden="true" />
                <p className="text-sm text-ice-dim">{L("Forms will appear here as our team publishes them.", "ቅጾች ሲታተሙ እዚህ ይታያሉ።")}</p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* gallery */}
      {data.gallery.filter((g) => g.type !== "form").length > 0 && (
        <section className="relative section-pad bg-navy/60">
          <div className="container-x">
            <SectionHeading eyebrow={str(galleryHead, "eyebrow")} title={str(galleryHead, "title")} subtitle={str(galleryHead, "subtitle")} />
            <StaggerGroup className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {data.gallery.filter((g) => g.type !== "form").slice(0, 8).map((g) => (
                <StaggerItem key={g.id}>
                  <div className="group relative aspect-square overflow-hidden rounded-xl border border-white/8">
                    {g.type === "video" ? (
                      <video src={g.url} className="h-full w-full object-cover" muted loop playsInline preload="metadata" aria-label={g.alt || g.title} />
                    ) : (
                      <img src={g.url} alt={g.alt || g.title || "Clinic facility"} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                    )}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/85 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="text-xs font-semibold text-ice">{g.title}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}
    </>
  );
}

function InfoCard({
  icon: Icon,
  eyebrow,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  items: string[];
}) {
  return (
    <Reveal className="h-full">
      <GlassCard className="h-full">
        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan/20 bg-gradient-to-br from-brand/25 to-cyan/10 text-cyan">
          <Icon className="h-6 w-6" />
        </span>
        <p className="eyebrow text-cyan/80">{eyebrow}</p>
        <h2 className="h3 mt-1.5 text-ice">{title}</h2>
        <ul className="mt-5 space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ice-dim">
              <span className="mt-1.5 inline-block h1.5 w-1.5 shrink-0 rounded-full bg-clinic-red" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </GlassCard>
    </Reveal>
  );
}
