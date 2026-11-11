"use client";

import React from "react";
import { ArrowUpRight, CalendarCheck } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonRed, EcgDivider, PageHero, SectionHeading } from "@/components/site/bits";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion";
import { str } from "@/lib/content-schema";

export default function ServicesPage() {
  const { data, section, L, navigate } = useSite();
  const hero = section("services", "hero");
  const intro = section("services", "intro");

  return (
    <>
      <PageHero title={str(hero, "title")} subtitle={str(hero, "subtitle")} crumb={L("Services", "አገልግሎቶች")} />

      {/* editorial index — one service per hairline row, large serif names */}
      <section className="bg-porcelain-flat relative section-pad">
        <div className="container-x">
          <SectionHeading title={str(intro, "title")} subtitle={str(intro, "text")} emphasizeLast />
          <StaggerGroup className="mt-12 border-t border-ink/12 md:mt-16">
            {data.services.map((s, i) => (
              <StaggerItem key={s.id}>
                <button
                  onClick={() => navigate(`/services/${s.slug}`)}
                  className="group flex w-full items-center justify-between gap-5 border-b border-ink/12 py-6 text-left transition-colors duration-300 md:gap-10 md:py-7"
                >
                  <span className="flex min-w-0 items-baseline gap-4 md:gap-8">
                    <span className="num-serif shrink-0 text-sm text-stone-deep transition-colors duration-300 group-hover:text-crimson" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[1.4rem] tracking-[-0.015em] text-ink transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-crimson md:text-[2rem]">
                        {L(s.titleEn, s.titleAm)}
                      </span>
                      {s.taglineEn && (
                        <span className="mt-1 block text-[0.64rem] font-bold uppercase tracking-[0.2em] text-stone">
                          {L(s.taglineEn, s.taglineAm)}
                        </span>
                      )}
                      <span className="mt-1.5 block max-w-2xl text-sm leading-relaxed text-stone-deep">
                        {L(s.excerptEn, s.excerptAm)}
                      </span>
                    </span>
                  </span>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/55 transition-all duration-300 group-hover:border-crimson group-hover:bg-crimson group-hover:text-white md:h-12 md:w-12" aria-hidden="true">
                    <ArrowUpRight className="h-4 w-4 md:h-[1.15rem] md:w-[1.15rem]" />
                  </span>
                </button>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* closing CTA — ink vignette with the crimson pulse */}
      <section className="bg-ink-vignette grain on-dark relative overflow-hidden section-pad">
        <div className="container-x">
          <SectionHeading
            dark
            align="center"
            title={L("Not sure which service you need?", "የትኛው አገልግሎት እንደሚያስፈልግዎ አላወቁም?")}
            subtitle={L("Our reception team will guide you to the right specialist in minutes.", "የመቀበያ ቡድናችን በደቂቃዎች ውስጥ ወደሚመጥን ስፔሻሊስት ይመራዎታል።")}
          />
          <Reveal delay={0.15} className="mt-9">
            <EcgDivider className="mx-auto max-w-sm text-crimson" />
          </Reveal>
          <Reveal delay={0.2} className="mt-4 text-center">
            <ButtonRed onClick={() => navigate("/book")}>
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              {L("Book a consultation", "ምክክር ይያዙ")}
            </ButtonRed>
          </Reveal>
        </div>
      </section>
    </>
  );
}
