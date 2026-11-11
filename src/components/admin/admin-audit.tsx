"use client";

import React, { useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "./admin-api";

type AuditRow = { id: string; actorEmail: string; action: string; entity: string; entityId: string; meta: unknown; createdAt: string };

export function AdminAudit() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<AuditRow[]>(`/api/admin/audit?page=${page}&pageSize=25`).then((res) => {
      if (res.ok) {
        setRows(res.data);
        if (res.meta) setPages(res.meta.pages);
      }
      setLoading(false);
    });
  }, [page]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No audit entries yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="pb-3 pr-4">When</th>
                  <th className="pb-3 pr-4">Actor</th>
                  <th className="pb-3 pr-4">Action</th>
                  <th className="pb-3 pr-4">Entity</th>
                  <th className="pb-3">Meta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="whitespace-nowrap py-3 pr-4 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-xs font-semibold text-foreground">{r.actorEmail}</td>
                    <td className="py-3 pr-4"><span className="rounded-full bg-secondary px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">{r.action}</span></td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">{r.entity}</td>
                    <td className="max-w-[16rem] truncate py-3 text-xs text-muted-foreground">{r.meta ? JSON.stringify(r.meta) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground disabled:opacity-30">
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground disabled:opacity-30">
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
