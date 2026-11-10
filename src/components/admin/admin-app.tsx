"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard, Layers, LibraryBig, Inbox, Settings2, ScrollText, LogOut, LogIn,
  Users, Stethoscope, Package, Newspaper, MessageSquareQuote, HelpCircle, Images, Building2,
  Loader2, ExternalLink, Lock,
} from "lucide-react";
import { api, type AdminUser } from "./admin-api";
import { AdminDashboard } from "./admin-dashboard";
import { AdminContent } from "./admin-content";
import { AdminCollections } from "./admin-collections";
import { AdminMedia } from "./admin-media";
import { AdminInbox } from "./admin-inbox";
import { AdminSettings } from "./admin-settings";
import { AdminAudit } from "./admin-audit";
import { cn } from "@/lib/utils";
import { useSite } from "@/components/site/site-context";

type View =
  | { kind: "dashboard" }
  | { kind: "content" }
  | { kind: "collection"; entity: string }
  | { kind: "media" }
  | { kind: "inbox"; tab: "messages" | "appointments" }
  | { kind: "settings" }
  | { kind: "audit" };

const NAV: Array<{ section: string; items: Array<{ label: string; icon: React.ComponentType<{ className?: string }>; view: View; roles: string[] }> }> = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, view: { kind: "dashboard" }, roles: ["super_admin", "editor", "receptionist"] },
    ],
  },
  {
    section: "Website",
    items: [
      { label: "Content sections", icon: Layers, view: { kind: "content" }, roles: ["super_admin", "editor"] },
      { label: "Services", icon: Stethoscope, view: { kind: "collection", entity: "services" }, roles: ["super_admin", "editor"] },
      { label: "Doctors", icon: Users, view: { kind: "collection", entity: "doctors" }, roles: ["super_admin", "editor"] },
      { label: "Packages", icon: Package, view: { kind: "collection", entity: "packages" }, roles: ["super_admin", "editor"] },
      { label: "Blog posts", icon: Newspaper, view: { kind: "collection", entity: "posts" }, roles: ["super_admin", "editor"] },
      { label: "Testimonials", icon: MessageSquareQuote, view: { kind: "collection", entity: "testimonials" }, roles: ["super_admin", "editor"] },
      { label: "FAQs", icon: HelpCircle, view: { kind: "collection", entity: "faqs" }, roles: ["super_admin", "editor"] },
      { label: "Gallery", icon: Images, view: { kind: "collection", entity: "gallery" }, roles: ["super_admin", "editor"] },
      { label: "Branches", icon: Building2, view: { kind: "collection", entity: "branches" }, roles: ["super_admin", "editor"] },
      { label: "Media library", icon: LibraryBig, view: { kind: "media" }, roles: ["super_admin", "editor"] },
    ],
  },
  {
    section: "Inbox",
    items: [
      { label: "Messages", icon: Inbox, view: { kind: "inbox", tab: "messages" }, roles: ["super_admin", "receptionist", "editor"] },
      { label: "Appointments", icon: Layers, view: { kind: "inbox", tab: "appointments" }, roles: ["super_admin", "receptionist", "editor"] },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Settings", icon: Settings2, view: { kind: "settings" }, roles: ["super_admin", "editor"] },
      { label: "Admin users", icon: Users, view: { kind: "collection", entity: "admins" }, roles: ["super_admin"] },
      { label: "Audit log", icon: ScrollText, view: { kind: "audit" }, roles: ["super_admin"] },
    ],
  },
];

