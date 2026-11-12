"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, BadgeCheck, CalendarCheck, ChevronDown, CheckCircle2, PhoneCall,
} from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { PageBackdrop } from "@/components/site/page-backdrop";
import { ButtonGlass, ButtonRed, GlassCard, IconFor, JsonLd, SectionHeading } from "@/components/site/bits";
import { Counter, Reveal, SplitWords, StaggerGroup, StaggerItem, easeOut } from "@/components/site/motion";
import {
  DoctorsCarousel, FaqAccordion, PackageCard, PostCard, ServiceCard, TestimonialSlider,
} from "@/components/site/cards";
import { list, str } from "@/lib/content-schema";
import type { SectionData } from "@/lib/content-schema";

export default function HomePage() {
  const { data, settings, section, visible, locale, navigate, scrollToId, t, L } = useSite();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 110]);
  const heroOpacity = useTransform(heroScroll, [0, 0.9], [1, 0.15]);
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

      {/* ═══════════ HERO — care in action (video or photographic backdrop) ═══════════ */}
      <section ref={heroRef} className="relative flex min-h-[100svh] items-center overflow-hidden" aria-label="Introduction">
        {/* background */}
        {settings.heroVideo ? (
          <>
            <VideoBackground src={settings.heroVideo} poster={settings.heroPoster} />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/72 to-ink/25" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-ink to-transparent" aria-hidden="true" />
          </>
        ) : (
          <PageBackdrop
            config={data.backdrops?.["hero.home"]}
            slotKey="hero.home"
            priority
            edge="none"
            bottomFade
            className="absolute inset-0"
          />
        )}

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container-x relative z-10 pb-28 pt-36 sm:pt-32">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
            className="max-w-3xl"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } } }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full glass px-4 py-2 text-xs font-semibold tracking-[0.14em] text-ice/90"
            >
              <span className="pulse-dot inline-blockh h-2 w-2 rounded-full bg-clinic-red" aria-hidden="true" />
              {str(hero, "badge")}
            </motion.div>

            <h1 className="h-display text-ice">
              <SplitWords text={str(hero, "title")} delay={0.1} />
              <br />
              <span className="text-gradient">
                <SplitWords text={str(hero, "titleAccent")} delay={0.35} />
              </span>
            </h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } } }}
              className="lead mt-6 max-w-xl"
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
              <ButtonGlass onClick={() => scrollToId("home-services")}>
                {str(hero, "ctaSecondary")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonGlass>
            </motion.div>

            {/* stats — hairline-separated serif numerals over the photo */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } } }}
              className="mt-12 flex flex-wrap items-stretch gap-y-5 divide-x divide-porcelain/20 [&>div]:pl-7 [&>div]:pr-7 [&>div:first-child]:pl-0 [&>div:last-child]:pr-0"
            >
              {list(hero, "stats").map((s, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <span className="num-serif text-3xl leading-none text-ice sm:text-[2.6rem]">
                    <Counter value={str(s as SectionData, "value")} />
                  </span>
                  <span className="max-w-[8.5rem] text-[0.66rem] font-semibold uppercase leading-snug tracking-[0.16em] text-porcelain/60">
                    {str(s as SectionData, "label")}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* scroll indicator */}
        <motion.button
          onClick={() => scrollToId("home-trust")}
          className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-ice-dim transition hover:text-cyan"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          aria-label={str(hero, "scrollHint") || t("hero.scroll")}
        >
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.3em]">{str(hero, "scrollHint") || t("hero.scroll")}</span>
          <motion.span animate={settings.preloaderEnabled ? { y: [0, 7, 0] } : {}} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </motion.span>
        </motion.button>
      </section>

      {/* ═══════════ TRUST MARQUEE ═══════════ */}
      {visible("home", "trust") && (
        <div id="home-trust" className="relative border-y border-white/6 bg-navy/40 py-5" aria-hidden="true">
          <div className="overflow-hidden">
            <div className="marquee-track gap-10">
              {[...list(trust, "chips"), ...list(trust, "chips")].map((chip, i) => (
                <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.22em] text-ice-dim">
                  {str(chip as SectionData, "text")}
                  <span className="pulse-dot inline-block h1.5 w-1.5 rounded-full bg-clinic-red" />
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ THREE PILLARS ═══════════ */}
      {visible("home", "pillars") && (
        <section className="bg-mesh-dark grain relative section-pad" aria-labelledby="pillars-title">
          <div className="container-x">
            <SectionHeading eyebrow={str(pillars, "eyebrow")} title={str(pillars, "title")} subtitle={str(pillars, "subtitle")} />
            <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-3">
              {list(pillars, "items").map((item, i) => (
                <StaggerItem key={i}>
                  <GlassCard className="group h-full text-center">
                    <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan/20 bg-gradient-to-br from-brand/25 to-cyan/10 text-cyan shadow-[0_0_30px_-6px_rgba(227,32,43,0.4)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <IconFor name={str(item as SectionData, "icon")} className="h-7 w-7" />
                    </div>
                    <h3 id={i === 0 ? "pillars-title" : undefined} className="h3 text-ice">{str(item as SectionData, "title")}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-ice-dim">{str(item as SectionData, "text")}</p>
                  </GlassCard>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* ═══════════ ABOUT TEASER (bright) ═══════════ */}
      {visible("home", "about") && (
        <section className="bg-mesh-ice relative section-pad text-navy" aria-labelledby="about-teaser-title">
          <div className="container-x grid items-center gap-14 lg:grid-cols-2">
            <Reveal className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_30px_80px_-30px_rgba(17,16,18,0.45)]">
                <Image
                  src={(str(aboutTeaser, "image") || "/img/about-teaser.jpg")}
                  alt={L("Universe Medical Center clinic", "ዩኒቨርስ ሜዲካል ሴንተር")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 via-transparent to-cyan/10 mix-blend-overlay" aria-hidden="true" />
              </div>
              {/* floating chips */}
              <div className="float-y absolute -bottom-6 left-6 flex flex-wrap gap-2 rounded-2xl glass-ice p-3 shadow-xl">
                {list(aboutTeaser, "chips").slice(0, 2).map((c, i) => (
                  <span key={i} className="rounded-full bg-brand/10 px-3.5 py-1.5 text-xs font-bold text-brand">
                    {str(c as SectionData, "text")}
                  </span>
                ))}
              </div>
              <div className="float-y absolute -top-5 right-8 rounded-2xl glass-ice px-4 py-3 shadow-xl [animation-delay:1.2s]">
                <span className="flex items-center gap-2 text-xs font-bold text-navy">
                  <span className="pulse-doth h-2 w-2 rounded-full bg-clinic-red" aria-hidden="true" />
                  {list(aboutTeaser, "chips")[2] && str(list(aboutTeaser, "chips")[2] as SectionData, "text")}
                </span>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <p className="eyebrow mb-3 inline-flex items-center gap-2 text-brand">
                  <span className="inline-block h-px w-8 bg-brand/50" />
                  {str(aboutTeaser, "eyebrow")}
                </p>
              </Reveal>
              <h2 id="about-teaser-title" className="h1 text-navy">
                <SplitWords text={str(aboutTeaser, "title")} />
              </h2>
              <Reveal delay={0.12}>
                <p className="mt-5 leading-relaxed text-navy/70">{str(aboutTeaser, "text")}</p>
              </Reveal>
              <Reveal delay={0.18}>
                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {list(aboutTeaser, "stats").map((s, i) => (
                    <div key={i} className="rounded-2xl bg-white p-4 text-center shadow-[0_10px_30px_-12px_rgba(17,16,18,0.15)]">
                      <p className="font-display text-2xl font-bold text-brand">
                        <Counter value={str(s as SectionData, "value")} />
                      </p>
                      <p className="mt-1 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-navy/55">{str(s as SectionData, "label")}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <ButtonRed onClick={() => navigate("/about")}>{str(aboutTeaser, "ctaLabel")}</ButtonRed>
                  <div className="flex flex-wrap gap-2">
                    {list(aboutTeaser, "chips").slice(2).map((c, i) => (
                      <span key={i} className="rounded-full border border-navy/12 bg-white/60 px-3 py-1.5 text-xs font-semibold text-navy/70">
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

      {/* ═══════════ PATIENT JOURNEY (pinned) — full-bleed photo band ═══════════ */}
      {visible("home", "journey") && <JourneyPinned data={journey} backdrops={data.backdrops} />}

      {/* ═══════════ SERVICES GRID ═══════════ */}
      {visible("home", "services") && (
        <section id="home-services" className="bg-mesh-dark grain relative section-pad" aria-labelledby="services-title">
          <div className="container-x">
            <SectionHeading eyebrow={str(servicesHead, "eyebrow")} title={str(servicesHead, "title")} subtitle={str(servicesHead, "subtitle")} />
            <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.services.map((s, i) => (
                <StaggerItem key={s.id} className="h-full">
                  <ServiceCard service={s} index={i} />
                </StaggerItem>
              ))}
            </StaggerGroup>
            <Reveal className="mt-10 text-center">
              <ButtonGlass onClick={() => navigate("/services")}>
                {t("common.viewAll")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonGlass>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════ WHY CHOOSE US (bright) ═══════════ */}
      {visible("home", "why") && (
        <section className="bg-mesh-ice relative section-pad text-navy">
          <div className="container-x">
            <SectionHeading dark eyebrow={str(why, "eyebrow")} title={str(why, "title")} subtitle={str(why, "subtitle")} />
            <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {list(why, "items").map((item, i) => (
                <StaggerItem key={i} className="h-full">
                  <div className="group h-full rounded-2xl border border-navy/8 bg-white p-6 shadow-[0_14px_40px_-20px_rgba(17,16,18,0.25)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-20px_rgba(227,32,43,0.3)]">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand transition-transform duration-500 group-hover:scale-110">
                      <IconFor name={str(item as SectionData, "icon")} className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-[1.02rem] font-bold text-navy">{str(item as SectionData, "title")}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-navy/65">{str(item as SectionData, "text")}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* ═══════════ DOCTORS ═══════════ */}
      {visible("home", "doctors") && data.doctors.length > 0 && (
        <section className="bg-mesh-dark grain relative section-pad" aria-labelledby="doctors-title">
          <div className="container-x">
            <SectionHeading eyebrow={str(doctorsHead, "eyebrow")} title={str(doctorsHead, "title")} subtitle={str(doctorsHead, "subtitle")} />
            <div className="mt-12">
              <DoctorsCarousel doctors={data.doctors} />
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ PACKAGES TEASER ═══════════ */}
      {visible("home", "packages") && data.packages.length > 0 && (
        <section className="relative section-pad bg-navy" aria-labelledby="packages-title">
          <div className="container-x">
            <SectionHeading eyebrow={str(packagesHead, "eyebrow")} title={str(packagesHead, "title")} subtitle={str(packagesHead, "subtitle")} />
            <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.packages.slice(0, 3).map((p) => (
                <StaggerItem key={p.id} className="h-full">
                  <PackageCard pkg={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
            <Reveal className="mt-10 text-center">
              <ButtonGlass onClick={() => navigate("/packages")}>
                {t("common.viewAll")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonGlass>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      {visible("home", "testimonials") && data.testimonials.length > 0 && (
        <section className="bg-mesh-dark grain relative section-pad">
          <div className="container-x">
            <SectionHeading eyebrow={str(testimonialsHead, "eyebrow")} title={str(testimonialsHead, "title")} subtitle={str(testimonialsHead, "subtitle")} />
            <div className="mt-12">
              <TestimonialSlider items={data.testimonials} />
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ CALL FOR HELP BANNER — full-bleed photo band ═══════════ */}
      {visible("home", "ctaHelp") && (
        <section className="relative section-pad">
          <div className="container-x">
            <Reveal>
              <PageBackdrop
                config={data.backdrops?.["band.call-help"]}
                slotKey="band.call-help"
                edge="curve"
                className="overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16"
              >
                <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
                  <div>
                    <h2 className="h1 text-ice">{str(ctaHelp, "title")}</h2>
                    <ul className="mt-7 grid gap-3.5 sm:grid-cols-2">
                      {list(ctaHelp, "bullets").map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-ice/85">
                          <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-cyan" aria-hidden="true" />
                          {str(b as SectionData, "text")}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col items-center gap-5 rounded-3xl glass p-8 text-center">
                    <span className="relative inline-flex h-16 w-16 items-center justify-center">
                      <span className="absolute inset-0 rounded-full bg-clinic-red/20 animate-ping [animation-duration:1.8s]" aria-hidden="true" />
                      <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-clinic-red glow-red">
                        <PhoneCall className="h-7 w-7 text-white" aria-hidden="true" />
                      </span>
                    </span>
                    <p className="font-display text-3xl font-bold tracking-wide text-ice" dir="ltr">{str(ctaHelp, "phone")}</p>
                    <ButtonRed href={`tel:${settings.phoneIntl}`}>
                      <PhoneCall className="h-4 w-4" aria-hidden="true" />
                      {str(ctaHelp, "buttonLabel")}
                    </ButtonRed>
                  </div>
                </div>
              </PageBackdrop>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════ BLOG TEASER ═══════════ */}
      {visible("home", "blog") && data.posts.length > 0 && (
        <section className="relative section-pad bg-navy/60">
          <div className="container-x">
            <SectionHeading eyebrow={str(blogHead, "eyebrow")} title={str(blogHead, "title")} subtitle={str(blogHead, "subtitle")} />
            <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.posts.slice(0, 3).map((p) => (
                <StaggerItem key={p.id} className="h-full">
                  <PostCard post={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
            <Reveal className="mt-10 text-center">
              <ButtonGlass onClick={() => navigate("/blog")}>
                {t("common.viewAll")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonGlass>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════ FAQ TEASER ═══════════ */}
      {visible("home", "faq") && data.faqs.length > 0 && (
        <section className="bg-mesh-dark grain relative section-pad">
          <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <SectionHeading align="left" eyebrow={str(faqHead, "eyebrow")} title={str(faqHead, "title")} subtitle={str(faqHead, "subtitle")} />
              <Reveal delay={0.15} className="mt-7">
                <ButtonGlass onClick={() => navigate("/resources")}>
                  {L("All patient resources", "ሁሉም የታካሚ መረጃ")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonGlass>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <FaqAccordion faqs={data.faqs.slice(0, 5)} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════ FINAL CTA — full-bleed photo band ═══════════ */}
      {visible("home", "final") && (
        <PageBackdrop
          config={data.backdrops?.["band.final-cta"]}
          slotKey="band.final-cta"
          as="section"
          edge="curve"
          className="section-pad"
          childClassName="container-x relative text-center"
        >
          <h2 className="h-display mx-auto max-w-3xl text-ice">
            <SplitWords text={str(finalCta, "title")} />
          </h2>
          <Reveal delay={0.14}>
            <p className="lead mx-auto mt-5 max-w-xl">{str(finalCta, "text")}</p>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <ButtonRed onClick={() => navigate("/book")}>
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {str(finalCta, "ctaPrimary")}
              </ButtonRed>
              <ButtonGlass href={`tel:${settings.phoneIntl}`}>
                <PhoneCall className="h-4 w-4 text-crimson" aria-hidden="true" />
                {str(finalCta, "ctaSecondary")}
              </ButtonGlass>
            </div>
          </Reveal>
        </PageBackdrop>
      )}
    </>
  );
}

/* ── video background with graceful fallback ──────────────── */

function VideoBackground({ src, poster }: { src: string; poster: string }) {
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setFailed(true);
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    if (conn && (conn.saveData || (conn.effectiveType && /^(slow-2g|2g)$/.test(conn.effectiveType)))) setFailed(true);
  }, []);

  if (failed) {
    return (
      <div className="absolute inset-0" aria-hidden="true">
        <div className="bg-warm-drift absolute inset-0" />
      </div>
    );
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
    </div>
  );
}

/* ── pinned patient journey (desktop) + timeline (mobile) ── */

function JourneyPinned({ data, backdrops }: { data: SectionData; backdrops: Record<string, import("@/lib/backdrops").BackdropPublic> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const steps = list(data, "steps");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 1024) return;
    if (!steps.length) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const stepEls = gsap.utils.toArray<HTMLElement>(".journey-step");
        const progress = el.querySelector<HTMLElement>(".journey-progress");
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: `+=${Math.max(1600, steps.length * 520)}`,
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;
            const idx = Math.min(steps.length - 1, Math.floor(p * steps.length * 1.0001));
            stepEls.forEach((s, i) => {
              s.classList.toggle("is-active", i <= idx);
              s.classList.toggle("is-current", i === idx);
            });
            if (progress) progress.style.transform = `scaleX(${p})`;
          },
        });
      }, el);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [steps.length]);

  return (
    <section className="relative" aria-labelledby="journey-title" ref={containerRef}>
      {/* pinned desktop experience — full-bleed photographic band */}
      <PageBackdrop
        config={backdrops?.["band.journey"]}
        slotKey="band.journey"
        edge="none"
        className="hidden min-h-screen items-center bg-gradient-to-b from-ink via-oxblood/45 to-ink lg:flex"
        childClassName="container-x relative grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]"
      >
          <div>
            <p className="eyebrow mb-3 inline-flex items-center gap-2 text-cyan">
              <span className="pulse-dot inline-blockh h-2 w-2 rounded-full bg-clinic-red" aria-hidden="true" />
              {str(data, "eyebrow")}
            </p>
            <h2 id="journey-title" className="h-display text-ice">
              <SplitWords text={str(data, "title")} />
            </h2>
            <p className="lead mt-5 max-w-md">{str(data, "subtitle")}</p>
            {/* heartbeat progress rail */}
            <div className="relative mt-12 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/8">
              <div
                className="journey-progress absolute inset-0 origin-left rounded-full bg-gradient-to-r from-cyan to-brand"
                style={{ transform: "scaleX(0)" }}
                aria-hidden="true"
              />
            </div>
            <div className="mt-4 flex items-center gap-3 text-ice-dim">
              <span className="pulse-dot inline-blockh h2.5 w-2.5 rounded-full bg-clinic-red" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">ECG · your journey</span>
            </div>
          </div>

          <ol className="relative space-y-2">
            <div className="absolute bottom-6 left-[27px] top-6 w-px bg-white/8" aria-hidden="true" />
            {steps.map((step, i) => (
              <li key={i} className="journey-step relative flex gap-5 rounded-2xl p-4 opacity-30 transition-all duration-500" data-step={i}>
                <span className="relative z-10 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border border-cyan/25 bg-ink font-display text-sm font-bold text-cyan">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pt-1.5">
                  <h3 className="font-display text-lg font-bold text-ice">{str(step as SectionData, "title")}</h3>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-ice-dim">{str(step as SectionData, "text")}</p>
                </div>
                <span className="absolute right-4 top-4h h-2 w-2 rounded-full bg-clinic-red opacity-0 transition-opacity duration-500 [.is-current_&]:opacity-100" aria-hidden="true" />
              </li>
            ))}
          </ol>
      </PageBackdrop>

      {/* mobile timeline */}
      <div className="bg-mesh-dark grain section-pad lg:hidden">
        <div className="container-x">
          <SectionHeading eyebrow={str(data, "eyebrow")} title={str(data, "title")} subtitle={str(data, "subtitle")} />
          <ol className="relative mt-12 space-y-4">
            <div className="absolute bottom-6 left-[25px] top-6 w-px bg-gradient-to-b from-cyan/40 via-brand/30 to-transparent" aria-hidden="true" />
            {steps.map((step, i) => (
              <Reveal as="li" key={i} delay={i * 0.06} className="relative flex gap-4">
                <span className="relative z-10 flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border border-cyan/25 bg-ink font-display text-sm font-bold text-cyan glow-blue">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="glass flex-1 rounded-2xl p-4">
                  <h3 className="font-display text-base font-bold text-ice">{str(step as SectionData, "title")}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ice-dim">{str(step as SectionData, "text")}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
