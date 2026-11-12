"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check, Copy, FileText, Film, HardDrive, Images, Loader2, Pencil, Search, SearchX,
  Trash2, UploadCloud, X,
} from "lucide-react";
import { api, compressImage, formatBytes, uploadMedia, type MediaItem } from "./admin-api";
import { compressVideo } from "@/lib/video-client";
import { ModalShell } from "./admin-content";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── shared media helpers ────────────────────────────────── */

type TileTone = "page" | "picker";
type MediaTypeFilter = "all" | "image" | "video" | "doc";

const DEFAULT_MEDIA_ACCEPT = "image/*,video/mp4,video/webm,application/pdf";

const TYPE_CHIPS: Array<{ id: MediaTypeFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "doc", label: "Docs" },
];

function kindOf(m: MediaItem): Exclude<MediaTypeFilter, "all"> {
  if (m.type.startsWith("image/")) return "image";
  if (m.type.startsWith("video/")) return "video";
  return "doc";
}

function kindLabel(m: MediaItem): string {
  const kind = kindOf(m);
  if (kind === "image") return "Image";
  if (kind === "video") return "Video";
  return m.type === "application/pdf" ? "PDF" : "Document";
}

function matchesFilter(m: MediaItem, filter: MediaTypeFilter, query: string): boolean {
  const kindOk = filter === "all" || kindOf(m) === filter;
  const q = query.trim().toLowerCase();
  const qOk = !q || `${m.name} ${m.alt}`.toLowerCase().includes(q);
  return kindOk && qOk;
}

const PICKER_GRID = "grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4";

/* ── shared UI pieces (page + picker share the same language) ── */

