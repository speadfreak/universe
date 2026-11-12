"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Save, UploadCloud, Palette, ShieldAlert, ShieldCheck } from "lucide-react";
import { api, compressImage, formatBytes, uploadMedia, type MediaItem } from "./admin-api";
import { compressVideo } from "@/lib/video-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MediaPickerModal } from "./admin-media";
import { ACCENT_PRESETS, checkAccent } from "@/lib/color";
import { cn } from "@/lib/utils";

type Settings = {
  clinicName: string; tagline: string; phone: string; phoneIntl: string; email: string;
  addressAddis: string; addressAmbo: string; hoursEn: string; hoursAm: string;
  socials: { facebook: string; tiktok: string; google: string; linkedin: string };
  heroVideo: string; heroPoster: string; logoUrl: string; accentColor: string;
  preloaderEnabled: boolean; announcementEnabled: boolean; announcementEn: string; announcementAm: string;
  seoTitle: string; seoDescription: string; defaultLocale: string;
};

export function AdminSettings({ role }: { role: string }) {
  const router = useRouter();
  const isSuper = role === "super_admin";
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<"heroVideo" | "heroPoster" | "logoUrl" | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoStage, setVideoStage] = useState<number | null>(null);

  useEffect(() => {
    api.get<Settings>("/api/admin/settings").then((res) => {
      if (res.ok) setS(res.data);
    });
  }, []);

  const accentCheck = useMemo(() => checkAccent(s?.accentColor || "#E3202B"), [s?.accentColor]);
  const accentChanged = !!s && s.accentColor.toLowerCase() !== "#e3202b";

  if (!s) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const set = (k: keyof Settings, v: unknown) => setS((prev) => (prev ? { ...prev, [k]: v } : prev));
  const setSocial = (k: keyof Settings["socials"], v: string) =>
    setS((prev) => (prev ? { ...prev, socials: { ...prev.socials, [k]: v } } : prev));

  async function uploadHeroVideo(file: File) {
    setUploadingVideo(true);
    setVideoStage(0);
    try {
      // Optimize in the browser first: ≤1280px H.264, faststart, audio
      // stripped (the hero plays muted) — typically 60–90% smaller, so the
      // live hero video starts streaming almost immediately.
      const optimized = await compressVideo(file, {
        keepAudio: false,
        maxDim: 1280,
        onProgress: (r) => setVideoStage(Math.round(r * 100)),
      });
      const saved = optimized.size < file.size;
      if (saved) toast.success(`Optimized ${formatBytes(file.size)} → ${formatBytes(optimized.size)}`);
      const res = await uploadMedia(optimized);
      if (res.ok) { set("heroVideo", res.data.url); toast.success("Video uploaded — press Save"); }
      else toast.error(res.error.message);
    } catch {
      toast.error("Could not process that video — try a smaller file.");
    } finally {
      setUploadingVideo(false);
      setVideoStage(null);
    }
  }

  async function save() {
    if (isSuper && !accentCheck.valid) {
      toast.error("The accent color was blocked — it fails the WCAG AA contrast check.");
      return;
    }
    setSaving(true);
    const res = await api.put("/api/admin/settings", s);
    setSaving(false);
    if (res.ok) { toast.success("Settings saved — site updated"); router.refresh(); } else toast.error(res.error.message);
  }

  const inputCls = "min-h-10 w-full rounded-[10px] border border-border bg-background px-3.5 text-sm focus:border-crimson/60 focus:outline-none";

  return (
    <div className="max-w-3xl space-y-6">
      {isSuper && (
        <Section title="Brand accent" icon={<Palette className="h-4 w-4 text-crimson" />}>
          <p className="text-xs leading-relaxed text-muted-foreground">
            The single brand signal across the whole site. The crimson carries white text on every
            primary button, so the choice is blocked unless white-on-accent clears WCAG AA (4.5:1).
          </p>
          <Row label="Accent color (hex)">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(s.accentColor) ? s.accentColor : "#E3202B"}
                onChange={(e) => set("accentColor", e.target.value.toUpperCase())}
                className="h-10 w-12 cursor-pointer rounded-[8px] border border-border bg-transparent p-1"
                aria-label="Pick accent color"
              />
              <input
                value={s.accentColor}
                onChange={(e) => set("accentColor", e.target.value)}
                className={cn(inputCls, "w-32 font-mono")}
                dir="ltr"
                maxLength={7}
              />
              <span className="flex gap-1.5">
                {ACCENT_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("accentColor", p)}
                    className={cn(
                      "h-8 w-8 rounded-full border transition",
                      s.accentColor.toLowerCase() === p.toLowerCase() ? "border-foreground scale-110" : "border-border hover:scale-105"
                    )}
                    style={{ background: p }}
                    aria-label={`Use ${p}`}
                  />
                ))}
              </span>
            </div>
          </Row>

          {/* live contrast report */}
          <div className="flex flex-wrap items-center gap-4 rounded-[10px] border border-border bg-secondary/40 p-4">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold text-white" style={{ background: /^#[0-9a-fA-F]{6}$/.test(s.accentColor) ? s.accentColor : "#E3202B" }}>
              Primary button
            </span>
            {accentCheck.valid ? (
              <p className="flex items-center gap-2 text-xs font-semibold text-scrub">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                White text on accent: {accentCheck.vsWhite?.toFixed(2)}:1 — WCAG AA pass
              </p>
            ) : (
              <p className="flex items-center gap-2 text-xs font-semibold text-crimson-deep">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                {accentCheck.reason}
              </p>
            )}
          </div>
          {accentChanged && (
            <p className="text-xs text-muted-foreground">Save to apply the accent across the public site instantly.</p>
          )}
        </Section>
      )}

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
            <input value={s.heroVideo} onChange={(e) => set("heroVideo", e.target.value)} placeholder="empty = warm gradient + ECG fallback" className={inputCls} />
            <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] border border-border px-3 text-xs font-bold text-muted-foreground transition hover:border-crimson/50 hover:text-crimson">
              {uploadingVideo ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {videoStage !== null && videoStage > 0 ? `Optimizing ${videoStage}%` : "Preparing"}
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" /> Upload
                </>
              )}
              <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" disabled={uploadingVideo} onChange={(e) => e.target.files?.[0] && void uploadHeroVideo(e.target.files[0])} />
            </label>
          </div>
          <p className="mt-1.5 text-[0.68rem] leading-relaxed text-muted-foreground">
            Uploaded videos are auto-optimized in your browser (≤1280px H.264 + faststart, audio stripped — the hero plays muted) before upload, so the hero streams fast. Keep clips under ~60s for best results.
          </p>
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
        <button onClick={() => void save()} disabled={saving || (isSuper && !accentCheck.valid)} className="inline-flex items-center gap-2 rounded-[10px] bg-crimson px-6 py-3 text-sm font-semibold text-white shadow-warm-sm transition-colors hover:bg-crimson-deep disabled:opacity-60">
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
      <input value={value} onChange={(e) => onChange(e.target.value)} className="min-h-10 flex-1 rounded-[10px] border border-border bg-background px-3.5 text-sm focus:border-crimson/60 focus:outline-none" />
      <button type="button" onClick={onPick} className="shrink-0 rounded-[10px] border border-border px-3 text-xs font-bold text-muted-foreground transition hover:border-crimson/50 hover:text-crimson">Choose</button>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[#E3202B]" />
      <span className="text-sm text-muted-foreground">{checked ? "On" : "Off"}</span>
    </label>
  );
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-5 flex items-center gap-2 font-display text-[0.98rem] tracking-tight">{icon}{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
