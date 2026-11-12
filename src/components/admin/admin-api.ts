"use client";

/** Typed fetch helpers for the admin panel. */

export type ApiResult<T> = { ok: true; data: T; meta?: { page: number; pageSize: number; total: number; pages: number } } | { ok: false; error: { code: string; message: string } };

async function request<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers || {}) } });
    const body = (await res.json().catch(() => null)) as ApiResult<T> | null;
    if (!body) return { ok: false, error: { code: "bad_response", message: `Request failed (${res.status})` } };
    return body;
  } catch {
    return { ok: false, error: { code: "network", message: "Network error — check your connection." } };
  }
}

export const api = {
  get: <T,>(url: string) => request<T>(url),
  post: <T,>(url: string, body: unknown) => request<T>(url, { method: "POST", body: JSON.stringify(body) }),
  put: <T,>(url: string, body: unknown) => request<T>(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T,>(url: string, body: unknown) => request<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T,>(url: string) => request<T>(url, { method: "DELETE" }),
};

export type AdminUser = { email: string; name: string; role: "super_admin" | "editor" | "receptionist" };

export type MediaItem = { id: string; name: string; type: string; size: number; alt: string; url: string; createdAt: string };

export async function uploadMedia(file: File, alt = "", name = ""): Promise<ApiResult<MediaItem>> {
  const form = new FormData();
  form.append("file", file);
  if (alt) form.append("alt", alt);
  if (name) form.append("name", name);
  try {
    const res = await fetch("/api/admin/media", { method: "POST", body: form });
    return (await res.json()) as ApiResult<MediaItem>;
  } catch {
    return { ok: false, error: { code: "network", message: "Upload failed" } };
  }
}

/** Human-readable file size, e.g. "12 KB" or "3.4 MB". */
export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"] as const;
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const value = n / 1024 ** i;
  return `${i === 0 || value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

/** Client-side image compression before upload. */
export async function compressImage(file: File, maxDim = 1920, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    if (Math.max(bitmap.width, bitmap.height) <= maxDim && file.size < 400 * 1024) return file;
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
  } catch {
    return file;
  }
}