function TypeChips({ value, onChange, tone }: { value: MediaTypeFilter; onChange: (f: MediaTypeFilter) => void; tone: TileTone }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by media type">
      {TYPE_CHIPS.map((chip) => {
        const active = value === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[0.68rem] font-bold transition-colors",
              active
                ? "border-crimson bg-crimson text-white"
                : tone === "picker"
                  ? "border-porcelain/15 text-porcelain/60 hover:border-crimson/50 hover:text-porcelain"
                  : "border-border text-muted-foreground hover:border-crimson/50 hover:text-crimson"
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

function SearchField({ value, onChange, tone, label, inputRef, autoFocus }: { value: string; onChange: (v: string) => void; tone: TileTone; label: string; inputRef?: React.RefObject<HTMLInputElement | null>; autoFocus?: boolean }) {
  return (
    <div className="relative w-full sm:w-48">
      <Search
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2",
          tone === "picker" ? "text-porcelain/40" : "text-muted-foreground"
        )}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search name or alt…"
        aria-label={label}
        className={cn(
          "h-9 w-full rounded-lg border pl-9 pr-3 text-xs focus:border-crimson/60 focus:outline-none",
          tone === "picker"
            ? "border-porcelain/15 bg-porcelain/5 text-porcelain placeholder:text-porcelain/35"
            : "border-border bg-card text-foreground placeholder:text-muted-foreground/70"
        )}
      />
    </div>
  );
}

/** Renders the media itself — images, real video first-frame thumbnails, or a PDF/doc tile. */
function MediaThumb({ m, tone }: { m: MediaItem; tone: TileTone }) {
  const kind = kindOf(m);
  if (kind === "image") {
    return (
      <img
        src={m.url}
        alt={m.alt || m.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    );
  }
  if (kind === "video") {
    return (
      <>
        {/* #t=0.1 makes the browser paint the first frame instead of a blank player */}
        <video src={`${m.url}#t=0.1`} preload="metadata" muted playsInline className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-ink/70 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-porcelain backdrop-blur">
          <Film className="h-3 w-3 text-crimson" aria-hidden="true" /> Video
        </span>
      </>
    );
  }
  return (
    <div className={cn("flex h-full flex-col items-center justify-center gap-2.5", tone === "picker" ? "text-porcelain/70" : "text-muted-foreground")}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-crimson/10 text-crimson">
        <FileText className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="max-w-[85%] truncate text-[0.65rem] font-medium">{m.name}</span>
    </div>
  );
}

/** Ink gradient footer used on picker tiles (name + size + alt). */
function TileFooter({ m }: { m: MediaItem }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/50 to-transparent px-2.5 pb-2 pt-8">
      <p className="truncate text-[0.7rem] font-semibold text-porcelain">{m.name}</p>
      <p className="truncate text-[0.6rem] text-porcelain/55">
        {formatBytes(m.size)} · {kindLabel(m)}
        {m.alt ? ` · ${m.alt}` : ""}
      </p>
    </div>
  );
}

function MediaGridSkeleton({ tone, count = 8, caption = false }: { tone: TileTone; count?: number; caption?: boolean }) {
  return (
    <div className={PICKER_GRID} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className={cn("aspect-[4/3] animate-pulse rounded-xl", tone === "picker" ? "bg-porcelain/10" : "bg-secondary")} />
          {caption && (
            <div className="mt-2.5 space-y-1.5">
              <div className="h-2.5 w-3/4 animate-pulse rounded bg-secondary" />
              <div className="h-2 w-1/3 animate-pulse rounded bg-secondary" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MediaEmptyState({ tone, title, subtext, cta, onCta }: { tone: TileTone; title: string; subtext: string; cta?: string; onCta?: () => void }) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center",
      tone === "picker" ? "border-porcelain/15" : "border-border bg-card/50"
    )}>
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-crimson/25 bg-crimson/10">
        <UploadCloud className="h-7 w-7 text-crimson" aria-hidden="true" />
      </span>
      <p className={cn("mt-4 font-display text-base font-bold", tone === "picker" ? "text-porcelain" : "text-foreground")}>{title}</p>
      <p className={cn("mt-1.5 max-w-xs text-xs leading-relaxed", tone === "picker" ? "text-porcelain/55" : "text-muted-foreground")}>{subtext}</p>
      {cta && onCta && (
        <button
          type="button"
          onClick={onCta}
          className="mt-5 inline-flex min-h-9 items-center gap-2 rounded-lg bg-crimson px-4 text-xs font-bold text-white transition hover:bg-crimson-deep"
        >
          <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" /> {cta}
        </button>
      )}
    </div>
  );
}

/* ── Media library ───────────────────────────────────────── */

export function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MediaTypeFilter>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get<MediaItem[]>("/api/admin/media?pageSize=100");
    if (res.ok) setItems(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      for (const original of Array.from(files)) {
        try {
          // Videos are re-encoded to lean fast-start MP4s in the browser;
          // images pass through the canvas compressor. Failures fall back to
          // the original file, so uploads never block.
          const file = original.type.startsWith("video/")
            ? await compressVideo(original)
            : await compressImage(original);
          const res = await uploadMedia(file);
          if (!res.ok) toast.error(`${original.name}: ${res.error.message}`);
        } catch {
          toast.error(`${original.name}: could not process this file`);
        }
      }
      setUploading(false);
      toast.success("Upload complete");
      void load();
    },
    [load]
  );

  const filtered = useMemo(() => items.filter((m) => matchesFilter(m, filter, query)), [items, filter, query]);
  const totalSize = useMemo(() => items.reduce((sum, m) => sum + m.size, 0), [items]);

  const deleteItem = useCallback(
    async (m: MediaItem) => {
      if (!window.confirm(`Delete "${m.name}"?`)) return;
      const res = await api.delete(`/api/admin/media/${m.id}`);
      if (res.ok) { toast.success("Deleted"); void load(); } else toast.error(res.error.message);
    },
    [load]
  );

  return (
    <div>
      {/* stats + filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground">
            <Images className="h-3.5 w-3.5 text-crimson" aria-hidden="true" />
            <span className="font-bold text-foreground">{items.length}</span> {items.length === 1 ? "asset" : "assets"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground">
            <HardDrive className="h-3.5 w-3.5 text-crimson" aria-hidden="true" />
            <span className="font-bold text-foreground">{formatBytes(totalSize)}</span> total
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SearchField tone="page" label="Search media" value={query} onChange={setQuery} />
          <TypeChips tone="page" value={filter} onChange={setFilter} />
        </div>
      </div>

      {/* dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition sm:p-10",
          dragOver ? "border-crimson bg-crimson/10" : "border-border hover:border-crimson/50 hover:bg-crimson/5"
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); }
        }}
      >
        {uploading ? (
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-crimson/25 bg-crimson/10">
            <Loader2 className="h-7 w-7 animate-spin text-crimson" aria-hidden="true" />
          </span>
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-crimson/25 bg-crimson/10">
            <UploadCloud className="h-7 w-7 text-crimson" aria-hidden="true" />
          </span>
        )}
        <p className="mt-4 text-sm font-semibold text-foreground">
          Drag &amp; drop files here, or <span className="text-crimson underline underline-offset-2">browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Images (auto-compressed to WebP), video (MP4/WebM) and PDF — up to 25MB</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />
      </div>

      {/* grid */}
      {loading ? (
        <div className="mt-6"><MediaGridSkeleton tone="page" caption count={8} /></div>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <MediaEmptyState
            tone="page"
            title="No media yet"
            subtext="Drag files into the dropzone above, or click it to browse — images, videos and PDFs all live here."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <SearchX className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">No matches</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">Nothing matches your current search and filters — try different keywords.</p>
          <button
            type="button"
            onClick={() => { setQuery(""); setFilter("all"); }}
            className="mt-4 inline-flex min-h-9 items-center rounded-lg border border-border px-3.5 text-xs font-bold text-muted-foreground transition hover:border-crimson/50 hover:text-crimson"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => (
            <LibraryTile key={m.id} m={m} onEdit={() => setEditItem(m)} onDelete={() => void deleteItem(m)} />
          ))}
        </div>
      )}

      {editItem && (
        <EditMediaModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => { setEditItem(null); void load(); }}
        />
      )}
    </div>
  );
}

