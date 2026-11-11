"use client";

import React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ArrowUpRight, Award, BadgeCheck, CalendarCheck, ChevronLeft, ChevronRight, Clock, Quote, Star } from "lucide-react";
import { A, useSite } from "./site-context";
import { IconFor, PaperCard } from "./bits";
import { Counter, Reveal } from "./motion";
import { cn } from "@/lib/utils";
import type { DoctorDTO, FaqDTO, PackageDTO, PostDTO, ServiceDTO, TestimonialDTO } from "@/lib/site-types";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

/* ── Service card (grid pages) — porcelain paper, hairline, serif numeral ─ */

export function ServiceCard({ service, index = 0 }: { service: ServiceDTO; index?: number }) {
  const { L, locale } = useSite();
  return (
    <PaperCard className="group relative flex h-full flex-col">
      <div className="flex items-start justify-between">
        <span className="num-serif text-[2rem] leading-none text-ink/15 transition-colors duration-500 group-hover:text-crimson" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/12 text-ink/70 transition-colors duration-500 group-hover:border-crimson/40 group-hover:text-crimson">
          <IconFor name={service.icon} className="h-5 w-5" />
        </span>
      </div>
      <h3 className="h3 mt-5 text-ink">{L(service.titleEn, service.titleAm)}</h3>
      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-stone-deep">
        {L(service.excerptEn, service.excerptAm)}
      </p>
      <A
        href={`/services/${service.slug}`}
        className="mt-5 inline-flex items-center gap-1.5 border-b border-transparent pb-0.5 text-sm font-semibold text-ink transition group-hover:border-crimson group-hover:text-crimson"
      >
        {locale === "am" ? "የበለጠ ይወቁ" : "Learn more"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </A>
    </PaperCard>
  );
}

/* ── Editorial service row (home) — hover reveals image + crimson arrow ── */

export function ServiceListRow({
  service, index, onHover, active,
}: {
  service: ServiceDTO;
  index: number;
  onHover?: (slug: string | null) => void;
  active?: boolean;
}) {
  const { L } = useSite();
  return (
    <A
      href={`/services/${service.slug}`}
      className={cn(
        "group relative block border-t border-ink/12 py-6 transition-colors last:border-b md:py-7",
        active && "border-crimson/50"
      )}
      onMouseEnter={() => onHover?.(service.slug)}
      onMouseLeave={() => onHover?.(null)}
    >
      <span className="flex items-center justify-between gap-4">
        <span className="flex min-w-0 items-baseline gap-4 md:gap-8">
          <span className={cn("num-serif shrink-0 text-sm transition-colors md:text-base", active ? "text-crimson" : "text-stone-deep")} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className={cn(
              "truncate font-display text-[1.35rem] tracking-[-0.015em] transition-all duration-300 group-hover:translate-x-2 md:text-[1.9rem]",
              active ? "text-crimson" : "text-ink group-hover:text-crimson"
            )}
          >
            {L(service.titleEn, service.titleAm)}
          </span>
        </span>
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 md:h-11 md:w-11",
            active
              ? "border-crimson bg-crimson text-white"
              : "border-ink/15 text-ink/60 group-hover:border-crimson group-hover:text-crimson"
          )}
          aria-hidden="true"
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </span>
      <span className="mt-1.5 block pl-9 text-sm text-stone-deep md:pl-[4.25rem] md:text-[0.95rem]">
        {L(service.excerptEn, service.excerptAm)}
      </span>
    </A>
  );
}

