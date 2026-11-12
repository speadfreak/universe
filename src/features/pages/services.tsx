"use client";

import React from "react";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonRed, GlassCard, IconFor, PageHero, SectionHeading } from "@/components/site/bits";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion";
import { str } from "@/lib/content-schema";

export default function ServicesPage() {
  const { data, section, L, navigate } = useSite();
  const hero = section("services", "hero");
  const intro = section("services", "intro");

  return (
    <>
      <PageHero title={str(hero, "title")} subtitle={str(hero, "subtitle")} slot="hero.services" crumb={L("Services", "አገልግሎቶች")} />

      <section className="bg-mesh-dark grain relative section-pad">
        <div className="container-x">
          <SectionHeading title={str(intro, "title")} subtitle={str(intro, "text")} />
          <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.services.map((s) => (
              <StaggerItem key={s.id} className="h-full">
                <GlassCard className="group flex h-full flex-col">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan/20 bg-gradient-to-br from-brand/25 to-cyan/10 text-cyan">
                    <IconFor name={s.icon} className="h-6 w-6" />
                  </div>
                  <h2 className="h3 text-ice">{L(s.titleEn, s.titleAm)}</h2>
                  {s.taglineEn && <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan/80">{L(s.taglineEn, s.taglineAm)}</p>}
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ice-dim">{L(s.excerptEn, s.excerptAm)}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-5">
                    <button
                      onClick={() => navigate(`/services/${s.slug}`)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan transition group-hover:gap-3"
                    >
                      {L("Explore service", "አገልግሎቱን ይመልከቱ")}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal className="mt-14">
            <div className="glass border-glow mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-3xl p-9 text-center">
              <h2 className="h3 text-ice">{L("Not sure which service you need?", "የትኛው አገልግሎት እንደሚያስፈልግዎ አላወቁም?")}</h2>
              <p className="text-sm text-ice-dim">
                {L("Our reception team will guide you to the right specialist in minutes.", "የመቀበያ ቡድናችን በደቂቃዎች ውስጥ ወደሚመጥን ስፔሻሊስት ይመራዎታል።")}
              </p>
              <ButtonRed onClick={() => navigate("/book")}>
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {L("Book a consultation", "ምክክር ይያዙ")}
              </ButtonRed>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
