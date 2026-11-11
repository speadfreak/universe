"use client";

import React from "react";
import { Building2, CalendarCheck } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonRed, GlassCard, PageHero, SectionHeading } from "@/components/site/bits";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion";
import { PackageCard } from "@/components/site/cards";
import { str } from "@/lib/content-schema";

export default function PackagesPage() {
  const { data, section, L, navigate } = useSite();
  const hero = section("packages", "hero");
  const corporate = section("packages", "corporate");

  return (
    <>
      <PageHero title={str(hero, "title")} subtitle={str(hero, "subtitle")} crumb={L("Packages", "ጥቅሎች")} />

      <section className="bg-mesh-dark grain relative section-pad">
        <div className="container-x">
          <StaggerGroup className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.packages.map((p) => (
              <StaggerItem key={p.id} className="h-full">
                <PackageCard pkg={p} />
              </StaggerItem>
            ))}
          </StaggerGroup>

          {data.packages.length === 0 && (
            <p className="mt-10 text-center text-ice-dim">{L("Packages are being curated — check back soon.", "ጥቅሎች በማዘጋጀት ላይ ናቸው።")}</p>
          )}

          {/* corporate */}
          <Reveal className="mt-16">
            <GlassCard className="relative overflow-hidden p-9 sm:p-12">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand/15 blur-[90px]" aria-hidden="true" />
              <div className="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
                <div>
                  <p className="eyebrow mb-3 inline-flex items-center gap-2 text-cyan">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                    {L("For organizations", "ለድርጅቶች")}
                  </p>
                  <h2 className="h2 text-ice">{str(corporate, "title")}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-ice-dim">{str(corporate, "text")}</p>
                </div>
                <div className="flex lg:justify-end">
                  <ButtonRed onClick={() => navigate("/contact")}>
                    <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                    {str(corporate, "ctaLabel")}
                  </ButtonRed>
                </div>
              </div>
            </GlassCard>
          </Reveal>

          <Reveal className="mt-10 text-center">
            <p className="text-xs text-ice-dim">
              {L("Prices and included tests are managed by the clinic and may change — confirm on booking.", "ዋጋዎች እና የሚካተቱ ምርመራዎች ሊለወጡ ይችላሉ — በማስያዝ ጊዜ ያረጋግጡ።")}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
