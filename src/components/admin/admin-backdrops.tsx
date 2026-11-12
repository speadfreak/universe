"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ChevronDown, ChevronUp, Images, Loader2, Monitor, RotateCcw, Save, Smartphone, Trash2, UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api, compressImage, uploadMedia, type MediaItem } from "./admin-api";
import { MediaPickerModal } from "./admin-media";
import { cn } from "@/lib/utils";
import {
  backdropDefault,
  slotMeta,
  type BackdropFocal,
  type BackdropImage,
  type BackdropMode,
  type BackdropPublic,
  type BackdropSlotMeta,
} from "@/lib/backdrops";

/**
 * Admin > Page backgrounds — editor for the photographic page-backdrop system.
 *
 * Left: every slot (page heroes, mid-page bands, per-service heroes) with a
 * thumbnail, mode badge and crimson active bar. Right: photos manager with
 * focal-point pickers + mobile crops, mode / darkness / warmth / text-side /
 * parallax controls, a scaled live preview of the public PageBackdrop grade,
 * an estimated WCAG contrast chip, and a sticky publish bar.
 */

const MAX_UPLOAD_BYTES = 2_000_000; // hard 2 MB ceiling for photos after compression
const MAX_IMAGES = 4;

const MODE_OPTIONS: Array<{ value: BackdropMode; label: string }> = [
  { value: "single", label: "Single" },
  { value: "slideshow", label: "Slideshow" },
  { value: "kenburns", label: "Ken Burns" },
  { value: "gradient", label: "Gradient only" },
];

const PORCELAIN_L = 0.918; // relative luminance of #F7F4EF body text
const INK_ESTIMATE = 0.056; // conservative luminance estimate for the ink overlay

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** Derived registry entry for a per-service hero key ("hero.service.<slug>"). */
function serviceSlotMeta(key: string): BackdropSlotMeta {
  const slug = key.replace(/^hero\.service\./, "");
  const label =
    slug
      .split(/[-_]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || slug;
  return {
    key,
    label: label ? `${label} page` : key,
    group: "heroes",
    shot: "Service page hero — uses the service card photo until you upload one here",
    default: backdropDefault(key),
  };
}

function objectPositionOf(focal: BackdropFocal | undefined): string {
  const x = Math.round((focal?.x ?? 0.5) * 100);
  const y = Math.round((focal?.y ?? 0.42) * 100);
  return `${x}% ${y}%`;
}

function linearChannel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Average relative luminance of the text-side 55% of the photo (offscreen 32×18 canvas). */
async function sampleTextSideLuminance(url: string, side: "left" | "right"): Promise<number | null> {
  try {
    const img = new Image();
    const loaded = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
    if (!loaded || !img.naturalWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 18;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, 32, 18);
    const { data } = ctx.getImageData(0, 0, 32, 18);
    const startCol = side === "left" ? 0 : 14; // 55% of 32 ≈ 18 columns
    let sum = 0;
    let count = 0;
    for (let y = 0; y < 18; y++) {
      for (let x = startCol; x < startCol + 18; x++) {
        const i = (y * 32 + x) * 4;
        sum += 0.2126 * linearChannel(data[i]) + 0.7152 * linearChannel(data[i + 1]) + 0.0722 * linearChannel(data[i + 2]);
        count += 1;
      }
    }
    return count > 0 ? sum / count : null;
  } catch {
    return null; // tainted canvas (external image) or decode failure — no estimate
  }
}

/* ── small building blocks ─────────────────────────────────────────── */

function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Array<{ value: T; label: string; disabled?: boolean }>;
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex flex-wrap rounded-[10px] border border-border bg-background p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "min-h-9 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-colors",
              active ? "bg-crimson text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              o.disabled && "cursor-not-allowed opacity-35 hover:bg-transparent hover:text-muted-foreground"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-start gap-3">
      <label htmlFor={id} className="w-28 shrink-0 pt-1.5 text-xs font-semibold text-foreground">
        {label}
      </label>
      <div className="min-w-0 flex-1">
        <input
          id={id}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-crimson"
        />
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[0.68rem] text-muted-foreground">{value.toFixed(2)}</span>
          {hint && <span className="text-[0.62rem] text-muted-foreground/80">{hint}</span>}
        </div>
      </div>
    </div>
  );
}

