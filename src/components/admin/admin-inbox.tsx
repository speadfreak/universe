"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CalendarDays, Download, Loader2, Mail, Phone, Search, Trash2 } from "lucide-react";
import { api } from "./admin-api";
import { StatusBadge } from "./admin-dashboard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Message = { id: string; name: string; phone: string; email: string; department: string; message: string; status: string; notes: string; createdAt: string };
type Appointment = { id: string; reference: string; serviceName: string; doctorName: string; date: string; timeSlot: string; patientName: string; phone: string; email: string; notes: string; status: string; source: string; createdAt: string };

const STATUSES = ["new", "confirmed", "completed", "cancelled"];

export function AdminInbox({ tab, onTabChange }: { tab: "messages" | "appointments"; onTabChange: (t: "messages" | "appointments") => void }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    if (tab === "messages") {
      const res = await api.get<Message[]>(`/api/admin/messages?pageSize=100${query ? `&q=${encodeURIComponent(query)}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`);
      if (res.ok) setMessages(res.data);
    } else {
      const res = await api.get<Appointment[]>(`/api/admin/appointments?pageSize=100${query ? `&q=${encodeURIComponent(query)}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`);
      if (res.ok) setAppointments(res.data);
    }
    setLoading(false);
  }, [tab, query, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(kind: "messages" | "appointments", id: string, status: string) {
    const url = kind === "messages" ? `/api/admin/messages/${id}` : `/api/admin/appointments/${id}`;
    const res = await api.patch(url, { status });
    if (res.ok) { toast.success(`Marked ${status}`); void load(); } else toast.error(res.error.message);
  }

  async function saveNotes(kind: "messages" | "appointments", id: string, notes: string) {
    const url = kind === "messages" ? `/api/admin/messages/${id}` : `/api/admin/appointments/${id}`;
    const body = kind === "messages" ? { notes } : { internalNotes: notes };
    const res = await api.patch(url, body);
    if (res.ok) toast.success("Notes saved"); else toast.error(res.error.message);
  }

  async function remove(kind: "messages" | "appointments", id: string) {
    if (!window.confirm("Delete this item permanently?")) return;
    const url = kind === "messages" ? `/api/admin/messages/${id}` : `/api/admin/appointments/${id}`;
    const res = await api.delete(url);
    if (res.ok) { toast.success("Deleted"); void load(); } else toast.error(res.error.message);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-navy/12 bg-white p-1">
          {(["messages", "appointments"] as const).map((tb) => (
            <button
              key={tb}
              onClick={() => onTabChange(tb)}
              className={cn("rounded-lg px-4 py-2 text-xs font-bold capitalize transition", tab === tb ? "bg-brand text-white" : "text-navy/60 hover:text-navy")}
            >
              {tb}
            </button>
          ))}
        </div>
        <label className="flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-navy/12 bg-white px-3.5 sm:max-w-xs">
          <Search className="h-4 w-4 text-navy/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="w-full bg-transparent py-2 text-sm focus:outline-none" />
        </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-h-10 rounded-xl border border-navy/12 bg-white px-3 text-sm focus:outline-none">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {tab === "appointments" && (
          <a
            href={`/api/admin/appointments?format=csv${statusFilter ? `&status=${statusFilter}` : ""}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-navy/12 bg-white px-3.5 py-2 text-xs font-bold text-navy/70 transition hover:border-brand/40 hover:text-brand"
          >
            <Download className="h3.5 w-3.5" /> Export CSV
          </a>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-navy/30" /></div>
      ) : tab === "messages" ? (
        messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-navy/40">No messages found.</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className="rounded-2xl border border-navy/8 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-navy">{m.name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-navy/50">
                      {m.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</span>}
                      {m.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>}
                      {m.department && <span className="rounded bg-navy/6 px-1.5 py-0.5">{m.department}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.68rem] text-navy/40">{new Date(m.createdAt).toLocaleString()}</span>
                    <StatusBadge status={m.status} />
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-navy/75">{m.message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-navy/6 pt-3.5">
                  <select
                    value={m.status}
                    onChange={(e) => void setStatus("messages", m.id, e.target.value)}
                    className="min-h-9 rounded-lg border border-navy/12 px-2.5 text-xs font-semibold focus:outline-none"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => setExpanded(expanded === m.id ? null : m.id)} className="rounded-lg border border-navy/12 px-3 py-1.5 text-xs font-semibold text-navy/60 hover:text-navy">
                    {m.notes ? "Notes ✓" : "Add note"}
                  </button>
                  <button onClick={() => void remove("messages", m.id)} className="ml-auto rounded-lg p-2 text-navy/40 hover:bg-clinic-red/10 hover:text-clinic-red" aria-label="Delete message">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {expanded === m.id && (
                  <textarea
                    defaultValue={m.notes}
                    onBlur={(e) => void saveNotes("messages", m.id, e.target.value)}
                    rows={2}
                    placeholder="Internal notes (never shown publicly)…"
                    className="mt-3 w-full rounded-lg border border-navy/12 px-3 py-2 text-sm focus:border-brand/50 focus:outline-none"
                  />
                )}
              </li>
            ))}
          </ul>
        )
      ) : appointments.length === 0 ? (
        <p className="py-16 text-center text-sm text-navy/40">No appointments found.</p>
      ) : (
        <ul className="space-y-3">
          {appointments.map((a) => (
            <li key={a.id} className="rounded-2xl border border-navy/8 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-navy">
                    {a.patientName} <span className="ml-1 font-mono text-xs font-normal text-navy/45">{a.reference}</span>
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-navy/50">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(a.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {a.timeSlot}</span>
                    {a.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{a.phone}</span>}
                    {a.serviceName && <span className="rounded bg-navy/6 px-1.5 py-0.5">{a.serviceName}</span>}
                    {a.doctorName && <span className="rounded bg-brand/8 px-1.5 py-0.5 text-brand">Dr. {a.doctorName}</span>}
                    <span className="rounded bg-navy/6 px-1.5 py-0.5 uppercase">{a.source}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.68rem] text-navy/40">{new Date(a.createdAt).toLocaleString()}</span>
                  <StatusBadge status={a.status} />
                </div>
              </div>
              {a.notes && <p className="mt-3 rounded-lg bg-navy/4 px-3.5 py-2.5 text-sm text-navy/70">{a.notes}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-navy/6 pt-3.5">
                <select
                  value={a.status}
                  onChange={(e) => void setStatus("appointments", a.id, e.target.value)}
                  className="min-h-9 rounded-lg border border-navy/12 px-2.5 text-xs font-semibold focus:outline-none"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => setExpanded(expanded === a.id ? null : a.id)} className="rounded-lg border border-navy/12 px-3 py-1.5 text-xs font-semibold text-navy/60 hover:text-navy">
                  {a.createdAt ? "Notes" : "Add note"}
                </button>
                <button onClick={() => void remove("appointments", a.id)} className="ml-auto rounded-lg p-2 text-navy/40 hover:bg-clinic-red/10 hover:text-clinic-red" aria-label="Delete appointment">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {expanded === a.id && (
                <textarea
                  onBlur={(e) => void saveNotes("appointments", a.id, e.target.value)}
                  rows={2}
                  placeholder="Internal notes (never shown publicly)…"
                  className="mt-3 w-full rounded-lg border border-navy/12 px-3 py-2 text-sm focus:border-brand/50 focus:outline-none"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
