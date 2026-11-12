"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, CalendarCheck, CalendarDays, Check, CheckCircle2, Clock, Loader2, UserRound,
} from "lucide-react";
import { useSite } from "@/components/site/site-context";
import { ButtonRed, ButtonGlass, GlassCard, PageHero } from "@/components/site/bits";
import { Reveal } from "@/components/site/motion";
import { str } from "@/lib/content-schema";
import { appointmentSchema, type AppointmentInput } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STEPS = ["book.service", "book.doctor", "book.datetime", "book.details", "book.confirm"] as const;

export default function BookPage() {
  const { data, section, settings, L, t } = useSite();
  const hero = section("book", "hero");
  const success = section("book", "success");

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [slots, setSlots] = useState<{ slots: string[]; booked: string[] } | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [details, setDetails] = useState({ patientName: "", phone: "", email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");

  // prefill from "book with this doctor" / "book this service"
  useEffect(() => {
    try {
      const ps = window.sessionStorage.getItem("umc-prefill-service");
      const pd = window.sessionStorage.getItem("umc-prefill-doctor");
      if (ps && data.services.some((s) => s.id === ps)) {
        setServiceId(ps);
        setStep(1);
      }
      if (pd && data.doctors.some((d) => d.id === pd)) setDoctorId(pd);
      window.sessionStorage.removeItem("umc-prefill-service");
      window.sessionStorage.removeItem("umc-prefill-doctor");
    } catch {
      /* ignore */
    }
  }, [data.services, data.doctors]);

  const service = data.services.find((s) => s.id === serviceId);
  const doctor = data.doctors.find((d) => d.id === doctorId);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().slice(0, 10);
  }, []);

  async function loadSlots(iso: string) {
    if (!iso) return;
    setSlotsLoading(true);
    setSlots(null);
    setTimeSlot("");
    try {
      const res = await fetch(`/api/v1/availability?date=${iso}`);
      if (res.ok) {
        const body = await res.json();
        setSlots({ slots: body.data.slots, booked: body.data.booked });
      } else {
        setSlots({ slots: [], booked: [] });
      }
    } catch {
      setSlots({ slots: [], booked: [] });
    } finally {
      setSlotsLoading(false);
    }
  }

  function pickDate(iso: string) {
    setDate(iso);
    if (iso) void loadSlots(iso);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const payload: AppointmentInput = {
        serviceId,
        doctorId,
        serviceName: service?.titleEn || "",
        doctorName: doctor?.nameEn || "",
        date,
        timeSlot,
        patientName: details.patientName.trim(),
        phone: details.phone.trim(),
        email: details.email.trim(),
        notes: details.notes.trim(),
        website: "",
      };
      const parsed = appointmentSchema.safeParse(payload);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message || t("common.error"));
        setSubmitting(false);
        return;
      }
      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message || "failed");
      setReference(body.data.reference);
      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSubmitting(false);
    }
  }

  const canContinue =
    (step === 0 && !!serviceId) ||
    step === 1 ||
    (step === 2 && !!date && !!timeSlot) ||
    (step === 3 && details.patientName.trim().length >= 2 && details.phone.trim().length >= 7);

  const inputCls =
    "min-h-11 w-full rounded-xl border border-white/12 bg-white/5 px-4 text-sm text-ice placeholder:text-ice-dim/55 transition focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/20";

  const dateLabel = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";

  return (
    <>
      <PageHero title={str(hero, "title")} subtitle={str(hero, "subtitle")} slot="hero.book" crumb={t("nav.book")} />

      <section className="bg-mesh-dark grain relative section-pad">
        <div className="container-x max-w-3xl">
          {/* stepper */}
          <ol className="mb-12 flex items-center justify-between gap-1" aria-label="Booking progress">
            {STEPS.map((key, i) => (
              <li key={key} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-center">
                  <span className={cn("h-px flex-1", i === 0 ? "opacity-0" : step >= i ? "bg-cyan/60" : "bg-white/10")} />
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-display text-xs font-bold transition-all",
                      step > i
                        ? "border-cyan/60 bg-cyan/15 text-cyan"
                        : step === i
                          ? "border-clinic-red/60 bg-clinic-red/15 text-red-300 glow-red"
                          : "border-white/12 text-ice-dim"
                    )}
                    aria-current={step === i ? "step" : undefined}
                  >
                    {step > i ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className={cn("h-px flex-1", i === STEPS.length - 1 ? "opacity-0" : step > i ? "bg-cyan/60" : "bg-white/10")} />
                </div>
                <span className={cn("text-center text-[0.62rem] font-bold uppercase tracking-wider", step >= i ? "text-ice" : "text-ice-dim/60")}>
                  {t(key)}
                </span>
              </li>
            ))}
          </ol>

          <GlassCard className="p-7 sm:p-9">
            {/* STEP 0 — service */}
            {step === 0 && (
              <div>
                <h2 className="h3 text-ice">{t("book.service")}</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {data.services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setServiceId(s.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all",
                        serviceId === s.id
                          ? "border-cyan/50 bg-brand/12 shadow-[0_0_26px_-8px_rgba(227,32,43,0.4)]"
                          : "border-white/10 bg-white/3 hover:border-cyan/30"
                      )}
                      aria-pressed={serviceId === s.id}
                    >
                      <p className="text-sm font-bold text-ice">{L(s.titleEn, s.titleAm)}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-ice-dim">{L(s.excerptEn, s.excerptAm)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1 — doctor */}
            {step === 1 && (
              <div>
                <h2 className="h3 text-ice">{t("book.doctor")}</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setDoctorId("")}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                      doctorId === "" ? "border-cyan/50 bg-brand/12" : "border-white/10 bg-white/3 hover:border-cyan/30"
                    )}
                    aria-pressed={doctorId === ""}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/15 text-cyan"><UserRound className="h-5 w-5" aria-hidden="true" /></span>
                    <div>
                      <p className="text-sm font-bold text-ice">{t("book.anyDoctor")}</p>
                      <p className="text-xs text-ice-dim">{L("First available specialist", "የመጀመሪያ ክፍት ስፔሻሊስት")}</p>
                    </div>
                  </button>
                  {data.doctors.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDoctorId(d.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                        doctorId === d.id ? "border-cyan/50 bg-brand/12" : "border-white/10 bg-white/3 hover:border-cyan/30"
                      )}
                      aria-pressed={doctorId === d.id}
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-navy-2 to-navy font-display text-sm font-bold text-cyan" aria-hidden="true">
                        {d.nameEn.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-ice">{L(d.nameEn, d.nameAm)}</p>
                        <p className="text-xs text-cyan">{L(d.specialtyEn, d.specialtyAm)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 — date & time */}
            {step === 2 && (
              <div>
                <h2 className="h3 text-ice">{t("book.datetime")}</h2>
                <label htmlFor="book-date" className="mt-6 block text-xs font-semibold uppercase tracking-wider text-ice-dim">
                  <CalendarDays className="mr-1.5 inline h-4 w-4 text-cyan" aria-hidden="true" />
                  {L("Choose a day", "ቀን ይምረጡ")}
                </label>
                <input
                  id="book-date"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={date}
                  onChange={(e) => pickDate(e.target.value)}
                  className={cn(inputCls, "mt-2 [color-scheme:dark]")}
                />
                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ice-dim">
                    <Clock className="mr-1.5 inline h-4 w-4 text-cyan" aria-hidden="true" />
                    {L("Available times", "ክፍት ሰዓቶች")} {date && `— ${dateLabel}`}
                  </p>
                  {slotsLoading && (
                    <p className="flex items-center gap-2 text-sm text-ice-dim">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {t("common.loading")}
                    </p>
                  )}
                  {slots && !slotsLoading && (
                    slots.slots.length === 0 ? (
                      <p className="text-sm text-ice-dim">{L("Closed on this day — please pick another date (Sundays: emergency only).", "በዚህ ቀን አንከፍትም — ሌላ ቀን ይምረጡ (እሁድ፡ አስቸኳይ ብቻ)።")}</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4" role="listbox" aria-label="Time slots">
                        {slots.slots.map((slot) => {
                          const taken = slots.booked.includes(slot);
                          return (
                            <button
                              key={slot}
                              disabled={taken}
                              onClick={() => setTimeSlot(slot)}
                              aria-pressed={timeSlot === slot}
                              className={cn(
                                "rounded-xl border py-2.5 text-sm font-semibold transition-all",
                                taken
                                  ? "cursor-not-allowed border-white/5 text-ice-dim/30 line-through"
                                  : timeSlot === slot
                                    ? "border-cyan/60 bg-cyan/15 text-cyan"
                                    : "border-white/10 text-ice/85 hover:border-cyan/40"
                              )}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    )
                  )}
                  {!slots && !slotsLoading && (
                    <p className="text-sm text-ice-dim">{L("Pick a date to see open slots.", "ክፍት ሰዓቶችን ለማየት ቀን ይምረጡ።")}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3 — details */}
            {step === 3 && (
              <div>
                <h2 className="h3 text-ice">{t("book.details")}</h2>
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="b-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ice-dim">{t("form.name")} *</label>
                    <input id="b-name" value={details.patientName} onChange={(e) => setDetails({ ...details, patientName: e.target.value })} className={inputCls} autoComplete="name" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="b-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ice-dim">{t("form.phone")} *</label>
                      <input id="b-phone" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} className={inputCls} inputMode="tel" dir="ltr" autoComplete="tel" />
                    </div>
                    <div>
                      <label htmlFor="b-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ice-dim">{t("form.email")}</label>
                      <input id="b-email" type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} className={inputCls} autoComplete="email" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="b-notes" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ice-dim">{L("Notes (symptoms, requests)", "ማስታወሻዎች")}</label>
                    <textarea id="b-notes" rows={3} value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} className={cn(inputCls, "resize-y")} />
                  </div>
                  <p className="text-[0.7rem] leading-relaxed text-ice-dim/70">
                    {L("Only the minimum information needed to schedule your visit is collected and stored securely.", "የጉብኝትዎን ለማስያዝ የሚያስፈልገው ብቻ ይሰበሰባል።")}
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4 — confirmation */}
            {step === 4 ? (
              <div className="py-4 text-center">
                <div>
                  <CheckCircle2 className="mx-auto h-16 w-16 text-cyan" aria-hidden="true" />
                </div>
                <h2 className="h2 mt-5 text-ice">{str(success, "title") || t("book.success")}</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ice-dim">{str(success, "text")}</p>
                <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-cyan/25 bg-brand/10 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-ice-dim">{t("book.reference")}</p>
                  <p className="mt-1.5 font-display text-3xl font-bold tracking-[0.12em] text-cyan" dir="ltr">{reference}</p>
                </div>
                <dl className="mx-auto mt-7 max-w-sm space-y-2 rounded-2xl glass p-5 text-left text-sm">
                  <Row label={t("book.service")} value={service ? L(service.titleEn, service.titleAm) : "—"} />
                  {doctor && <Row label={t("book.doctor")} value={L(doctor.nameEn, doctor.nameAm)} />}
                  <Row label={t("book.datetime")} value={`${dateLabel} · ${timeSlot}`} />
                  <Row label={t("form.name")} value={details.patientName} />
                  <Row label={t("form.phone")} value={details.phone} />
                </dl>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <ButtonRed href={`tel:${settings.phoneIntl}`}>{t("common.callNow")}</ButtonRed>
                  <ButtonGlass onClick={() => { setStep(0); setServiceId(""); setDoctorId(""); setDate(""); setTimeSlot(""); setReference(""); setDetails({ patientName: "", phone: "", email: "", notes: "" }); }}>
                    {L("Book another visit", "ሌላ ቀን ይያዙ")}
                  </ButtonGlass>
                </div>
              </div>
            ) : (
              <>
                {/* summary rail */}
                {(service || doctor || date) && step < 4 && (
                  <div className="mt-8 rounded-2xl border border-white/8 bg-white/3 p-4 text-xs text-ice-dim">
                    <p className="mb-1 font-bold uppercase tracking-wider text-ice-dim">{L("Your selection", "የመረጡት")}</p>
                    <p>{service ? L(service.titleEn, service.titleAm) : "—"}{doctor ? ` · ${L(doctor.nameEn, doctor.nameAm)}` : ""}{date ? ` · ${dateLabel} ${timeSlot}` : ""}</p>
                  </div>
                )}
                {/* nav buttons */}
                <div className="mt-8 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 px-6 text-sm font-semibold text-ice transition hover:border-cyan/40 disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {t("book.back")}
                  </button>
                  {step < 3 ? (
                    <ButtonRed onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
                      {t("book.next")}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </ButtonRed>
                  ) : (
                    <ButtonRed onClick={submit} disabled={!canContinue || submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CalendarCheck className="h-4 w-4" aria-hidden="true" />}
                      {t("book.submit")}
                    </ButtonRed>
                  )}
                </div>
              </>
            )}
          </GlassCard>
        </div>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-ice-dim">{label}</dt>
      <dd className="text-right font-semibold text-ice">{value}</dd>
    </div>
  );
}

