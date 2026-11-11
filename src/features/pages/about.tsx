"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CalendarCheck, ChevronRight, MapPin, Phone, Quote } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonRed, JsonLd, PageHero, SectionHeading } from "@/components/site/bits";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion";
import { StatBand, StatChip } from "@/components/site/cards";
import { list, str } from "@/lib/content-schema";
import type { SectionData } from "@/lib/content-schema";

export default function AboutPage() {
  const { data, section, L, locale, navigate, settings } = useSite();
  const hero = section("about", "hero");
  const story = section("about", "story");
  const timeline = section("about", "timeline");
  const mission = section("about", "mission");
  const values = section("about", "values");
  const branchesHead = section("about", "branches");
  const teamHead = section("about", "team");
  const galleryHead = section("about", "gallery");

  const [activeBranch, setActiveBranch] = useState(0);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Universe Medical Center",
    mainEntity: {
      "@type": "MedicalClinic",
      name: settings.clinicName,
      foundingDate: "2021-02",
      telephone: settings.phoneIntl,
      email: settings.email,
    },
  };

  return (
    <>
      <JsonLd data={orgSchema} />
      <PageHero title={str(hero, "title")} subtitle={str(hero, "subtitle")} crumb={L("About", "ስለ እኛ")} />

      {/* 01 — story: light porcelain, arch-masked image */}
      <section className="bg-porcelain-flat relative section-pad">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading index="01" eyebrow={str(story, "eyebrow")} title={str(story, "title")} emphasizeLast />
            <Reveal delay={0.1}>
              <p className="lead mt-6 max-w-xl">{str(story, "text")}</p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-4 max-w-xl leading-relaxed text-stone-deep">{str(story, "text2")}</p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="relative">
            <div className="arch relative aspect-[4/4.4] overflow-hidden bg-bone shadow-warm sm:aspect-[4/3.4]">
              <Image
                src={str(story, "image") || "/img/about-story.jpg"}
                alt={L("Our clinic team", "የክሊኒካችን ቡድን")}
                fill
                sizes="(max-width:1024px) 100vw, 46vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-6 flex max-w-[13rem] items-center gap-3 rounded-[10px] bg-ink px-5 py-4 shadow-warm-sm">
              <Quote className="h-5 w-5 shrink-0 text-crimson" aria-hidden="true" />
              <p className="text-xs font-semibold leading-snug text-porcelain">
                {L("“We care about you.”", "“እንከታከምልዎታለን።”")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 02 — timeline: hairline spine, serif numerals, no boxes */}
      <section className="bg-porcelain-deep relative section-pad">
        <div className="container-x">
          <SectionHeading index="02" eyebrow={str(timeline, "eyebrow")} title={str(timeline, "title")} emphasizeLast />
          <div className="relative mx-auto mt-16 max-w-3xl">
            <div className="absolute bottom-4 left-5 top-4 w-px bg-ink/12 sm:left-1/2" aria-hidden="true" />
            <ol className="space-y-10">
              {list(timeline, "items").map((item, i) => (
                <Reveal as="li" key={i} delay={i * 0.08} className={`relative flex gap-6 sm:w-1/2 ${i % 2 === 0 ? "sm:pr-12" : "sm:ml-auto sm:flex-row-reverse sm:pl-12 sm:text-right"}`}>
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-porcelain-deep font-display text-[0.7rem] font-bold text-crimson">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <p className="eyebrow text-stone-deep">{str(item as SectionData, "year")}</p>
                    <h3 className="h3 mt-1.5 text-ink">{str(item as SectionData, "title")}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-deep">{str(item as SectionData, "text")}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 03 — mission: bone surface, stat chips divided by whitespace */}
      <section className="bg-bone-flat relative section-pad">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <SectionHeading index="03" eyebrow={str(mission, "eyebrow")} title={str(mission, "title")} subtitle={str(mission, "text")} emphasizeLast />
          </div>
          <StaggerGroup className="grid grid-cols-2 gap-4">
            {[
              { value: "5", label: L("Years of experience", "የሥራ ዓመታት") },
              { value: "7k", label: L("Satisfied patients", "የተሟላ ታካሚዎች") },
              { value: "2", label: L("Branches", "ቅርንጫፎች") },
              { value: "24/7", label: L("Patient support", "የታካሚ ድጋፍ") },
            ].map((s, i) => (
              <StaggerItem key={i}>
                <StatChip value={s.value} label={s.label} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 04 — values: calm scrub band, hairline rows */}
      <section className="bg-scrub on-dark relative section-pad">
        <div className="container-x">
          <SectionHeading dark index="04" eyebrow={str(values, "eyebrow")} title={str(values, "title")} emphasizeLast />
          <StaggerGroup className="mt-12">
            {list(values, "items").map((item, i) => (
              <StaggerItem key={i} className="border-t border-porcelain/12 last:border-b">
                <div className="grid gap-2 py-6 md:grid-cols-[4.5rem_1fr_1.6fr] md:items-baseline md:gap-10">
                  <span className="num-serif text-sm text-porcelain/40" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="h3 text-porcelain">{str(item as SectionData, "title")}</h3>
                  <p className="text-sm leading-relaxed text-porcelain/65">{str(item as SectionData, "text")}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <Reveal className="mt-10">
            <p className="text-xs italic text-porcelain/45">
              {L("Amharic wording shown on the Amharic site is flagged for native-speaker review in the admin panel.", "በአማርኛ ገጹ ላይ ያለው ጽሑፍ ለተሟላ ክለሳ ተመልክቷል።")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 05 — branches: selectable hairline rows + paper detail plate */}
      <section className="bg-bone-flat relative section-pad">
        <div className="container-x">
          <SectionHeading index="05" eyebrow={str(branchesHead, "eyebrow")} title={str(branchesHead, "title")} subtitle={str(branchesHead, "subtitle")} emphasizeLast />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
            <div>
              {data.branches.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setActiveBranch(i)}
                  className="group flex w-full items-center justify-between gap-4 border-t border-ink/12 py-5 text-left transition-colors duration-300 last:border-b"
                  aria-pressed={activeBranch === i}
                >
                  <span className="flex min-w-0 items-baseline gap-4">
                    <span className={`num-serif text-sm transition-colors duration-300 ${activeBranch === i ? "text-crimson" : "text-stone-deep"}`} aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className={`block font-display text-[1.1rem] tracking-[-0.01em] transition-colors duration-300 ${activeBranch === i ? "text-crimson" : "text-ink group-hover:text-crimson"}`}>
                        {L(b.nameEn, b.nameAm)}
                      </span>
                      {b.established && (
                        <span className="mt-1 block text-[0.66rem] font-bold uppercase tracking-[0.18em] text-stone-deep">{b.established}</span>
                      )}
                    </span>
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-all duration-300 ${activeBranch === i ? "translate-x-1 text-crimson" : "text-ink/35 group-hover:text-crimson"}`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
            {data.branches[activeBranch] && (
              <Reveal className="h-full">
                <div className="paper-card h-full p-7 md:p-8">
                  <h3 className="h3 text-ink">{L(data.branches[activeBranch].nameEn, data.branches[activeBranch].nameAm)}</h3>
                  <ul className="mt-5 space-y-4 text-sm text-stone-deep">
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-crimson" aria-hidden="true" />
                      {L(data.branches[activeBranch].addressEn, data.branches[activeBranch].addressAm)}
                    </li>
                    {data.branches[activeBranch].phone && (
                      <li className="flex gap-3">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-crimson" aria-hidden="true" />
                        <a href={`tel:${settings.phoneIntl}`} className="transition hover:text-crimson" dir="ltr">{data.branches[activeBranch].phone}</a>
                      </li>
                    )}
                  </ul>
                  {data.branches[activeBranch].mapEmbedUrl && (
                    <div className="mt-6 overflow-hidden rounded-[8px] border border-ink/12">
                      <iframe
                        src={data.branches[activeBranch].mapEmbedUrl}
                        title={`${data.branches[activeBranch].nameEn} map`}
                        className="h-64 w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <ButtonRed onClick={() => navigate("/book")}>
                      <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                      {L("Book at this branch", "በዚህ ቅርንጫፍ ይያዙ")}
                    </ButtonRed>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* 06 — team: ink-vignette closing band */}
      {data.doctors.length > 0 && (
        <section className="bg-ink-vignette grain on-dark relative section-pad">
          <div className="container-x">
            <SectionHeading dark align="center" index="06" eyebrow={str(teamHead, "eyebrow")} title={str(teamHead, "title")} subtitle={str(teamHead, "subtitle")} emphasizeLast />
            <Reveal className="mt-10 text-center">
              <ButtonRed onClick={() => navigate("/doctors")}>
                {L("Meet the full team", "ሙሉውን ቡድን ይዩት")}
              </ButtonRed>
            </Reveal>
          </div>
        </section>
      )}

      {/* 07 — gallery: porcelain grid with soft-rectangle frames */}
      {data.gallery.length > 0 && (
        <section className="bg-porcelain-flat relative section-pad">
          <div className="container-x">
            <SectionHeading index="07" eyebrow={str(galleryHead, "eyebrow")} title={str(galleryHead, "title")} subtitle={str(galleryHead, "subtitle")} emphasizeLast />
            <StaggerGroup className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {data.gallery.slice(0, 8).map((g) => (
                <StaggerItem key={g.id}>
                  <div className="group relative aspect-square overflow-hidden rounded-[10px] border border-ink/10 bg-bone">
                    {g.type === "video" ? (
                      <video src={g.url} className="h-full w-full object-cover" muted loop playsInline preload="metadata" aria-label={g.alt || g.title} />
                    ) : (
                      <Image src={g.url} alt={g.alt || g.title || "Clinic facility"} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
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

      {/* closing stat band on ink */}
      <section className="border-t border-porcelain/10 bg-ink py-14">
        <div className="container-x">
          <StatBand
            dark
            stats={[
              { value: "5+", label: L("Years of Experience", "የሥራ ዓመታት") },
              { value: "7k", label: L("Satisfied Patients", "የተሟላ ታካሚዎች") },
              { value: "2", label: L("Branches", "ቅርንጫፎች") },
            ]}
          />
        </div>
      </section>
    </>
  );
}
