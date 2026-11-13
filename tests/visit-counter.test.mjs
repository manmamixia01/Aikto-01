import test from "node:test";
import assert from "node:assert/strict";
import { HISTORY, COUNTER_PREFIX, markerPath, latestVisitNumber, allocateVisitNumber } from "../lib/visit-counter.js";
import { countryFlag, isAutomatedVisit } from "../lib/visit-helpers.js";
import { createVisitHandler } from "../api/visit.js";

function memoryStore() {
  const data = new Map();
  return {
    data,
    list: async ({ cursor }) => {
      const paths = [...data.keys()];
      const offset = Number(cursor || 0), pageSize = 3;
      return {
        blobs: paths.slice(offset, offset + pageSize).map(pathname => ({ pathname })),
        hasMore: paths.length > offset + pageSize,
        cursor: paths.length > offset + pageSize ? String(offset + pageSize) : undefined
      };
    },
    put: async (path, body, options) => {
      assert.equal(options.allowOverwrite, false);
      assert.equal(options.addRandomSuffix, false);
      if (data.has(path)) throw new Error("Vercel Blob: This blob already exists.");
      data.set(path, JSON.parse(body));
    },
    isAlreadyExists: error => /already exists/i.test(error.message),
    read: async path => data.get(path)
  };
}

test("country codes become flags and invalid/missing codes stay empty", () => {
  for (const [code, expected] of [["JP", "🇯🇵"], ["us", "🇺🇸"], ["AE", "🇦🇪"], ["GB", "🇬🇧"], ["NL", "🇳🇱"]]) {
    assert.equal(countryFlag(code), expected);
  }
  for (const invalid of [undefined, null, "", "Japan", "J1", "JP\n", 123]) assert.equal(countryFlag(invalid), "");
});

test("automated clients are recognized without using country as a heuristic", () => {
  for (const ua of ["Googlebot/2.1", "HeadlessChrome/130", "curl/8.0", "python-requests/2.3", "facebookexternalhit/1.1"]) {
    assert.equal(isAutomatedVisit(ua, false), true);
  }
  assert.equal(isAutomatedVisit("Mozilla/5.0 Chrome/130", true), true);
  assert.equal(isAutomatedVisit("Mozilla/5.0 Chrome/130", false), false);
});

test("historical import starts at 95, first new human visit is 96", async () => {
  const store = memoryStore();
  assert.equal(HISTORY.visits, 97 - 2);
  assert.equal(HISTORY.botStatusUnknown, 94);
  assert.equal(await latestVisitNumber(store), 95);
  assert.equal(await allocateVisitNumber(store, "one"), 96);
  assert.deepEqual([...store.data.values()], [{ number: 96, requestId: "one" }]);
});

test("counter continues across fresh server instances and paginated listings", async () => {
  const store = memoryStore();
  for (let i = 0; i < 9; i++) await allocateVisitNumber({ ...store }, "visit-" + i);
  assert.equal(await latestVisitNumber({ ...store }), 104);
  assert.equal(await allocateVisitNumber({ ...store }, "next"), 105);
});

test("20 simultaneous visits receive distinct consecutive numbers", async () => {
  const store = memoryStore();
  const results = await Promise.all(Array.from({ length: 20 }, (_, i) => allocateVisitNumber(store, "parallel-" + i)));
  assert.deepEqual(results.sort((a, b) => a - b), Array.from({ length: 20 }, (_, i) => 96 + i));
  assert.equal(store.data.size, 20);
});

test("a stale listing is recovered through atomic create conflicts", async () => {
  const store = memoryStore();
  await allocateVisitNumber(store, "first");
  const stale = { ...store, list: async () => ({ blobs: [], hasMore: false }) };
  assert.equal(await allocateVisitNumber(stale, "second"), 97);
});

test("lost upload acknowledgement does not allocate twice", async () => {
  const store = memoryStore();
  const retryingStore = { ...store, put: async (...args) => {
    await store.put(...args);
    throw new Error("Vercel Blob: This blob already exists.");
  } };
  assert.equal(await allocateVisitNumber(retryingStore, "same-request"), 96);
  assert.equal(store.data.size, 1);
});

