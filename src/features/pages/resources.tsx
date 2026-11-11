"use client";

import React from "react";
import { Download, FileText, ShieldCheck, FlaskConical, ClipboardList, Scale } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { JsonLd, PageHero, PaperCard, SectionHeading } from "@/components/site/bits";
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
      <PageHero title={str(hero, "title")} subtitle={str(hero, "subtitle")} crumb={L("Patient Resources", "የታካሚ መረጃ")} />

      {/* FAQ */}
      <section className="section-pad bg-porcelain-flat">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeading align="left" index="01" eyebrow={L("Answers", "መልሶች")} title={L("Frequently asked questions", "በተደጋጋሚ የሚጠየቁ ጥያቄዎች")} subtitle={L("Can't find your answer? Call us — we're happy to help.", "መልስ አላገኙም? ይደውሉልን — ለመርዳት ደስ ይላል።")} />
          </div>
          <Reveal delay={0.1}>
            <FaqAccordion faqs={data.faqs} />
          </Reveal>
        </div>
      </section>

      {/* bring / lab / rights — info cards */}
      <section className="section-pad bg-porcelain-deep">
        <div className="container-x grid gap-6 lg:grid-cols-3">
          <InfoCard icon={ClipboardList} eyebrow={str(bring, "eyebrow")} title={str(bring, "title")} items={list(bring, "items").map((i) => str(i as SectionData, "text"))} />
          <InfoCard icon={FlaskConical} eyebrow={str(lab, "eyebrow")} title={str(lab, "title")} items={list(lab, "items").map((i) => str(i as SectionData, "text"))} />
          <InfoCard icon={ShieldCheck} eyebrow={str(rights, "eyebrow")} title={str(rights, "title")} items={list(rights, "items").map((i) => str(i as SectionData, "text"))} />
        </div>

        {/* insurance */}
        <Reveal className="container-x mt-6">
          <PaperCard hover={false} className="flex flex-col items-start gap-5 p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow mb-2 inline-flex items-center gap-2 text-crimson-deep">
                <Scale className="h-4 w-4" aria-hidden="true" />
                {str(insurance, "eyebrow")}
              </p>
              <h2 className="h3 text-ink">{str(insurance, "title")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-deep">{str(insurance, "text")}</p>
            </div>
          </PaperCard>
        </Reveal>
      </section>

      {/* forms */}
      <section className="section-pad bg-bone-flat">
        <div className="container-x">
          <SectionHeading index="02" eyebrow={str(forms, "eyebrow")} title={str(forms, "title")} subtitle={str(forms, "subtitle")} />
          {data.gallery.filter((g) => g.type === "form").length > 0 ? (
            <StaggerGroup className="mt-12">
              {data.gallery.filter((g) => g.type === "form").map((f) => (
                <StaggerItem key={f.id}>
                  <a href={f.url} download target="_blank" rel="noopener noreferrer" className="group flex items-center gap-5 border-t border-ink/12 px-1 py-5 transition-colors last:border-b hover:bg-white/60 sm:px-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/12 text-crimson transition-colors duration-300 group-hover:border-crimson/40">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink transition-colors group-hover:text-crimson">{f.title}</p>
                      <p className="text-xs text-stone-deep">{f.alt}</p>
                    </div>
                    <Download className="h-4 w-4 shrink-0 text-stone-deep transition-colors group-hover:text-crimson" aria-hidden="true" />
                  </a>
                </StaggerItem>
              ))}
            </StaggerGroup>
          ) : (
            <Reveal className="mt-10">
              <div className="mx-auto flex max-w-xl items-center justify-center gap-4 rounded-[10px] border border-ink/12 bg-white p-7 text-center">
                <FileText className="h-5 w-5 shrink-0 text-crimson" aria-hidden="true" />
                <p className="text-sm text-stone-deep">{L("Forms will appear here as our team publishes them.", "ቅጾች ሲታተሙ እዚህ ይታያሉ።")}</p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* gallery */}
      {data.gallery.filter((g) => g.type !== "form").length > 0 && (
        <section className="section-pad bg-porcelain-deep">
          <div className="container-x">
            <SectionHeading index="03" eyebrow={str(galleryHead, "eyebrow")} title={str(galleryHead, "title")} subtitle={str(galleryHead, "subtitle")} />
            <StaggerGroup className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {data.gallery.filter((g) => g.type !== "form").slice(0, 8).map((g) => (
                <StaggerItem key={g.id}>
                  <div className="group relative aspect-square overflow-hidden rounded-[10px] border border-ink/12">
                    {g.type === "video" ? (
                      <video src={g.url} className="h-full w-full object-cover" muted loop playsInline preload="metadata" aria-label={g.alt || g.title} />
                    ) : (
                      <img src={g.url} alt={g.alt || g.title || "Clinic facility"} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                    )}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/85 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="text-xs font-semibold text-porcelain">{g.title}</p>
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
      <PaperCard className="h-full">
        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink/12 text-crimson">
          <Icon className="h-6 w-6" />
        </span>
        <p className="eyebrow text-crimson-deep">{eyebrow}</p>
        <h2 className="h3 mt-1.5 text-ink">{title}</h2>
        <ul className="mt-5 space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-stone-deep">
              <span className="mt-[0.45rem] inline-block h-1 w-1 shrink-0 rounded-full bg-crimson" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </PaperCard>
    </Reveal>
  );
}
