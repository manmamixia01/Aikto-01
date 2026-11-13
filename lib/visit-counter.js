import { randomUUID } from "node:crypto";

// Imported once from the supplied Discord export (2026-11-13 20:44 JST).
// 97 Site access events - 2 explicitly identified bots = 95 legacy visits.
// 94 legacy events lack bot/user-agent data. This is NOT a unique-person count.
export const HISTORY = Object.freeze({
  visits: 95,
  explicitlyExcludedBots: 2,
  botStatusUnknown: 94,
  through: "2026-11-13T11:44:18.805Z"
});
export const COUNTER_PREFIX = "analytics/site-visits-v1/";

// Immutable numbered markers avoid the public Blob CDN's mutable-file cache.
// Creation with allowOverwrite:false is the atomic operation: only one request
// can claim a number. Stored data contains no IP, UA, location, or stable user ID.
export function markerPath(number) {
  return COUNTER_PREFIX + String(number).padStart(12, "0") + ".json";
}

export async function latestVisitNumber(store) {
  let latest = HISTORY.visits;
  let cursor;
  const seenCursors = new Set();
  do {
    const result = await store.list({ prefix: COUNTER_PREFIX, limit: 1000, cursor });
    for (const blob of result.blobs) {
      const suffix = blob.pathname.slice(COUNTER_PREFIX.length);
      if (!blob.pathname.startsWith(COUNTER_PREFIX) || !/^\d{12}\.json$/.test(suffix)) continue;
      const number = Number(suffix.slice(0, -5));
      if (Number.isSafeInteger(number) && number > latest) latest = number;
    }
    if (!result.hasMore) return latest;
    if (!result.cursor || seenCursors.has(result.cursor)) throw new Error("Invalid counter pagination");
    seenCursors.add(result.cursor);
    cursor = result.cursor;
  } while (true);
}

export async function allocateVisitNumber(store, requestId = randomUUID()) {
  let number = await latestVisitNumber(store);
  for (let attempt = 0; attempt < 64; attempt++) {
    number++;
    if (number >= 1e12) throw new Error("Visit counter capacity exceeded");
    const pathname = markerPath(number);
    try {
      await store.put(pathname, JSON.stringify({ number, requestId }), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "application/json"
      });
      return number;
    } catch (error) {
      if (!store.isAlreadyExists(error)) throw error;
      // An SDK retry after a lost upload response can encounter our own marker.
      const existing = await store.read(pathname);
      if (existing?.requestId === requestId && existing?.number === number) return number;
      // Another concurrent visit owns this number. Claim the next one.
    }
  }
  throw new Error("Too many concurrent counter updates");
}

export async function incrementVisit() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Visit storage is not configured");
  const { list, put, get, BlobError } = await import("@vercel/blob");
  return allocateVisitNumber({
    list,
    put,
    isAlreadyExists: (error) => error instanceof BlobError && /already exists/i.test(error.message),
    read: async (pathname) => {
      const result = await get(pathname, { access: "public" });
      if (!result || result.statusCode !== 200) throw new Error("Cannot read visit marker");
      return new Response(result.stream).json();
    }
  });
}