test("storage read errors never fall back to the seed and write duplicate counts", async () => {
  const store = memoryStore();
  await assert.rejects(allocateVisitNumber({ ...store, list: async () => { throw new Error("offline"); } }), /offline/);
  assert.equal(store.data.size, 0);
});

test("storage write errors are not treated as occupied slots", async () => {
  const store = memoryStore();
  await assert.rejects(allocateVisitNumber({ ...store, put: async () => { throw new Error("permission denied"); } }), /permission denied/);
  assert.equal(store.data.size, 0);
});

test("unrelated files do not enter the visit count", async () => {
  const store = memoryStore();
  store.data.set(COUNTER_PREFIX + "readme.json", {});
  store.data.set("other/" + "999999999999.json", {});
  assert.equal(await allocateVisitNumber(store, "valid"), 96);
  assert.ok(store.data.has(markerPath(96)));
});

test("notification counter integration", async t => {
  const previousFetch = globalThis.fetch;
  const previousWebhook = process.env.DISCORD_WEBHOOK_URL;
  const previousEnv = process.env.VERCEL_ENV;
  const messages = [];
  let increments = 0;
  let fail = false;
  const handler = createVisitHandler({ nextVisitNumber: async () => {
    if (fail) throw new Error("storage unavailable");
    return 95 + ++increments;
  } });
  process.env.DISCORD_WEBHOOK_URL = "https://discord.invalid/test-only";
  process.env.VERCEL_ENV = "production";
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://discord.invalid/test-only");
    messages.push(JSON.parse(options.body));
    return { ok: true };
  };
  const invoke = async (ua, body = {}, headers = {}) => {
    const res = {
      code: 0, body: null,
      status(code) { this.code = code; return this; },
      json(body) { this.body = body; return this; }
    };
    await handler({ method: "POST", headers: { "user-agent": ua, ...headers }, body }, res);
    return res;
  };
  try {
    await t.test("human visits advance the shared counter", async () => {
      const res = await invoke("Mozilla/5.0 (Windows NT 10.0) Chrome/130");
      assert.equal(res.body.visitNumber, 96);
      assert.equal(res.body.counted, true);
      assert.ok(messages.at(-1).content.includes("累計訪問: 96回目"));
    });
    await t.test("known bot is notified but never counted", async () => {
      const before = increments;
      const res = await invoke("HeadlessChrome/130", { userAgent: "normal browser" });
      assert.equal(increments, before);
      assert.equal(res.body.counted, false);
      assert.equal(res.body.visitNumber, null);
      assert.ok(messages.at(-1).content.includes("対象外（Bot）"));
    });
    await t.test("webdriver hint excludes a disguised browser", async () => {
      const before = increments;
      await invoke("Mozilla/5.0 Chrome/130", { webdriver: true });
      assert.equal(increments, before);
    });
    await t.test("preview requests neither count nor notify", async () => {
      process.env.VERCEL_ENV = "preview";
      const before = increments, sent = messages.length;
      const res = await invoke("Mozilla/5.0 Chrome/130");
      assert.equal(increments, before);
      assert.equal(messages.length, sent);
      assert.equal(res.body.skipped, "non-production");
      process.env.VERCEL_ENV = "production";
    });
    await t.test("counter failure is reported without inventing a number", async () => {
      fail = true;
      const res = await invoke("Mozilla/5.0 Chrome/130");
      assert.equal(res.code, 503);
      assert.equal(res.body.counted, false);
      assert.equal(res.body.visitNumber, null);
      assert.ok(messages.at(-1).content.includes("集計エラー"));
      fail = false;
    });
    await t.test("next human follows the last counted human", async () => {
      const res = await invoke("Mozilla/5.0 Chrome/130");
      assert.equal(res.body.visitNumber, 97);
    });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousWebhook === undefined) delete process.env.DISCORD_WEBHOOK_URL;
    else process.env.DISCORD_WEBHOOK_URL = previousWebhook;
    if (previousEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousEnv;
  }
});
