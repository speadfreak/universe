# Universe Medical Center — Clinic Website & Platform

The official website and content platform for **Universe Medical Center (Universe Clinic)** — an internal-medicine clinic with branches in **Addis Ababa** (Ayat–Bole Arabsa Main Road) and **Ambo** (Heran Clinic, est. 2021).

This is a cinematic, fully bilingual (**English / አማርኛ**) single-page clinic website with a custom admin panel, built with:

- **Next.js 16 (App Router)** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **Framer Motion** + **GSAP** + **Lenis** (smooth scroll) for the cinematic feel
- **Prisma** + **PostgreSQL** (Neon) for content, media, and appointments
- Custom admin panel for content, collections, media, and the appointments inbox

## Features

**Public site**

- Cinematic single-page experience: hero, services, doctors, packages, testimonials, FAQ, gallery, blog, branches, and contact — all managed as content
- Full **EN / አማርኛ** bilingual content with a client-side locale switcher
- Contact form, appointment request form, and newsletter signup
- Deep-linkable virtual hash router (`/#/about`, `/#/services`, …) with state-based page transitions

**Admin panel** (`/#/admin`)

- Content editor for every page section, driven by the section registry
- Collections CRUD: services, doctors, packages, blog posts, testimonials, FAQs, gallery items, branches
- **Media library** — uploads stored in Postgres (`bytea`) and served through `/api/media/[id]`
- **Appointments inbox** — review, confirm, and cancel patient appointment requests
- Role-based access: `super_admin`, `editor`, `receptionist`

**Platform**

- Versioned REST API under `/api/v1` with API-key auth
- **HMS adapter layer** — swap the built-in local storage adapter for an external Hospital Management System
- Audit log, per-IP rate limiting, and Zod validation on every input

## Quick start

```bash
bun install
cp .env.example .env          # then set DATABASE_URL (see table below)
bunx prisma db push           # create the schema
bun prisma/seed.ts            # seed default content + first admin
bun run dev                   # http://localhost:3000
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Prisma connection string for the Postgres database (Neon recommended). |
| `POSTGRES_URL` | ✅ | Direct Postgres URL used by tooling; typically the same value as `DATABASE_URL`. |
| `SESSION_SECRET` | ✅ | Secret used to sign admin session cookies (HMAC-SHA256). Use a long random string. |
| `ADMIN_EMAIL` | ✅ (seed) | Email for the initial admin account created by the seed script. |
| `ADMIN_PASSWORD` | ✅ (seed) | Password for the initial admin account (stored scrypt-hashed). |
| `ADMIN_NAME` | ✅ (seed) | Display name of the initial admin account. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public base URL of the site (e.g. `https://universeclinic.et`). |
| `WEBHOOK_SECRET` | Optional | Secret used to sign outgoing webhook payloads (`x-umc-signature`). |
| `WEBHOOK_URL` | Optional | Destination URL for outgoing webhook events (e.g. your HMS endpoint). |

> HMS integrations add two optional variables: `HMS_ADAPTER` and `HMS_API_KEY`. See [docs/HMS_INTEGRATION.md](docs/HMS_INTEGRATION.md).

## Admin panel

The first admin account is **created by the seed script** from the `ADMIN_*` environment variables — there is no public signup. To sign in:

1. Run the app and log in through the site's admin login.
2. Open **`/#/admin`** to enter the admin panel.

Additional staff accounts (editors, receptionists) can be created from the admin panel by a `super_admin`.

## Deployment (Vercel + Neon)

1. **Import the repo** — import `github.com/speadfreak/universe` into Vercel as a new project.
2. **Provision the database** — create a Postgres database on [Neon](https://neon.tech) and copy the pooled connection string.
3. **Add environment variables** — in Vercel → Project → Settings → Environment Variables, add every variable from the table above. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
4. **Deploy** — deploy the project, then run `bunx prisma db push` and `bun prisma/seed.ts` once against the production database (locally, with `DATABASE_URL` pointed at Neon) to create the schema and the first admin.

## API overview

All integration endpoints live under the versioned prefix `/api/v1` and are authenticated with an `x-api-key` header (value of `HMS_API_KEY`). Errors always use a consistent envelope: `{ "ok": false, "error": { "code", "message" } }`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/appointments` | Create an appointment request |
| `GET` | `/api/v1/appointments/availability` | Query open slots for a service/date |
| `GET` | `/api/v1/appointments/{reference}` | Look up an appointment by reference (`UMC-XXXXXX`) |
| `POST` | `/api/v1/appointments/{reference}/cancel` | Cancel an appointment |
| `POST` | `/api/v1/patients/sync` | Upsert a patient record |

Every appointment carries a unique reference code (`UMC-XXXXXX`) used across the API and webhooks. Outgoing webhooks (`appointment.created`, `appointment.confirmed`, `appointment.cancelled`) are signed with HMAC-SHA256.

👉 Full request/response examples, webhook verification snippets, and adapter guidance live in **[docs/HMS_INTEGRATION.md](docs/HMS_INTEGRATION.md)**.

## Project structure

```
.
├── prisma/
│   ├── schema.prisma          # Data model: content, collections, media, audit log
│   └── seed.ts                # Seeds default content + first admin from env
├── src/
│   ├── app/                   # Next.js App Router (SPA shell + API routes)
│   │   ├── page.tsx           # Single-page app shell; hash router mounts pages
│   │   └── api/               # /api/v1, /api/admin, /api/media/[id]
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   └── features/          # Hero, Services, Doctors, Appointment, …
│   ├── server/
│   │   ├── auth/              # scrypt hashing, JWT sessions, role guards
│   │   ├── services/          # Business logic + HMS adapters
│   │   └── validation/        # Zod schemas
│   ├── lib/                   # content defaults, section registry, router, i18n
│   └── hooks/
├── content/                   # Legal pages (privacy policy, terms of service)
├── docs/                      # ARCHITECTURE.md, HMS_INTEGRATION.md
└── public/
```

## Security notes

- Admin passwords are stored with **scrypt**; sessions are **HMAC-SHA256-signed, httpOnly** JWT cookies.
- Role checks (`super_admin` / `editor` / `receptionist`) are enforced **server-side on every `/api/admin` route** — the UI is never trusted.
- **Zod validates every input** (public forms and admin API alike); public forms and the login endpoint are rate-limited per IP.
- Admin actions are recorded in an **audit log**.
- Patient data is never written to logs; secrets live only in environment variables — never commit `.env`.

## License

© 2026 Universe Medical Center. All rights reserved.