/* ── Doctor card — arch photo, hairline frame ───────────── */

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
    <PaperCard className="group flex h-full flex-col p-0">
      <div className="arch-sm relative mx-6 mt-6 aspect-[4/4.6] overflow-hidden bg-bone">
        {doctor.photo ? (
          <Image src={doctor.photo} alt={doctor.nameEn} fill sizes="(max-width:768px) 80vw, 30vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
        ) : (
          <span className="num-serif flex h-full w-full items-center justify-center bg-gradient-to-b from-bone to-porcelain-deep text-4xl text-ink/30" aria-hidden="true">
            {initials}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
        <h3 className="font-display text-[1.05rem] tracking-tight text-ink">{L(doctor.nameEn, doctor.nameAm)}</h3>
        <p className="mt-1 text-[0.8rem] font-semibold text-crimson">{L(doctor.specialtyEn, doctor.specialtyAm)}</p>
        {doctor.credentials && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[0.72rem] text-stone-deep">
            <Award className="h-3.5 w-3.5 shrink-0 text-scrub" aria-hidden="true" />
            {doctor.credentials}
          </p>
        )}
        {doctor.isPlaceholder && (
          <span className="mx-auto mt-3 inline-flex items-center gap-1 rounded-full border border-stone/30 bg-bone px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-stone-deep">
            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
            {t("common.placeholder")}
          </span>
        )}
        <div className="mt-auto pt-5">
          <button
            onClick={bookWithDoctor}
            className="group/btn inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-ink/15 px-4 py-2 text-[0.8rem] font-semibold text-ink transition hover:border-crimson hover:bg-crimson hover:text-white"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            {L("Book with this doctor", "ከዚህ ሐኪም ይያዙ")}
          </button>
        </div>
      </div>
    </PaperCard>
  );
}

/* ── Package card — bone surface, featured gets a crimson hairline ── */

