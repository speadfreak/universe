"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, ImagePlus, Loader2, Pencil, Plus, Save, Search, Trash2 } from "lucide-react";
import { api } from "./admin-api";
import { ModalShell, FieldInput } from "./admin-content";
import { MediaPickerModal } from "./admin-media";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StatusBadge } from "./admin-dashboard";
import { cn } from "@/lib/utils";

/* ── field configs per entity ────────────────────────────── */

type ColField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "markdown" | "number" | "bool" | "select" | "image" | "bilingual-list" | "string-list" | "faqlist" | "datetime" | "password";
  options?: string[];
  help?: string;
  col?: 1 | 2;
};

const ICON_OPTIONS = ["stethoscope", "microscope", "heart-handshake", "clock", "scan-heart", "user-round-check", "hand-coins", "flask-conical", "monitor-smartphone", "siren", "calendar-check", "shield", "sparkles"];

const CONFIGS: Record<string, { title: string; primary: string; secondary?: string; fields: ColField[] }> = {
  services: {
    title: "Service", primary: "titleEn", secondary: "slug",
    fields: [
      { name: "titleEn", label: "Title (EN)", type: "text" },
      { name: "titleAm", label: "Title (AM)", type: "text" },
      { name: "slug", label: "Slug (URL)", type: "text", help: "e.g. internal-medicine-care" },
      { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
      { name: "image", label: "Image", type: "image" },
      { name: "taglineEn", label: "Tagline (EN)", type: "text" },
      { name: "taglineAm", label: "Tagline (AM)", type: "text" },
      { name: "excerptEn", label: "Excerpt (EN)", type: "textarea" },
      { name: "excerptAm", label: "Excerpt (AM)", type: "textarea" },
      { name: "bodyEn", label: "Body (EN · markdown)", type: "markdown" },
      { name: "bodyAm", label: "Body (AM · markdown)", type: "markdown" },
      { name: "features", label: "What's included (EN/AM)", type: "bilingual-list" },
      { name: "process", label: "Process steps (EN/AM)", type: "bilingual-list" },
      { name: "expect", label: "What to expect (EN/AM)", type: "bilingual-list" },
      { name: "faqs", label: "Service FAQs", type: "faqlist" },
      { name: "order", label: "Sort order", type: "number", col: 1 },
      { name: "visible", label: "Visible on site", type: "bool", col: 1 },
    ],
  },
  doctors: {
    title: "Doctor", primary: "nameEn", secondary: "specialtyEn",
    fields: [
      { name: "nameEn", label: "Name (EN)", type: "text" },
      { name: "nameAm", label: "Name (AM)", type: "text" },
      { name: "specialtyEn", label: "Specialty (EN)", type: "text" },
      { name: "specialtyAm", label: "Specialty (AM)", type: "text" },
      { name: "credentials", label: "Credentials", type: "text", help: "e.g. MD, Internal Medicine" },
      { name: "languages", label: "Languages", type: "text", help: "comma separated" },
      { name: "bioEn", label: "Bio (EN)", type: "textarea" },
      { name: "bioAm", label: "Bio (AM)", type: "textarea" },
      { name: "photo", label: "Photo", type: "image" },
      { name: "isPlaceholder", label: "Marked as placeholder", type: "bool" },
      { name: "order", label: "Sort order", type: "number" },
      { name: "visible", label: "Visible on site", type: "bool" },
    ],
  },
  packages: {
    title: "Package", primary: "nameEn", secondary: "price",
    fields: [
      { name: "nameEn", label: "Name (EN)", type: "text" },
      { name: "nameAm", label: "Name (AM)", type: "text" },
      { name: "descEn", label: "Description (EN)", type: "textarea" },
      { name: "descAm", label: "Description (AM)", type: "textarea" },
      { name: "items", label: "Included tests / items (EN/AM)", type: "bilingual-list" },
      { name: "price", label: "Price", type: "text", help: "leave empty to show “Contact us”" },
      { name: "featured", label: "Highlight as popular", type: "bool" },
      { name: "order", label: "Sort order", type: "number" },
      { name: "visible", label: "Visible on site", type: "bool" },
    ],
  },
  posts: {
    title: "Blog post", primary: "title", secondary: "status",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "slug", label: "Slug (URL)", type: "text", help: "auto-generated from title if empty" },
      { name: "category", label: "Category", type: "text" },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "coverImage", label: "Cover image", type: "image" },
      { name: "content", label: "Content (markdown — use ## for section headings)", type: "markdown" },
      { name: "tags", label: "Tags", type: "string-list", help: "comma separated" },
      { name: "status", label: "Status", type: "select", options: ["draft", "published", "scheduled"] },
      { name: "publishedAt", label: "Publish date", type: "datetime" },
      { name: "readingTime", label: "Reading time (minutes)", type: "number" },
      { name: "seoTitle", label: "SEO title", type: "text" },
      { name: "seoDescription", label: "SEO description", type: "textarea" },
    ],
  },
  testimonials: {
    title: "Testimonial", primary: "name", secondary: "role",
    fields: [
      { name: "name", label: "Patient name", type: "text" },
      { name: "role", label: "Role / context", type: "text", help: "e.g. Addis Ababa · checkup" },
      { name: "quote", label: "Quote", type: "textarea" },
      { name: "rating", label: "Rating (1–5)", type: "number" },
      { name: "photo", label: "Photo", type: "image" },
      { name: "isPlaceholder", label: "Marked as sample", type: "bool" },
      { name: "order", label: "Sort order", type: "number" },
      { name: "visible", label: "Visible on site", type: "bool" },
    ],
  },
  faqs: {
    title: "FAQ", primary: "questionEn", secondary: "category",
    fields: [
      { name: "questionEn", label: "Question (EN)", type: "text" },
      { name: "questionAm", label: "Question (AM)", type: "text" },
      { name: "answerEn", label: "Answer (EN)", type: "textarea" },
      { name: "answerAm", label: "Answer (AM)", type: "textarea" },
      { name: "category", label: "Category", type: "select", options: ["general", "appointment", "billing", "lab"] },
      { name: "order", label: "Sort order", type: "number" },
      { name: "visible", label: "Visible on site", type: "bool" },
    ],
  },
  gallery: {
    title: "Gallery item", primary: "title", secondary: "type",
    fields: [
      { name: "title", label: "Caption", type: "text" },
      { name: "type", label: "Type", type: "select", options: ["image", "video", "form"] },
      { name: "url", label: "Media URL", type: "image" },
      { name: "alt", label: "Alt text", type: "text" },
      { name: "order", label: "Sort order", type: "number" },
      { name: "visible", label: "Visible on site", type: "bool" },
    ],
  },
  branches: {
    title: "Branch", primary: "nameEn", secondary: "phone",
    fields: [
      { name: "nameEn", label: "Name (EN)", type: "text" },
      { name: "nameAm", label: "Name (AM)", type: "text" },
      { name: "addressEn", label: "Address (EN)", type: "textarea" },
      { name: "addressAm", label: "Address (AM)", type: "textarea" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "hours", label: "Hours (EN)", type: "text" },
      { name: "hoursAm", label: "Hours (AM)", type: "text" },
      { name: "mapEmbedUrl", label: "Google Maps embed URL", type: "text", help: "must start with https://www.google.com/maps/embed" },
      { name: "established", label: "Established note", type: "text" },
      { name: "noteEn", label: "Note (EN)", type: "textarea" },
      { name: "order", label: "Sort order", type: "number" },
      { name: "visible", label: "Visible on site", type: "bool" },
    ],
  },
  admins: {
    title: "Admin user", primary: "email", secondary: "role",
    fields: [
      { name: "email", label: "Email", type: "text" },
      { name: "name", label: "Name", type: "text" },
      { name: "role", label: "Role", type: "select", options: ["super_admin", "editor", "receptionist"] },
      { name: "password", label: "Password", type: "password", help: "min 8 characters — required on create" },
      { name: "isActive", label: "Active", type: "bool" },
    ],
  },
};

