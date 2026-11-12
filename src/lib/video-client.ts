"use client";

/**
 * Client-side video optimization — transcodes uploads into a lean,
 * fast-start H.264 MP4 entirely in the browser before they ever hit the
 * server, so every video stored in the media library (today and in the
 * future) streams instantly instead of dragging multi-megabyte originals.
 *
 * How it stays fast:
 *  - ffmpeg.wasm (single-threaded core — no SharedArrayBuffer/COOP headers
 *    needed), lazy-loaded from CDN and cached by the browser after first use.
 *  - max width 1280px, CRF 27, veryfast preset, yuv420p → typically 60–90%
 *    smaller than phone camera output.
 *  - `+faststart` moves the moov atom to the front → playback begins with the
 *    first bytes instead of waiting for the whole file.
 *  - hero/background videos strip the audio track entirely (they play muted)
 *    for a further big cut.
 *  - Anything that fails (offline CDN, unsupported file, timeout) falls back
 *    to the ORIGINAL file, so an upload never blocks on the optimizer.
 */

import type { FFmpeg as FFmpegType } from "@ffmpeg/ffmpeg";

const CDN_BASES = [
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd",
  "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd",
];

let instance: FFmpegType | null = null;
let loading: Promise<FFmpegType | null> | null = null;

async function getFFmpeg(): Promise<FFmpegType | null> {
  if (instance) return instance;
  if (loading) return loading;

  loading = (async () => {
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ff = new FFmpeg();

      for (const base of CDN_BASES) {
        try {
          await ff.load({
            coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
          });
          instance = ff;
          return ff;
        } catch {
          try {
            ff.terminate();
          } catch {
            /* try next mirror */
          }
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      loading = null;
    }
  })();

  return loading;
}

export type CompressVideoOptions = {
  /** Hero/background videos play muted → strip the audio track entirely. */
  keepAudio?: boolean;
  /** Longest-side ceiling for the encoded video. Default 1280. */
  maxDim?: number;
  /** Skip compression below this size (bytes). Default 2.5MB. */
  minSize?: number;
  /** Hard timeout in ms before giving up and returning the original. Default 150s. */
  timeoutMs?: number;
  /** 0..1 progress reporter for UI. */
  onProgress?: (ratio: number) => void;
};

async function probeDimensions(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    const done = (w: number, h: number) => {
      URL.revokeObjectURL(url);
      resolve({ w: w || 1920, h: h || 1080 });
    };
    v.onloadedmetadata = () => done(v.videoWidth, v.videoHeight);
    v.onerror = () => done(1920, 1080);
    window.setTimeout(() => done(1920, 1080), 6000);
    v.src = url;
  });
}

/**
 * Compress a video file for the web. Returns the optimized MP4, or the
 * original file when compression is unnecessary / unavailable / failed.
 */
export async function compressVideo(file: File, opts: CompressVideoOptions = {}): Promise<File> {
  const { keepAudio = true, maxDim = 1280, minSize = 2.5 * 1024 * 1024, timeoutMs = 150_000, onProgress } = opts;

  // Only real videos; tiny files are already web-friendly; skip formats the
  // optimizer gains nothing from (already-encoded small webm).
  if (!file.type.startsWith("video/")) return file;
  if (file.size < minSize) return file;

  const ff = await getFFmpeg();
  if (!ff) return file;

  const inName = "in" + (file.type.includes("webm") ? ".webm" : ".mp4");
  const outName = "out.mp4";

  try {
    const { fetchFile } = await import("@ffmpeg/util");
    const { w, h } = await probeDimensions(file);

    const args: string[] = ["-i", inName];
    const long = Math.max(w, h);
    if (long > maxDim) {
      const scale = maxDim / long;
      const tw = Math.round((w * scale) / 2) * 2;
      const th = Math.round((h * scale) / 2) * 2;
      args.push("-vf", `scale=${tw}:${th}`);
    }
    args.push(
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "27",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-map_metadata", "-1",
    );
    if (keepAudio) args.push("-c:a", "aac", "-b:a", "128k");
    else args.push("-an");
    args.push("-y", outName);

    const onProg = ({ progress }: { progress: number }) => {
      if (onProgress && Number.isFinite(progress)) onProgress(Math.min(0.99, Math.max(0, progress)));
    };

    const timeout = new Promise<never>((_, reject) =>
      window.setTimeout(() => reject(new Error("timeout")), timeoutMs)
    );

    const work = (async () => {
      ff.on("progress", onProg);
      await ff.writeFile(inName, await fetchFile(file));
      await ff.exec(args);
      const data = (await ff.readFile(outName)) as Uint8Array;
      try {
        await ff.deleteFile(inName);
        await ff.deleteFile(outName);
      } catch {
        /* cleanup best-effort */
      }
      return data;
    })();

    const data = await Promise.race([work, timeout]);

    // Lost the race — a fresh instance is needed next time.
    if (!data) {
      try { ff.terminate(); } catch { /* noop */ }
      instance = null;
      return file;
    }

    if (!data || data.byteLength < 1024) return file;
    if (data.byteLength >= file.size) return file; // no win → keep original

    const out = new File([data.slice().buffer as ArrayBuffer], file.name.replace(/\.\w+$/, ".mp4"), { type: "video/mp4" });
    return out;
  } catch {
    try { ff.terminate(); } catch { /* noop */ }
    instance = null;
    return file;
  }
}

/** True when this browser can run the wasm optimizer at all. */
export function canOptimizeVideo(): boolean {
  return typeof window !== "undefined" && "WebAssembly" in window;
}