function FocalPicker({
  url,
  focal,
  onChange,
  label,
}: {
  url: string;
  focal: BackdropFocal | undefined;
  onChange: (f: BackdropFocal) => void;
  label: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const x = focal?.x ?? 0.5;
  const y = focal?.y ?? 0.42;

  const apply = (clientX: number, clientY: number) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const nx = clamp01((clientX - r.left) / r.width);
    const ny = clamp01((clientY - r.top) / r.height);
    onChange({ x: Math.round(nx * 1000) / 1000, y: Math.round(ny * 1000) / 1000 });
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <p className="font-mono text-[0.62rem] text-muted-foreground">
          {Math.round(x * 100)}% · {Math.round(y * 100)}%
        </p>
      </div>
      <div
        ref={boxRef}
        tabIndex={0}
        aria-label={`${label} — click or drag to set the crop anchor, arrow keys nudge`}
        className="relative aspect-video w-full cursor-crosshair touch-none select-none overflow-hidden rounded-[10px] border border-border bg-ink focus:border-crimson focus:outline-none"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          apply(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (dragging.current) apply(e.clientX, e.clientY);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 0.05 : 0.01;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            onChange({ x: clamp01(x - step), y });
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            onChange({ x: clamp01(x + step), y });
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            onChange({ x, y: clamp01(y - step) });
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            onChange({ x, y: clamp01(y + step) });
          }
        }}
      >
        <img
          src={url}
          alt=""
          draggable={false}
          loading="lazy"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: objectPositionOf(focal) }}
        />
        {/* crimson focal ring — marks the anchor inside the live crop */}
        <span
          className="absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-crimson bg-crimson/10"
          style={{ left: `${x * 100}%`, top: `${y * 100}%`, boxShadow: "0 0 0 2px rgba(17,16,18,0.35)" }}
          aria-hidden="true"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-crimson" />
        </span>
      </div>
    </div>
  );
}

function ModeBadge({ cfg }: { cfg?: BackdropPublic }) {
  const mode = cfg?.mode ?? "gradient";
  const photo = (cfg?.images.length ?? 0) > 0 && mode !== "gradient";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[0.52rem] font-bold uppercase tracking-wider",
        photo ? "bg-crimson/10 text-crimson" : "bg-secondary text-muted-foreground"
      )}
    >
      {mode === "kenburns" ? "Ken Burns" : mode}
    </span>
  );
}

function SlotRow({
  meta,
  cfg,
  active,
  onSelect,
}: {
  meta: BackdropSlotMeta;
  cfg: BackdropPublic | undefined;
  active: boolean;
  onSelect: () => void;
}) {
  const img = cfg?.images[0];
  const photo = Boolean(img?.url) && cfg?.mode !== "gradient";
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className={cn(
          "relative flex w-full items-center gap-3 rounded-[10px] py-2 pl-3 pr-2.5 text-left transition-colors",
          active ? "bg-crimson/10" : "hover:bg-secondary"
        )}
      >
        {/* 3px crimson active bar, like the sidebar nav */}
        <span
          className={cn(
            "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-crimson transition-opacity",
            active ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        />
        {/* 16:9 thumbnail — photo or warm gradient placeholder (never a grid) */}
        <span className="relative block w-16 shrink-0 overflow-hidden rounded-md border border-border bg-ink" style={{ aspectRatio: "16 / 9" }}>
          {img && photo ? (
            <img
              src={img.url}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: objectPositionOf(img.focal) }}
            />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center px-1 text-center text-[0.4rem] font-bold uppercase leading-tight tracking-wider text-porcelain/55"
              style={{ background: "linear-gradient(100deg, #111012 0%, #4A0F18 100%)" }}
            >
              {meta.label}
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.8rem] font-semibold text-foreground">{meta.label}</span>
          <span className="mt-1 block">
            <ModeBadge cfg={cfg} />
          </span>
        </span>
      </button>
    </li>
  );
}

