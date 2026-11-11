# Architecture — Universe Medical Center Website

This document explains how the site is put together: the layering, the virtual hash router, the content model, auth, media, security, and deployment topology. For external/integration concerns, see [HMS_INTEGRATION.md](HMS_INTEGRATION.md).

## Layered architecture

The codebase is layered top-down, with dependencies pointing strictly downward:

```
┌──────────────────────────────────────────────────────────┐
│  src/app        Next.js App Router                       │
│                 page.tsx (SPA shell) + route handlers    │
├──────────────────────────────────────────────────────────┤
│  src/components features & UI (Framer Motion / GSAP)     │
│                 src/components/ui  = shadcn/ui primitives│
├──────────────────────────────────────────────────────────┤
│  src/server     server services                          │
│                 auth · hms adapters · rate limiting ·    │
│                 audit log · validation (Zod)             │
├──────────────────────────────────────────────────────────┤
│  src/lib/db.ts  Prisma client singleton → Postgres       │
└──────────────────────────────────────────────────────────┘
```

- **App routes** (`src/app`) hold only thin glue: the single-page shell that mounts sections, and API route handlers that parse input, call a service, and shape the response.
- **Features/components** (`src/components`) render sections and interact with APIs via typed fetch helpers. No component touches Prisma directly.
- **Server services** (`src/server`) contain all business logic: authentication, appointments, media, rate limiting, auditing. They are the only place that talks to the database.
- **DB** — one Prisma client singleton (`src/lib/db.ts`) shared across the process to avoid exhausting connections, especially under serverless.

## Virtual hash router

The public site is a **single-page app shell under one Next route** (`src/app/page.tsx`). Navigation between "pages" is handled by a small custom hash router (`src/lib/router.ts`) that treats the URL fragment as the route: `/#/about`, `/#/services`, `/#/doctors`, `/#/admin`, and so on.

Why a hash router instead of one Next.js route per page?

- **One app shell.** The cinematic transitions, GSAP scene lifecycle, Lenis smooth scrolling, and the language provider boot once and never remount. Full page loads would tear down and restart heavy scenes on every navigation.
- **Deep-linkable without server rewrites.** Hash changes never hit the server, so any "page" is linkable and shareable with zero server configuration — the whole app is one deployable document.
- **State-based page transitions.** The router keeps a current-route state; an enter/exit animation orchestrator reacts to it, giving coherent, interruptible transitions that Next.js file-based routing alone would not express.

The router is deliberately small and handles the unglamorous parts too: it sets `document.title` per route and restores scroll position on back/forward navigation (and resets to top on new navigation).

## Content model

Page content lives in the database as **PageSection rows**: each row is keyed by `page` + `sectionKey` (e.g. `home/hero`, `about/story`) and stores a JSON `data` column holding `{ en: ..., am: ... }`.

- **Typed defaults** for every section live in `src/lib/content-defaults.ts`. Rendering merges a section's DB row **over** its typed default, so a section is never broken by a missing or partially edited field, and a fresh database still renders a complete site.
- **Section registry** (`src/lib/sections.ts`) is the single source of truth: it maps each `sectionKey` to its React component, its default content type, and its **admin form schema**. The same registry drives the public renderer and the admin panel's auto-generated editing forms — add a section once and it is both renderable and editable.

## Collections

Editorial entities are modeled as first-class Prisma models:

| Model | Purpose |
| --- | --- |
| `Service` | Clinical services shown in the services section and appointment form |
| `Doctor` | Physician profiles (name, specialty, photo, schedule) |
| `Package` | Health-check and procedure packages |
| `BlogPost` | Articles (EN/AM), draft/published states |
| `Testimonial` | Patient quotes |
| `Faq` | Question/answer pairs |
| `GalleryItem` | Clinic photos |
| `Branch` | Branch info for Addis Ababa and Ambo |

All collection text fields store `{ en, am }` so every entity is bilingual at the data level.

## Admin authentication

- **Password hashing:** scrypt with per-user random salt; only the hash and salt are stored. Login is constant-time compared to avoid timing leaks.
- **Sessions:** a JWT signed with **HMAC-SHA256** using `SESSION_SECRET`, delivered as an **httpOnly** cookie (also `Secure` + `SameSite=Lax` in production). No session data is client-readable or client-writable.
- **Roles:** `super_admin`, `editor`, `receptionist`. The role guard is enforced **inside every `/api/admin` route handler server-side** — the admin UI hides links for convenience only, never as a security boundary. Receptionists manage the appointments inbox; editors manage content; super admins manage staff and settings.

## Media library

