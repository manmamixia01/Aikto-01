import assert from "node:assert/strict";
import test from "node:test";
import handler from "../api/visit.js";
import { collectVisitContext } from "../src/visit-context.js";

const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";
const desktop = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36";
const ipadDesktop = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15";

test("browser sends layout CSS pixels independently of screen pixels and DPR", () => {
  const result = collectVisitContext({
    innerWidth: 390, innerHeight: 720,
    screen: { width: 390, height: 844 }, devicePixelRatio: 3
  }, { maxTouchPoints: 5 });
  assert.deepEqual(result, {
    viewport: { width: 390, height: 720 },
    screen: { width: 390, height: 844 },
    devicePixelRatio: 3, maxTouchPoints: 5
  });
  assert.equal(Object.hasOwn(result, "userAgent"), false);
});

test("visit notifications (all external requests mocked)", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalWebhook = process.env.DISCORD_WEBHOOK_URL;
  const webhook = "https://discord.invalid/test-only";
  const requests = [];
  let webhookOk = true;
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    if (url.startsWith("http://ip-api.com/")) {
      return { json: async () => ({ status: "success", country: "Japan", regionName: "Tokyo", city: "Shinjuku" }) };
    }
    assert.equal(url, webhook, "no request may leave the test stub");
    return { ok: webhookOk };
  };
  process.env.DISCORD_WEBHOOK_URL = webhook;
  const invoke = async (body = {}, ua = desktop, method = "POST", extraHeaders = {}) => {
    requests.length = 0;
    const response = {
      statusCode: null, body: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; }
    };
    await handler({ method, headers: { "user-agent": ua, ...extraHeaders }, body }, response);
    const sent = requests.find((r) => r.url === webhook);
    return { response, message: sent ? JSON.parse(sent.options.body) : null };
  };
  try {
    await t.test("phone context and existing geolocation reach one Discord message", async () => {
      const { response, message } = await invoke({
        page: "/works",
        viewport: { width: 390, height: 720 }, screen: { width: 390, height: 844 },
        devicePixelRatio: 3, maxTouchPoints: 5
      }, iphone, "POST", { "x-forwarded-for": "203.0.113.42" });
      assert.equal(response.statusCode, 200);
      for (const text of [
        "Page: /works", "Country: Japan", "Region: Tokyo", "City: Shinjuku",
        "Device (estimated): Smartphone", "Viewport: 390 x 720 CSS px",
        "Screen: 390 x 844 CSS px", "Pixel ratio (DPR): 3", "Orientation: Portrait"
      ]) assert.ok(message.content.includes(text), text);
      assert.equal(requests.length, 2);
      assert.ok(!message.content.includes("203.0.113.42"));
      assert.ok(!message.content.includes(iphone));
      assert.deepEqual(message.allowed_mentions, { parse: [] });
    });

    const devices = [
      ["narrow desktop stays desktop", desktop, 0, "Desktop / laptop"],
      ["touchscreen Windows stays desktop", desktop, 10, "Desktop / laptop"],
      ["Android phone", "Mozilla/5.0 (Linux; Android 15; Pixel 9) Chrome/131 Mobile Safari/537.36", 5, "Smartphone"],
      ["Android tablet", "Mozilla/5.0 (Linux; Android 14; SM-X810) Chrome/131 Safari/537.36", 5, "Tablet"],
      ["iPad desktop user agent", ipadDesktop, 5, "Tablet"],
      ["Mac desktop", ipadDesktop, 0, "Desktop / laptop"],
      ["legacy iPad user agent", "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)", 5, "Tablet"],
      ["crawler", "Mozilla/5.0 (compatible; Googlebot/2.1)", 0, "Bot / automated"],
      ["missing user agent", "", 0, "Unknown"],
      ["invalid iPad touch hint", ipadDesktop, "5", "Desktop / laptop"]
    ];
    for (const [name, ua, maxTouchPoints, expected] of devices) {
      await t.test(name, async () => {
        const { message } = await invoke({ viewport: { width: 390, height: 720 }, maxTouchPoints }, ua);
        assert.ok(message.content.includes("Device (estimated): " + expected));
      });
    }

    await t.test("older clients without metrics still succeed", async () => {
      const { response, message } = await invoke({ page: "/" });
      assert.equal(response.statusCode, 200);
      for (const label of ["Viewport", "Screen", "Pixel ratio (DPR)", "Orientation"]) {
        assert.ok(message.content.includes(label + ": Unknown"));
      }
    });

    await t.test("malformed metrics cannot inject Discord content", async () => {
      const { message } = await invoke({
        page: "/@everyone\n`test`",
        viewport: { width: "@everyone\nInjected", height: -1 },
        screen: { width: 999999999, height: 800 },
        devicePixelRatio: Infinity
      });
      for (const label of ["Viewport", "Screen", "Pixel ratio (DPR)", "Orientation"]) {
        assert.ok(message.content.includes(label + ": Unknown"));
      }
      assert.ok(!message.content.includes("Injected"));
      assert.deepEqual(message.allowed_mentions, { parse: [] });
    });

    await t.test("landscape viewport and fractional DPR", async () => {
      const { message } = await invoke({ viewport: { width: 1366, height: 768 }, devicePixelRatio: 1.253 });
      assert.ok(message.content.includes("Orientation: Landscape"));
      assert.ok(message.content.includes("Pixel ratio (DPR): 1.25"));
    });

    await t.test("square viewport", async () => {
      const { message } = await invoke({ viewport: { width: 800, height: 800 } });
      assert.ok(message.content.includes("Orientation: Square"));
    });

    await t.test("GET is rejected without external requests", async () => {
      const { response } = await invoke({}, desktop, "GET");
      assert.equal(response.statusCode, 405);
      assert.equal(requests.length, 0);
    });

    await t.test("Discord failure returns 502", async () => {
      webhookOk = false;
      const { response } = await invoke({});
      assert.equal(response.statusCode, 502);
      webhookOk = true;
    });

    await t.test("missing webhook retains skip behavior", async () => {
      delete process.env.DISCORD_WEBHOOK_URL;
      const { response, message } = await invoke({});
      assert.equal(response.statusCode, 200);
      assert.equal(message, null);
      assert.equal(requests.length, 0);
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWebhook === undefined) delete process.env.DISCORD_WEBHOOK_URL;
    else process.env.DISCORD_WEBHOOK_URL = originalWebhook;
  }
});
