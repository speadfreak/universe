"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Save, UploadCloud } from "lucide-react";
import { api, compressImage, uploadMedia, type MediaItem } from "./admin-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MediaPickerModal } from "./admin-media";

type Settings = {
  clinicName: string; tagline: string; phone: string; phoneIntl: string; email: string;
  addressAddis: string; addressAmbo: string; hoursEn: string; hoursAm: string;
  socials: { facebook: string; tiktok: string; google: string; linkedin: string };
  heroVideo: string; heroPoster: string; logoUrl: string;
  preloaderEnabled: boolean; announcementEnabled: boolean; announcementEn: string; announcementAm: string;
  seoTitle: string; seoDescription: string; defaultLocale: string;
};

export function AdminSettings() {
  const router = useRouter();
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<"heroVideo" | "heroPoster" | "logoUrl" | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    api.get<Settings>("/api/admin/settings").then((res) => {
      if (res.ok) setS(res.data);
    });
  }, []);

  if (!s) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-navy/30" /></div>;
  }

  const set = (k: keyof Settings, v: unknown) => setS((prev) => ({ ...(prev as Settings), [k]: v }));
  const setSocial = (k: keyof Settings["socials"], v: string) => setS((prev) => ({ ...(prev as Settings), socials: { ...prev.socials, [k]: v } }));

  async function uploadHeroVideo(file: File) {
    setUploadingVideo(true);
    const res = await uploadMedia(file);
    setUploadingVideo(false);
    if (res.ok) { set("heroVideo", res.data.url); toast.success("Video uploaded — press Save"); } else toast.error(res.error.message);
  }

  async function save() {
    setSaving(true);
    const res = await api.put("/api/admin/settings", s);
    setSaving(false);
    if (res.ok) { toast.success("Settings saved — site updated"); router.refresh(); } else toast.error(res.error.message);
  }

  const inputCls = "min-h-10 w-full rounded-xl border border-navy/12 px-3.5 text-sm focus:border-brand/50 focus:outline-none";

  return (
    <div className="max-w-3xl space-y-6">
      <Section title="Clinic identity">
        <Row label="Clinic name"><input value={s.clinicName} onChange={(e) => set("clinicName", e.target.value)} className={inputCls} /></Row>
        <Row label="Tagline"><input value={s.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} /></Row>
        <Row label="Phone (display)"><input value={s.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} dir="ltr" /></Row>
        <Row label="Phone (tel: link)"><input value={s.phoneIntl} onChange={(e) => set("phoneIntl", e.target.value)} className={inputCls} dir="ltr" /></Row>
        <Row label="Email"><input value={s.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></Row>
        <Row label="Address — Addis Ababa"><textarea rows={2} value={s.addressAddis} onChange={(e) => set("addressAddis", e.target.value)} className={inputCls} /></Row>
        <Row label="Address — Ambo (Heran Clinic)"><textarea rows={2} value={s.addressAmbo} onChange={(e) => set("addressAmbo", e.target.value)} className={inputCls} /></Row>
        <Row label="Working hours (EN)"><input value={s.hoursEn} onChange={(e) => set("hoursEn", e.target.value)} className={inputCls} /></Row>
        <Row label="Working hours (AM)"><input value={s.hoursAm} onChange={(e) => set("hoursAm", e.target.value)} className={inputCls} /></Row>
      </Section>

      <Section title="Hero media">
        <Row label="Hero background video URL">
          <div className="flex gap-2">
            <input value={s.heroVideo} onChange={(e) => set("heroVideo", e.target.value)} placeholder="empty = animated cinematic fallback" className={inputCls} />
            <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-navy/12 px-3 text-xs font-bold text-navy/70 hover:border-brand/40 hover:text-brand">
              {uploadingVideo ? <Loader2 className="h3.5 w-3.5 animate-spin" /> : <UploadCloud className="h3.5 w-3.5" />} Upload
              <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => e.target.files?.[0] && void uploadHeroVideo(e.target.files[0])} />
            </label>
          </div>
        </Row>
        <Row label="Hero poster image"><PickerInput value={s.heroPoster} onChange={(v) => set("heroPoster", v)} onPick={() => setPicker("heroPoster")} /></Row>
        <Row label="Logo"><PickerInput value={s.logoUrl} onChange={(v) => set("logoUrl", v)} onPick={() => setPicker("logoUrl")} /></Row>
        <Row label="Cinematic preloader">
          <Toggle checked={s.preloaderEnabled} onChange={(v) => set("preloaderEnabled", v)} />
        </Row>
      </Section>

      <Section title="Announcement bar">
        <Row label="Enabled"><Toggle checked={s.announcementEnabled} onChange={(v) => set("announcementEnabled", v)} /></Row>
        <Row label="Text (EN)"><input value={s.announcementEn} onChange={(e) => set("announcementEn", e.target.value)} className={inputCls} /></Row>
        <Row label="Text (AM)"><input value={s.announcementAm} onChange={(e) => set("announcementAm", e.target.value)} className={inputCls} /></Row>
      </Section>

      <Section title="SEO defaults">
        <Row label="Default title"><input value={s.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={inputCls} /></Row>
        <Row label="Default description"><textarea rows={2} value={s.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className={inputCls} /></Row>
        <Row label="Default language">
          <select value={s.defaultLocale} onChange={(e) => set("defaultLocale", e.target.value)} className={inputCls}>
            <option value="en">English</option>
            <option value="am">አማርኛ (Amharic)</option>
          </select>
        </Row>
      </Section>

      <Section title="Social links">
        {(["facebook", "tiktok", "google", "linkedin"] as const).map((k) => (
          <Row key={k} label={k[0].toUpperCase() + k.slice(1)}>
            <input value={s.socials[k]} onChange={(e) => setSocial(k, e.target.value)} className={inputCls} placeholder="https://…" dir="ltr" />
          </Row>
        ))}
      </Section>

      <div className="sticky bottom-4 flex justify-end">
        <button onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#2456d6] disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save all settings
        </button>
      </div>

      {picker && (
        <MediaPickerModal
          open
          onClose={() => setPicker(null)}
          onPick={(url) => { set(picker, url); setPicker(null); }}
        />
      )}
    </div>
  );
}

function PickerInput({ value, onChange, onPick }: { value: string; onChange: (v: string) => void; onPick: () => void }) {
  return (
    <div className="flex gap-2">
      <input value={value} onChange={(e) => onChange(e.target.value)} className="min-h-10 flex-1 rounded-xl border border-navy/12 px-3.5 text-sm focus:border-brand/50 focus:outline-none" />
      <button type="button" onClick={onPick} className="shrink-0 rounded-xl border border-navy/12 px-3 text-xs font-bold text-navy/70 hover:border-brand/40 hover:text-brand">Choose</button>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[#2f6bff]" />
      <span className="text-sm text-navy/60">{checked ? "On" : "Off"}</span>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-navy/8 bg-white p-6">
      <h2 className="mb-5 font-display text-sm font-bold text-navy">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-navy/50">{label}</span>
      {children}
    </label>
  );
}