/* ── list + editor ───────────────────────────────────────── */

type Row = Record<string, unknown> & { id: string };

export function AdminCollections({ entity }: { entity: string }) {
  const router = useRouter();
  const config = CONFIGS[entity];
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | "new" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get<Row[]>(`/api/admin/collections/${entity}?pageSize=100${query ? `&q=${encodeURIComponent(query)}` : ""}`);
    if (res.ok) setRows(res.data);
    setLoading(false);
  }, [entity, query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    const res = await api.delete(`/api/admin/collections/${entity}/${id}`);
    if (res.ok) { toast.success("Deleted"); void load(); router.refresh(); } else toast.error(res.error.message);
  }

  if (!config) return <p className="text-sm text-navy/50">Unknown collection.</p>;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-10 w-full max-w-xs items-center gap-2 rounded-xl border border-navy/12 bg-white px-3.5">
          <Search className="h-4 w-4 text-navy/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${config.title.toLowerCase()}s…`}
            className="w-full bg-transparent py-2 text-sm focus:outline-none"
          />
        </label>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#2456d6]"
        >
          <Plus className="h-4 w-4" /> New {config.title.toLowerCase()}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-navy/30" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/15 py-16 text-center text-sm text-navy/40">
          Nothing here yet — create the first {config.title.toLowerCase()}.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-4 rounded-xl border border-navy/8 bg-white p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-navy">{String(row[config.primary] || "—")}</p>
                <p className="truncate text-xs text-navy/50">
                  {config.secondary ? String(row[config.secondary] || "") : ""}
                </p>
              </div>
              {"status" in row && <StatusBadge status={String(row.status)} />}
              {"isPlaceholder" in row && row.isPlaceholder === true && (
                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-amber-600">placeholder</span>
              )}
              {"featured" in row && row.featured === true && (
                <span className="rounded-full bg-clinic-red/10 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-clinic-red">featured</span>
              )}
              {"visible" in row && (
                <span className={cn("rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider", row.visible ? "bg-emerald-500/10 text-emerald-600" : "bg-navy/8 text-navy/40")}>
                  {row.visible ? "live" : "hidden"}
                </span>
              )}
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => setEditing(row)} className="rounded-lg p-2 text-navy/50 transition hover:bg-brand/10 hover:text-brand" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => void remove(row.id)} className="rounded-lg p-2 text-navy/50 transition hover:bg-clinic-red/10 hover:text-clinic-red" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <CollectionEditor
          entity={entity}
          row={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); void load(); router.refresh(); }}
        />
      )}
    </div>
  );
}

