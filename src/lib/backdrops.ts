/**
 * Universe Medical Center — photographic page-backdrop system.
 *
 * Every page hero and full-bleed mid-page band sits on a PageBackdrop: a
 * photograph (from the media library or static seed), a warm ink→oxblood
 * grade that darkens toward the text side, film grain, a soft vignette and a
 * curved bottom edge that melts into the next section. No grids, no tiles.
 *
 * This module is the single source of truth for slot keys and defaults:
 *  - BACKDROP_SLOTS  — the registry (admin > Backgrounds lists these)
 *  - mergeBackdropRows — merges DB rows over registry defaults
 *  - publicBackdropMap — what the site payload (SiteData.backdrops) carries
 */

// ── Types ────────────────────────────────────────────────────────────

export type BackdropFocal = { x: number; y: number }; // 0..1 (fraction of width/height)

export type BackdropImage = {
  url: string;
  alt?: string;
  /** Desktop focal point (object-position). Defaults to center-upper. */
  focal?: BackdropFocal;
  /** Optional separate mobile crop (≤900px wide). Falls back to url. */
  mobileUrl?: string;
  mobileFocal?: BackdropFocal;
};

export type BackdropMode = "single" | "slideshow" | "kenburns" | "gradient";

/** The config the public site consumes (no registry metadata). */
export type BackdropPublic = {
  mode: BackdropMode;
  images: BackdropImage[];
  darkness: number; // 0..1 — overlay darkness toward the text side
  warmth: number; // 0..1 — crimson/amber grade strength
  textSide: "left" | "right";
  parallax: boolean;
};

/** Registry entry — everything the admin needs to present a slot. */
export type BackdropSlotMeta = {
  key: string;
  label: string;
  group: "heroes" | "bands";
  /** Shot-list hint shown in admin + README. */
  shot: string;
  /** Slot accepts no photos (gradient-only by design). */
  gradientOnly?: boolean;
  default: BackdropPublic;
};

/** A stored row (prisma BackdropSlot). */
export type BackdropRow = {
  key: string;
  mode: string;
  images: unknown;
  darkness: number;
  warmth: number;
  textSide: string;
  parallax: boolean;
};

// ── Registry ─────────────────────────────────────────────────────────

const DEF = {
  darkness: 0.62,
  warmth: 0.42,
  textSide: "left" as const,
  parallax: true,
};

const fallback = (): BackdropPublic => ({
  mode: "gradient",
  images: [],
  darkness: DEF.darkness,
  warmth: DEF.warmth,
  textSide: DEF.textSide,
  parallax: false,
});

function slot(
  key: string,
  label: string,
  group: BackdropSlotMeta["group"],
  shot: string,
  d: Partial<BackdropPublic> & { gradientOnly?: boolean } = {},
): BackdropSlotMeta {
  const { gradientOnly, ...cfg } = d;
  return {
    key,
    label,
    group,
    shot,
    gradientOnly,
    default: {
      mode: gradientOnly ? "gradient" : "gradient",
      images: gradientOnly ? [] : [],
      darkness: cfg.darkness ?? DEF.darkness,
      warmth: cfg.warmth ?? DEF.warmth,
      textSide: cfg.textSide ?? DEF.textSide,
      parallax: cfg.parallax ?? DEF.parallax,
    },
  };
}

export const BACKDROP_SLOTS: BackdropSlotMeta[] = [
  // ── Page heroes ──
  slot("hero.home", "Home hero", "heroes", "Care in action — clinician listening to a patient, warm window light (photo or video)", { darkness: 0.58 }),
  slot("hero.about", "About page", "heroes", "The clinic building and team, warm morning light"),
  slot("hero.services", "Services page", "heroes", "Laboratory bench, ultrasound room or corridor details"),
  slot("hero.doctors", "Doctors page", "heroes", "Consulting-room light — desk, stethoscope, files"),
  slot("hero.packages", "Packages page", "heroes", "Reception desk and checkup moments"),
  slot("hero.blog", "Blog page", "heroes", "Calm editorial still life — journal, tea, glasses"),
  slot("hero.post", "Blog posts", "heroes", "Editorial still life per article (post cover is used when this slot is empty)"),
  slot("hero.contact", "Contact page", "heroes", "Building exterior and street — Lemi Kura / Ambo"),
  slot("hero.book", "Book appointment", "heroes", "Reassuring waiting area, soft chairs, plants"),
  slot("hero.resources", "Patient resources", "heroes", "Health-education leaflets on a warm desk"),
  slot("hero.legal", "Privacy & terms", "heroes", "Gradient only — no photo needed", { gradientOnly: true }),
  slot("hero.404", "404 page", "heroes", "Gradient only — no photo needed", { gradientOnly: true }),

  // ── Full-bleed mid-page bands ──
  slot("band.call-help", "Call for help banner", "bands", "Hands holding a phone in urgency + warmth, dark grade", { darkness: 0.7, warmth: 0.5 }),
  slot("band.journey", "Patient journey band", "bands", "Patient and nurse walking a sunlit corridor, depth", { darkness: 0.66 }),
  slot("band.final-cta", "Final call-to-action", "bands", "Warm handshake at the doorway, dusk rim light", { darkness: 0.68 }),
  slot("band.footer-top", "Footer top band", "bands", "Building at dusk, warm windows, long exposure", { darkness: 0.8, warmth: 0.36 }),
];

