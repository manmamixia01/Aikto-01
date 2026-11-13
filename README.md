<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a6459b5a-403b-4db2-8d53-1830db572e1c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Visit notifications

Set `DISCORD_WEBHOOK_URL` in the Vercel server environment. The React site's
existing `/api/visit` notifications include:

- Page, country with flag emoji, region, city, and access time.
- Persistent cumulative visit number; identified bots are excluded.
- Estimated device category: smartphone, tablet, desktop/laptop, bot, or unknown.
- Layout viewport width and height (`window.innerWidth/innerHeight`) in CSS pixels.
- Screen width and height in CSS pixels, separately from the viewport.
- Device pixel ratio (DPR), and viewport orientation.

For responsive design, use **Viewport**, especially its width. Screen dimensions
are not physical pixel resolution. Device category is a user-agent heuristic;
desktop mode and spoofed user agents can affect it. Desktop-style iPad user agents
are recognized using the browser's touch-point count.

Measurements are captured when the existing page-access event is sent. The
existing per-tab, per-page session deduplication is unchanged; resizing alone
does not send another notification. Standalone static pages such as `/ar` and
`/animation` do not use this React tracker. Older clients show `Unknown` for
unavailable measurements.

The webhook stays server-side. Raw IP addresses and user-agent strings are not
included in Discord messages; mentions are disabled. Numeric metrics are
validated before formatting.

### Cumulative visits

The counter is an **access-event count, not unique people**. It uses the same
per-tab/per-page counting unit as the existing Discord logs. Repeat visits in
new sessions and visits to another tracked page can count again.

The supplied export contains 97 `Site access` events through
2026-11-13T11:44:18.805Z (20:44 JST). Exclude 2 events explicitly marked
`Bot / automated`, giving a seed of **95**. Of these, **94 historical events
have no bot classification**; they remain unverified legacy visits, not
confirmed humans. Messages from the separate Captain Hook webhook and chat
spam are not site-access events. No raw export is committed.

New requests are excluded when server-side user-agent checks or the browser's
WebDriver signal identify automation. This is heuristic filtering, not proof of
human identity. Geography is never used as evidence of bot traffic. Bot
notifications say `累計訪問: 対象外（Bot）` and do not touch the counter.
Preview/development deployments do not count or send notifications.

The existing public Vercel Blob store (`BLOB_READ_WRITE_TOKEN`) persists the
counter across redeployments. Each counted request atomically creates an
immutable numbered marker under `analytics/site-visits-v1/` with overwriting
disabled. A collision claims the next number; an SDK retry that finds its own
marker reuses that number. Each marker contains only the count and a random
per-request nonce, with no visitor identity, IP, user agent, or location.
The counter starts with 95 when no markers exist; it never resets or re-adds
the seed on redeployment. Do not delete its marker files.

This low-traffic implementation scans paginated marker metadata on each
counted visit. If traffic grows substantially, migrate the existing total to an
atomic database counter. Storage errors are surfaced as an unavailable count,
never a fabricated/reset total. A persisted visit still counts if Discord
delivery fails. Requests between the export cutoff and deployment cannot be
backfilled without another log export.

Run `node --test tests/visit.test.mjs tests/visit-counter.test.mjs`.
Tests mock all external requests, including storage, and do not send real
Discord notifications.
