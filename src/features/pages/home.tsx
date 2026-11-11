"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight, CalendarCheck, Check, PhoneCall,
} from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { HeroScene } from "@/components/site/hero-scene";
import { ButtonGhost, ButtonRed, EcgDivider, IconFor, JsonLd, LinkUnderline, SectionHeading } from "@/components/site/bits";
import { Counter, Reveal, SplitWords, StaggerGroup, StaggerItem, easeOut } from "@/components/site/motion";
import {
  DoctorsCarousel, FaqAccordion, PackageCard, PostCard, ServiceListRow, StatBand, TestimonialSlider,
} from "@/components/site/cards";
import { list, str } from "@/lib/content-schema";
import type { SectionData } from "@/lib/content-schema";
import type { ServiceDTO } from "@/lib/site-types";

export default function HomePage() {
  const { data, settings, section, visible, locale, navigate, scrollToId, t, L } = useSite();
  const [activeService, setActiveService] = useState<string | null>(null);
  const hero = section("home", "hero");
  const trust = section("home", "trust");
  const pillars = section("home", "pillars");
  const aboutTeaser = section("home", "about");
  const journey = section("home", "journey");
  const servicesHead = section("home", "services");
  const why = section("home", "why");
  const doctorsHead = section("home", "doctors");
  const packagesHead = section("home", "packages");
  const testimonialsHead = section("home", "testimonials");
  const ctaHelp = section("home", "ctaHelp");
  const blogHead = section("home", "blog");
  const faqHead = section("home", "faq");
  const finalCta = section("home", "final");

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.slice(0, 6).map((f) => ({
      "@type": "Question",
      name: locale === "am" && f.questionAm ? f.questionAm : f.questionEn,
      acceptedAnswer: { "@type": "Answer", text: locale === "am" && f.answerAm ? f.answerAm : f.answerEn },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden" aria-label="Introduction">
        {/* background */}
        {settings.heroVideo ? (
          <VideoBackground src={settings.heroVideo} poster={settings.heroPoster} />
        ) : (
          <HeroScene posterUrl={settings.heroPoster} />
        )}

        <div className="container-x relative z-10 pb-32 pt-40 sm:pt-36">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
            className="max-w-3xl"
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } } }}
              className="eyebrow mb-6 inline-flex items-center gap-3 text-porcelain/70"
            >
              <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-crimson" aria-hidden="true" />
              {str(hero, "badge")}
            </motion.p>

            <h1 className="h-display text-porcelain">
              <SplitWords text={str(hero, "title")} delay={0.1} />
              <br />
              <span className="word-accent">
                <SplitWords text={str(hero, "titleAccent")} delay={0.35} />
              </span>
            </h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } } }}
              className="lead lead-on-dark mt-6 max-w-xl"
            >
              {str(hero, "subtitle")}
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } } }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <ButtonRed onClick={() => navigate("/book")}>
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {str(hero, "ctaPrimary")}
              </ButtonRed>
              <ButtonGhost onDark onClick={() => scrollToId("home-services")}>
                {str(hero, "ctaSecondary")}
              </ButtonGhost>
            </motion.div>

            {/* stats — serif numerals over a hairline */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } } }}
              className="mt-14"
            >
              <div className="rule rule-on-dark mb-6 max-w-xl" aria-hidden="true" />
              <div className="flex flex-wrap gap-x-10 gap-y-6">
                {list(hero, "stats").map((s, i) => (
                  <div key={i} className="min-w-[7.5rem]">
                    <p className="num-serif text-[2.3rem] leading-none text-porcelain">
                      <Counter value={str(s as SectionData, "value")} />
                    </p>
                    <p className="mt-1.5 max-w-[9rem] text-[0.7rem] font-semibold uppercase leading-snug tracking-[0.14em] text-porcelain/55">
                      {str(s as SectionData, "label")}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* scroll cue — hairline + serif numeral, no glow */}
        <motion.button
          onClick={() => scrollToId("home-trust")}
          className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2.5 text-porcelain/50 transition hover:text-porcelain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          aria-label={str(hero, "scrollHint") || t("hero.scroll")}
        >
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.3em]">{str(hero, "scrollHint") || t("hero.scroll")}</span>
          <span className="relative block h-9 w-px overflow-hidden bg-porcelain/20" aria-hidden="true">
            <motion.span
              className="absolute inset-x-0 top-0 h-3 bg-crimson"
              animate={settings.preloaderEnabled ? { y: [-12, 36] } : {}}
              transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </motion.button>
      </section>

      {/* ═══════════ TRUST MARQUEE — quiet ink strip ═══════════ */}
      {visible("home", "trust") && (
        <div id="home-trust" className="relative border-y border-porcelain/10 bg-ink py-5" aria-hidden="true">
          <div className="overflow-hidden">
            <div className="marquee-track gap-12">
              {[...list(trust, "chips"), ...list(trust, "chips")].map((chip, i) => (
                <span key={i} className="flex items-center gap-12 whitespace-nowrap text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-porcelain/45">
                  {str(chip as SectionData, "text")}
                  <span className="inline-block h-1 w-1 rounded-full bg-crimson" />
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ THREE PILLARS — numbered editorial columns ═══════════ */}
      {visible("home", "pillars") && (
        <section className="bg-porcelain-deep relative section-pad" aria-labelledby="pillars-title">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <SectionHeading index="01" eyebrow={str(pillars, "eyebrow")} title={str(pillars, "title")} subtitle={str(pillars, "subtitle")} emphasizeLast />
            </div>
            <StaggerGroup className="mt-16 grid gap-10 md:grid-cols-3 md:gap-0">
              {list(pillars, "items").map((item, i) => (
                <StaggerItem key={i} className={i > 0 ? "md:border-l md:border-ink/12 md:pl-10" : ""}>
                  <div className="group h-full md:pr-10">
                    <div className="flex items-center justify-between border-t border-ink/15 pt-6">
                      <span className="num-serif text-sm text-crimson">{String(i + 1).padStart(2, "0")}</span>
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/12 text-ink/70 transition-colors duration-500 group-hover:border-crimson/40 group-hover:text-crimson">
                        <IconFor name={str(item as SectionData, "icon")} className="h-5 w-5" />
                      </span>
                    </div>
                    <h3 id={i === 0 ? "pillars-title" : undefined} className="h3 mt-6 text-ink">{str(item as SectionData, "title")}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-stone-deep">{str(item as SectionData, "text")}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* ═══════════ ABOUT TEASER — asymmetric, arch image ═══════════ */}
      {visible("home", "about") && (
        <section className="bg-bone-flat relative overflow-hidden section-pad" aria-labelledby="about-teaser-title">
          <div className="container-x grid items-center gap-14 lg:grid-cols-12">
            <Reveal className="relative lg:col-span-7">
              <div className="arch relative aspect-[4/4.4] overflow-hidden bg-porcelain shadow-warm sm:aspect-[4/3.4]">
                <Image
                  src={(str(aboutTeaser, "image") || "/img/about-teaser.jpg")}
                  alt={L("Universe Medical Center clinic", "ዩኒቨርስ ሜዲካል ሴንተር")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
              {/* offset crimson hairline detail */}
              <div className="absolute -left-4 top-10 hidden h-40 w-px bg-crimson/50 lg:block" aria-hidden="true" />
              <div className="float-y absolute -bottom-6 right-8 bg-porcelain px-5 py-3 shadow-warm-sm">
                <span className="flex items-center gap-2 text-xs font-bold text-ink">
                  <span className="pulse-dot h-2 w-2 rounded-full bg-crimson" aria-hidden="true" />
                  {list(aboutTeaser, "chips")[2] && str(list(aboutTeaser, "chips")[2] as SectionData, "text")}
                </span>
              </div>
            </Reveal>

            <div className="lg:col-span-5 lg:pl-4">
              <Reveal>
                <p className="eyebrow mb-4 inline-flex items-center gap-3 text-stone-deep">
                  <span className="num-serif text-[0.85rem] text-crimson">02</span>
                  <span className="inline-block h-px w-9 bg-ink/20" aria-hidden="true" />
                  {str(aboutTeaser, "eyebrow")}
                </p>
              </Reveal>
              <h2 id="about-teaser-title" className="h1 text-ink">
                <SplitWords text={str(aboutTeaser, "title")} />
              </h2>
              <Reveal delay={0.12}>
                <p className="mt-5 leading-relaxed text-stone-deep">{str(aboutTeaser, "text")}</p>
              </Reveal>
              <Reveal delay={0.18}>
                <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
                  {list(aboutTeaser, "stats").map((s, i) => (
                    <div key={i} className={i > 0 ? "sm:border-l sm:border-ink/12 sm:pl-4" : ""}>
                      <p className="num-serif text-[1.9rem] leading-none text-crimson">
                        <Counter value={str(s as SectionData, "value")} />
                      </p>
                      <p className="mt-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-stone-deep">{str(s as SectionData, "label")}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="mt-9 flex flex-wrap items-center gap-6">
                  <ButtonRed onClick={() => navigate("/about")}>{str(aboutTeaser, "ctaLabel")}</ButtonRed>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {list(aboutTeaser, "chips").slice(0, 2).map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-2 text-xs font-semibold text-ink/70">
                        <Check className="h-3.5 w-3.5 text-scrub" aria-hidden="true" />
                        {str(c as SectionData, "text")}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ PATIENT JOURNEY — crimson ECG timeline ═══════════ */}
      {visible("home", "journey") && <JourneyEcg data={journey} />}

      {/* ═══════════ SERVICES — editorial list with image preview ═══════════ */}
      {visible("home", "services") && (
        <section id="home-services" className="bg-porcelain-flat relative section-pad" aria-labelledby="services-title">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <SectionHeading index="03" eyebrow={str(servicesHead, "eyebrow")} title={str(servicesHead, "title")} subtitle={str(servicesHead, "subtitle")} emphasizeLast />
              <Reveal delay={0.1} className="hidden lg:block">
                <LinkUnderline href="/services">{t("common.viewAll")}</LinkUnderline>
              </Reveal>
            </div>

            <div className="relative mt-14">
              {/* hover image preview (desktop) */}
              <ServicePreview active={data.services.find((s) => s.slug === activeService)} />

              <div className="flex flex-col">
                {data.services.map((s, i) => (
                  <Reveal key={s.id} delay={i * 0.04}>
                    <ServiceRowWithMobileImage
                      service={s}
                      index={i}
                      onHover={setActiveService}
                      active={activeService === s.slug}
                    />
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal className="mt-10 lg:hidden">
              <ButtonGhost onClick={() => navigate("/services")}>
                {t("common.viewAll")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonGhost>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════ WHY CHOOSE US — the calm scrub section ═══════════ */}
      {visible("home", "why") && (
        <section className="grain relative section-pad" style={{ background: "linear-gradient(165deg, #14403B 0%, #0F312D 100%)" }} aria-labelledby="why-title">
          <div className="container-x on-dark">
            <SectionHeading dark index="04" eyebrow={str(why, "eyebrow")} title={str(why, "title")} subtitle={str(why, "subtitle")} emphasizeLast />
            <StaggerGroup className="mt-16 grid gap-x-12 md:grid-cols-2">
              {list(why, "items").map((item, i) => (
                <StaggerItem key={i} className="border-t border-porcelain/12 py-6">
                  <div className="group flex gap-5">
                    <span className="num-serif pt-1 text-sm text-porcelain/45" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-display text-[1.08rem] tracking-tight text-porcelain">{str(item as SectionData, "title")}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-porcelain/65">{str(item as SectionData, "text")}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* ═══════════ DOCTORS ═══════════ */}
      {visible("home", "doctors") && data.doctors.length > 0 && (
        <section className="bg-porcelain-deep relative section-pad" aria-labelledby="doctors-title">
          <div className="container-x">
            <SectionHeading index="05" eyebrow={str(doctorsHead, "eyebrow")} title={str(doctorsHead, "title")} subtitle={str(doctorsHead, "subtitle")} emphasizeLast />
            <div className="mt-12">
              <DoctorsCarousel doctors={data.doctors} />
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ PACKAGES TEASER — graphite ═══════════ */}
      {visible("home", "packages") && data.packages.length > 0 && (
        <section className="bg-graphite-flat relative section-pad" aria-labelledby="packages-title">
          <div className="container-x on-dark">
            <SectionHeading dark index="06" eyebrow={str(packagesHead, "eyebrow")} title={str(packagesHead, "title")} subtitle={str(packagesHead, "subtitle")} emphasizeLast />
            <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.packages.slice(0, 3).map((p) => (
                <StaggerItem key={p.id} className="h-full [&_.paper-card]:bg-[#232022] [&_.paper-card]:border-porcelain/10">
                  <PackageCard pkg={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
            <Reveal className="mt-10">
              <ButtonGhost onDark onClick={() => navigate("/packages")}>
                {t("common.viewAll")}
              </ButtonGhost>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════ TESTIMONIALS — bone ═══════════ */}
      {visible("home", "testimonials") && data.testimonials.length > 0 && (
        <section className="bg-bone-flat relative section-pad">
          <div className="container-x">
            <SectionHeading index="07" eyebrow={str(testimonialsHead, "eyebrow")} title={str(testimonialsHead, "title")} subtitle={str(testimonialsHead, "subtitle")} emphasizeLast />
            <div className="mt-12">
              <TestimonialSlider items={data.testimonials} />
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ CALL FOR HELP — oxblood plate ═══════════ */}
      {visible("home", "ctaHelp") && (
        <section className="relative section-pad">
          <div className="container-x">
            <Reveal>
              <div className="grain relative overflow-hidden rounded-2xl p-8 shadow-plate sm:p-12 lg:p-16" style={{ background: "linear-gradient(140deg, #2a1015 0%, #4A0F18 60%, #360c13 100%)" }}>
                <div className="on-dark relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
                  <div>
                    <h2 className="h1 text-porcelain">{str(ctaHelp, "title")}</h2>
                    <ul className="mt-7 grid gap-3.5 sm:grid-cols-2">
                      {list(ctaHelp, "bullets").map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-porcelain/80">
                          <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-crimson" aria-hidden="true" />
                          {str(b as SectionData, "text")}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col items-center gap-5 rounded-xl border border-porcelain/12 bg-ink/40 p-8 text-center">
                    <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full border border-crimson/50">
                      <span className="pulse-dot absolute inset-0 rounded-full bg-crimson/12" aria-hidden="true" />
                      <PhoneCall className="relative h-6 w-6 text-crimson" aria-hidden="true" />
                    </span>
                    <p className="num-serif text-3xl text-porcelain" dir="ltr">{str(ctaHelp, "phone")}</p>
                    <ButtonRed href={`tel:${settings.phoneIntl}`} arrow={false}>
                      <PhoneCall className="h-4 w-4" aria-hidden="true" />
                      {str(ctaHelp, "buttonLabel")}
                    </ButtonRed>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════ BLOG TEASER ═══════════ */}
      {visible("home", "blog") && data.posts.length > 0 && (
        <section className="bg-porcelain-flat relative border-t border-ink/10 section-pad">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <SectionHeading index="08" eyebrow={str(blogHead, "eyebrow")} title={str(blogHead, "title")} subtitle={str(blogHead, "subtitle")} emphasizeLast />
              <Reveal delay={0.1} className="hidden lg:block">
                <LinkUnderline href="/blog">{t("common.viewAll")}</LinkUnderline>
              </Reveal>
            </div>
            <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.posts.slice(0, 3).map((p) => (
                <StaggerItem key={p.id} className="h-full">
                  <PostCard post={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* ═══════════ FAQ ═══════════ */}
      {visible("home", "faq") && data.faqs.length > 0 && (
        <section className="bg-porcelain-deep relative border-t border-ink/10 section-pad">
          <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <SectionHeading align="left" index="09" eyebrow={str(faqHead, "eyebrow")} title={str(faqHead, "title")} subtitle={str(faqHead, "subtitle")} emphasizeLast />
              <Reveal delay={0.15} className="mt-7">
                <LinkUnderline href="/resources">{L("All patient resources", "ሁሉም የታካሚ መረጃ")}</LinkUnderline>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <FaqAccordion faqs={data.faqs.slice(0, 5)} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════ FINAL CTA — ink vignette ═══════════ */}
      {visible("home", "final") && (
        <section className="bg-ink-vignette grain on-dark relative overflow-hidden section-pad">
          <div className="container-x relative text-center">
            <h2 className="h-display mx-auto max-w-3xl text-porcelain">
              <SplitWords text={str(finalCta, "title")} />
            </h2>
            <Reveal delay={0.14}>
              <p className="lead lead-on-dark mx-auto mt-5 max-w-xl">{str(finalCta, "text")}</p>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <ButtonRed onClick={() => navigate("/book")}>
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  {str(finalCta, "ctaPrimary")}
                </ButtonRed>
                <ButtonGhost onDark href={`tel:${settings.phoneIntl}`}>
                  <PhoneCall className="h-4 w-4" aria-hidden="true" />
                  {str(finalCta, "ctaSecondary")}
                </ButtonGhost>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}

/* ── service row with mobile inline image ─────────────────── */

function ServiceRowWithMobileImage({
  service, index, onHover, active,
}: {
  service: ServiceDTO;
  index: number;
  onHover?: (slug: string | null) => void;
  active?: boolean;
}) {
  return (
    <div>
      <ServiceListRow service={service} index={index} onHover={onHover} active={active} />
      {service.image && (
        <div className="arch-sm relative mb-6 aspect-[16/8] overflow-hidden bg-bone md:hidden">
          <Image src={service.image} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      )}
    </div>
  );
}

/* ── desktop hover preview panel for the services list ───── */

function ServicePreview({ active }: { active: ServiceDTO | undefined }) {
  const show = !!active?.image;
  return (
    <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-[24rem] items-center justify-center lg:flex" aria-hidden="true">
      <motion.div
        className="relative h-72 w-full"
        animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.96, rotate: show ? -1.5 : 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        {show && (
          <div className="arch-sm absolute inset-0 overflow-hidden shadow-warm">
            <Image key={active!.slug} src={active!.image} alt="" fill sizes="24rem" className="object-cover" />
            <div className="absolute inset-0 ring-1 ring-inset ring-ink/10" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ── video background with graceful fallback ─────────────── */

function VideoBackground({ src, poster }: { src: string; poster: string }) {
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setFailed(true);
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    if (conn && (conn.saveData || (conn.effectiveType && /^(slow-2g|2g)$/.test(conn.effectiveType)))) setFailed(true);
  }, []);

  if (failed) {
    return <HeroScene posterUrl={poster} />;
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster || undefined}
        onError={() => setFailed(true)}
      >
        <source src={src} />
      </video>
      {/* ink → oxblood cinematic overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(17,16,18,0.94) 0%, rgba(17,16,18,0.78) 36%, rgba(42,16,21,0.5) 66%, rgba(74,15,24,0.4) 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
}

/* ── patient journey: crimson ECG timeline (GSAP ScrollTrigger) ── */

function JourneyEcg({ data }: { data: SectionData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const desktopPathRef = useRef<SVGPathElement>(null);
  const mobilePathRef = useRef<SVGPathElement>(null);
  const steps = list(data, "steps");
  const count = Math.max(steps.length, 1);

  // build an ECG path with a QRS spike at each node
  const buildPath = (w: number, n: number, base: number, pad = 10) => {
    const seg = (w - pad * 2) / n;
    let d = `M0 ${base} H${pad + seg * 0.18}`;
    for (let i = 0; i < n; i++) {
      const cx = pad + seg * (i + 0.5);
      d += ` L${cx - seg * 0.14} ${base}`;
      d += ` l${seg * 0.045} ${-base * 0.34}`;
      d += ` l${seg * 0.055} ${base * 0.72}`;
      d += ` l${seg * 0.045} ${-base * 0.86}`;
      d += ` l${seg * 0.045} ${base * 0.48}`;
      d += ` L${cx + seg * 0.3} ${base}`;
      const nextStop = i < n - 1 ? pad + seg * (i + 1.5) - seg * 0.14 : w;
      d += ` L${nextStop} ${base}`;
    }
    return d;
  };

  const desktopPath = useMemo(() => buildPath(1200, count, 80), [count]);
  const mobilePath = useMemo(() => buildPathVertical(count, 1000, 30, 13), [count]);

  // vertical ECG for mobile: a pulse mark at each node
  function buildPathVertical(n: number, h: number, x: number, amp = 13) {
    const seg = h / n;
    let d = `M${x} 0 L${x} ${seg * 0.5 - amp * 1.4}`;
    for (let i = 0; i < n; i++) {
      const cy = seg * (i + 0.5);
      d += ` L${x} ${cy - amp * 1.4}`;
      d += ` l${amp} ${amp * 0.6}`;
      d += ` l${-amp * 1.6} ${amp * 1.15}`;
      d += ` l${amp * 1.6} ${amp * 1.15}`;
      d += ` l${-amp} ${amp * 0.6}`;
      const next = i < n - 1 ? seg * (i + 1.5) - amp * 1.4 : h;
      d += ` L${x} ${next}`;
    }
    return d;
  }

  useEffect(() => {
    if (!steps.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const paint = (
        path: SVGPathElement | null,
        container: HTMLElement | null,
        p: number
      ) => {
        if (!path || !container) return;
        const len = path.getTotalLength();
        path.style.strokeDasharray = String(len);
        path.style.strokeDashoffset = String(len * (1 - p));
        const nodes = container.querySelectorAll<HTMLElement>(".ecg-node");
        const idx = Math.min(nodes.length - 1, Math.floor(p * nodes.length * 1.0001));
        nodes.forEach((node, i) => {
          node.classList.toggle("is-active", i <= idx);
          node.classList.toggle("is-current", i === idx);
        });
      };

      ctx = gsap.context(() => {
        const isDesktop = window.innerWidth >= 1024;
        const triggerEl = isDesktop ? desktopRef.current : mobileRef.current;
        const pathEl = isDesktop ? desktopPathRef.current : mobilePathRef.current;
        if (!triggerEl) return;

        if (isDesktop) {
          ScrollTrigger.create({
            trigger: triggerEl,
            start: "top top",
            end: `+=${Math.max(1500, count * 420)}`,
            pin: true,
            scrub: 0.6,
            onUpdate: (self) => paint(pathEl, triggerEl, self.progress),
          });
          paint(pathEl, triggerEl, 0);
        } else {
          ScrollTrigger.create({
            trigger: triggerEl,
            start: "top 78%",
            end: "bottom 55%",
            scrub: 0.6,
            onUpdate: (self) => paint(pathEl, triggerEl, self.progress),
          });
        }
      }, sectionRef.current ?? undefined);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [steps.length, count]);

  return (
    <section className="relative" aria-labelledby="journey-title" ref={sectionRef}>
      {/* ── desktop: pinned horizontal ECG ── */}
      <div ref={desktopRef} className="bg-ink-vignette grain on-dark relative hidden min-h-screen items-center overflow-hidden lg:flex">
        <div className="container-x relative w-full py-20">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading dark eyebrow={str(data, "eyebrow")} title={str(data, "title")} subtitle={str(data, "subtitle")} emphasizeLast />
            <p className="flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-porcelain/45">
              <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-crimson" aria-hidden="true" />
              ECG · {str(data, "eyebrow")}
            </p>
          </div>

          {/* timeline */}
          <div className="relative mt-16">
            <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className="h-40 w-full" aria-hidden="true">
              <path d={desktopPath} fill="none" stroke="rgba(247,244,239,0.14)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <path
                ref={desktopPathRef}
                d={desktopPath}
                fill="none"
                stroke="#E3202B"
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* nodes + text columns */}
            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
              {steps.map((step, i) => (
                <div key={i} className="ecg-node relative" data-step={i}>
                  {/* node dot sits on the baseline (middle of the 160-viewBox svg) */}
                  <span
                    className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-porcelain/25 bg-ink transition-all duration-500"
                    aria-hidden="true"
                  >
                    <span className="absolute inset-[3px] rounded-full bg-crimson opacity-0 transition-opacity duration-500" />
                  </span>
                  {/* text above or below, alternating */}
                  <div
                    className={
                      i % 2 === 0
                        ? "absolute bottom-[62%] left-1/2 w-56 -translate-x-1/2 text-center"
                        : "absolute left-1/2 top-[62%] w-56 -translate-x-1/2 text-center"
                    }
                  >
                    <p className="num-serif text-[1.6rem] leading-none text-porcelain/30 transition-colors duration-500">
                      <span className="node-num">{String(i + 1).padStart(2, "0")}</span>
                    </p>
                    <h3 className="mt-2 font-display text-[1.05rem] tracking-tight text-porcelain/85 transition-colors duration-500">
                      <span className="node-title">{str(step as SectionData, "title")}</span>
                    </h3>
                    <p className="mt-1.5 text-[0.8rem] leading-relaxed text-porcelain/50 transition-colors duration-500">
                      <span className="node-text">{str(step as SectionData, "text")}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* node activation styles (desktop) */}
        <style>{`
          .ecg-node.is-active > span > span { opacity: 1; }
          .ecg-node.is-active { --on: 1; }
          .ecg-node.is-active .node-num { color: #E3202B; }
          .ecg-node.is-active .node-title { color: #F7F4EF; }
          .ecg-node.is-active .node-text { color: rgba(247,244,239,0.72); }
          .ecg-node.is-current > span { border-color: #E3202B; transform: translate(-50%,-50%) scale(1.35); }
        `}</style>
      </div>

      {/* ── mobile: vertical ECG with scrub draw ── */}
      <div ref={mobileRef} className="bg-ink-vignette grain on-dark relative section-pad lg:hidden">
        <div className="container-x">
          <SectionHeading dark eyebrow={str(data, "eyebrow")} title={str(data, "title")} subtitle={str(data, "subtitle")} emphasizeLast />
          <div className="relative mt-12 pl-16">
            {/* vertical line */}
            <svg viewBox="0 0 60 1000" preserveAspectRatio="none" className="absolute bottom-4 left-5 top-4 h-[calc(100%-2rem)] w-[42px]" aria-hidden="true">
              <path d={mobilePath} fill="none" stroke="rgba(247,244,239,0.14)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <path
                ref={mobilePathRef}
                d={mobilePath}
                fill="none"
                stroke="#E3202B"
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <ol className="space-y-10">
              {steps.map((step, i) => (
                <Reveal as="li" key={i} delay={i * 0.05} className="ecg-node relative flex items-start gap-4" data-step={i}>
                  <span
                    className="absolute -left-[3.65rem] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-porcelain/25 bg-ink transition-all duration-500"
                    aria-hidden="true"
                  >
                    <span className="h-[5px] w-[5px] rounded-full bg-crimson opacity-0 transition-opacity duration-500" />
                  </span>
                  <div className="pt-0.5">
                    <p className="num-serif text-[1.35rem] leading-none text-porcelain/35 transition-colors duration-500">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 font-display text-[1.15rem] tracking-tight text-porcelain">{str(step as SectionData, "title")}</h3>
                    <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-porcelain/60">{str(step as SectionData, "text")}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
