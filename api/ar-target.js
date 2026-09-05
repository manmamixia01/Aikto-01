import crypto from "node:crypto";
import { head, put } from "@vercel/blob";

const CONFIG_PATH = "mindar/config.json";
const json = (res, status, body) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json(body);
};
const authorized = (received) => {
  const expected = process.env.AR_ADMIN_PASSWORD || "";
  if (!expected || typeof received !== "string") return false;
  const a = Buffer.from(expected), b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const decode = (value, limit) => {
  if (typeof value !== "string" || value.length > Math.ceil(limit * 4 / 3) + 8) throw new Error("File is too large");
  const buffer = Buffer.from(value, "base64");
  if (!buffer.length || buffer.length > limit) throw new Error("Invalid file");
  return buffer;
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return json(res, 200, { configured: false });
    try {
      const configBlob = await head(CONFIG_PATH);
      const response = await fetch(`${configBlob.url}?v=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Config fetch failed");
      return json(res, 200, { configured: true, ...(await response.json()) });
    } catch {
      return json(res, 200, { configured: false });
    }
  }
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return json(res, 503, { error: "Vercel Blob is not configured" });
  if (!authorized(req.body?.password)) return json(res, 401, { error: "Password is incorrect" });
  try {
    const image = decode(req.body?.image, 2_000_000);
    const target = decode(req.body?.target, 2_500_000);
    const imageType = req.body?.imageType === "image/png" ? "image/png" : "image/jpeg";
    const extension = imageType === "image/png" ? "png" : "jpg";
    const [imageBlob, targetBlob] = await Promise.all([
      put(`mindar/card.${extension}`, image, { access: "public", addRandomSuffix: true, contentType: imageType }),
      put("mindar/target.mind", target, { access: "public", addRandomSuffix: true, contentType: "application/octet-stream" })
    ]);
    const config = {
      imageUrl: imageBlob.url,
      targetUrl: targetBlob.url,
      aspectRatio: Math.max(0.25, Math.min(4, Number(req.body?.aspectRatio) || 0.6044)),
      originalName: String(req.body?.originalName || "business-card").slice(0, 120),
      updatedAt: new Date().toISOString()
    };
    await put(CONFIG_PATH, JSON.stringify(config), {
      access: "public", addRandomSuffix: false, allowOverwrite: true,
      contentType: "application/json", cacheControlMaxAge: 60
    });
    return json(res, 200, { ok: true, ...config });
  } catch (error) {
    console.error("AR target upload failed", error);
    return json(res, 400, { error: error?.message || "Upload failed" });
  }
}
