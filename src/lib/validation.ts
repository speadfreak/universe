import { z } from "zod";

/** ── public forms ─────────────────────────────────────────────── */

const optionalEmail = z
  .union([z.email("Please enter a valid email"), z.literal("")])
  .refine((v) => v.length <= 160, "Email is too long");

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(30),
  email: optionalEmail,
  department: z.string().trim().max(120).default(""),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(4000),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot — must stay empty
});

export type ContactInput = z.infer<typeof contactSchema>;

export const appointmentSchema = z.object({
  serviceId: z.string().trim().max(80).optional().or(z.literal("")),
  doctorId: z.string().trim().max(80).optional().or(z.literal("")),
  serviceName: z.string().trim().max(160).default(""),
  doctorName: z.string().trim().max(160).default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  patientName: z.string().trim().min(2, "Please enter the patient's name").max(120),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(30),
  email: optionalEmail,
  notes: z.string().trim().max(2000).default(""),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const newsletterSchema = z.object({
  email: z.email("Please enter a valid email").max(160),
  website: z.string().max(0).optional().or(z.literal("")),
});

/** ── admin ────────────────────────────────────────────────────── */

export const loginSchema = z.object({
  email: z.email("Enter a valid email").max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

/** ── versioned API (HMS) ──────────────────────────────────────── */

export const apiAppointmentSchema = appointmentSchema.omit({ website: true });

export function zodErrorMessage(err: z.ZodError): string {
  const first = err.issues[0];
  return first ? `${first.path.join(".") || "input"}: ${first.message}` : "Invalid input";
}
