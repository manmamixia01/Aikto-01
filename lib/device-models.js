// Representative emulation profiles, not an exhaustive hardware identification database.
// Source: https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/models/emulation/EmulatedDevices.ts
// Screen dimensions are CSS pixels. Shared profiles must remain explicitly uncertain.
// iPhone 17e: https://www.apple.com/iphone-17e/specs/ (1170 x 2532 physical pixels).
// CSS 390 x 844 at DPR 3 is also confirmed by the owner's device visit.
const profiles = [
  {
    "name": "iPhone 17e",
    "width": 390,
    "height": 844,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone SE",
    "width": 375,
    "height": 667,
    "dpr": 2,
    "family": "iphone"
  },
  {
    "name": "iPhone XR",
    "width": 414,
    "height": 896,
    "dpr": 2,
    "family": "iphone"
  },
  {
    "name": "iPhone 12 Pro",
    "width": 390,
    "height": 844,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 14",
    "width": 390,
    "height": 844,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 14 Plus",
    "width": 428,
    "height": 926,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 14 Pro",
    "width": 393,
    "height": 852,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 14 Pro Max",
    "width": 430,
    "height": 932,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 15",
    "width": 393,
    "height": 852,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 15 Plus",
    "width": 430,
    "height": 932,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 15 Pro",
    "width": 393,
    "height": 852,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 15 Pro Max",
    "width": 430,
    "height": 932,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 16e",
    "width": 390,
    "height": 844,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 16",
    "width": 393,
    "height": 852,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 16 Plus",
    "width": 430,
    "height": 932,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 16 Pro",
    "width": 402,
    "height": 874,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "iPhone 16 Pro Max",
    "width": 440,
    "height": 956,
    "dpr": 3,
    "family": "iphone"
  },
  {
    "name": "Pixel 8",
    "width": 412,
    "height": 915,
    "dpr": 2.625,
    "family": "android"
  },
  {
    "name": "Pixel 8 Pro",
    "width": 448,
    "height": 997,
    "dpr": 3,
    "family": "android"
  },
  {
    "name": "Pixel 8a",
    "width": 412,
    "height": 915,
    "dpr": 2.625,
    "family": "android"
  },
  {
    "name": "Pixel 9",
    "width": 412,
    "height": 924,
    "dpr": 2.625,
    "family": "android"
  },
  {
    "name": "Pixel 9 Pro",
    "width": 427,
    "height": 952,
    "dpr": 3,
    "family": "android"
  },
  {
    "name": "Pixel 9 Pro XL",
    "width": 448,
    "height": 997,
    "dpr": 3,
    "family": "android"
  },
  {
    "name": "Pixel 10",
    "width": 412,
    "height": 924,
    "dpr": 2.625,
    "family": "android"
  },
  {
    "name": "Samsung Galaxy S8+",
    "width": 360,
    "height": 740,
    "dpr": 4,
    "family": "android"
  },
  {
    "name": "Samsung Galaxy S20 Ultra",
    "width": 412,
    "height": 915,
    "dpr": 3.5,
    "family": "android"
  },
  {
    "name": "iPad Mini",
    "width": 768,
    "height": 1024,
    "dpr": 2,
    "family": "ipad"
  },
  {
    "name": "iPad Pro 13",
    "width": 1032,
    "height": 1376,
    "dpr": 2,
    "family": "ipad"
  },
  {
    "name": "Samsung Galaxy A55",
    "width": 360,
    "height": 800,
    "dpr": 2.25,
    "family": "android"
  },
  {
    "name": "Pixel 9 Pro Fold",
    "width": 412,
    "height": 922,
    "dpr": 2.625,
    "family": "android"
  },
  {
    "name": "Galaxy Z Fold 6",
    "width": 412,
    "height": 968,
    "dpr": 2.625,
    "family": "android"
  },
  {
    "name": "Galaxy Z Fold 5",
    "width": 344,
    "height": 882,
    "dpr": 2.625,
    "family": "android"
  },
  {
    "name": "Samsung Galaxy A51/71",
    "width": 412,
    "height": 914,
    "dpr": 2.625,
    "family": "android"
  },
  {
    "name": "Moto G4",
    "width": 360,
    "height": 640,
    "dpr": 3,
    "family": "android"
  },
  {
    "name": "Moto G Power",
    "width": 412,
    "height": 823,
    "dpr": 1.75,
    "family": "android"
  },
  {
    "name": "Galaxy Tab S4",
    "width": 712,
    "height": 1138,
    "dpr": 2.25,
    "family": "android"
  }
];

export function estimateDeviceModel(userAgent, context = {}, category) {
  if (category !== "Smartphone" && category !== "Tablet") return null;
  const ua = typeof userAgent === "string" ? userAgent.slice(0, 1024) : "";
  const family = /iPhone/i.test(ua) ? "iphone"
    : /iPad/i.test(ua) || (/Macintosh/i.test(ua) && category === "Tablet") ? "ipad"
    : /Android/i.test(ua) ? "android" : null;
  const { width, height } = context?.screen ?? {};
  const dpr = context?.devicePixelRatio;
  if (!family || !Number.isInteger(width) || !Number.isInteger(height)
      || width <= 0 || height <= 0 || width > 100000 || height > 100000
      || !Number.isFinite(dpr) || dpr <= 0 || dpr > 20) {
    return "不明（推定に必要な情報が不足）";
  }
  const short = Math.min(width, height);
  const long = Math.max(width, height);
  const matches = profiles.filter(p => p.family === family
    && p.width === short && p.height === long && Math.abs(p.dpr - dpr) < 0.01);
  if (!matches.length) return "不明（登録候補との一致なし）";
  return "候補例: " + matches.map(p => p.name).join(" / ")
    + "（Screen＋DPRによる推定・未確定）";
}
