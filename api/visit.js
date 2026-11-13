import { estimateDeviceModel } from "../lib/device-models.js";
import { incrementVisit } from "../lib/visit-counter.js";
import { countryFlag, isAutomatedVisit } from "../lib/visit-helpers.js";

const firstHeaderValue = (headers, names) => {
  for (const name of names) {
    const value = headers[name] || headers[name.toLowerCase()];
    if (value) return value.split(",")[0].trim();
  }
  return "";
};

const isPublicIp = (ip) => {
  if (!ip || ip === "::1" || ip === "127.0.0.1") return false;
  if (/^(10|127)\./.test(ip)) return false;
  if (/^192\.168\./.test(ip)) return false;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return false;
  return true;
};

const sanitize = (value, fallback) => {
  const text = typeof value === "string" ? value : fallback;
  return text.replace(/[\r\n`]/g, " ").slice(0, 180) || fallback;
};


// User-agent classification is an estimate, independent of viewport width.
const deviceType = (userAgent, maxTouchPoints) => {
  const ua = typeof userAgent === "string" ? userAgent.slice(0, 1024) : "";
  if (/bot|crawler|spider|headless/i.test(ua)) return "Bot / automated";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) ||
      (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
      (/Macintosh/i.test(ua) && Number.isInteger(maxTouchPoints) &&
       maxTouchPoints > 1 && maxTouchPoints <= 20)) return "Tablet";
  if (/iPhone|iPod|Android.*Mobile|Windows Phone|Mobi/i.test(ua)) return "Smartphone";
  if (/Windows NT|Macintosh|X11|CrOS|Linux/i.test(ua)) return "Desktop / laptop";
  return "Unknown";
};

const dimension = (value) =>
  Number.isInteger(value) && value > 0 && value <= 100000 ? value : null;

const formatSize = (size) => {
  const width = dimension(size?.width);
  const height = dimension(size?.height);
  return width !== null && height !== null ? `${width} x ${height} CSS px` : "Unknown";
};

const orientation = (viewport) => {
  const width = dimension(viewport?.width);
  const height = dimension(viewport?.height);
  if (width === null || height === null) return "Unknown";
  return width === height ? "Square" : width > height ? "Landscape" : "Portrait";
};

const formatPixelRatio = (value) =>
  typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 20
    ? String(Math.round(value * 100) / 100)
    : "Unknown";

export function createVisitHandler({ nextVisitNumber = incrementVisit } = {}) {
  return async function handler(req, res) {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
  
    // Preview deployments must never affect production statistics.
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
      res.status(200).json({ ok: true, skipped: "non-production" });
      return;
    }
  
    const automated = isAutomatedVisit(req.headers?.["user-agent"], req.body?.webdriver);
    let visitNumber = null;
    let countFailed = false;
    if (!automated) {
      try {
        visitNumber = await nextVisitNumber();
      } catch {
        countFailed = true;
        console.error("Visit count could not be persisted");
      }
    }
  
    const page = sanitize(req.body?.page, "/");
    const accessedAt = new Date().toISOString();
    const ip = firstHeaderValue(req.headers || {}, [
      "x-forwarded-for",
      "x-real-ip",
      "client-ip"
    ]);
  
    let country = "Unknown";
    let countryCode = firstHeaderValue(req.headers || {}, ["x-vercel-ip-country"]);
    let region = "Unknown";
    let city = "Unknown";
  
    // Same lookup approach as the adress project: ip-api.com/json/{ip}.
    // The raw IP is only used transiently for this lookup and is not sent to Discord.
    if (isPublicIp(ip)) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city`);
        const geo = await geoResponse.json();
        if (geo.status === "success") {
          country = sanitize(geo.country, "Unknown");
          countryCode = sanitize(geo.countryCode, countryCode);
          region = sanitize(geo.regionName, "Unknown");
          city = sanitize(geo.city, "Unknown");
        }
      } catch (error) {
        console.error("Geo lookup failed:", error.message);
      }
    }
  
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      res.status(200).json({ ok: true, skipped: "DISCORD_WEBHOOK_URL is not set" });
      return;
    }
  
    const category = automated ? "Bot / automated" : deviceType(req.headers?.["user-agent"], req.body?.maxTouchPoints);
    const model = estimateDeviceModel(req.headers?.["user-agent"], req.body, category);
    const content = [
      "**Site access**",
      `Page: ${page}`,
      `Country: ${country}${countryFlag(countryCode) ? " " + countryFlag(countryCode) : ""}`,
      automated ? "累計訪問: 対象外（Bot）" : countFailed ? "累計訪問: 集計エラー（未加算）" : `累計訪問: ${visitNumber}回目`,
      `Region: ${region}`,
      `City: ${city}`,
      `Device (estimated): ${category}`,
      ...(model ? [`推定機種: ${model}`] : []),
      `Viewport: ${formatSize(req.body?.viewport)}`,
      `Screen: ${formatSize(req.body?.screen)}`,
      `Pixel ratio (DPR): ${formatPixelRatio(req.body?.devicePixelRatio)}`,
      `Orientation: ${orientation(req.body?.viewport)}`,
      `Time: ${accessedAt}`
    ].join("\n");
  
    try {
      const discordResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, allowed_mentions: { parse: [] } })
      });
  
      if (!discordResponse.ok) {
        res.status(502).json({ error: "Discord webhook failed" });
        return;
      }
    } catch (error) {
      console.error("Discord webhook failed:", error.message);
      res.status(502).json({ error: "Discord webhook failed" });
      return;
    }
  
    res.status(countFailed ? 503 : 200).json({
      ok: !countFailed, counted: !automated && !countFailed, visitNumber,
      ...(countFailed ? { error: "Visit count unavailable" } : {})
    });
  };
}

export default createVisitHandler();
