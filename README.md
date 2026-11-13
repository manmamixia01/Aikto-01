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

- Page, country, region, city, and access time.
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
`/animation` do not use this React tracker. This adds no historical backfill or
aggregate statistics; new visits supply the new fields, and older clients show
`Unknown` for unavailable measurements.

The webhook stays server-side. Raw IP addresses and user-agent strings are not
included in Discord messages; mentions are disabled. Numeric metrics are
validated before formatting.

Run the notification tests with `node --test tests/visit.test.mjs`. These tests
mock all network calls and do not send real Discord notifications.