/** Estimated WCAG chip — scrub-green when AA, crimson warning otherwise. */
function ContrastChip({ gradientSafe, ratio }: { gradientSafe: boolean; ratio: number | null }) {
  const scrubTones =
    "border-scrub/35 bg-scrub/10 text-scrub [.admin-dark_&]:border-scrub/50 [.admin-dark_&]:bg-scrub/30 [.admin-dark_&]:text-[#8fcfc0]";
  const warnTones =
    "border-crimson/40 bg-crimson/10 text-crimson [.admin-dark_&]:border-crimson/50 [.admin-dark_&]:bg-crimson/20 [.admin-dark_&]:text-[#ef5360]";
  const base = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-bold";
  if (gradientSafe) {
    return (
      <span className={cn(base, scrubTones)} title="Gradient backdrops always meet contrast targets">
        AA ✓ gradient
      </span>
    );
  }
  if (ratio === null) return null; // measuring (or photo could not be sampled)
  return ratio >= 4.5 ? (
    <span className={cn(base, scrubTones)}>AA ✓ {ratio.toFixed(1)}:1</span>
  ) : (
    <span className={cn(base, warnTones)}>Low contrast — raise darkness ({ratio.toFixed(1)}:1)</span>
  );
}

/**
 * Scaled-down replica of the public PageBackdrop grade — same gradient stops,
 * warmth tint, ink curve and sample copy as src/components/site/page-backdrop.tsx.
 */
function MiniBackdrop({ cfg, device }: { cfg: BackdropPublic; device: "desktop" | "phone" }) {
  const mobile = device === "phone";
  const img = cfg.images[0];
  const hasPhoto = Boolean(img?.url) && cfg.mode !== "gradient";
  const url = img ? (mobile ? img.mobileUrl || img.url : img.url) : undefined;
  const focal = img ? (mobile ? img.mobileFocal ?? img.focal : img.focal) : undefined;

  // Same grade math as the public component (ink floor 0.46 included).
  const dk = Math.min(1, Math.max(0.46, cfg.darkness));
  const angle = cfg.textSide === "right" ? 260 : 100;
  const inkAlpha = Math.min(0.97, 0.5 + dk * 0.5);
  const midAlpha = Math.min(0.92, 0.2 + dk * 0.48);
  const farAlpha = Math.min(0.8, 0.1 + dk * 0.34);
  const warmAlpha = 0.1 + clamp01(cfg.warmth) * 0.3;

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      {hasPhoto && url ? (
        <img
          src={url}
          alt=""
          draggable={false}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: objectPositionOf(focal) }}
        />
      ) : (
        /* warm gradient fallback with the faint logo-circle motif */
        <div className="absolute inset-0" aria-hidden="true">
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 rounded-full border border-porcelain/10",
              mobile ? "h-24 w-24" : "h-52 w-52",
              cfg.textSide === "right" ? "-left-12" : "-right-12"
            )}
          >
            <div className={cn("absolute rounded-full border border-porcelain/5", mobile ? "inset-3" : "inset-7")} />
            <div className="absolute inset-0 rounded-full border border-dashed border-crimson/15" />
          </div>
        </div>
      )}

      {/* warm grade: ink→oxblood, darkest where the text sits */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: `linear-gradient(${angle}deg, rgba(17,16,18,${inkAlpha.toFixed(3)}) 0%, rgba(74,15,24,${midAlpha.toFixed(3)}) 52%, rgba(17,16,18,${farAlpha.toFixed(3)}) 100%)`,
        }}
      />
      {/* crimson warmth tint */}
      <div
        className="absolute inset-0 mix-blend-soft-light"
        aria-hidden="true"
        style={{
          background: `linear-gradient(${angle}deg, rgba(227,32,43,${(warmAlpha * 1.4).toFixed(3)}) 0%, rgba(181,18,28,${warmAlpha.toFixed(3)}) 100%)`,
        }}
      />
      {/* header-legibility fade */}
      <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-ink/70 to-transparent" aria-hidden="true" />

      {/* representative sample copy */}
      <div
        className={cn(
          "absolute inset-x-0 top-[30%] z-10",
          mobile ? "px-4" : "px-7",
          cfg.textSide === "right" ? "text-right" : "text-left"
        )}
      >
        <p
          className="font-display font-semibold text-porcelain"
          style={{ fontSize: mobile ? 15 : 27, lineHeight: 1.16, letterSpacing: "-0.01em" }}
        >
          Care that moves with you
        </p>
        <p className="mt-1.5 text-porcelain/75" style={{ fontSize: mobile ? 8 : 12, lineHeight: 1.4 }}>
          Consultations, labs and same-day checkups under one calm roof.
        </p>
      </div>

      {/* curved bottom edge melting into the next section */}
      <svg viewBox="0 0 1440 84" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[-1px] z-10 h-[15%] w-full" aria-hidden="true">
        <path d="M0 84 L0 44 C 300 6 720 4 1060 26 C 1220 36 1360 46 1440 44 L1440 84 Z" fill="var(--ink)" />
      </svg>
    </div>
  );
}

