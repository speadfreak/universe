/**
 * LocalDbAdapter — the default HmsAdapter implementation.
 *
 * Persists appointments and patients to Postgres through Prisma and
 * computes availability from the clinic schedule minus booked slots.
 * This powers the public booking flow and the admin appointments inbox
 * out of the box; no external HMS required.
 *
 * To integrate a real HMS later, implement HmsAdapter against its API
 * and switch via the HMS_ADAPTER env var (see docs/HMS_INTEGRATION.md).
 */

import { db } from "@/lib/db";
import { emitWebhook } from "@/lib/webhooks";
import {
  HmsAdapter,
  AppointmentRequest,
  AppointmentRecord,
  generateReference,
} from "./hms";

/** Typed adapter error — routes map `code` to HTTP status. */
export class AdapterError extends Error {
  constructor(
    public readonly code: "invalid_date" | "invalid_slot" | "slot_taken" | "conflict",
    message: string
  ) {
    super(message);
    this.name = "AdapterError";
  }
}

/** ── Clinic schedule (Addis Ababa / Ambo, Ethiopia, UTC+3) ────────── */

const ET_OFFSET_MIN = 3 * 60; // Ethiopia is UTC+3, no DST
const SLOT_MINUTES = 30;
const DAY_OPEN_MIN = 8 * 60 + 30; // 08:30
const DAY_CLOSE_MIN = 17 * 60 + 30; // 17:30
const LUNCH_MIN = [12 * 60 + 30, 13 * 60]; // 12:30–13:30 lunch break excluded

function minutesToHHmm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Current date (yyyy-mm-dd) and minutes-since-midnight in Ethiopia local time. */
function ethiopiaNow(): { date: string; minutes: number } {
  const now = new Date(Date.now() + ET_OFFSET_MIN * 60_000);
  const date = now.toISOString().slice(0, 10);
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return { date, minutes };
}

