import assert from "node:assert/strict";
import test from "node:test";
import { estimateDeviceModel as estimate } from "../lib/device-models.js";
import { createVisitHandler } from "../api/visit.js";

const context = { screen: { width: 390, height: 844 }, devicePixelRatio: 3 };
test("shared iPhone dimensions produce uncertain candidate examples", () => {
  const result = estimate("iPhone", context, "Smartphone");
  assert.match(result, /iPhone 12 Pro.*iPhone 14/);
  assert.match(result, /候補例.*未確定/);
});
test("rotation and in-app viewport height do not affect model candidates", () => {
  assert.equal(estimate("iPhone", context, "Smartphone"),
    estimate("iPhone", { ...context, screen: { width: 844, height: 390 },
      viewport: { width: 844, height: 200 } }, "Smartphone"));
});
test("OS prevents Apple candidates being assigned to Android", () => {
  assert.match(estimate("Linux; Android", context, "Smartphone"), /^不明/);
  assert.match(estimate("Android", { screen: { width: 412, height: 915 },
    devicePixelRatio: 2.625 }, "Smartphone"), /Pixel 8.*Pixel 8a/);
});
test("iPad desktop UA and Android tablets have candidate support", () => {
  assert.match(estimate("Macintosh", { screen: { width: 768, height: 1024 },
    devicePixelRatio: 2 }, "Tablet"), /iPad Mini/);
  assert.match(estimate("Android", { screen: { width: 712, height: 1138 },
    devicePixelRatio: 2.25 }, "Tablet"), /Galaxy Tab S4/);
});
test("desktop and automated visits never get model estimates", () => {
  for (const category of ["Desktop / laptop", "Bot / automated", "Unknown"])
    assert.equal(estimate("iPhone", context, category), null);
});
test("missing, malformed and unmatched metrics never force a model", () => {
  for (const metrics of [undefined, null, {}, { ...context, devicePixelRatio: 2 },
    { ...context, devicePixelRatio: Infinity },
    { ...context, screen: { width: "390", height: 844 } },
    { ...context, screen: { width: -390, height: 844 } }])
    assert.match(estimate("iPhone", metrics, "Smartphone"), /^不明/);
});
test("Discord includes model candidates only for human mobile visits", async () => {
  const previousFetch = globalThis.fetch;
  const previousEnv = { webhook: process.env.DISCORD_WEBHOOK_URL, env: process.env.VERCEL_ENV };
  const messages = [];
  process.env.DISCORD_WEBHOOK_URL = "https://discord.invalid/model-test";
  process.env.VERCEL_ENV = "production";
  globalThis.fetch = async (url, options) => {
    assert.equal(url, process.env.DISCORD_WEBHOOK_URL);
    messages.push(JSON.parse(options.body).content);
    return { ok: true };
  };
  try {
    const handler = createVisitHandler({ nextVisitNumber: async () => 97 });
    for (const ua of ["iPhone", "Windows NT", "iPhone Googlebot"]) {
      await handler({ method: "POST", headers: { "user-agent": ua }, body: context },
        { status() { return this; }, json() { return this; } });
    }
    assert.match(messages[0], /推定機種: 候補例:/);
    assert.ok(messages[0].length < 2000);
    assert.ok(!messages[1].includes("推定機種:"));
    assert.ok(!messages[2].includes("推定機種:"));
  } finally {
    globalThis.fetch = previousFetch;
    for (const [key, value] of [["DISCORD_WEBHOOK_URL", previousEnv.webhook], ["VERCEL_ENV", previousEnv.env]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
