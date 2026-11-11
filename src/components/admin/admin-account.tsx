"use client";

import React, { useState } from "react";
import { Loader2, Lock, Save, UserRoundCog, ShieldCheck } from "lucide-react";
import { api, type AdminUser } from "./admin-api";
import { toast } from "sonner";

/**
 * Self-service account panel — every admin can change their own name,
 * email and password. Email/password changes re-verify the current password.
 */
export function AdminAccount({ me, onUpdated }: { me: AdminUser; onUpdated: (u: AdminUser) => void }) {
  const [name, setName] = useState(me.name || "");
  const [email, setEmail] = useState(me.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const wantsSecurityChange = !!newPassword || (!!email && email !== me.email);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword && newPassword !== confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (wantsSecurityChange && !currentPassword) {
      toast.error("Enter your current password to make this change");
      return;
    }
    setBusy(true);
    const res = await api.patch<{ email: string; name: string; role: string }>("/api/admin/account", {
      name,
      email,
      currentPassword,
      newPassword: newPassword || undefined,
    });
    setBusy(false);
    if (res.ok) {
      toast.success("Account updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      onUpdated({ ...me, email: res.data.email, name: res.data.name, role: res.data.role as AdminUser["role"] });
    } else {
      toast.error(res.error.message);
    }
  }

  const inputCls =
    "min-h-10 w-full rounded-[10px] border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-crimson/60 focus:outline-none";
  const labelCls = "mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground";

  return (
    <div className="max-w-2xl">
      <form onSubmit={save} className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-porcelain">
            <UserRoundCog className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 className="font-display text-base tracking-tight">{me.name || me.email}</h2>
            <p className="text-xs capitalize text-muted-foreground">{me.role.replace("_", " ")}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Display name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" />
          </label>
          <label className="block">
            <span className={labelCls}>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} dir="ltr" />
          </label>
        </div>

        <div className="mt-6 rounded-[10px] border border-border bg-secondary/40 p-4">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-scrub" aria-hidden="true" />
            Security — verify with your current password
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className={labelCls}>Current password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputCls}
                autoComplete="current-password"
                placeholder={wantsSecurityChange ? "Required" : "Only for changes"}
              />
            </label>
            <label className="block">
              <span className={labelCls}>New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
                placeholder="min 8 characters"
              />
            </label>
            <label className="block">
              <span className={labelCls}>Confirm new</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
                placeholder="repeat it"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Changing email or password signs nothing out — your session stays active.
          </p>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-[10px] bg-crimson px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crimson-deep disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