function dayBoundsUTC(date: string): { start: Date; end: Date } {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(new Date(start).getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/** Full schedule for a date: every bookable HH:mm slot (Sunday = emergency only → none). */
function scheduleFor(date: string): string[] {
  const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay(); // 0 = Sunday
  if (weekday === 0) return []; // Sunday: Emergency only
  const slots: string[] = [];
  for (let t = DAY_OPEN_MIN; t <= DAY_CLOSE_MIN - SLOT_MINUTES; t += SLOT_MINUTES) {
    if (LUNCH_MIN.includes(t)) continue;
    slots.push(minutesToHHmm(t));
  }
  return slots;
}

/** Booked HH:mm slots for a date (any status except cancelled). */
async function bookedSlots(date: string): Promise<string[]> {
  const { start, end } = dayBoundsUTC(date);
  const rows = await db.appointment.findMany({
    where: { date: { gte: start, lt: end }, status: { not: "cancelled" } },
    select: { timeSlot: true },
  });
  return rows.map((r) => r.timeSlot);
}

/** ── The adapter ──────────────────────────────────────────────────── */

export class LocalDbAdapter implements HmsAdapter {
  readonly name = "local-db";

  async createAppointment(input: AppointmentRequest): Promise<AppointmentRecord> {
    const date = input.date;
    const timeSlot = input.timeSlot;
    const { date: today } = ethiopiaNow();

    // 1. sanity: date must be today or future
    if (date < today) {
      throw new AdapterError("invalid_date", "The selected date is in the past.");
    }

    // 2. Sunday (emergency only) and schedule validation for website/internal bookings.
    //    External HMS bookings may manage their own schedule.
    const external = input.source === "hms" || input.source === "api";
    if (!external) {
      const schedule = scheduleFor(date);
      if (schedule.length === 0) {
        throw new AdapterError("invalid_date", "The clinic is closed on Sundays — emergency only.");
      }
      if (!schedule.includes(timeSlot)) {
        throw new AdapterError("invalid_slot", "The selected time is outside clinic hours (Mon–Sat 8:30 AM – 5:30 PM).");
      }
    }

    // 3. double-booking guard
    const booked = await bookedSlots(date);
    if (booked.includes(timeSlot)) {
      throw new AdapterError("slot_taken", "That time slot has just been taken. Please pick another one.");
    }

    // 4. resolve display names when only IDs were provided
    let serviceName = input.serviceName || "";
    if (input.serviceId && !serviceName) {
      const svc = await db.service.findFirst({
        where: { OR: [{ id: input.serviceId }, { slug: input.serviceId }] },
        select: { titleEn: true },
      });
      serviceName = svc?.titleEn || input.serviceId;
    }
    let doctorName = input.doctorName || "";
    if (input.doctorId && !doctorName) {
      const doc = await db.doctor.findFirst({
        where: { OR: [{ id: input.doctorId }, { nameEn: input.doctorId }] },
        select: { nameEn: true },
      });
      doctorName = doc?.nameEn || input.doctorId;
    }

    // 5. collision-safe reference
    let reference = "";
    for (let attempt = 0; attempt < 6; attempt++) {
      const candidate = generateReference();
      const exists = await db.appointment.findUnique({ where: { reference: candidate }, select: { id: true } });
      if (!exists) {
        reference = candidate;
        break;
      }
    }
    if (!reference) throw new AdapterError("conflict", "Could not allocate a booking reference. Please retry.");

    // 6. persist
    const created = await db.appointment.create({
      data: {
        reference,
        serviceId: input.serviceId || null,
        doctorId: input.doctorId || null,
        serviceName,
        doctorName,
        date: dayBoundsUTC(date).start,
        timeSlot,
        patientName: input.patientName,
        phone: input.phone,
        email: input.email || "",
        notes: input.notes || "",
        status: "new",
        source: input.source || "website",
      },
    });

    // 7. keep the local patient directory in sync (best-effort)
    try {
      await this.syncPatient({ name: input.patientName, phone: input.phone, email: input.email });
    } catch {
      // patient sync must never break a booking
    }

    void emitWebhook("appointment.created", {
      reference: created.reference,
      status: created.status,
      patientName: created.patientName,
      phone: created.phone,
      serviceName,
      date,
      timeSlot,
    });

    return {
      id: created.id,
      reference: created.reference,
      date: created.date,
      timeSlot: created.timeSlot,
      status: created.status,
    };
  }

  async getAvailability(date: string): Promise<{ date: string; slots: string[]; booked: string[] }> {
    const slots = scheduleFor(date);
    if (slots.length === 0) return { date, slots: [], booked: [] };

    // past slots (for today, Ethiopia time) are not bookable
    const { date: today, minutes: nowMin } = ethiopiaNow();
    const bookable =
      date === today ? slots.filter((s) => {
        const [h, m] = s.split(":").map(Number);
        return h * 60 + m > nowMin;
      }) : slots;

    const booked = await bookedSlots(date);
    return { date, slots: bookable, booked };
  }

  async cancelAppointment(reference: string, reason?: string): Promise<boolean> {
    const existing = await db.appointment.findUnique({ where: { reference } });
    if (!existing || existing.status === "cancelled") return false;

    const updated = await db.appointment.update({
      where: { reference },
      data: {
        status: "cancelled",
        internalNotes: reason
          ? `${existing.internalNotes ? existing.internalNotes + "\n" : ""}[cancelled] ${reason}`.slice(0, 4000)
          : existing.internalNotes,
      },
    });

    void emitWebhook("appointment.cancelled", { reference: updated.reference, reason: reason || "" });
    return true;
  }

  async syncPatient(patient: {
    name: string;
    phone: string;
    email?: string;
  }): Promise<{ externalId: string | null; queued: boolean }> {
    const row = await db.patient.upsert({
      where: { phone: patient.phone },
      create: {
        phone: patient.phone,
        name: patient.name,
        email: patient.email || "",
      },
      update: {
        name: patient.name,
        ...(patient.email ? { email: patient.email } : {}),
      },
    });
    // externalId stays null until a real HMS takes over and back-fills ids
    return { externalId: row.externalId || null, queued: !row.externalId };
  }
}

/** Adapter resolver — HMS_ADAPTER env picks an implementation, LocalDb is the default. */
export function getHmsAdapter(): HmsAdapter {
  switch (process.env.HMS_ADAPTER) {
    case "local":
    case "local-db":
    case undefined:
    case "":
      return new LocalDbAdapter();
    // case "yourhms": return new YourHmsAdapter();
    default:
      // Unknown adapter names fall back to the safe local implementation.
      return new LocalDbAdapter();
  }
}