/* ── library tile (non-interactive wrapper; actions are real buttons) ── */

function LibraryTile({ m, onEdit, onDelete }: { m: MediaItem; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-crimson/50 hover:shadow-warm">
      <div className="relative aspect-[4/3] bg-secondary">
        <MediaThumb m={m} tone="page" />
        <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => { void navigator.clipboard.writeText(`${window.location.origin}${m.url}`); toast.success("URL copied"); }}
            aria-label="Copy URL"
            className="rounded-lg bg-ink/70 p-1.5 text-porcelain backdrop-blur transition hover:bg-crimson"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit"
            className="rounded-lg bg-ink/70 p-1.5 text-porcelain backdrop-blur transition hover:bg-crimson"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            className="rounded-lg bg-ink/70 p-1.5 text-porcelain backdrop-blur transition hover:bg-crimson"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="truncate text-xs font-semibold text-foreground" title={m.name}>{m.name}</p>
        <p className="mt-0.5 text-[0.65rem] text-muted-foreground">{formatBytes(m.size)} · {kindLabel(m)}</p>
        {m.alt ? <p className="mt-1 truncate text-[0.62rem] italic text-muted-foreground/80" title={m.alt}>Alt: {m.alt}</p> : null}
      </div>
    </div>
  );
}

function EditMediaModal({ item, onClose, onSaved }: { item: MediaItem; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(item.name);
  const [alt, setAlt] = useState(item.alt);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await api.patch(`/api/admin/media/${item.id}`, { name, alt });
    setBusy(false);
    if (res.ok) { toast.success("Media updated"); onSaved(); } else toast.error(res.error.message);
  }

  return (
    <ModalShell title="Edit media" onClose={onClose}>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">File name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="min-h-10 w-full rounded-xl border border-border px-3.5 text-sm focus:border-crimson/60 focus:outline-none" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Alt text (accessibility + SEO)</span>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className="min-h-10 w-full rounded-xl border border-border px-3.5 text-sm focus:border-crimson/60 focus:outline-none" />
        </label>
        <button onClick={() => void save()} disabled={busy} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-crimson text-sm font-bold text-white transition hover:bg-crimson-deep disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save changes
        </button>
      </div>
    </ModalShell>
  );
}

/* ── media picker modal (used by content/collection editors) ── */

/**
 * Ink-plate media chooser. Picking calls BOTH callbacks when provided
 * (onPick with the url, onPickMedia with the full item), then closes.
 */
