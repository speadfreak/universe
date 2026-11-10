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
    { label: "Appointments today", value: stats?.apptToday ?? 0, icon: CalendarDays, tint: "text-brand bg-brand/10", go: { kind: "inbox", tab: "appointments" } as View },
    { label: "This week", value: stats?.apptWeek ?? 0, icon: CalendarDays, tint: "text-cyan bg-cyan/10", go: { kind: "inbox", tab: "appointments" } as View },
    { label: "Unread messages", value: stats?.newMessages ?? 0, icon: Inbox, tint: "text-clinic-red bg-clinic-red/10", go: { kind: "inbox", tab: "messages" } as View },
    { label: "Published posts", value: stats?.publishedPosts ?? 0, icon: Newspaper, tint: "text-amber-500 bg-amber-500/10", go: { kind: "collection", entity: "posts" } as View },
    { label: "Newsletter subscribers", value: stats?.subscribers ?? 0, icon: Users, tint: "text-emerald-500 bg-emerald-500/10", go: { kind: "dashboard" } as View },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy/60">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <div className="flex gap-2">
          <button onClick={() => { void load(); router.refresh(); }} className="inline-flex items-center gap-1.5 rounded-lg border border-navy/12 px-3 py-2 text-xs font-semibold text-navy/70 transition hover:border-brand/40 hover:text-brand">
            <RefreshCw className="h3.5 w-3.5" /> Refresh
          </button>
          <button onClick={() => router.refresh()} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#2456d6]">
            Apply site changes
          </button>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onNavigate(c.go)}
            className="group rounded-2xl border border-navy/8 bg-white p-5 text-left shadow-[0_2px_12px_-6px_rgba(13,31,60,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(47,107,255,0.25)]"
          >
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.tint}`}>
              <c.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-3xl font-bold text-navy">
              {loading ? <Loader2 className="h-6 w-6 animate-spin text-navy/20" /> : c.value}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-navy/50">{c.label}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* recent appointments */}
        <div className="rounded-2xl border border-navy/8 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold">Latest appointment requests</h2>
            <button onClick={() => onNavigate({ kind: "inbox", tab: "appointments" })} className="text-xs font-semibold text-brand hover:underline">View all</button>
          </div>
          <ul className="divide-y divide-navy/6">
            {(stats?.recentAppointments || []).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-navy">{a.patientName} <span className="font-mono text-xs text-navy/50">{a.reference}</span></p>
                  <p className="text-xs text-navy/50">{new Date(a.date).toLocaleDateString()} · {a.timeSlot}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
            {stats && stats.recentAppointments.length === 0 && <li className="py-6 text-center text-sm text-navy/40">No appointments yet</li>}
          </ul>
        </div>

        {/* recent messages */}
        <div className="rounded-2xl border border-navy/8 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold">Latest messages</h2>
            <button onClick={() => onNavigate({ kind: "inbox", tab: "messages" })} className="text-xs font-semibold text-brand hover:underline">View all</button>
          </div>
          <ul className="divide-y divide-navy/6">
            {(stats?.recentMessages || []).map((m) => (
              <li key={m.id} className="py-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold text-navy">{m.name}</p>
                  <StatusBadge status={m.status} />
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-navy/50">{m.message}</p>
              </li>
            ))}
            {stats && stats.recentMessages.length === 0 && <li className="py-6 text-center text-sm text-navy/40">No messages yet</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-brand/10 text-brand",
    confirmed: "bg-cyan/15 text-cyan-dark",
    completed: "bg-emerald-500/10 text-emerald-600",
    cancelled: "bg-navy/8 text-navy/50",
    published: "bg-emerald-500/10 text-emerald-600",
    draft: "bg-amber-500/10 text-amber-600",
    scheduled: "bg-cyan/15 text-cyan-dark",
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider ${styles[status] || "bg-navy/8 text-navy/60"}`}>
      {status}
    </span>
  );
}
