# HMS Integration Guide — Universe Medical Center

This guide is for connecting the website to an external **Hospital Management System (HMS)** — or any third-party booking/patient system — using the adapter layer, the versioned REST API, and signed webhooks.

- REST API base path: **`/api/v1`**
- Auth: **`x-api-key`** header (see [Authentication](#authentication-for-external-systems))
- Errors: a single, consistent envelope (see [Error envelope](#error-envelope))

---

## The `HmsAdapter` interface

All appointment/patient persistence goes through one interface, defined in `src/server/services/hms/`:

```ts
// src/server/services/hms/types.ts
export interface CreateAppointmentInput {
  patientName: string;
  phone: string;
  email?: string;
  serviceId: string;
  preferredDate: string;      // ISO 8601 date, e.g. "2026-01-20"
  preferredTime: string;      // ISO 8601 time, e.g. "09:30"
  notes?: string;
  source: "website" | "api" | "walk_in";
}

export interface AvailabilityQuery {
  serviceId: string;
  date: string;               // ISO 8601 date
}

export interface AvailabilitySlot {
  time: string;               // ISO 8601 time
  available: boolean;
  capacityRemaining?: number;
}

export interface PatientSyncInput {
  externalId?: string;        // HMS-side patient id, if known
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;       // ISO 8601 date
}

export interface Appointment {
  reference: string;          // "UMC-XXXXXX"
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;          // ISO 8601
  // ...additional mapped fields
}

export interface HmsAdapter {
  createAppointment(input: CreateAppointmentInput): Promise<Appointment>;
  getAvailability(query: AvailabilityQuery): Promise<AvailabilitySlot[]>;
  syncPatient(patient: PatientSyncInput): Promise<Patient>;
  cancelAppointment(reference: string, reason?: string): Promise<Appointment>;
}
```

Everything else in the app — public forms, the admin appointments inbox, the `/api/v1` routes — calls the adapter, never a database or an external SDK directly.

## `LocalDbAdapter` (current default)

`LocalDbAdapter` is the built-in implementation: it writes appointments, patients, and availability to the local **Postgres** database through Prisma. It powers the admin appointments inbox out of the box:

- `createAppointment` inserts a row with status `pending` and generates a `UMC-XXXXXX` reference.
- `getAvailability` computes open slots from configured service schedules and already-booked appointments.
- `syncPatient` upserts by phone number (the clinic's natural patient key).
- `cancelAppointment` flips the status to `cancelled` and records the reason.

When no HMS is connected, nothing else is required — this adapter is the default.

## Implementing a new adapter

To integrate a real HMS (e.g. an external EHR/booking system):

1. **Create the implementation** in `src/server/services/hms/`, e.g. `MyHmsAdapter.ts`, implementing every method of `HmsAdapter` by calling the HMS's API. Translate HMS errors into the shared error codes (see below) so HTTP responses stay consistent.
2. **Export a resolver** that picks the adapter from configuration:

   ```ts
   // src/server/services/hms/index.ts
   import { LocalDbAdapter } from "./LocalDbAdapter";
   import { MyHmsAdapter } from "./MyHmsAdapter";

   export function getHmsAdapter(): HmsAdapter {
     switch (process.env.HMS_ADAPTER) {
       case "myhms":  return new MyHmsAdapter();
       default:       return new LocalDbAdapter();
     }
   }
   ```

3. **Switch via env** — set `HMS_ADAPTER=myhms` in `.env` (and in your deployment environment). All routes, forms, and the admin inbox immediately route through the new adapter. `LocalDbAdapter` remains the fallback whenever `HMS_ADAPTER` is unset or unrecognized.
4. Keep any HMS-specific credentials in dedicated env variables — never hardcode them, and never commit them.

## REST API reference (v1)

All endpoints are versioned under `/api/v1`. Requests and responses are JSON.

### Authentication for external systems

External systems authenticate with a static API key:

```
x-api-key: <HMS_API_KEY>
```

- Set the key in `.env` as `HMS_API_KEY=<long random string>` and share it only with the integrating system.
- Missing or invalid keys receive `401 UNAUTHORIZED`.
- The key grants read/write on appointments, availability, and patient sync — issue separate keys per partner and rotate them if ever exposed.

### `POST /api/v1/appointments` — create an appointment

```bash
curl -X POST https://universeclinic.example.et/api/v1/appointments \
  -H "x-api-key: $HMS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Selam Bekele",
    "phone": "+251911234567",
    "email": "selam@example.com",
    "serviceId": "internal-medicine",
    "preferredDate": "2026-01-20",
    "preferredTime": "09:30",
    "notes": "Follow-up consultation"
  }'
```

`201 Created`:

```json
{
  "ok": true,
  "data": {
    "reference": "UMC-4F7K2Q",
    "status": "pending",
    "createdAt": "2026-01-14T08:22:31.000Z"
  }
}
```

> An appointment created through the API starts as `pending` and is confirmed by clinic staff (which fires `appointment.confirmed`) unless the connected HMS confirms immediately.

### `GET /api/v1/appointments/availability` — open slots

```bash
curl "https://universeclinic.example.et/api/v1/appointments/availability?serviceId=internal-medicine&date=2026-01-20" \
  -H "x-api-key: $HMS_API_KEY"
```

```json
{
  "ok": true,
  "data": {
    "date": "2026-01-20",
    "slots": [
      { "time": "09:00", "available": false },
      { "time": "09:30", "available": true, "capacityRemaining": 2 },
      { "time": "10:00", "available": true, "capacityRemaining": 4 }
    ]
  }
}
```

### `GET /api/v1/appointments/{reference}` — look up an appointment

```bash
curl https://universeclinic.example.et/api/v1/appointments/UMC-4F7K2Q \
  -H "x-api-key: $HMS_API_KEY"
```

```json
{
  "ok": true,
  "data": {
    "reference": "UMC-4F7K2Q",
    "status": "confirmed",
    "patientName": "Selam Bekele",
    "serviceId": "internal-medicine",
    "preferredDate": "2026-01-20",
    "preferredTime": "09:30",
    "createdAt": "2026-01-14T08:22:31.000Z"
  }
}
```

### `POST /api/v1/appointments/{reference}/cancel` — cancel

```bash
curl -X POST https://universeclinic.example.et/api/v1/appointments/UMC-4F7K2Q/cancel \
  -H "x-api-key: $HMS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "reason": "Patient rescheduling" }'
```

```json
{
  "ok": true,
  "data": {
    "reference": "UMC-4F7K2Q",
    "status": "cancelled"
  }
}
```

### `POST /api/v1/patients/sync` — upsert a patient

```bash
curl -X POST https://universeclinic.example.et/api/v1/patients/sync \
  -H "x-api-key: $HMS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "externalId": "HMS-88231",
    "fullName": "Selam Bekele",
    "phone": "+251911234567",
    "email": "selam@example.com"
  }'
```

```json
{
  "ok": true,
  "data": { "id": "pt_219", "fullName": "Selam Bekele", "matchedOn": "phone" }
}
```

### Error envelope

Every failure — validation, auth, not found, upstream HMS error — returns the same shape:

```json
{
  "ok": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "The requested time is no longer available. Please check /availability."
  }
}
```

| Code | HTTP | Meaning |
| --- | --- | --- |
| `INVALID_REQUEST` | 400 | Validation failed (Zod) — check field formats |
| `UNAUTHORIZED` | 401 | Missing/invalid `x-api-key` |
| `NOT_FOUND` | 404 | Unknown reference or resource |
| `SLOT_UNAVAILABLE` | 409 | Requested slot is taken |
| `RATE_LIMITED` | 429 | Too many requests from this IP |
| `UPSTREAM_ERROR` | 502 | The connected HMS returned an error |
| `INTERNAL` | 500 | Unexpected server error |

## Signed outgoing webhooks

When appointment state changes, the site can `POST` a signed event to `WEBHOOK_URL` (if configured). Events: `appointment.created`, `appointment.confirmed`, `appointment.cancelled`.

**Signature.** Each delivery includes `x-umc-signature`: the **HMAC-SHA256 hex digest of the raw request body**, keyed with `WEBHOOK_SECRET`. Compute it over the exact bytes received — do not re-serialize the parsed JSON first.

### Event payloads

```json
{
  "event": "appointment.created",
  "timestamp": "2026-01-14T08:22:31.000Z",
  "data": {
    "reference": "UMC-4F7K2Q",
    "status": "pending",
    "patientName": "Selam Bekele",
    "phone": "+251911234567",
    "serviceId": "internal-medicine",
    "preferredDate": "2026-01-20",
    "preferredTime": "09:30"
  }
}
```

```json
{
  "event": "appointment.confirmed",
  "timestamp": "2026-01-14T10:05:00.000Z",
  "data": {
    "reference": "UMC-4F7K2Q",
    "status": "confirmed",
    "confirmedBy": "reception",
    "preferredDate": "2026-01-20",
    "preferredTime": "09:30"
  }
}
```

```json
{
  "event": "appointment.cancelled",
  "timestamp": "2026-01-15T07:40:12.000Z",
  "data": {
    "reference": "UMC-4F7K2Q",
    "status": "cancelled",
    "reason": "Patient rescheduling"
  }
}
```

### Verification snippet (Node/TypeScript receiver)

```ts
import { createHmac, timingSafeEqual } from "crypto";

export function verifyUmcSignature(
  rawBody: string,
  receivedSignature: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(receivedSignature, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

// in your handler:
// const ok = verifyUmcSignature(rawBody, req.headers["x-umc-signature"], process.env.WEBHOOK_SECRET!);
// if (!ok) return res.status(401).end();
```

Deliveries are retried with backoff for a short window; your endpoint should respond `2xx` quickly and process asynchronously.

## Data model mapping notes

- **Reference code:** every appointment carries a stable reference in the form `UMC-XXXXXX` (uppercase alphanumeric). Treat it as the join key between the website, the HMS, and phone conversations with patients. When the HMS assigns its own ID, store the mapping HMS-side or via `syncPatient`/`externalId` — do not reuse `UMC-XXXXXX` for HMS-internal ids.
- **Dates and times:** all API and webhook timestamps are **ISO 8601**. Dates are `YYYY-MM-DD`, times are `HH:mm` (clinic-local, Ethiopia, UTC+3), and full timestamps use `Z` (UTC). Convert to local display at the edges of your system, never in storage.
- **Status flow:** `pending → confirmed → completed`, with `cancelled` possible from `pending` or `confirmed`. Map HMS states into this set; unknown HMS states should surface as an explicit error, not silently mapped.
- **Identifiers:** patients are matched on phone number by default; `externalId` is honored when provided.

## Security guidance

- **TLS everywhere.** All API traffic and webhook deliveries must run over HTTPS (TLS 1.2+). Never accept an `x-api-key` over plain HTTP.
- **Least privilege.** Issue one API key per integrating system and scope it to what that system needs. Rotate `HMS_API_KEY`, `WEBHOOK_SECRET`, and any HMS credentials on staff changes or suspected exposure.
- **Verify webhook signatures.** Reject any delivery whose `x-umc-signature` does not verify; compare with a constant-time function.
- **Never log patient data.** Logs may include the appointment `reference` and error codes, but never names, phone numbers, emails, or clinical notes — on both the website side and the HMS side.
- **Protect secrets.** Keys live in environment variables and your deployment's secret store. Never commit `.env`, never embed keys in client-side code, and do not send them in support channels.
- **Validate and rate-limit.** All `/api/v1` inputs pass Zod validation and the same per-IP rate limiting as public forms; your HMS adapter should equally validate responses received from the external system before persisting them.