export function MediaPickerModal({
  open,
  onClose,
  onPick,
  onPickMedia,
  accept,
}: {
  open: boolean;
  onClose: () => void;
  onPick?: (url: string) => void;
  onPickMedia?: (m: MediaItem) => void;
  accept?: string;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MediaTypeFilter>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setFilter("all");
    setLoading(true);
    api.get<MediaItem[]>("/api/admin/media?pageSize=100").then((res) => {
      if (res.ok) setItems(res.data);
      setLoading(false);
    });
    searchRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  const filtered = items.filter((m) => matchesFilter(m, filter, query));

  function pick(m: MediaItem) {
    onPick?.(m.url);
    onPickMedia?.(m);
    onClose();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const optimized = file.type.startsWith("video/")
        ? await compressVideo(file)
        : await compressImage(file, 1920, 0.82);
      const res = await uploadMedia(optimized);
      if (!res.ok) { toast.error(res.error.message); return; }
      toast.success("Uploaded — inserted");
      pick(res.data);
    } catch {
      toast.error("Could not process this file");
    } finally {
      setUploading(false);
    }
  }

  return (
    <PickerShell
      onClose={onClose}
      header={
        <>
          <PickerHeader
            onClose={onClose}
            count={items.length}
            query={query}
            onQuery={setQuery}
            filter={filter}
            onFilter={setFilter}
            uploading={uploading}
            onUploadClick={() => inputRef.current?.click()}
            searchRef={searchRef}
          />
          <input
            ref={inputRef}
            type="file"
            accept={accept ?? DEFAULT_MEDIA_ACCEPT}
            className="hidden"
            onChange={(e) => void handleUpload(e)}
          />
        </>
      }
      footer={
        <>
          <p className="text-[0.68rem] font-semibold text-porcelain/60">
            {filtered.length === items.length
              ? `${items.length} ${items.length === 1 ? "item" : "items"}`
              : `${filtered.length} of ${items.length} items`}
          </p>
          <p className="text-[0.65rem] text-porcelain/35">Click a tile to insert it — videos preview their first frame.</p>
        </>
      }
    >
      <div>
        {loading ? (
          <MediaGridSkeleton tone="picker" count={8} />
        ) : items.length === 0 ? (
          <MediaEmptyState
            tone="picker"
            title="No media yet"
            subtext="Upload an image, video or PDF — it will be compressed, stored and ready to insert."
            cta="Upload file"
            onCta={() => inputRef.current?.click()}
          />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-porcelain/15 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-porcelain/10">
              <SearchX className="h-5 w-5 text-porcelain/60" aria-hidden="true" />
            </span>
            <p className="mt-3 font-display text-sm font-bold text-porcelain">No matches</p>
            <p className="mt-1 max-w-xs text-xs text-porcelain/55">Nothing matches your current search and filters — try different keywords.</p>
          </div>
        ) : (
          <div className={PICKER_GRID}>
            {filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => pick(m)}
                aria-label={`Insert ${m.name}`}
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-porcelain/12 bg-porcelain/5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-crimson/60 hover:ring-2 hover:ring-crimson/40 focus-visible:border-crimson focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50"
              >
                <MediaThumb m={m} tone="picker" />
                <TileFooter m={m} />
                <span
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-crimson text-white opacity-0 shadow-warm-sm transition group-hover:opacity-100 group-focus-visible:opacity-100"
                  aria-hidden="true"
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </PickerShell>
  );
}

/* ── ink picker shell — warm, premium, sticky header/footer ── */

function PickerHeader({
  onClose, count, query, onQuery, filter, onFilter, uploading, onUploadClick, searchRef,
}: {
  onClose: () => void;
  count: number;
  query: string;
  onQuery: (v: string) => void;
  filter: MediaTypeFilter;
  onFilter: (f: MediaTypeFilter) => void;
  uploading: boolean;
  onUploadClick: () => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-crimson/25 bg-crimson/10 text-crimson">
            <Images className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold tracking-tight text-porcelain">Choose media</h2>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-porcelain/45">
              {count} {count === 1 ? "asset" : "assets"} in library
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-2 text-porcelain/60 transition hover:bg-porcelain/10 hover:text-porcelain"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchField tone="picker" label="Search media" value={query} onChange={onQuery} inputRef={searchRef} />
        <TypeChips tone="picker" value={filter} onChange={onFilter} />
        <button
          type="button"
          onClick={onUploadClick}
          disabled={uploading}
          className="ml-auto inline-flex min-h-9 items-center gap-2 rounded-lg bg-crimson px-3.5 text-xs font-bold text-white transition hover:bg-crimson-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />}
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
    </div>
  );
}

function PickerShell({ onClose, header, footer, children }: { onClose: () => void; header?: React.ReactNode; footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Choose media"
        className="grain relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-porcelain/10 bg-ink text-porcelain shadow-plate"
      >
        <header className="shrink-0 border-b border-porcelain/10 p-6">{header}</header>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
        {footer ? (
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-porcelain/10 px-6 py-3.5">{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}