export function PackageCard({ pkg }: { pkg: PackageDTO }) {
  const { L } = useSite();
  return (
    <div className={cn("paper-card relative flex h-full flex-col bg-bone/60", pkg.featured && "border-crimson/45 shadow-[0_18px_44px_-28px_rgba(74,15,24,0.5)]")}>
      {pkg.featured && (
        <span className="absolute -top-3 left-6 rounded-[7px] bg-crimson px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white">
          Popular
        </span>
      )}
      <h3 className="h3 text-ink">{L(pkg.nameEn, pkg.nameAm)}</h3>
      {pkg.descEn && <p className="mt-2 text-sm text-stone-deep">{L(pkg.descEn, pkg.descAm)}</p>}
      <ul className="mt-5 flex-1 space-y-2.5">
        {pkg.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-ink/80">
            <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-crimson" aria-hidden="true" />
            {L(item.en, item.am)}
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-ink/10 pt-5">
        <p className="num-serif text-[1.7rem] text-ink">
          {pkg.price ? pkg.price : L("Contact us", "ያግኙን")}
        </p>
        <A
          href="/book"
          className="group mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2.5 rounded-[10px] bg-ink px-5 py-2.5 text-sm font-semibold text-porcelain transition hover:bg-crimson"
        >
          {L("Book this package", "ይህን ጥቅል ይያዙ")}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
        </A>
      </div>
    </div>
  );
}

/* ── Post card — editorial with soft-rect image ─────────── */

export function PostCard({ post, featured = false }: { post: PostDTO; featured?: boolean }) {
  const { L } = useSite();
  const date = new Date(post.publishedAt);
  const dateStr = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <A href={`/blog/${post.slug}`} className={cn("group block", featured && "sm:col-span-2")}>
      <article className={cn("paper-card flex h-full flex-col overflow-hidden p-0", featured && "lg:flex-row")}>
        <div className={cn("relative overflow-hidden bg-bone", featured ? "aspect-[16/9] lg:aspect-auto lg:w-[46%]" : "aspect-[16/9]")}>
          {post.coverImage ? (
            <Image src={post.coverImage} alt={post.title} fill sizes={featured ? "(max-width:1024px) 100vw, 40vw" : "(max-width:768px) 100vw, 33vw"} className="object-cover transition duration-700 group-hover:scale-[1.045]" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bone">
              <span className="num-serif text-5xl text-ink/15" aria-hidden="true">UMC</span>
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-[7px] bg-ink/85 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-porcelain-sm">
            {post.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-3 text-[0.72rem] font-medium text-stone-deep">
            <time dateTime={post.publishedAt}>{dateStr}</time>
            <span className="h-1 w-1 rounded-full bg-crimson" aria-hidden="true" />
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {post.readingTime} min
            </span>
          </div>
          <h3 className={cn("h3 mt-3 text-ink transition-colors group-hover:text-crimson", featured && "text-2xl")}>{post.title}</h3>
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-stone-deep line-clamp-3">{post.excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition group-hover:gap-3 group-hover:text-crimson">
            {L("Read more", "ያንብቡ")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </article>
    </A>
  );
}

/* ── Testimonials slider — bone cards, crimson quote ────── */

export function TestimonialSlider({ items }: { items: TestimonialDTO[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start", skipSnaps: false });
  const { locale } = useSite();

  if (!items.length) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5 py-2">
          {items.map((tm) => (
            <figure key={tm.id} className="paper-card relative min-w-0 flex-[0_0_88%] bg-bone/50 p-7 sm:flex-[0_0_46%] lg:flex-[0_0_32%]">
              <Quote className="absolute right-6 top-6 h-8 w-8 text-crimson/20" aria-hidden="true" />
              <div className="flex gap-1" aria-label={`${tm.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-4 w-4", i < tm.rating ? "fill-crimson text-crimson" : "text-ink/15")} aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-4 font-display text-[1.02rem] leading-relaxed text-ink/90">“{tm.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="num-serif flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-sm text-porcelain" aria-hidden="true">
                  {tm.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{tm.name}</p>
                  <p className="text-xs text-stone-deep">{tm.role}</p>
                </div>
                {tm.isPlaceholder && (
                  <span className="ml-auto rounded-full border border-stone/30 bg-porcelain px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-stone-deep">
                    {locale === "am" ? "ናሙና" : "Sample"}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => embla?.scrollPrev()} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:border-crimson hover:text-crimson" aria-label="Previous testimonial">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => embla?.scrollNext()} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:border-crimson hover:text-crimson" aria-label="Next testimonial">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Doctors carousel ───────────────────────────────────── */

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
        <button onClick={() => embla?.scrollPrev()} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:border-crimson hover:text-crimson" aria-label="Previous doctor">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => embla?.scrollNext()} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:border-crimson hover:text-crimson" aria-label="Next doctor">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── FAQ accordion — hairline rows, serif numerals ──────── */

export function FaqAccordion({ faqs }: { faqs: FaqDTO[] }) {
  const { locale } = useSite();
  if (!faqs.length) return null;
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((f, i) => (
        <AccordionItem
          key={f.id}
          value={f.id}
          className="overflow-hidden rounded-none border-b border-ink/12 px-0 data-[state=open]:border-crimson/40"
        >
          <AccordionTrigger className="py-5 text-left font-display text-[1.02rem] tracking-[-0.01em] text-ink hover:no-underline [&>svg]:text-crimson">
            <span className="flex items-start gap-4">
              <span className="num-serif mt-1 text-xs text-stone-deep" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {locale === "am" && f.questionAm ? f.questionAm : f.questionEn}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-5 pl-9 text-sm leading-relaxed text-stone-deep">
            {locale === "am" && f.answerAm ? f.answerAm : f.answerEn}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/* ── Stat line — huge serif numerals separated by hairlines ── */

export function StatChip({ value, label, dark = false }: { value: string; label: string; dark?: boolean }) {
  return (
    <div className={cn("px-2 py-3 text-center sm:px-6", dark ? "on-dark" : "")}>
      <p className={cn("num-serif text-[clamp(2.4rem,4.6vw,3.6rem)] leading-none", dark ? "text-porcelain" : "text-ink")}>
        <Counter value={value} />
      </p>
      <p className={cn("mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em]", dark ? "text-porcelain/55" : "text-stone-deep")}>{label}</p>
    </div>
  );
}

/** Editorial stat band — numerals divided by vertical hairlines, no boxes. */
export function StatBand({
  stats, dark = false, className,
}: {
  stats: Array<{ value: string; label: string }>;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-stretch justify-center", dark && "on-dark", className)}>
      {stats.map((s, i) => (
        <Reveal key={i} delay={i * 0.07} className={cn("flex-1 basis-28", i > 0 && (dark ? "border-l border-porcelain/12" : "border-l border-ink/12"))}>
          <StatChip value={s.value} label={s.label} dark={dark} />
        </Reveal>
      ))}
    </div>
  );
}
