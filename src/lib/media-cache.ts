/**
 * In-process media byte cache.
 *
 * Videos and large images live as Postgres bytea on a remote database —
 * re-pulling 10–25MB on every request (and on every video seek/range
 * request) is what made hero videos feel slow. This LRU-style cache keeps
 * the most recently served assets in memory per server instance so range
 * requests and repeats answer instantly.
 *
 * Bounded: evicts least-recently-used entries once the total exceeds the cap,
 * so memory stays predictable on serverless instances.
 */

const MAX_TOTAL_BYTES = 64 * 1024 * 1024; // 64MB per instance

type Entry = {
  buf: Buffer;
  type: string;
  name: string;
  etag: string;
  at: number;
};

const store = new Map<string, Entry>();

function evictIfNeeded() {
  let total = 0;
  for (const e of store.values()) total += e.buf.length;
  while (total > MAX_TOTAL_BYTES && store.size > 0) {
    // Map preserves insertion order; oldest "at" wins eviction.
    let oldestKey: string | null = null;
    let oldestAt = Infinity;
    for (const [k, e] of store) {
      if (e.at < oldestAt) {
        oldestAt = e.at;
        oldestKey = k;
      }
    }
    if (!oldestKey) break;
    total -= store.get(oldestKey)!.buf.length;
    store.delete(oldestKey);
  }
}

export function cacheGet(id: string): Entry | undefined {
  const e = store.get(id);
  if (e) e.at = Date.now(); // touch
  return e;
}

export function cacheSet(id: string, buf: Buffer, type: string, name: string, etag: string): void {
  store.set(id, { buf, type, name, etag, at: Date.now() });
  evictIfNeeded();
}

export function cacheInvalidate(id: string): void {
  store.delete(id);
}

export function makeEtag(id: string, size: number): string {
  return `"m-${id.slice(0, 8)}-${size}"`;
}
