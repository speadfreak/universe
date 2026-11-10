"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { api } from "./admin-api";
import { CONTENT_SCHEMA, type FieldDef, type SectionData } from "@/lib/content-schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MediaPickerModal } from "./admin-media";
import { cn } from "@/lib/utils";

type SectionRow = { id: string; page: string; sectionKey: string; data: { en?: SectionData; am?: SectionData }; visible: boolean; sortOrder: number };

export function AdminContent() {
  const router = useRouter();
  const [rows, setRows] = useState<SectionRow[]>([]);
  const [page, setPage] = useState(CONTENT_SCHEMA[0].page);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const pageDef = useMemo(() => CONTENT_SCHEMA.find((p) => p.page === page)!, [page]);

  async function load() {
    setLoading(true);
    const res = await api.get<SectionRow[]>("/api/admin/sections");
    if (res.ok) setRows(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const rowFor = (key: string) => rows.find((r) => r.page === page && r.sectionKey === key);
  const activeDef = pageDef.sections.find((s) => s.key === activeKey);

  async function toggleVisible(sectionKey: string, visible: boolean) {
    const row = rowFor(sectionKey);
    const data = row?.data || {};
    const res = await api.put<SectionRow>("/api/admin/sections", {
      page,
      sectionKey,
      data,
      visible,
      sortOrder: row?.sortOrder ?? 0,
    });
    if (res.ok) {
      toast.success(visible ? "Section shown" : "Section hidden");
      void load();
      router.refresh();
    } else toast.error(res.error.message);
  }

  async function move(sectionKey: string, dir: -1 | 1) {
    const list = pageDef.sections.map((s) => {
      const row = rowFor(s.key);
      return { key: s.key, sortOrder: row?.sortOrder ?? pageDef.sections.indexOf(s) };
    });
    const idx = list.findIndex((s) => s.key === sectionKey);
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= list.length) return;
    const a = list[idx];
    const b = list[swapWith];
    for (const item of [ { ...a, sortOrder: b.sortOrder }, { ...b, sortOrder: a.sortOrder } ]) {
      const row = rowFor(item.key);
      await api.put("/api/admin/sections", { page, sectionKey: item.key, data: row?.data || {}, visible: row?.visible ?? true, sortOrder: item.sortOrder });
    }
    toast.success("Order updated");
    void load();
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr_1.6fr]">
      {/* pages */}
      <div className="rounded-2xl border border-navy/8 bg-white p-3">
        <p className="px-2 pb-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-navy/40">Pages</p>
        <ul className="space-y-0.5">
          {CONTENT_SCHEMA.map((p) => (
            <li key={p.page}>
              <button
                onClick={() => { setPage(p.page); setActiveKey(null); }}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-[0.83rem] font-medium transition",
                  page === p.page ? "bg-brand/10 text-brand" : "text-navy/70 hover:bg-navy/4"
                )}
              >
                {p.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* sections */}
      <div className="rounded-2xl border border-navy/8 bg-white p-4">
        <p className="px-1 pb-3 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-navy/40">{pageDef.label} sections</p>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-navy/30" /></div>
        ) : (
          <ul className="space-y-2">
            {pageDef.sections.map((s) => {
              const row = rowFor(s.key);
              return (
                <li key={s.key} className={cn("rounded-xl border px-3.5 py-3 transition", activeKey === s.key ? "border-brand/40 bg-brand/5" : "border-navy/8")}>
                  <div className="flex items-center justify-between gap-2">
                    <button onClick={() => setActiveKey(s.key)} className="flex-1 text-left text-[0.83rem] font-semibold text-navy">
                      {s.label}
                    </button>
                    <div className="flex items-center gap-1">
                      <button onClick={() => void move(s.key, -1)} className="rounded p-1.5 text-navy/40 hover:bg-navy/5 hover:text-navy" aria-label="Move up"><ChevronUp className="h3.5 w-3.5" /></button>
                      <button onClick={() => void move(s.key, 1)} className="rounded p-1.5 text-navy/40 hover:bg-navy/5 hover:text-navy" aria-label="Move down"><ChevronDown className="h3.5 w-3.5" /></button>
                      <button
                        onClick={() => void toggleVisible(s.key, !(row?.visible ?? true))}
                        className={cn("rounded p-1.5 hover:bg-navy/5", (row?.visible ?? true) ? "text-emerald-600" : "text-navy/30")}
                        aria-label={row?.visible === false ? "Show section" : "Hide section"}
                      >
                        {(row?.visible ?? true) ? <Eye className="h3.5 w-3.5" /> : <EyeOff className="h3.5 w-3.5" />}
                      </button>
                      <button onClick={() => setActiveKey(s.key)} className="rounded p-1.5 text-navy/40 hover:bg-navy/5 hover:text-brand" aria-label="Edit"><Pencil className="h3.5 w-3.5" /></button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* editor */}
      <div className="rounded-2xl border border-navy/8 bg-white p-5">
        {activeDef ? (
          <SectionEditor
            key={`${page}.${activeDef.key}`}
            page={page}
            sectionKey={activeDef.key}
            label={activeDef.label}
            fields={activeDef.fields}
            row={rowFor(activeDef.key)}
            onSaved={() => { void load(); router.refresh(); }}
          />
        ) : (
          <div className="flex h-full min-h-40 flex-col items-center justify-center text-center text-navy/40">
            <Pencil className="mb-3 h-8 w-8" />
            <p className="text-sm font-medium">Select a section to edit</p>
            <p className="mt-1 max-w-xs text-xs">Every heading, paragraph, button label and image on the public site lives here — in English and Amharic.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── per-section editor with EN/AM tabs ──────────────────── */

function SectionEditor({
  page, sectionKey, label, fields, row, onSaved,
}: {
  page: string;
  sectionKey: string;
  label: string;
  fields: FieldDef[];
  row?: SectionRow;
  onSaved: () => void;
}) {
  const [locale, setLocale] = useState<"en" | "am">("en");
  const [en, setEn] = useState<SectionData>({ ...(row?.data?.en || {}) });
  const [am, setAm] = useState<SectionData>({ ...(row?.data?.am || {}) });
  const [saving, setSaving] = useState(false);
  const [pickerField, setPickerField] = useState<string | null>(null);

  const current = locale === "en" ? en : am;
  const setter = locale === "en" ? setEn : setAm;

  function setValue(name: string, value: SectionData[string]) {
    setter((prev) => ({ ...prev, [name]: value }));
  }

  async function save() {
    setSaving(true);
    const res = await api.put("/api/admin/sections", { page, sectionKey, data: { en, am }, visible: row?.visible ?? true, sortOrder: row?.sortOrder ?? 0 });
    setSaving(false);
    if (res.ok) {
      toast.success(`Saved — changes are live on the site`);
      onSaved();
    } else {
      toast.error(res.error.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-bold text-navy">{label}</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-navy/12 p-0.5">
            {(["en", "am"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={cn("rounded-md px-3 py-1.5 text-xs font-bold transition", locale === l ? "bg-brand text-white" : "text-navy/50 hover:text-navy")}
              >
                {l === "en" ? "EN" : "አማ"}
              </button>
            ))}
          </div>
          <button
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white transition hover:bg-[#2456d6] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h3.5 w-3.5 animate-spin" /> : <Save className="h3.5 w-3.5" />}
            Save
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {fields.map((f) => (
          <FieldInput
            key={f.name}
            field={f}
            value={current[f.name]}
            onChange={(v) => setValue(f.name, v)}
            onPickImage={() => setPickerField(f.name)}
          />
        ))}
      </div>

      {pickerField && (
        <MediaPickerModal
          open
          onClose={() => setPickerField(null)}
          onPick={(url) => {
            setValue(pickerField, url);
            setPickerField(null);
          }}
        />
      )}
    </div>
  );
}

export function FieldInput({
  field, value, onChange, onPickImage,
}: {
  field: FieldDef;
  value: SectionData[string] | undefined;
  onChange: (v: SectionData[string]) => void;
  onPickImage?: () => void;
}) {
  const listRows = Array.isArray(value) ? value : [];

  if (field.list) {
    return (
      <div>
        <p className="mb-2 flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">
          {field.label}
          <button
            onClick={() => onChange([...listRows, Object.fromEntries(field.list!.map((lf) => [lf.name, ""]))])}
            className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-1 text-[0.65rem] font-bold text-brand"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </p>
        <div className="space-y-2">
          {listRows.map((row, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl border border-navy/10 p-3">
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                {field.list!.map((lf) => (
                  <label key={lf.name} className="block">
                    <span className="mb-1 block text-[0.62rem] font-semibold uppercase tracking-wider text-navy/40">{lf.label}</span>
                    <input
                      value={(typeof row === "object" && row !== null ? (row as Record<string, unknown>)[lf.name] as string : "") || ""}
                      onChange={(e) => {
                        const next = [...listRows];
                        next[i] = { ...(next[i] as object), [lf.name]: e.target.value };
                        onChange(next);
                      }}
                      className="min-h-9 w-full rounded-lg border border-navy/12 px-3 text-sm focus:border-brand/50 focus:outline-none"
                    />
                  </label>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    if (i === 0) return;
                    const next = [...listRows];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    onChange(next);
                  }}
                  className="rounded p-1 text-navy/40 hover:text-navy"
                  aria-label="Move up"
                >
                  <ChevronUp className="h3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onChange(listRows.filter((_, j) => j !== i))}
                  className="rounded p-1 text-navy/40 hover:text-clinic-red"
                  aria-label="Remove"
                >
                  <Trash2 className="h3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const str = typeof value === "string" ? value : "";

  if (field.type === "textarea") {
    return (
      <label className="block">
        <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">{field.label}</span>
        <textarea
          rows={4}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-navy/12 px-3.5 py-2.5 text-sm focus:border-brand/50 focus:outline-none"
        />
      </label>
    );
  }

  if (field.type === "image" || field.type === "video") {
    return (
      <label className="block">
        <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">{field.label}</span>
        <div className="flex gap-2">
          <input
            value={str}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.type === "video" ? "/api/media/… or https://…" : "/api/media/…"}
            className="min-h-10 flex-1 rounded-xl border border-navy/12 px-3.5 text-sm focus:border-brand/50 focus:outline-none"
          />
          {onPickImage && (
            <button type="button" onClick={onPickImage} className="rounded-xl border border-navy/12 px-3.5 text-xs font-bold text-navy/70 transition hover:border-brand/40 hover:text-brand">
              Choose
            </button>
          )}
        </div>
      </label>
    );
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">{field.label}</span>
      <input
        value={str}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-10 w-full rounded-xl border border-navy/12 px-3.5 text-sm focus:border-brand/50 focus:outline-none"
      />
    </label>
  );
}

export function ModalShell({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn("max-h-[88vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl", wide ? "max-w-3xl" : "max-w-lg")}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-navy">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-navy/40 hover:bg-navy/5 hover:text-navy" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
