"use client";

import React, { useMemo, useState } from "react";
import { CalendarCheck, Languages, Award, X } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonRed, PageHero, SectionHeading, JsonLd } from "@/components/site/bits";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion";
import { DoctorCard } from "@/components/site/cards";
import { str } from "@/lib/content-schema";
import type { DoctorDTO } from "@/lib/site-types";
import { cn } from "@/lib/utils";

export default function DoctorsPage() {
  const { data, section, L, locale } = useSite();
  const hero = section("doctors", "hero");
  const note = section("doctors", "note");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<DoctorDTO | null>(null);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    data.doctors.forEach((d) => set.add(locale === "am" && d.specialtyAm ? d.specialtyAm : d.specialtyEn));
    return [...set];
  }, [data.doctors, locale]);

  const filtered = filter === "all"
    ? data.doctors
    : data.doctors.filter((d) => (locale === "am" && d.specialtyAm ? d.specialtyAm : d.specialtyEn) === filter);

  const physicianSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: data.doctors.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Physician",
        name: d.nameEn,
        medicalSpecialty: d.specialtyEn,
        knowsLanguage: d.languages.split(",").map((l) => l.trim()),
      },
    })),
  };

  return (
    <>
      <JsonLd data={physicianSchema} />
      <PageHero title={str(hero, "title")} subtitle={str(hero, "subtitle")} crumb={L("Doctors", "ሐኪሞች")} />

      <section className="border-t border-ink/12 bg-porcelain-flat grain relative section-pad">
        <div className="container-x">
          <SectionHeading
            eyebrow={L("Our physicians", "የእኛ ሐኪሞች")}
            title={L("Specialists you can trust", "የሚታመኑ ሐኪሞች")}
            index="01"
            emphasizeLast
          />

          {/* filters */}
          {specialties.length > 1 && (
            <Reveal className="mb-10 mt-10 flex flex-wrap gap-2.5">
              <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
                {L("All specialties", "ሁሉም ስፔሻሊስቶች")}
              </FilterChip>
              {specialties.map((s) => (
                <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
                  {s}
                </FilterChip>
              ))}
            </Reveal>
          )}

          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((d) => (
              <StaggerItem key={d.id} className="h-full">
                <button onClick={() => setSelected(d)} className="block h-full w-full text-left" aria-label={`${d.nameEn} — view profile`}>
                  <DoctorCard doctor={d} />
                </button>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {filtered.length === 0 && (
            <p className="mt-10 text-center text-stone-deep">{L("No profiles in this specialty yet.", "በዚህ ስፔሻሊስት ገና መገለጫ የለም።")}</p>
          )}

          {/* placeholder notice */}
          <Reveal className="mx-auto mt-16 max-w-2xl">
            <div className="rounded-[14px] border border-ink/12 bg-bone-flat px-6 py-7 text-center shadow-warm-sm">
              <span className="mx-auto mb-4 block h-px w-10 bg-crimson" aria-hidden="true" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-ink">{str(note, "title")}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-deep">{str(note, "text")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* profile modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[150] flex items-end justify-center bg-ink/80 p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={selected.nameEn}
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-ink/12 bg-paper p-8 shadow-warm sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="num-serif flex h-16 w-16 items-center justify-center rounded-full border border-ink/12 bg-bone text-xl text-ink/80" aria-hidden="true">
                  {selected.nameEn.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <div>
                  <h2 className="h3 text-ink">{L(selected.nameEn, selected.nameAm)}</h2>
                  <p className="mt-0.5 text-sm font-semibold text-crimson">{L(selected.specialtyEn, selected.specialtyAm)}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:border-crimson hover:text-crimson" aria-label="Close profile">
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              {selected.credentials && (
                <div className="flex gap-3">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-scrub" aria-hidden="true" />
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-stone-deep">{L("Credentials", "ማስረጃዎች")}</dt>
                    <dd className="mt-0.5 text-ink/80">{selected.credentials}</dd>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Languages className="mt-0.5 h-4 w-4 shrink-0 text-scrub" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-stone-deep">{L("Languages", "ቋንቋዎች")}</dt>
                  <dd className="mt-0.5 text-ink/80">{selected.languages}</dd>
                </div>
              </div>
            </dl>

            {(selected.bioEn || selected.bioAm) && (
              <p className="mt-5 border-t border-ink/10 pt-5 text-sm leading-relaxed text-stone-deep">
                {L(selected.bioEn, selected.bioAm)}
              </p>
            )}

            {selected.isPlaceholder && (
              <p className="mt-4 rounded-[10px] border border-stone/30 bg-bone px-4 py-2.5 text-xs text-stone-deep">
                {L("Placeholder profile — details will be confirmed and published by the clinic.", "ናሙና መገለጫ ነው — ክሊኒኩ ሲያረጋግጥ ይታወቃል።")}
              </p>
            )}

            <ButtonRed
              arrow={false}
              className="mt-6 w-full"
              onClick={() => {
                try {
                  window.sessionStorage.setItem("umc-prefill-doctor", selected.id);
                } catch {
                  /* ignore */
                }
                setSelected(null);
                window.location.hash = "#/book";
              }}
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              {L("Book with this doctor", "ከዚህ ሐኪም ይያዙ")}
            </ButtonRed>
          </div>
        </div>
      )}
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-[10px] border px-4 py-2 text-xs font-semibold tracking-wide transition-colors",
        active
          ? "border-crimson bg-crimson/8 text-ink"
          : "border-ink/15 bg-paper text-stone-deep hover:border-ink/40 hover:text-ink"
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
