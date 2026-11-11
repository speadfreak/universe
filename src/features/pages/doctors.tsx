"use client";

import React, { useMemo, useState } from "react";
import { CalendarCheck, Languages, Award, X } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { PageHero, SectionHeading, GlassCard, JsonLd } from "@/components/site/bits";
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

      <section className="bg-mesh-dark grain relative section-pad">
        <div className="container-x">
          {/* filters */}
          {specialties.length > 1 && (
            <Reveal className="mb-12 flex flex-wrap justify-center gap-2.5">
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

          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((d) => (
              <StaggerItem key={d.id} className="h-full">
                <button onClick={() => setSelected(d)} className="block h-full w-full text-left" aria-label={`${d.nameEn} — view profile`}>
                  <DoctorCard doctor={d} />
                </button>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {filtered.length === 0 && (
            <p className="mt-10 text-center text-ice-dim">{L("No profiles in this specialty yet.", "በዚህ ስፔሻሊስት ገና መገለጫ የለም።")}</p>
          )}

          {/* placeholder notice */}
          <Reveal className="mx-auto mt-16 max-w-2xl">
            <div className="glass rounded-2xl border-amber-400/20 p-6 text-center">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-amber-300">{str(note, "title")}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-ice-dim">{str(note, "text")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* profile modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[150] flex items-end justify-center bg-ink/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={selected.nameEn}
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-strong max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-8 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan/30 bg-gradient-to-br from-navy-2 to-navy font-display text-xl font-bold text-cyan" aria-hidden="true">
                  {selected.nameEn.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <div>
                  <h2 className="h3 text-ice">{L(selected.nameEn, selected.nameAm)}</h2>
                  <p className="text-sm font-medium text-cyan">{L(selected.specialtyEn, selected.specialtyAm)}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-ice transition hover:border-cyan/40 hover:text-cyan" aria-label="Close profile">
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              {selected.credentials && (
                <div className="flex gap-3">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-ice-dim">{L("Credentials", "ማስረጃዎች")}</dt>
                    <dd className="mt-0.5 text-ice/85">{selected.credentials}</dd>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Languages className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-ice-dim">{L("Languages", "ቋንቋዎች")}</dt>
                  <dd className="mt-0.5 text-ice/85">{selected.languages}</dd>
                </div>
              </div>
            </dl>

            {(selected.bioEn || selected.bioAm) && (
              <p className="mt-5 border-t border-white/8 pt-5 text-sm leading-relaxed text-ice-dim">
                {L(selected.bioEn, selected.bioAm)}
              </p>
            )}

            {selected.isPlaceholder && (
              <p className="mt-4 rounded-lg border border-amber-400/25 bg-amber-400/10 px-4 py-2.5 text-xs text-amber-300">
                {L("Placeholder profile — details will be confirmed and published by the clinic.", "ናሙና መገለጫ ነው — ክሊኒኩ ሲያረጋግጥ ይታወቃል።")}
              </p>
            )}

            <button
              onClick={() => {
                try {
                  window.sessionStorage.setItem("umc-prefill-doctor", selected.id);
                } catch {
                  /* ignore */
                }
                setSelected(null);
                window.location.hash = "#/book";
              }}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-clinic-red font-display text-sm font-semibold text-white glow-red transition hover:scale-[1.02]"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              {L("Book with this doctor", "ከዚህ ሐኪም ይያዙ")}
            </button>
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
        "rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all",
        active
          ? "border-cyan/50 bg-brand/15 text-cyan shadow-[0_0_20px_-6px_rgba(227,32,43,0.45)]"
          : "border-white/10 bg-white/4 text-ice-dim hover:border-cyan/30 hover:text-ice"
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
