"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard, Layers, LibraryBig, Inbox, Settings2, ScrollText, LogOut, LogIn,
  Users, Stethoscope, Package, Newspaper, MessageSquareQuote, HelpCircle, Images, Building2,
  Loader2, ExternalLink, Lock, Moon, Sun, UserRoundCog,
} from "lucide-react";
import { api, type AdminUser } from "./admin-api";
import { AdminDashboard } from "./admin-dashboard";
import { AdminContent } from "./admin-content";
import { AdminCollections } from "./admin-collections";
import { AdminMedia } from "./admin-media";
import { AdminInbox } from "./admin-inbox";
import { AdminSettings } from "./admin-settings";
import { AdminAudit } from "./admin-audit";
import { AdminAccount } from "./admin-account";
import { cn } from "@/lib/utils";

type View =
  | { kind: "dashboard" }
  | { kind: "content" }
  | { kind: "collection"; entity: string }
  | { kind: "media" }
  | { kind: "inbox"; tab: "messages" | "appointments" }
  | { kind: "settings" }
  | { kind: "account" }
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
      { label: "My account", icon: UserRoundCog, view: { kind: "account" }, roles: ["super_admin", "editor", "receptionist"] },
      { label: "Admin users", icon: Users, view: { kind: "collection", entity: "admins" }, roles: ["super_admin"] },
      { label: "Audit log", icon: ScrollText, view: { kind: "audit" }, roles: ["super_admin"] },
    ],
  },
];

export default function AdminApp() {
  const [me, setMe] = useState<AdminUser | null | undefined>(undefined);
  const [view, setView] = useState<View>({ kind: "dashboard" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const checkSession = useCallback(async () => {
    const res = await api.get<AdminUser>("/api/admin/me");
    setMe(res.ok ? res.data : null);
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    document.title = "Admin · Universe Medical Center";
    setDark(window.localStorage.getItem("umc-admin-dark") === "1");
  }, []);

  const toggleDark = () => {
    setDark((v) => {
      window.localStorage.setItem("umc-admin-dark", v ? "0" : "1");
      return !v;
    });
  };

  if (me === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-porcelain">
        <Loader2 className="h-8 w-8 animate-spin text-crimson" aria-label="Loading" />
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
    <div className={cn("admin-root min-h-screen bg-background text-foreground", dark && "admin-dark")} style={{ fontFamily: "var(--font-body)" }}>
      <div className="flex min-h-screen">
        {/* sidebar — warm ink, 3px crimson active bar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto bg-ink text-porcelain transition-transform duration-300 lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center gap-2.5 border-b border-porcelain/10 px-5">
            <Image src="/logo.png" alt="UMC" width={40} height={40} className="h-9 w-auto" />
            <div>
              <p className="font-display text-[0.95rem] tracking-tight">UMC Admin</p>
              <p className="text-[0.62rem] text-porcelain/50">Universe Medical Center</p>
            </div>
          </div>
          <nav className="px-3 py-4">
            {allowedNav.map((group) => (
              <div key={group.section} className="mb-5">
                <p className="px-3 pb-2 text-[0.58rem] font-bold uppercase tracking-[0.22em] text-porcelain/40">{group.section}</p>
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
                            "relative flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-[0.83rem] font-medium transition-colors",
                            active ? "bg-porcelain/8 text-porcelain" : "text-porcelain/55 hover:bg-porcelain/5 hover:text-porcelain"
                          )}
                        >
                          {/* 3px crimson bar — no glow */}
                          <span
                            className={cn(
                              "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-crimson transition-opacity",
                              active ? "opacity-100" : "opacity-0"
                            )}
                            aria-hidden="true"
                          />
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
          <div className="border-t border-porcelain/10 p-4">
            <p className="truncate text-xs font-semibold text-porcelain">{me.name || me.email}</p>
            <p className="text-[0.62rem] uppercase tracking-wider text-crimson">{me.role.replace("_", " ")}</p>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-ink/60 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-border lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Layers className="h-4 w-4" />
              </button>
              <h1 className="font-display text-lg tracking-tight sm:text-xl">{viewTitle(view)}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDark}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-border text-muted-foreground transition hover:border-crimson/50 hover:text-crimson"
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <a
                href="#/"
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-crimson/50 hover:text-crimson"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View site</span>
              </a>
              <button
                onClick={async () => {
                  await api.post("/api/admin/logout", {});
                  window.location.hash = "#/";
                  window.location.reload();
                }}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-crimson/50 hover:text-crimson"
              >
                <LogOut className="h-3.5 w-3.5" />
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
            {view.kind === "settings" && <AdminSettings role={me.role} />}
            {view.kind === "account" && <AdminAccount me={me} onUpdated={setMe} />}
            {view.kind === "audit" && <AdminAudit />}
          </main>
        </div>
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
    case "account": return "My account";
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

/* ── login — editorial ink plate on porcelain ────────────── */

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
    <div className="bg-porcelain-deep relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* faint logo-circle motif */}
      <div className="pointer-events-none absolute -right-48 top-1/2 hidden h-[36rem] w-[36rem] -translate-y-1/2 rounded-full border border-ink/8 md:block" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-28 top-1/2 hidden h-[36rem] w-[36rem] -translate-y-1/2 rounded-full border border-ink/5 md:block" aria-hidden="true" />

      <div className="grain relative w-full max-w-md overflow-hidden rounded-2xl bg-ink p-8 shadow-plate sm:p-10">
        <Image src="/logo.png" alt="Universe Medical Center" width={160} height={54} className="mx-auto h-16 w-auto object-contain" />
        <p className="mt-5 text-center text-[0.65rem] font-bold uppercase tracking-[0.3em] text-porcelain/45">Staff portal</p>
        <h1 className="mt-2 text-center font-display text-2xl tracking-tight text-porcelain">Sign in to the admin panel</h1>
        <div className="mx-auto mt-5 h-px w-16 bg-crimson" aria-hidden="true" />

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-porcelain/45">Email</label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 w-full rounded-[10px] border border-porcelain/15 bg-porcelain/5 px-4 text-sm text-porcelain placeholder:text-porcelain/30 focus:border-crimson focus:outline-none"
              placeholder="admin@gmail.com"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-porcelain/45">Password</label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11 w-full rounded-[10px] border border-porcelain/15 bg-porcelain/5 px-4 text-sm text-porcelain placeholder:text-porcelain/30 focus:border-crimson focus:outline-none"
              placeholder="••••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="flex items-center gap-2 rounded-[8px] border border-crimson/40 bg-crimson/10 px-3.5 py-2.5 text-xs text-porcelain">
              <Lock className="h-3.5 w-3.5 shrink-0 text-crimson" aria-hidden="true" /> {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="group inline-flex min-h-11 w-full items-center justify-center gap-2.5 rounded-[10px] bg-crimson font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-deep disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-[0.7rem] leading-relaxed text-porcelain/40">
          Authorized staff only. Sessions are cookie-based, server-verified, and audited.
        </p>
        <p className="mt-3 text-center">
          <a href="#/" className="text-xs font-semibold text-porcelain/70 underline-offset-4 hover:text-porcelain hover:underline">← Back to website</a>
        </p>
      </div>
    </div>
  );
}
