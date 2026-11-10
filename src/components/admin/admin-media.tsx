"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy, FileText, Film, Image as ImageIcon, Loader2, Pencil, Trash2, UploadCloud,
} from "lucide-react";
import { api, compressImage, uploadMedia, type MediaItem } from "./admin-api";
import { ModalShell } from "./admin-content";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Media library ───────────────────────────────────────── */

export function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
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
        const file = await compressImage(original);
        const res = await uploadMedia(file);
        if (!res.ok) toast.error(`${original.name}: ${res.error.message}`);
      }
      setUploading(false);
      toast.success("Upload complete");
      void load();
    },
    [load]
  );

  return (
    <div>
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
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition",
          dragOver ? "border-brand bg-brand/5" : "border-navy/15 hover:border-brand/40 hover:bg-brand/3"
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        onKeyDown={(e) => { if (e.key === "Enter") inputRef.current?.click(); }}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        ) : (
          <UploadCloud className="h-8 w-8 text-brand" />
        )}
        <p className="mt-3 text-sm font-semibold text-navy">Drag & drop, or click to upload</p>
        <p className="mt-1 text-xs text-navy/50">Images (auto-compressed to WebP), video (MP4/WebM) and PDF — up to 25MB</p>
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
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-navy/30" /></div>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-sm text-navy/40">No media yet — upload your first file above.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((m) => (
            <div key={m.id} className="group overflow-hidden rounded-xl border border-navy/8 bg-white">
              <div className="relative aspect-square bg-navy/4">
                {m.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt={m.alt || m.name} loading="lazy" className="h-full w-full object-cover" />
                ) : m.type.startsWith("video/") ? (
                  <video src={m.url} className="h-full w-full object-cover" muted preload="metadata" />
                ) : (
                  <div className="flex h-full items-center justify-center text-navy/30"><FileText className="h-10 w-10" /></div>
                )}
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-navy/70 via-transparent to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => { void navigator.clipboard.writeText(`${window.location.origin}${m.url}`); toast.success("URL copied"); }}
                    className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur hover:bg-white/35"
                    aria-label="Copy URL"
                  >
                    <Copy className="h3.5 w-3.5" />
                  </button>
                  <div className="flex gap-1.5">
                    <button onClick={() => setEditItem(m)} className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur hover:bg-white/35" aria-label="Edit"><Pencil className="h3.5 w-3.5" /></button>
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Delete "${m.name}"?`)) return;
                        const res = await api.delete(`/api/admin/media/${m.id}`);
                        if (res.ok) { toast.success("Deleted"); void load(); } else toast.error(res.error.message);
                      }}
                      className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur hover:bg-clinic-red"
                      aria-label="Delete"
                    >
                      <Trash2 className="h3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-semibold text-navy">{m.name}</p>
                <p className="text-[0.65rem] text-navy/45">{(m.size / 1024 / 1024).toFixed(2)} MB · {m.type.split("/")[1]}</p>
              </div>
            </div>
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
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy/50">File name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="min-h-10 w-full rounded-xl border border-navy/12 px-3.5 text-sm focus:border-brand/50 focus:outline-none" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy/50">Alt text (accessibility + SEO)</span>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className="min-h-10 w-full rounded-xl border border-navy/12 px-3.5 text-sm focus:border-brand/50 focus:outline-none" />
        </label>
        <button onClick={() => void save()} disabled={busy} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold text-white transition hover:bg-[#2456d6] disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save changes
        </button>
      </div>
    </ModalShell>
  );
}

/* ── Media picker modal (used by content/collection editors) ── */

export function MediaPickerModal({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (url: string) => void }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get<MediaItem[]>("/api/admin/media?pageSize=100").then((res) => {
      if (res.ok) setItems(res.data);
      setLoading(false);
    });
  }, [open]);

  if (!open) return null;

  return (
    <ModalShell title="Choose media" onClose={onClose} wide>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-navy/12 px-3 py-2 text-xs font-bold text-navy/70 hover:border-brand/40 hover:text-brand"
        >
          <UploadCloud className="h3.5 w-3.5" /> Upload new
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/webm,application/pdf"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const compressed = await compressImage(file);
            const res = await uploadMedia(compressed);
            if (res.ok) {
              onPick(res.data.url);
              onClose();
            } else toast.error(res.error.message);
          }}
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-navy/30" /></div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-navy/40">No media yet — upload something first.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {items.map((m) => (
            <button
              key={m.id}
              onClick={() => { onPick(m.url); onClose(); }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-navy/10 bg-navy/4 transition hover:border-brand/50"
            >
              {m.type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.alt || m.name} loading="lazy" className="h-full w-full object-cover" />
              ) : m.type.startsWith("video/") ? (
                <div className="flex h-full flex-col items-center justify-center text-navy/40"><Film className="h-7 w-7" /><span className="mt-1 text-[0.6rem]">{m.name}</span></div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-navy/40"><FileText className="h-7 w-7" /><span className="mt-1 text-[0.6rem]">{m.name}</span></div>
              )}
              <span className="absolute inset-x-0 bottom-0 truncate bg-navy/70 px-1.5 py-1 text-[0.58rem] text-white opacity-0 transition group-hover:opacity-100">{m.name}</span>
            </button>
          ))}
        </div>
      )}
    </ModalShell>
  );
}
