"use client";

import React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, Award, BadgeCheck, CalendarCheck, ChevronLeft, ChevronRight, Clock, Quote, Star } from "lucide-react";
import { A, useSite } from "./site-context";
import { GlassCard, IconFor } from "./bits";
import { Counter, Reveal } from "./motion";
import { cn } from "@/lib/utils";
import type { DoctorDTO, FaqDTO, PackageDTO, PostDTO, ServiceDTO, TestimonialDTO } from "@/lib/site-types";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

/* ── Service card ────────────────────────────────────────── */

export function ServiceCard({ service, index = 0 }: { service: ServiceDTO; index?: number }) {
  const { L, locale } = useSite();
  return (
    <GlassCard className="group relative flex h-full flex-col overflow-hidden">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand/10 blur-2xl transition-opacity duration-500 group-hover:opacity-150" aria-hidden="true" />
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan/20 bg-gradient-to-br from-brand/25 to-cyan/10 text-cyan">
        <IconFor name={service.icon} className="h-6 w-6" />
      </div>
      <span className="absolute right-5 top-5 font-display text-4xl font-bold text-white/6" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="h3 text-ice">{L(service.titleEn, service.titleAm)}</h3>
      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ice-dim">
        {L(service.excerptEn, service.excerptAm)}
      </p>
      <A
        href={`/services/${service.slug}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan transition group-hover:gap-3"
      >
        {locale === "am" ? "የበለጠ ይወቁ" : "Learn more"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </A>
    </GlassCard>
  );
}

/* ── Doctor card ─────────────────────────────────────────── */

export function DoctorCard({ doctor }: { doctor: DoctorDTO }) {
  const { L, navigate, t } = useSite();
  const initials = (doctor.nameEn || "UMC")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  function bookWithDoctor() {
    try {
      window.sessionStorage.setItem("umc-prefill-doctor", doctor.id);
    } catch {
      /* ignore */
    }
    navigate("/book");
  }

  return (
    <GlassCard className="group flex h-full flex-col p-0 text-center">
      <div className="relative mx-auto mt-7 h-24 w-24 overflow-hidden rounded-full border-2 border-cyan/30 bg-gradient-to-br from-navy-2 to-navy">
        {doctor.photo ? (
          <Image src={doctor.photo} alt={doctor.nameEn} fill sizes="96px" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-cyan/80" aria-hidden="true">
            {initials}
          </span>
        )}
        <span className="absolute inset-0 rounded-full shadow-[inset_0_0_24px_rgba(56,214,255,0.15)]" aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col px-5 pb-6 pt-4">
        <h3 className="font-display text-[1.02rem] font-bold text-ice">{L(doctor.nameEn, doctor.nameAm)}</h3>
        <p className="mt-1 text-[0.8rem] font-medium text-cyan">{L(doctor.specialtyEn, doctor.specialtyAm)}</p>
        {doctor.credentials && (
          <p className="mt-2 inline-flex items-center justify-center gap-1.5 text-[0.72rem] text-ice-dim">
            <Award className="h3.5 w-3.5 shrink-0 text-cyan/70" aria-hidden="true" />
            {doctor.credentials}
          </p>
        )}
        {doctor.isPlaceholder && (
          <span className="mx-auto mt-3 inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-amber-300">
            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
            {t("common.placeholder")}
          </span>
        )}
        <div className="mt-auto pt-5">
          <button
            onClick={bookWithDoctor}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-clinic-red/50 bg-clinic-red/10 px-4 py-2 text-[0.8rem] font-semibold text-red-300 transition hover:bg-clinic-red hover:text-white"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            {L("Book with this doctor", "ከዚህ ሐኪም ይያዙ")}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

/* ── Package card ────────────────────────────────────────── */

export function PackageCard({ pkg }: { pkg: PackageDTO }) {
  const { L } = useSite();
  return (
    <GlassCard className={cn("relative flex h-full flex-col", pkg.featured && "border-clinic-red/40 shadow-[0_0_50px_-18px_rgba(227,30,36,0.45)]")}>
      {pkg.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-clinic-red px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white glow-red">
          Popular
        </span>
      )}
      <h3 className="h3 text-ice">{L(pkg.nameEn, pkg.nameAm)}</h3>
      {pkg.descEn && <p className="mt-2 text-sm text-ice-dim">{L(pkg.descEn, pkg.descAm)}</p>}
      <ul className="mt-5 flex-1 space-y-2.5">
        {pkg.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-ice/85">
            <Star className="mt-0.5 h3.5 w-3.5 shrink-0 text-cyan" aria-hidden="true" />
            {L(item.en, item.am)}
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-white/8 pt-5">
        <p className="font-display text-2xl font-bold text-ice">
          {pkg.price ? pkg.price : L("Contact us", "ያግኙን")}
        </p>
        <A
          href="/book"
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 font-display text-sm font-semibold text-white transition hover:bg-[#2456d6] hover:shadow-[0_0_28px_rgba(47,107,255,0.5)]"
        >
          {L("Book this package", "ይህን ጥቅል ይያዙ")}
        </A>
      </div>
    </GlassCard>
  );
}

/* ── Post card ───────────────────────────────────────────── */

export function PostCard({ post, featured = false }: { post: PostDTO; featured?: boolean }) {
  const { L } = useSite();
  const date = new Date(post.publishedAt);
  const dateStr = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <A href={`/blog/${post.slug}`} className={cn("group block", featured && "sm:col-span-2")}>
      <article className={cn("glass border-glow flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan/35 hover:shadow-[0_20px_60px_-24px_rgba(47,107,255,0.5)]", featured && "lg:flex-row")}>
        <div className={cn("relative overflow-hidden", featured ? "aspect-[16/9] lg:aspect-auto lg:w-[46%]" : "aspect-[16/9]")}>
          {post.coverImage ? (
            <Image src={post.coverImage} alt={post.title} fill sizes={featured ? "(max-width:1024px) 100vw, 40vw" : "(max-width:768px) 100vw, 33vw"} className="object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-2 via-navy to-ink">
              <span className="font-display text-5xl font-bold text-brand/25" aria-hidden="true">UMC</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" aria-hidden="true" />
          <span className="absolute left-4 top-4 rounded-full bg-brand/90 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white">
            {post.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-3 text-[0.72rem] font-medium text-ice-dim">
            <time dateTime={post.publishedAt}>{dateStr}</time>
            <span className="h-1 w-1 rounded-full bg-cyan/60" aria-hidden="true" />
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {post.readingTime} min
            </span>
          </div>
          <h3 className={cn("h3 mt-3 text-ice transition-colors group-hover:text-cyan", featured && "text-2xl")}>{post.title}</h3>
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ice-dim line-clamp-3">{post.excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan transition group-hover:gap-3">
            {L("Read more", "ያንብቡ")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </article>
    </A>
  );
}

/* ── Testimonials slider ─────────────────────────────────── */

export function TestimonialSlider({ items }: { items: TestimonialDTO[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start", skipSnaps: false });
  const { locale } = useSite();

  if (!items.length) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5 py-2">
          {items.map((tm) => (
            <figure key={tm.id} className="glass border-glow relative min-w-0 flex-[0_0_88%] rounded-2xl p-7 sm:flex-[0_0_46%] lg:flex-[0_0_32%]">
              <Quote className="absolute right-6 top-6 h-8 w-8 text-brand/25" aria-hidden="true" />
              <div className="flex gap-1" aria-label={`${tm.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-4 w-4", i < tm.rating ? "fill-amber-400 text-amber-400" : "text-white/15")} aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-4 text-[0.95rem] leading-relaxed text-ice/90">“{tm.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-navy-2 font-display text-sm font-bold text-white" aria-hidden="true">
                  {tm.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ice">{tm.name}</p>
                  <p className="text-xs text-ice-dim">{tm.role}</p>
                </div>
                {tm.isPlaceholder && (
                  <span className="ml-auto rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-amber-300">
                    {locale === "am" ? "ናሙና" : "Sample"}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => embla?.scrollPrev()} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-ice transition hover:border-cyan/50 hover:text-cyan" aria-label="Previous testimonial">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => embla?.scrollNext()} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-ice transition hover:border-cyan/50 hover:text-cyan" aria-label="Next testimonial">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Doctors carousel ────────────────────────────────────── */

export function DoctorsCarousel({ doctors }: { doctors: DoctorDTO[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start" });
  if (!doctors.length) return null;
  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5 py-2">
          {doctors.map((d) => (
            <div key={d.id} className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_44%] lg:flex-[0_0_30%]">
              <DoctorCard doctor={d} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => embla?.scrollPrev()} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-ice transition hover:border-cyan/50 hover:text-cyan" aria-label="Previous doctor">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => embla?.scrollNext()} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-ice transition hover:border-cyan/50 hover:text-cyan" aria-label="Next doctor">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── FAQ accordion ───────────────────────────────────────── */

export function FaqAccordion({ faqs }: { faqs: FaqDTO[] }) {
  const { locale } = useSite();
  if (!faqs.length) return null;
  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {faqs.map((f, i) => (
        <AccordionItem
          key={f.id}
          value={f.id}
          className="glass overflow-hidden rounded-xl border-none px-5 data-[state=open]:border-cyan/25"
        >
          <AccordionTrigger className="py-4 text-left font-display text-[0.95rem] font-semibold text-ice hover:no-underline">
            <span className="flex items-start gap-3">
              <span className="mt-0.5 font-display text-xs text-cyan/70" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {locale === "am" && f.questionAm ? f.questionAm : f.questionEn}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-5 pl-8 text-sm leading-relaxed text-ice-dim">
            {locale === "am" && f.answerAm ? f.answerAm : f.answerEn}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/* ── Stat block ──────────────────────────────────────────── */

export function StatChip({ value, label, dark = false }: { value: string; label: string; dark?: boolean }) {
  return (
    <div className={cn("rounded-2xl px-5 py-4 text-center", dark ? "bg-white shadow-[0_10px_30px_-12px_rgba(13,31,60,0.18)]" : "glass")}>
      <p className={cn("font-display text-3xl font-bold", dark ? "text-brand" : "text-gradient")}>
        <Counter value={value} />
      </p>
      <p className={cn("mt-1 text-[0.72rem] font-medium uppercase tracking-[0.14em]", dark ? "text-navy/60" : "text-ice-dim")}>{label}</p>
    </div>
  );
}
