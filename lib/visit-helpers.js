export function countryFlag(code) {
  if (typeof code !== "string" || !/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...code.toUpperCase().split("").map((letter) =>
    0x1F1E6 + letter.charCodeAt(0) - 65));
}

export function isAutomatedVisit(userAgent, webdriver) {
  if (webdriver === true) return true;
  const ua = typeof userAgent === "string" ? userAgent.slice(0, 2048) : "";
  return /bot|crawler|spider|headless|lighthouse|pagespeed|facebookexternalhit|facebot|slurp|bingpreview|previewbot|phantomjs|selenium|playwright|puppeteer|curl\/|wget\/|python-requests|python-urllib|go-http-client|node-fetch|undici|httpclient/i.test(ua);
}
