"use client";

import React from "react";
import { Building2, CalendarCheck } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonRed, PageHero } from "@/components/site/bits";
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

      <section className="border-t border-ink/12 bg-bone-flat grain relative section-pad">
        <div className="container-x">
          <StaggerGroup className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.packages.map((p) => (
              <StaggerItem key={p.id} className="h-full">
                <PackageCard pkg={p} />
              </StaggerItem>
            ))}
          </StaggerGroup>

          {data.packages.length === 0 && (
            <p className="mt-10 text-center text-stone-deep">{L("Packages are being curated — check back soon.", "ጥቅሎች በማዘጋጀት ላይ ናቸው።")}</p>
          )}

          <Reveal className="mt-10 text-center">
            <p className="text-xs text-stone-deep">
              {L("Prices and included tests are managed by the clinic and may change — confirm on booking.", "ዋጋዎች እና የሚካተቱ ምርመራዎች ሊለወጡ ይችላሉ — በማስያዝ ጊዜ ያረጋግጡ።")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* corporate — ink CTA band */}
      <section className="on-dark bg-ink-vignette grain relative section-pad">
        <div
          className="pointer-events-none absolute -left-32 bottom-0 hidden h-[24rem] w-[24rem] rounded-full border border-porcelain/8 lg:block"
          aria-hidden="true"
        />
        <div className="container-x relative">
          <div className="rule rule-on-dark" aria-hidden="true" />
          <Reveal className="grid items-center gap-10 pt-14 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="eyebrow mb-3 inline-flex items-center gap-2.5 text-porcelain/60">
                <Building2 className="h-4 w-4 text-crimson" aria-hidden="true" />
                {L("For organizations", "ለድርጅቶች")}
              </p>
              <h2 className="h2 text-porcelain">{str(corporate, "title")}</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-porcelain/70">{str(corporate, "text")}</p>
            </div>
            <div className="flex lg:justify-end">
              <ButtonRed onClick={() => navigate("/contact")}>
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {str(corporate, "ctaLabel")}
              </ButtonRed>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
