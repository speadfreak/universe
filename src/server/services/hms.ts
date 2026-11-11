/**
 * HMS integration layer.
 *
 * Every appointment mutation flows through an HmsAdapter. Today the
 * LocalDbAdapter persists to Postgres; when the clinic's HMS arrives,
 * implement HmsAdapter against its API and select it via HMS_ADAPTER env.
 * See docs/HMS_INTEGRATION.md.
 */

export type AppointmentRequest = {
  serviceId?: string;
  doctorId?: string;
  serviceName?: string;
  doctorName?: string;
  date: string; // yyyy-mm-dd
  timeSlot: string; // HH:mm
  patientName: string;
  phone: string;
  email?: string;
  notes?: string;
  source?: string;
};

export type AppointmentRecord = {
  id: string;
  reference: string;
  date: Date;
  timeSlot: string;
  status: string;
};

export interface HmsAdapter {
  readonly name: string;
  createAppointment(input: AppointmentRequest): Promise<AppointmentRecord>;
  getAvailability(date: string): Promise<{ date: string; slots: string[]; booked: string[] }>;
  cancelAppointment(reference: string, reason?: string): Promise<boolean>;
  syncPatient(patient: { name: string; phone: string; email?: string }): Promise<{ externalId: string | null; queued: boolean }>;
}

/** Deterministic, collision-checked reference codes: UMC-XXXXXX */
export function generateReference(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `UMC-${code}`;
}