export default function AdminApp() {
  const [me, setMe] = useState<AdminUser | null | undefined>(undefined);
  const [view, setView] = useState<View>({ kind: "dashboard" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const checkSession = useCallback(async () => {
    const res = await api.get<AdminUser>("/api/admin/me");
    setMe(res.ok ? res.data : null);
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    document.title = "Admin · Universe Medical Center";
  }, []);

  if (me === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Loader2 className="h-8 w-8 animate-spin text-cyan" aria-label="Loading" />
      </div>
    );
  }

  if (me === null) {
    return <AdminLogin onLogin={setMe} />;
  }

  const allowedNav = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(me.role)),
  })).filter((g) => g.items.length > 0);

  const currentRoles = (roles: string[]) => roles.includes(me.role);

  return (
    <div className="flex min-h-screen bg-[#f6f9ff] text-navy" style={{ fontFamily: "var(--font-body)" }}>
      {/* sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-navy/8 bg-[#0a1628] text-ice transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-white/8 px-5">
          <Image src="/logo.png" alt="UMC" width={40} height={40} className="h-9 w-auto" />
          <div>
            <p className="font-display text-sm font-bold">UMC Admin</p>
            <p className="text-[0.65rem] text-ice-dim">Universe Medical Center</p>
          </div>
        </div>
        <nav className="px-3 py-4">
          {allowedNav.map((group) => (
            <div key={group.section} className="mb-5">
              <p className="px-3 pb-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-ice-dim/70">{group.section}</p>
              <ul className="space-y-0.5">
                {group.items.map((item, i) => {
                  const active = JSON.stringify(item.view) === JSON.stringify(view);
                  return (
                    <li key={`${group.section}-${i}`}>
                      <button
                        onClick={() => {
                          setView(item.view);
                          setSidebarOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[0.83rem] font-medium transition",
                          active ? "bg-brand/25 text-white" : "text-ice-dim hover:bg-white/5 hover:text-ice"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/8 p-4">
          <p className="truncate text-xs font-semibold text-ice">{me.name || me.email}</p>
          <p className="text-[0.65rem] uppercase tracking-wider text-cyan">{me.role.replace("_", " ")}</p>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-ink/60 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-navy/8 bg-white/85 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-navy/10 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Layers className="h-4 w-4" />
            </button>
            <h1 className="font-display text-sm font-bold sm:text-base">{viewTitle(view)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy/12 px-3 py-2 text-xs font-semibold text-navy/70 transition hover:border-brand/40 hover:text-brand"
            >
              <ExternalLink className="h3.5 w-3.5" />
              <span className="hidden sm:inline">View site</span>
            </a>
            <button
              onClick={async () => {
                await api.post("/api/admin/logout", {});
                window.location.hash = "#/";
                window.location.reload();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy/12 px-3 py-2 text-xs font-semibold text-navy/70 transition hover:border-clinic-red/40 hover:text-clinic-red"
            >
              <LogOut className="h3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {view.kind === "dashboard" && <AdminDashboard onNavigate={(v) => currentRoles(["*"]) && setView(v)} />}
          {view.kind === "content" && <AdminContent />}
          {view.kind === "collection" && <AdminCollections entity={view.entity} />}
          {view.kind === "media" && <AdminMedia />}
          {view.kind === "inbox" && <AdminInbox tab={view.tab} onTabChange={(tab) => setView({ kind: "inbox", tab })} />}
          {view.kind === "settings" && <AdminSettings />}
          {view.kind === "audit" && <AdminAudit />}
        </main>
      </div>
    </div>
  );
}

function viewTitle(view: View): string {
  switch (view.kind) {
    case "dashboard": return "Dashboard";
    case "content": return "Content sections";
    case "media": return "Media library";
    case "settings": return "Global settings";
    case "audit": return "Audit log";
    case "inbox": return view.tab === "messages" ? "Messages" : "Appointments";
    case "collection": {
      const labels: Record<string, string> = {
        services: "Services", doctors: "Doctors", packages: "Health packages", posts: "Blog posts",
        testimonials: "Testimonials", faqs: "FAQs", gallery: "Gallery", branches: "Branches", admins: "Admin users",
      };
      return labels[view.entity] || view.entity;
    }
  }
}

/* ── login ───────────────────────────────────────────────── */

function AdminLogin({ onLogin }: { onLogin: (user: AdminUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await api.post<AdminUser>("/api/admin/login", { email, password });
    if (res.ok) onLogin(res.data);
    else setError(res.error.message);
    setBusy(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mesh-dark px-4">
      <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/3 h-72 w-[30rem] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" aria-hidden="true" />
      <div className="glass-strong relative w-full max-w-md rounded-3xl p-8 sm:p-10">
        <Image src="/logo.png" alt="Universe Medical Center" width={160} height={54} className="mx-auto h-16 w-auto object-contain" />
        <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.28em] text-cyan">Staff portal</p>
        <h1 className="mt-2 text-center font-display text-xl font-bold text-ice">Sign in to the admin panel</h1>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ice-dim">Email</label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-white/12 bg-white/5 px-4 text-sm text-ice placeholder:text-ice-dim/50 focus:border-cyan/50 focus:outline-none"
              placeholder="admin@universemedical.et"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ice-dim">Password</label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-white/12 bg-white/5 px-4 text-sm text-ice placeholder:text-ice-dim/50 focus:border-cyan/50 focus:outline-none"
              placeholder="••••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="flex items-center gap-2 rounded-lg border border-clinic-red/30 bg-clinic-red/10 px-3.5 py-2.5 text-xs text-red-300">
              <Lock className="h3.5 w-3.5 shrink-0" aria-hidden="true" /> {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand font-display text-sm font-bold text-white transition hover:bg-[#2456d6] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-[0.7rem] leading-relaxed text-ice-dim/70">
          Authorized staff only. Sessions are cookie-based, server-verified, and audited.
        </p>
        <p className="mt-3 text-center">
          <a href="#/" className="text-xs font-semibold text-cyan hover:underline">← Back to website</a>
        </p>
      </div>
    </div>
  );
}