Uploaded images are stored as **binary (`bytea`) rows in Postgres** and served through `GET /api/media/[id]` with long-lived cache headers (immutable, content-hashed filenames where applicable). Keeping binaries in Postgres means zero additional infrastructure to provision for a small clinic deployment, and one consistent backup story.

> **Scaling note:** if media volume grows, the storage layer can be swapped for object storage (e.g. Supabase Storage or S3) by implementing the same media service interface with an `ObjectStorageMediaService` — upload returns a URL/ID, serving redirects or proxies. No call sites change.

## Rate limiting

Public write endpoints (contact form, appointment form, newsletter) and the login endpoint are protected by an **in-memory, per-IP token bucket**. Buckets refill at a fixed rate; exhausted buckets return `429`. The limiter is deliberately dependency-free; it resets on process restart, which is acceptable for the traffic profile of a clinic site. (Multi-instance deployments would move buckets to Redis — the interface already isolates this.)

## Audit log

Every privileged mutation through `/api/admin` (content edits, collection changes, media uploads, appointment status changes, staff management) writes an **audit log** row: who, what, which entity, before/after summary, when, and from which IP. The log is append-only and viewable in the admin panel by `super_admin`.

## Validation

**Zod validates every input** — public forms, `/api/v1`, and every admin mutation. Schemas live in `src/server/validation` and are shared between API handlers and client forms where practical, so error messages match on both sides. Invalid input never reaches a service or the database.

## Internationalization (i18n)

- Locale is a **client-side context** (`EN` / `AM`) with a toggle in the header; it updates the `<html lang>` attribute on switch.
- **Content rows store both locales** (`{ en, am }`); the renderer picks the active locale and falls back to `en` if an `am` string is missing.
- **UI chrome strings** (buttons, labels, toasts, form messages) live in `src/lib/i18n.ts` as flat dictionaries.
- The admin panel edits both locales side by side, so a translation cannot be lost by editing one.

## Performance choices

- **Dynamic imports** for GSAP-heavy scenes and below-the-fold sections, keeping the initial bundle focused on the hero.
- **Canvas particle system** on the hero caps device-pixel-ratio (DPR ≤ 2) and respects `prefers-reduced-motion` with a static fallback.
- **`next/image`** for all content imagery with explicit sizes; media API responses are cacheable and immutable.
- **Font strategy:** `display: swap` so text renders immediately on slow connections.
- Lenis smooth scroll is disabled on touch devices where native scrolling is smoother.

## Deployment topology

```
Browser ──► Vercel (Next.js: SPA shell + route handlers)
                     │
                     ├──► Neon Postgres  (content, collections, media bytea,
                     │                    appointments, audit log)
                     └──► Email/hosting providers (form delivery)
```

- **Vercel** hosts the app and all API routes; no separate server to run.
- **Neon** provides managed Postgres with branching for staging/preview deploys — set preview deployments to a Neon branch so they never touch production content.
- **File storage consideration:** because media binaries live in Postgres (`bytea`), database size grows with uploads. Monitor Neon storage; if media dominates, migrate to object storage via the media service adapter (see *Media library* above). Serverless filesystems are ephemeral, so files must never be written to local disk in production.

## Folder tree

```
.
├── prisma/
│   ├── schema.prisma              # PageSection, collections, Media, AdminUser,
│   │                              #   Appointment, AuditLog, …
│   └── seed.ts                    # Default content + first admin from ADMIN_* env
├── src/
│   ├── app/
│   │   ├── page.tsx               # SPA shell; hash router mounts pages
│   │   ├── layout.tsx             # Fonts, providers, <html lang>
│   │   └── api/
│   │       ├── v1/                # Versioned public API (x-api-key)
│   │       ├── admin/             # Admin API (session cookie + role guard + audit)
│   │       └── media/[id]/        # Serves media binaries from Postgres
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives
│   │   └── features/              # Hero, Services, Doctors, Appointment, Admin, …
│   ├── server/
│   │   ├── auth/                  # scrypt, JWT session, role guard
│   │   ├── services/
│   │   │   └── hms/               # HmsAdapter implementations (LocalDbAdapter …)
│   │   ├── validation/            # Zod schemas
│   │   └── rate-limit.ts          # Per-IP token bucket
│   ├── lib/
│   │   ├── content-defaults.ts    # Typed default content for every section
│   │   ├── sections.ts            # Section registry (render + admin forms)
│   │   ├── router.ts              # Virtual hash router
│   │   ├── i18n.ts                # UI strings (EN/AM)
│   │   └── db.ts                  # Prisma client singleton
│   └── hooks/
├── content/                       # Legal pages (privacy-policy.md, terms-of-service.md)
├── docs/                          # ARCHITECTURE.md, HMS_INTEGRATION.md
└── public/
```
