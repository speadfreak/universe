"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CalendarCheck, ChevronRight, MapPin, Phone, Quote } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonRed, GlassCard, JsonLd, PageHero, SectionHeading } from "@/components/site/bits";
import { Reveal, SplitWords, StaggerGroup, StaggerItem, Counter } from "@/components/site/motion";
import { StatChip } from "@/components/site/cards";
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

      {/* story */}
      <section className="bg-mesh-dark grain relative section-pad">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <p className="eyebrow mb-3 inline-flex items-center gap-2 text-cyan">
                <span className="inline-block h-px w-8 bg-cyan/50" />
                {str(story, "eyebrow")}
              </p>
            </Reveal>
            <h2 className="h1 text-ice">
              <SplitWords text={str(story, "title")} />
            </h2>
            <Reveal delay={0.1}>
              <p className="mt-6 leading-relaxed text-ice-dim">{str(story, "text")}</p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-4 leading-relaxed text-ice-dim">{str(story, "text2")}</p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="relative">
            <div className="border-glow relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src={str(story, "image") || "/img/about-story.jpg"}
                alt={L("Our clinic team", "የክሊኒካችን ቡድን")}
                fill
                sizes="(max-width:1024px) 100vw, 46vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" aria-hidden="true" />
            </div>
            <div className="glass absolute -bottom-7 left-7 flex items-center gap-3 rounded-2xl px-5 py-4">
              <Quote className="h-6 w-6 text-cyan" aria-hidden="true" />
              <p className="max-w-[13rem] text-xs font-semibold leading-snug text-ice">
                {L("“We care about you.”", "“እንከታከምልዎታለን።”")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* timeline */}
      <section className="relative section-pad bg-navy/60">
        <div className="container-x">
          <SectionHeading eyebrow={str(timeline, "eyebrow")} title={str(timeline, "title")} />
          <div className="relative mx-auto mt-16 max-w-3xl">
            <div className="absolute bottom-4 left-5 top-4 w-px bg-gradient-to-b from-cyan/50 via-brand/40 to-transparent sm:left-1/2" aria-hidden="true" />
            <ol className="space-y-10">
              {list(timeline, "items").map((item, i) => (
                <Reveal as="li" key={i} delay={i * 0.08} className={`relative flex gap-6 sm:w-1/2 ${i % 2 === 0 ? "sm:pr-12" : "sm:ml-auto sm:flex-row-reverse sm:pl-12 sm:text-right"}`}>
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan/30 bg-ink font-display text-[0.7rem] font-bold text-cyan glow-blue">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="glass flex-1 rounded-2xl p-5">
                    <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-clinic-red">{str(item as SectionData, "year")}</p>
                    <h3 className="mt-1.5 font-display text-[1.05rem] font-bold text-ice">{str(item as SectionData, "title")}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ice-dim">{str(item as SectionData, "text")}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* mission (bright) */}
      <section className="bg-mesh-ice relative section-pad text-navy">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Reveal>
              <p className="eyebrow mb-3 inline-flex items-center gap-2 text-brand">
                <span className="inline-block h-px w-8 bg-brand/50" />
                {str(mission, "eyebrow")}
              </p>
            </Reveal>
            <h2 className="h1 text-navy">{str(mission, "title")}</h2>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-2xl leading-relaxed text-navy/70">{str(mission, "text")}</p>
            </Reveal>
          </div>
          <StaggerGroup className="grid grid-cols-2 gap-4">
            {[
              { value: "5", label: L("Years of experience", "የሥራ ዓመታት") },
              { value: "7k", label: L("Satisfied patients", "የተሟላ ታካሚዎች") },
              { value: "2", label: L("Branches", "ቅርንጫፎች") },
              { value: "24/7", label: L("Patient support", "የታካሚ ድጋፍ") },
            ].map((s, i) => (
              <StaggerItem key={i}>
                <StatChip value={s.value} label={s.label} dark />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* values */}
      <section className="bg-mesh-dark grain relative section-pad">
        <div className="container-x">
          <SectionHeading eyebrow={str(values, "eyebrow")} title={str(values, "title")} />
          <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {list(values, "items").map((item, i) => (
              <StaggerItem key={i} className="h-full">
                <GlassCard className="h-full">
                  <span className="font-display text-4xl font-bold text-gradient" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-[1.02rem] font-bold text-ice">{str(item as SectionData, "title")}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ice-dim">{str(item as SectionData, "text")}</p>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <Reveal className="mt-6 text-center">
            <p className="text-xs italic text-ice-dim/70">
              {L("Amharic wording shown on the Amharic site is flagged for native-speaker review in the admin panel.", "በአማርኛ ገጹ ላይ ያለው ጽሑፍ ለተሟላ ክለሳ ተመልክቷል።")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* branches interactive */}
      <section className="relative section-pad bg-navy/60">
        <div className="container-x">
          <SectionHeading eyebrow={str(branchesHead, "eyebrow")} title={str(branchesHead, "title")} subtitle={str(branchesHead, "subtitle")} />
          <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-3">
              {data.branches.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setActiveBranch(i)}
                  className={`w-full rounded-2xl border p-5 text-left transition-all duration-300 ${
                    activeBranch === i
                      ? "border-cyan/45 bg-brand/12 shadow-[0_0_34px_-10px_rgba(227,32,43,0.4)]"
                      : "border-white/8 bg-white/3 hover:border-cyan/25"
                  }`}
                  aria-pressed={activeBranch === i}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-[1.02rem] font-bold text-ice">{L(b.nameEn, b.nameAm)}</h3>
                    <ChevronRight className={`h-4 w-4 text-cyan transition-transform ${activeBranch === i ? "translate-x-1" : ""}`} aria-hidden="true" />
                  </div>
                  {b.established && <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-clinic-red">{b.established}</p>}
                </button>
              ))}
            </div>
            {data.branches[activeBranch] && (
              <Reveal className="h-full">
                <div className="glass border-glow h-full rounded-2xl p-7">
                  <h3 className="h3 text-ice">{L(data.branches[activeBranch].nameEn, data.branches[activeBranch].nameAm)}</h3>
                  <ul className="mt-5 space-y-4 text-sm text-ice-dim">
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                      {L(data.branches[activeBranch].addressEn, data.branches[activeBranch].addressAm)}
                    </li>
                    {data.branches[activeBranch].phone && (
                      <li className="flex gap-3">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                        <a href={`tel:${settings.phoneIntl}`} className="transition hover:text-cyan" dir="ltr">{data.branches[activeBranch].phone}</a>
                      </li>
                    )}
                  </ul>
                  {data.branches[activeBranch].mapEmbedUrl && (
                    <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
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

      {/* team preview */}
      {data.doctors.length > 0 && (
        <section className="bg-mesh-dark grain relative section-pad">
          <div className="container-x">
            <SectionHeading eyebrow={str(teamHead, "eyebrow")} title={str(teamHead, "title")} subtitle={str(teamHead, "subtitle")} />
            <Reveal className="mt-12 text-center">
              <ButtonRed onClick={() => navigate("/doctors")}>
                {L("Meet the full team", "ሙሉውን ቡድን ይዩት")}
              </ButtonRed>
            </Reveal>
          </div>
        </section>
      )}

      {/* gallery */}
      {data.gallery.length > 0 && (
        <section className="relative section-pad bg-navy/60">
          <div className="container-x">
            <SectionHeading eyebrow={str(galleryHead, "eyebrow")} title={str(galleryHead, "title")} subtitle={str(galleryHead, "subtitle")} />
            <StaggerGroup className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {data.gallery.slice(0, 8).map((g) => (
                <StaggerItem key={g.id}>
                  <div className="group relative aspect-square overflow-hidden rounded-xl border border-white/8">
                    {g.type === "video" ? (
                      <video src={g.url} className="h-full w-full object-cover" muted loop playsInline preload="metadata" aria-label={g.alt || g.title} />
                    ) : (
                      <Image src={g.url} alt={g.alt || g.title || "Clinic facility"} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-110" />
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

      {/* stat band */}
      <section className="border-t border-white/6 bg-ink py-12">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-center">
          {[
            { value: "5+", label: L("Years of Experience", "የሥራ ዓመታት") },
            { value: "7k", label: L("Satisfied Patients", "የተሟላ ታካሚዎች") },
            { value: "2", label: L("Branches", "ቅርንጫፎች") },
          ].map((s, i) => (
            <div key={i} className="min-w-[9rem]">
              <p className="font-display text-4xl font-bold text-gradient">
                <Counter value={s.value} />
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-ice-dim">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