/* ── main editor ───────────────────────────────────────────────────── */

export default function AdminBackdrops() {
  const router = useRouter();
  const [slots, setSlots] = useState<BackdropSlotMeta[]>([]);
  const [configs, setConfigs] = useState<Record<string, BackdropPublic>>({});
  const [drafts, setDrafts] = useState<Record<string, BackdropPublic>>({});
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"new" | "mobile" | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [measure, setMeasure] = useState<{ url: string; side: "left" | "right"; darkness: number; ratio: number } | null>(null);
  const newPhotoRef = useRef<HTMLInputElement>(null);
  const mobilePhotoRefs = useRef<Array<HTMLInputElement | null>>([]);

  const load = useCallback(async () => {
    const res = await api.get<{ slots: BackdropSlotMeta[]; configs: Record<string, BackdropPublic> }>("/api/admin/backdrops");
    if (res.ok) {
      setSlots(res.data.slots);
      setConfigs(res.data.configs);
      setActiveKey((cur) => (cur && res.data.configs[cur] ? cur : (res.data.slots[0]?.key ?? null)));
    } else {
      toast.error(res.error.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const heroSlots = useMemo(() => slots.filter((s) => s.group === "heroes"), [slots]);
  const bandSlots = useMemo(() => slots.filter((s) => s.group === "bands"), [slots]);
  const serviceMetas = useMemo(() => {
    const registry = new Set(slots.map((s) => s.key));
    return Object.keys(configs)
      .filter((k) => k.startsWith("hero.service.") && !registry.has(k))
      .sort()
      .map(serviceSlotMeta);
  }, [slots, configs]);

  const activeMeta: BackdropSlotMeta | null = useMemo(() => {
    if (!activeKey) return null;
    return slotMeta(activeKey) ?? serviceSlotMeta(activeKey);
  }, [activeKey]);

  // Unsaved edits live per-slot; a missing draft falls back to the saved config.
  const base: BackdropPublic | undefined = activeKey ? (configs[activeKey] ?? backdropDefault(activeKey)) : undefined;
  const draft = activeKey ? (drafts[activeKey] ?? base) : undefined;
  const dirty = Boolean(activeKey && drafts[activeKey]);
  const firstImage = draft?.images[0];

  // Estimated WCAG contrast of porcelain copy over the darkest text-side region.
  useEffect(() => {
    if (!draft || !firstImage) return;
    let cancelled = false;
    const url = firstImage.url;
    const side = draft.textSide;
    const darkness = draft.darkness;
    void (async () => {
      const imgL = await sampleTextSideLuminance(url, side);
      if (cancelled || imgL === null) return;
      const dk = Math.min(1, Math.max(0.46, darkness));
      const inkAlpha = Math.min(0.97, 0.5 + dk * 0.5);
      const composed = imgL * (1 - inkAlpha) + INK_ESTIMATE * inkAlpha;
      const ratio = (PORCELAIN_L + 0.05) / (composed + 0.05);
      setMeasure({ url, side, darkness, ratio });
    })();
    return () => {
      cancelled = true;
    };
  }, [firstImage, draft]);

  const gradientSafe = !draft || draft.mode === "gradient" || draft.images.length === 0;
  const freshMeasure =
    measure && draft && firstImage && measure.url === firstImage.url && measure.side === draft.textSide && measure.darkness === draft.darkness
      ? measure.ratio
      : null;

  /* ── immutable draft updates ── */

  function patchDraft(patch: Partial<BackdropPublic>) {
    if (!activeKey || !draft) return;
    const next = { ...draft, ...patch };
    setDrafts((prev) => ({ ...prev, [activeKey]: next }));
  }

  function patchImages(updater: (images: BackdropImage[]) => BackdropImage[]) {
    if (!draft) return;
    patchDraft({ images: updater(draft.images) });
  }

  function patchImage(idx: number, patch: Partial<BackdropImage>) {
    patchImages((imgs) => imgs.map((im, i) => (i === idx ? { ...im, ...patch } : im)));
  }

  function moveImage(idx: number, dir: -1 | 1) {
    patchImages((imgs) => {
      const j = idx + dir;
      if (j < 0 || j >= imgs.length) return imgs;
      const next = [...imgs];
      const [moved] = next.splice(idx, 1);
      next.splice(j, 0, moved);
      return next;
    });
  }

  function removeImage(idx: number) {
    if (!draft) return;
    const images = draft.images.filter((_, i) => i !== idx);
    // An empty list always renders the gradient fallback on the site.
    patchDraft(images.length === 0 ? { images, mode: "gradient" } : { images });
  }

  function appendImage(img: BackdropImage) {
    if (!draft) return;
    if (activeMeta?.gradientOnly) {
      toast.error("This slot is gradient-only by design");
      return;
    }
    if (draft.images.length >= MAX_IMAGES) {
      toast.error("A backdrop holds at most 4 photos");
      return;
    }
    patchDraft({
      images: [...draft.images, img],
      mode: draft.mode === "gradient" ? "single" : draft.mode,
    });
  }

  /* ── uploads ── */

  function escalate(file: File, maxDim: number): Promise<File> {
    return compressImage(file, maxDim, 0.7).then((f) =>
      f.size > MAX_UPLOAD_BYTES ? compressImage(file, maxDim, 0.6) : f
    );
  }

  async function handleUploadNew(file: File) {
    if (!draft || !activeMeta) return;
    if (activeMeta.gradientOnly) {
      toast.error("This slot is gradient-only by design");
      return;
    }
    if (draft.images.length >= MAX_IMAGES) {
      toast.error("A backdrop holds at most 4 photos");
      return;
    }
    setUploading("new");
    try {
      // Desktop master (2400px) — escalate quality until the 2 MB ceiling holds.
      let desktop = await compressImage(file, 2400, 0.82);
      if (desktop.size > MAX_UPLOAD_BYTES) desktop = await escalate(file, 2400);
      if (desktop.size > MAX_UPLOAD_BYTES) {
        toast.error("Desktop photo is still over 2 MB after compression — please choose a smaller file.");
        return;
      }
      const up = await uploadMedia(desktop);
      if (!up.ok) {
        toast.error(up.error.message);
        return;
      }
      // Phone crop (900px) — skip when compression cannot produce a distinct file.
      let mobileUrl: string | undefined;
      const mobile = await compressImage(file, 900, 0.82);
      if (mobile !== desktop) {
        let small = mobile;
        if (small.size > MAX_UPLOAD_BYTES) small = await escalate(file, 900);
        if (small.size <= MAX_UPLOAD_BYTES) {
          const mup = await uploadMedia(small);
          if (mup.ok && mup.data.url !== up.data.url) mobileUrl = mup.data.url;
        }
      }
      appendImage({ url: up.data.url, focal: { x: 0.5, y: 0.42 }, mobileUrl });
    } finally {
      setUploading(null);
    }
  }

  async function handleMobileCrop(idx: number, file: File) {
    setUploading("mobile");
    try {
      let mobile = await compressImage(file, 900, 0.82);
      if (mobile.size > MAX_UPLOAD_BYTES) mobile = await escalate(file, 900);
      if (mobile.size > MAX_UPLOAD_BYTES) {
        toast.error("Mobile crop is still over 2 MB after compression — please choose a smaller file.");
        return;
      }
      const up = await uploadMedia(mobile);
      if (!up.ok) {
        toast.error(up.error.message);
        return;
      }
      patchImage(idx, { mobileUrl: up.data.url, mobileFocal: undefined });
    } finally {
      setUploading(null);
    }
  }

  /* ── publish / reset ── */

  async function save(cfg: BackdropPublic, successMessage = "Backdrop published") {
    if (!activeKey) return;
    setSaving(true);
    const res = await api.put<BackdropPublic>(`/api/admin/backdrops/${encodeURIComponent(activeKey)}`, {
      mode: cfg.mode,
      images: cfg.images,
      darkness: cfg.darkness,
      warmth: cfg.warmth,
      textSide: cfg.textSide,
      parallax: cfg.parallax,
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    toast.success(successMessage);
    const key = activeKey;
    setConfigs((prev) => ({ ...prev, [key]: res.data }));
    setDrafts((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    router.refresh();
  }

  function resetToDefault() {
    if (!activeMeta) return;
    void save(activeMeta.default, "Backdrop reset to default");
  }

  /* ── render ── */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-crimson" aria-label="Loading page backgrounds" />
      </div>
    );
  }

  const editorOpen = Boolean(activeKey && activeMeta && draft);

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* ── slot list ── */}
      <aside
        aria-label="Backdrop slots"
        className="max-h-96 overflow-y-auto rounded-2xl border border-border bg-card p-3 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7.5rem)]"
      >
        <p className="px-2 pb-1.5 pt-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">Page heroes</p>
        <ul className="space-y-0.5">
          {heroSlots.map((meta) => (
            <SlotRow
              key={meta.key}
              meta={meta}
              cfg={configs[meta.key]}
              active={activeKey === meta.key}
              onSelect={() => setActiveKey(meta.key)}
            />
          ))}
        </ul>

        <p className="px-2 pb-1.5 pt-4 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">Mid-page bands</p>
        <ul className="space-y-0.5">
          {bandSlots.map((meta) => (
            <SlotRow
              key={meta.key}
              meta={meta}
              cfg={configs[meta.key]}
              active={activeKey === meta.key}
              onSelect={() => setActiveKey(meta.key)}
            />
          ))}
        </ul>

        {serviceMetas.length > 0 && (
          <>
            <p className="px-2 pb-1.5 pt-4 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">Service pages</p>
            <ul className="space-y-0.5">
              {serviceMetas.map((meta) => (
                <SlotRow
                  key={meta.key}
                  meta={meta}
                  cfg={configs[meta.key]}
                  active={activeKey === meta.key}
                  onSelect={() => setActiveKey(meta.key)}
                />
              ))}
            </ul>
          </>
        )}
      </aside>

      {/* ── editor ── */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6" aria-label="Backdrop editor">
        {editorOpen && activeMeta && draft ? (
          <>
            {/* header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-xl tracking-tight text-foreground">{activeMeta.label}</h2>
                <p className="mt-0.5 font-mono text-[0.68rem] text-muted-foreground">{activeMeta.key}</p>
              </div>
              <ModeBadge cfg={draft} />
            </div>
            <p className="mt-3 rounded-[10px] border border-border bg-secondary px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
              <span className="font-bold text-foreground">Shot list:</span> {activeMeta.shot}
            </p>

            <div className="mt-6 space-y-8">
              {/* ── photos ── */}
              <section aria-label="Photos">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Photos <span className="ml-1 font-mono tracking-normal">{draft.images.length}/{MAX_IMAGES}</span>
                  </p>
                  {!activeMeta.gradientOnly && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        disabled={draft.images.length >= MAX_IMAGES || uploading !== null}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-[10px] border border-border px-3 text-xs font-bold text-muted-foreground transition hover:border-crimson/50 hover:text-crimson disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Images className="h-3.5 w-3.5" /> Add from library
                      </button>
                      <button
                        type="button"
                        onClick={() => newPhotoRef.current?.click()}
                        disabled={draft.images.length >= MAX_IMAGES || uploading !== null}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-[10px] border border-border px-3 text-xs font-bold text-muted-foreground transition hover:border-crimson/50 hover:text-crimson disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploading === "new" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                        {uploading === "new" ? "Uploading…" : "Upload new"}
                      </button>
                    </div>
                  )}
                </div>

                {activeMeta.gradientOnly ? (
                  <p className="rounded-[10px] border border-border bg-secondary px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                    This slot is gradient-only by design — the warm ink→oxblood fallback renders here, no photo needed.
                  </p>
                ) : draft.images.length === 0 ? (
                  <p className="rounded-[10px] border border-dashed border-border px-3.5 py-6 text-center text-xs leading-relaxed text-muted-foreground">
                    No photos yet — the warm gradient fallback renders on the site. Add one from the library or upload a photo
                    (a desktop master plus a 900px phone crop are prepared automatically).
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {draft.images.map((img, idx) => (
                      <li key={`${idx}-${img.url}`} className="rounded-xl border border-border p-3">
                        <div className="flex flex-col gap-3 sm:flex-row">
                          {/* preview thumb (honors the focal point) */}
                          <div className="relative w-full shrink-0 overflow-hidden rounded-[10px] border border-border bg-ink sm:w-36" style={{ aspectRatio: "16 / 9" }} aria-hidden="true">
                            <img
                              src={img.url}
                              alt=""
                              loading="lazy"
                              className="absolute inset-0 h-full w-full object-cover"
                              style={{ objectPosition: objectPositionOf(img.focal) }}
                            />
                            <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/70 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-porcelain/90">
                              {idx + 1}
                            </span>
                            {img.mobileUrl && (
                              <span className="absolute right-1.5 top-1.5 rounded-full bg-scrub/85 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-porcelain">
                                Mobile crop
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-foreground">Photo {idx + 1}</p>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveImage(idx, -1)}
                                  disabled={idx === 0}
                                  className="flex h-9 w-9 items-center justify-center rounded-[8px] text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                                  aria-label={`Move photo ${idx + 1} up`}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveImage(idx, 1)}
                                  disabled={idx === draft.images.length - 1}
                                  className="flex h-9 w-9 items-center justify-center rounded-[8px] text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                                  aria-label={`Move photo ${idx + 1} down`}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeImage(idx)}
                                  className="flex h-9 w-9 items-center justify-center rounded-[8px] text-muted-foreground transition hover:bg-crimson/10 hover:text-crimson"
                                  aria-label={`Remove photo ${idx + 1}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <input
                              type="text"
                              value={img.alt ?? ""}
                              maxLength={220}
                              onChange={(e) => patchImage(idx, { alt: e.target.value })}
                              placeholder="Alt text — describe the photo (accessibility)"
                              aria-label={`Alt text for photo ${idx + 1}`}
                              className="min-h-10 w-full rounded-[10px] border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-crimson focus:outline-none"
                            />

                            {/* mobile crop control */}
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-secondary px-3 py-2">
                              <p className="text-[0.68rem] text-muted-foreground">
                                {img.mobileUrl ? (
                                  <span className="font-semibold text-foreground">Mobile crop set — phones use the 900px version</span>
                                ) : (
                                  "No mobile crop — phones reuse the desktop photo"
                                )}
                              </p>
                              <div className="flex items-center gap-2">
                                {img.mobileUrl && (
                                  <button
                                    type="button"
                                    onClick={() => patchImage(idx, { mobileUrl: undefined, mobileFocal: undefined })}
                                    className="inline-flex min-h-9 items-center rounded-[8px] px-2 text-[0.68rem] font-bold text-muted-foreground transition hover:text-crimson"
                                  >
                                    Reuse desktop
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => mobilePhotoRefs.current[idx]?.click()}
                                  disabled={uploading !== null}
                                  className="inline-flex min-h-9 items-center gap-1.5 rounded-[8px] border border-border bg-background px-2.5 text-[0.68rem] font-bold text-muted-foreground transition hover:border-crimson/50 hover:text-crimson disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {uploading === "mobile" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Smartphone className="h-3 w-3" />}
                                  {uploading === "mobile" ? "Uploading…" : "Upload mobile crop"}
                                </button>
                              </div>
                              <input
                                ref={(el) => {
                                  mobilePhotoRefs.current[idx] = el;
                                }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                tabIndex={-1}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) void handleMobileCrop(idx, f);
                                  e.target.value = "";
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* focal-point pickers */}
                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                          <FocalPicker
                            label="Desktop focal point"
                            url={img.url}
                            focal={img.focal}
                            onChange={(f) => patchImage(idx, { focal: f })}
                          />
                          {img.mobileUrl && (
                            <FocalPicker
                              label="Mobile focal point"
                              url={img.mobileUrl}
                              focal={img.mobileFocal ?? img.focal}
                              onChange={(f) => patchImage(idx, { mobileFocal: f })}
                            />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* ── mode & grade ── */}
              <section aria-label="Mode and grade">
                <p className="mb-3 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">Mode &amp; grade</p>
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="w-28 shrink-0 pt-1.5 text-xs font-semibold text-foreground">Mode</span>
                    <Segmented
                      ariaLabel="Backdrop mode"
                      value={draft.mode}
                      onChange={(mode) => patchDraft({ mode })}
                      options={MODE_OPTIONS.map((o) => ({
                        ...o,
                        disabled: o.value !== "gradient" && (Boolean(activeMeta.gradientOnly) || draft.images.length === 0),
                      }))}
                    />
                  </div>

                  <SliderRow
                    label="Overlay darkness"
                    value={draft.darkness}
                    onChange={(darkness) => patchDraft({ darkness })}
                    hint="Below 0.46 the site clamps for headline legibility"
                  />
                  <SliderRow label="Warmth" value={draft.warmth} onChange={(warmth) => patchDraft({ warmth })} />

                  <div className="flex flex-wrap items-start gap-3">
                    <span className="w-28 shrink-0 pt-1.5 text-xs font-semibold text-foreground">Text side</span>
                    <Segmented
                      ariaLabel="Text side"
                      value={draft.textSide}
                      onChange={(textSide) => patchDraft({ textSide })}
                      options={[
                        { value: "left", label: "Left" },
                        { value: "right", label: "Right" },
                      ]}
                    />
                  </div>

                  <div className="flex flex-wrap items-start gap-3">
                    <span className="w-28 shrink-0 pt-1.5 text-xs font-semibold text-foreground">Parallax</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={draft.parallax}
                      onClick={() => patchDraft({ parallax: !draft.parallax })}
                      className={cn(
                        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors",
                        draft.parallax ? "border-crimson bg-crimson/20" : "border-border bg-background"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute h-5 w-5 rounded-full transition-all",
                          draft.parallax ? "left-[1.55rem] bg-crimson" : "left-1 bg-muted-foreground/70"
                        )}
                        aria-hidden="true"
                      />
                      <span className="sr-only">Parallax scroll</span>
                    </button>
                    <span className="pt-1 text-xs text-muted-foreground">
                      {draft.parallax ? "Photo drifts gently as the page scrolls" : "Static photo"}
                    </span>
                  </div>
                </div>
              </section>

              {/* ── live preview ── */}
              <section aria-label="Live preview">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">Live preview</p>
                  <ContrastChip gradientSafe={gradientSafe} ratio={freshMeasure} />
                </div>
                <div className="flex flex-wrap items-start gap-6">
                  <figure className="w-full max-w-[640px]">
                    <div className="overflow-hidden rounded-lg border border-border shadow-sm" style={{ aspectRatio: "16 / 9" }}>
                      <MiniBackdrop cfg={draft} device="desktop" />
                    </div>
                    <figcaption className="mt-1.5 flex items-center justify-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <Monitor className="h-3 w-3" aria-hidden="true" /> Desktop · 1440
                    </figcaption>
                  </figure>
                  <figure className="w-[300px] shrink-0">
                    <div className="overflow-hidden rounded-[20px] border-[5px] border-ink shadow-sm" style={{ aspectRatio: "19 / 9" }}>
                      <MiniBackdrop cfg={draft} device="phone" />
                    </div>
                    <figcaption className="mt-1.5 flex items-center justify-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <Smartphone className="h-3 w-3" aria-hidden="true" /> Phone · mobile crop
                    </figcaption>
                  </figure>
                </div>
                <p className="mt-2 text-[0.62rem] leading-relaxed text-muted-foreground/80">
                  Slideshow and Ken Burns cross-fade through the photo list on the live site; the preview shows the first photo.
                </p>
              </section>
            </div>

            {/* sticky publish bar */}
            <div className="sticky bottom-0 z-20 -mx-4 -mb-4 mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-4 py-4 sm:-mx-6 sm:-mb-6 sm:px-6">
              <p className={cn("text-xs font-semibold", dirty ? "text-amber-500" : "text-muted-foreground")}>
                {dirty ? "Unsaved changes" : "All changes published"}
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={resetToDefault}
                  disabled={saving}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-border px-4 text-sm font-semibold text-muted-foreground transition hover:border-crimson/50 hover:text-crimson disabled:opacity-60"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset to default
                </button>
                <button
                  type="button"
                  onClick={() => draft && void save(draft)}
                  disabled={saving}
                  className="relative inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-crimson px-5 text-sm font-bold text-white transition hover:bg-crimson-deep disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                  Save changes
                  {dirty && !saving && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-amber-400" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {slots.length === 0 ? "Couldn't load backdrop slots." : "Select a slot from the list to edit its backdrop."}
            </p>
            {slots.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  void load();
                }}
                className="inline-flex min-h-10 items-center rounded-[10px] border border-border px-4 text-xs font-bold text-muted-foreground transition hover:border-crimson/50 hover:text-crimson"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </section>

      {/* hidden inputs */}
      <input
        ref={newPhotoRef}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleUploadNew(f);
          e.target.value = "";
        }}
      />

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        accept="image/*"
        onPickMedia={(m: MediaItem) => {
          appendImage({ url: m.url, alt: m.alt || undefined, focal: { x: 0.5, y: 0.42 } });
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
