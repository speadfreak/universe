"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Inbox, Loader2, Newspaper, Users, RefreshCw } from "lucide-react";
import { api } from "./admin-api";
import { useRouter } from "next/navigation";
import type { View } from "./admin-app-ext";

type Stats = {
  apptToday: number;
  apptWeek: number;
  newMessages: number;
  publishedPosts: number;
  subscribers: number;
  recentAppointments: Array<{ id: string; reference: string; patientName: string; date: string; timeSlot: string; status: string }>;
  recentMessages: Array<{ id: string; name: string; message: string; createdAt: string; status: string }>;
};

export function AdminDashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function load() {
    setLoading(true);
    const res = await api.get<Stats>("/api/admin/stats");
    if (res.ok) setStats(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const cards = [
    { label: "Appointments today", value: stats?.apptToday ?? 0, icon: CalendarDays, tint: "text-crimson bg-crimson/10", go: { kind: "inbox", tab: "appointments" } as View },
    { label: "This week", value: stats?.apptWeek ?? 0, icon: CalendarDays, tint: "text-scrub bg-scrub/10", go: { kind: "inbox", tab: "appointments" } as View },
    { label: "Unread messages", value: stats?.newMessages ?? 0, icon: Inbox, tint: "text-ink bg-ink/8", go: { kind: "inbox", tab: "messages" } as View },
    { label: "Published posts", value: stats?.publishedPosts ?? 0, icon: Newspaper, tint: "text-stone-deep bg-stone/15", go: { kind: "collection", entity: "posts" } as View },
    { label: "Newsletter subscribers", value: stats?.subscribers ?? 0, icon: Users, tint: "text-scrub bg-scrub/10", go: { kind: "dashboard" } as View },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-base tracking-tight text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <div className="flex gap-2">
          <button onClick={() => { void load(); router.refresh(); }} className="inline-flex items-center gap-1.5 rounded-[8px] border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-crimson/50 hover:text-crimson">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button onClick={() => router.refresh()} className="inline-flex items-center gap-1.5 rounded-[8px] bg-ink px-3 py-2 text-xs font-semibold text-porcelain transition hover:bg-crimson">
            Apply site changes
          </button>
        </div>
      </div>

      {/* stat cards — hairline paper, no shadows-on-hover glow */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onNavigate(c.go)}
            className="group rounded-xl border border-border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-crimson/50"
          >
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] ${c.tint}`}>
              <c.icon className="h-5 w-5" />
            </span>
            <p className="num-serif mt-4 text-[1.9rem] leading-none">
              {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" /> : c.value}
            </p>
            <p className="mt-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">{c.label}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* recent appointments */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[0.95rem] tracking-tight">Latest appointment requests</h2>
            <button onClick={() => onNavigate({ kind: "inbox", tab: "appointments" })} className="text-xs font-semibold text-crimson hover:underline">View all</button>
          </div>
          <ul className="divide-y divide-border">
            {(stats?.recentAppointments || []).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{a.patientName} <span className="font-mono text-xs text-muted-foreground">{a.reference}</span></p>
                  <p className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString()} · {a.timeSlot}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
            {stats && stats.recentAppointments.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No appointments yet</li>}
          </ul>
        </div>

        {/* recent messages */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[0.95rem] tracking-tight">Latest messages</h2>
            <button onClick={() => onNavigate({ kind: "inbox", tab: "messages" })} className="text-xs font-semibold text-crimson hover:underline">View all</button>
          </div>
          <ul className="divide-y divide-border">
            {(stats?.recentMessages || []).map((m) => (
              <li key={m.id} className="py-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold">{m.name}</p>
                  <StatusBadge status={m.status} />
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{m.message}</p>
              </li>
            ))}
            {stats && stats.recentMessages.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No messages yet</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    new: "chip-new",
    confirmed: "chip-confirmed",
    completed: "chip-completed",
    cancelled: "chip-cancelled",
    published: "chip-published",
    draft: "chip-draft",
    scheduled: "chip-scheduled",
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider ${cls[status] || "bg-secondary text-muted-foreground"}`}>
      {status}
    </span>
  );
}