/** Dynamic per-service hero keys ("hero.service.<slug>"). */
export function serviceSlotKey(slug: string): string {
  return `hero.service.${slug}`;
}

export const BACKDROP_KEYS: string[] = BACKDROP_SLOTS.map((s) => s.key);

// ── Merge helpers ────────────────────────────────────────────────────

const MODES: BackdropMode[] = ["single", "slideshow", "kenburns", "gradient"];

function clamp01(v: unknown, fallbackValue: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallbackValue;
  return Math.min(1, Math.max(0, n));
}

function parseImages(v: unknown): BackdropImage[] {
  if (!Array.isArray(v)) return [];
  const out: BackdropImage[] = [];
  for (const raw of v.slice(0, 4)) {
    if (!raw || typeof raw !== "object") continue;
    const img = raw as Record<string, unknown>;
    const url = typeof img.url === "string" ? img.url : "";
    if (!url) continue;
    const focal =
      img.focal && typeof img.focal === "object"
        ? {
            x: clamp01((img.focal as BackdropFocal).x, 0.5),
            y: clamp01((img.focal as BackdropFocal).y, 0.42),
          }
        : undefined;
    const mobileFocal =
      img.mobileFocal && typeof img.mobileFocal === "object"
        ? {
            x: clamp01((img.mobileFocal as BackdropFocal).x, 0.5),
            y: clamp01((img.mobileFocal as BackdropFocal).y, 0.42),
          }
        : undefined;
    out.push({
      url,
      alt: typeof img.alt === "string" ? img.alt.slice(0, 220) : undefined,
      focal,
      mobileUrl: typeof img.mobileUrl === "string" ? img.mobileUrl : undefined,
      mobileFocal,
    });
  }
  return out;
}

function sanitize(cfg: Partial<BackdropPublic> | undefined, base: BackdropPublic): BackdropPublic {
  if (!cfg) return base;
  const images = Array.isArray(cfg.images) ? parseImages(cfg.images) : base.images;
  const mode = MODES.includes(cfg.mode as BackdropMode) ? (cfg.mode as BackdropMode) : base.mode;
  // An empty image list always renders the warm gradient fallback.
  return {
    mode: images.length === 0 ? "gradient" : mode,
    images,
    darkness: clamp01(cfg.darkness, base.darkness),
    warmth: clamp01(cfg.warmth, base.warmth),
    textSide: cfg.textSide === "right" ? "right" : "left",
    parallax: typeof cfg.parallax === "boolean" ? cfg.parallax : base.parallax,
  };
}

function rowToPublic(row: BackdropRow, base: BackdropPublic): BackdropPublic {
  return sanitize(
    {
      mode: row.mode as BackdropMode,
      images: Array.isArray(row.images) ? (row.images as BackdropImage[]) : [],
      darkness: row.darkness,
      warmth: row.warmth,
      textSide: row.textSide as "left" | "right",
      parallax: row.parallax,
    },
    base,
  );
}

/** Registry lookup with graceful fallback for unknown keys. */
export function backdropDefault(key: string): BackdropPublic {
  const meta = BACKDROP_SLOTS.find((s) => s.key === key);
  if (meta) return meta.default;
  // Unknown slot (e.g. hero.service.<slug>) — inherit the services hero.
  const services = BACKDROP_SLOTS.find((s) => s.key === "hero.services");
  return services ? services.default : fallback();
}

export function slotMeta(key: string): BackdropSlotMeta | undefined {
  return BACKDROP_SLOTS.find((s) => s.key === key);
}

/**
 * Build the public backdrop map consumed by the site payload.
 * `rows` are stored overrides; `services` produce per-service hero slots
 * that default to each service's own card image.
 */
export function publicBackdropMap(
  rows: BackdropRow[],
  services: Array<{ slug: string; image: string; titleEn: string; titleAm: string }>,
): Record<string, BackdropPublic> {
  const map: Record<string, BackdropPublic> = {};
  const byKey = new Map(rows.map((r) => [r.key, r]));

  for (const meta of BACKDROP_SLOTS) {
    const row = byKey.get(meta.key);
    map[meta.key] = row ? rowToPublic(row, meta.default) : meta.default;
  }

  for (const sv of services) {
    const key = serviceSlotKey(sv.slug);
    const row = byKey.get(key);
    const derived: BackdropPublic = {
      mode: "single",
      images: sv.image
        ? [{ url: sv.image, alt: sv.titleEn || sv.titleAm, focal: { x: 0.5, y: 0.45 } }]
        : [],
      darkness: 0.66,
      warmth: 0.42,
      textSide: "left",
      parallax: true,
    };
    map[key] = row ? rowToPublic(row, derived) : sanitize(derived, derived);
  }

  return map;
}

/**
 * Fill a config's images when the slot is empty (e.g. blog posts fall back
 * to their own cover photo before hitting the gradient).
 */
export function withImageFallback(cfg: BackdropPublic | undefined, images: BackdropImage[]): BackdropPublic {
  if (!cfg) return { ...fallback(), images: parseImages(images) };
  if (cfg.images.length > 0) return cfg;
  const imgs = parseImages(images);
  if (imgs.length === 0) return cfg;
  return { ...cfg, images: imgs, mode: cfg.mode === "gradient" ? "single" : cfg.mode };
}