function CollectionEditor({ entity, row, onClose, onSaved }: { entity: string; row: Row | null; onClose: () => void; onSaved: () => void }) {
  const config = CONFIGS[entity];
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const base: Record<string, unknown> = {};
    for (const f of config.fields) {
      base[f.name] = row?.[f.name] ?? (f.type === "bool" ? true : f.type === "number" ? 0 : f.type === "bilingual-list" || f.type === "string-list" || f.type === "faqlist" ? [] : "");
    }
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [pickerField, setPickerField] = useState<string | null>(null);

  const set = (name: string, v: unknown) => setValues((prev) => ({ ...prev, [name]: v }));

  async function save() {
    setSaving(true);
    const payload = { ...values };
    if (entity === "admins" && !row && typeof payload.password !== "string") {
      setSaving(false);
      toast.error("Password is required");
      return;
    }
    if (entity === "admins" && row && !payload.password) delete payload.password;
    const res = row
      ? await api.patch(`/api/admin/collections/${entity}/${row.id}`, payload)
      : await api.post(`/api/admin/collections/${entity}`, payload);
    setSaving(false);
    if (res.ok) { toast.success(row ? "Saved — site updated" : "Created"); onSaved(); } else toast.error(res.error.message);
  }

  return (
    <ModalShell title={`${row ? "Edit" : "New"} ${config.title.toLowerCase()}`} onClose={onClose} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        {config.fields.map((f) => (
          <div key={f.name} className={cn(f.col === 1 && "sm:col-span-1", f.type !== "text" && f.type !== "number" && f.type !== "bool" && f.type !== "select" && f.type !== "password" && f.type !== "datetime" ? "sm:col-span-2" : "")}>
            <CollectionField
              field={f}
              value={values[f.name]}
              isCreate={!row}
              onChange={(v) => set(f.name, v)}
              onPickImage={() => setPickerField(f.name)}
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-2.5">
        <button onClick={onClose} className="rounded-xl border border-navy/12 px-4 py-2.5 text-sm font-semibold text-navy/70 hover:bg-navy/4">Cancel</button>
        <button onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2456d6] disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {row ? "Save changes" : "Create"}
        </button>
      </div>
      {pickerField && (
        <MediaPickerModal
          open
          onClose={() => setPickerField(null)}
          onPick={(url) => { set(pickerField, url); setPickerField(null); }}
        />
      )}
    </ModalShell>
  );
}

function CollectionField({
  field, value, isCreate, onChange, onPickImage,
}: {
  field: ColField;
  value: unknown;
  isCreate: boolean;
  onChange: (v: unknown) => void;
  onPickImage: () => void;
}) {
  const inputCls = "min-h-10 w-full rounded-xl border border-navy/12 px-3.5 text-sm focus:border-brand/50 focus:outline-none";

  switch (field.type) {
    case "bool":
      return (
        <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-xl border border-navy/12 px-3.5">
          <span className="text-sm font-medium text-navy/80">{field.label}</span>
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#2f6bff]" />
        </label>
      );
    case "select":
      return (
        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">{field.label}</span>
          <select value={String(value || "")} onChange={(e) => onChange(e.target.value)} className={inputCls}>
            {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {field.help && <span className="mt-1 block text-[0.65rem] text-navy/40">{field.help}</span>}
        </label>
      );
    case "number":
      return (
        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">{field.label}</span>
          <input type="number" value={Number(value || 0)} onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)} className={inputCls} />
        </label>
      );
    case "textarea":
      return (
        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">{field.label}</span>
          <textarea rows={3} value={String(value || "")} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "py-2.5")} />
        </label>
      );
    case "markdown":
      return <MarkdownField label={field.label} value={String(value || "")} onChange={(v) => onChange(v)} />;
    case "image":
      return (
        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">{field.label}</span>
          <div className="flex gap-2">
            <input value={String(value || "")} onChange={(e) => onChange(e.target.value)} placeholder="/api/media/…" className={inputCls} />
            <button type="button" onClick={onPickImage} className="inline-flex items-center gap-1.5 rounded-xl border border-navy/12 px-3 text-xs font-bold text-navy/70 hover:border-brand/40 hover:text-brand">
              <ImagePlus className="h3.5 w-3.5" /> Choose
            </button>
          </div>
          {field.help && <span className="mt-1 block text-[0.65rem] text-navy/40">{field.help}</span>}
        </label>
      );
    case "datetime": {
      const iso = value ? new Date(String(value)).toISOString().slice(0, 16) : "";
      return (
        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">{field.label}</span>
          <input
            type="datetime-local"
            value={iso}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : "")}
            className={inputCls}
          />
        </label>
      );
    }
    case "password":
      return (
        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">{field.label}</span>
          <input
            type="password"
            value={String(value || "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isCreate ? "Set initial password" : "Leave empty to keep current"}
            className={inputCls}
            autoComplete="new-password"
          />
          {field.help && <span className="mt-1 block text-[0.65rem] text-navy/40">{field.help}</span>}
        </label>
      );
    case "string-list":
      return (
        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">{field.label}</span>
          <input
            value={Array.isArray(value) ? (value as string[]).join(", ") : String(value || "")}
            onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            className={inputCls}
          />
          {field.help && <span className="mt-1 block text-[0.65rem] text-navy/40">{field.help}</span>}
        </label>
      );
    case "bilingual-list": {
      const rows = Array.isArray(value) ? (value as Array<{ en: string; am: string }>) : [];
      return (
        <div>
          <p className="mb-2 flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">
            {field.label}
            <button type="button" onClick={() => onChange([...rows, { en: "", am: "" }])} className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-1 text-[0.65rem] font-bold text-brand">
              <Plus className="h-3 w-3" /> Add
            </button>
          </p>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-navy/10 p-2.5">
                <input
                  value={r.en || ""}
                  onChange={(e) => { const n = [...rows]; n[i] = { ...n[i], en: e.target.value }; onChange(n); }}
                  placeholder="English"
                  className="min-h-9 flex-1 rounded-lg border border-navy/12 px-2.5 text-sm focus:border-brand/50 focus:outline-none"
                />
                <input
                  value={r.am || ""}
                  onChange={(e) => { const n = [...rows]; n[i] = { ...n[i], am: e.target.value }; onChange(n); }}
                  placeholder="አማርኛ"
                  className="min-h-9 flex-1 rounded-lg border border-navy/12 px-2.5 text-sm focus:border-brand/50 focus:outline-none"
                />
                <div className="flex flex-col">
                  <button type="button" onClick={() => { if (i === 0) return; const n = [...rows]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }} className="rounded p-0.5 text-navy/40 hover:text-navy" aria-label="Move up"><ChevronUp className="h-3 w-3" /></button>
                  <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="rounded p-0.5 text-navy/40 hover:text-clinic-red" aria-label="Remove"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "faqlist": {
      const rows = Array.isArray(value) ? (value as Array<{ q: { en: string; am: string }; a: { en: string; am: string } }>) : [];
      return (
        <div>
          <p className="mb-2 flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">
            {field.label}
            <button type="button" onClick={() => onChange([...rows, { q: { en: "", am: "" }, a: { en: "", am: "" } }])} className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-1 text-[0.65rem] font-bold text-brand">
              <Plus className="h-3 w-3" /> Add
            </button>
          </p>
          <div className="space-y-3">
            {rows.map((r, i) => (
              <div key={i} className="rounded-xl border border-navy/10 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[0.62rem] font-bold uppercase tracking-wider text-navy/40">FAQ {i + 1}</span>
                  <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="rounded p-1 text-navy/40 hover:text-clinic-red" aria-label="Remove">
                    <Trash2 className="h3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={r.q?.en || ""} onChange={(e) => { const n = [...rows]; n[i] = { ...n[i], q: { ...n[i].q, en: e.target.value } }; onChange(n); }} placeholder="Question (EN)" className="min-h-9 w-full rounded-lg border border-navy/12 px-2.5 text-sm focus:border-brand/50 focus:outline-none" />
                  <input value={r.q?.am || ""} onChange={(e) => { const n = [...rows]; n[i] = { ...n[i], q: { ...n[i].q, am: e.target.value } }; onChange(n); }} placeholder="ጥያቄ (AM)" className="min-h-9 w-full rounded-lg border border-navy/12 px-2.5 text-sm focus:border-brand/50 focus:outline-none" />
                  <textarea rows={2} value={r.a?.en || ""} onChange={(e) => { const n = [...rows]; n[i] = { ...n[i], a: { ...n[i].a, en: e.target.value } }; onChange(n); }} placeholder="Answer (EN)" className="w-full rounded-lg border border-navy/12 px-2.5 py-2 text-sm focus:border-brand/50 focus:outline-none" />
                  <textarea rows={2} value={r.a?.am || ""} onChange={(e) => { const n = [...rows]; n[i] = { ...n[i], a: { ...n[i].a, am: e.target.value } }; onChange(n); }} placeholder="መልስ (AM)" className="w-full rounded-lg border border-navy/12 px-2.5 py-2 text-sm focus:border-brand/50 focus:outline-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    default:
      return (
        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">{field.label}</span>
          <input value={String(value || "")} onChange={(e) => onChange(e.target.value)} className={inputCls} />
          {field.help && <span className="mt-1 block text-[0.65rem] text-navy/40">{field.help}</span>}
        </label>
      );
  }
}

/* markdown with image insert */
function MarkdownField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [picker, setPicker] = useState(false);

  function insert(url: string) {
    const el = ref.current;
    if (!el) { onChange(`${value}\n\n![image](${url})\n\n`); return; }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const snippet = `\n![image](${url})\n`;
    const next = value.slice(0, start) + snippet + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + snippet.length;
    });
  }

  return (
    <div>
      <p className="mb-1.5 flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">
        {label}
        <button type="button" onClick={() => setPicker(true)} className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-1 text-[0.65rem] font-bold text-brand">
          <ImagePlus className="h-3 w-3" /> Insert image
        </button>
      </p>
      <textarea ref={ref} rows={8} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-navy/12 px-3.5 py-2.5 font-mono text-[0.82rem] leading-relaxed focus:border-brand/50 focus:outline-none" />
      {picker && <MediaPickerModal open onClose={() => setPicker(false)} onPick={insert} />}
    </div>
  );
}
