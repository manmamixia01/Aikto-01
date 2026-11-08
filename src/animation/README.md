# Business-card motion study

Standalone route `/animation/` (also `/animation`). No camera, permission prompt, tracking, or AR state is involved.

`main.js` builds a Three.js scene and a deterministic 64-second timeline. Card coordinates are X/Z, Y up; the card is 9.1 × 5.5 scene units. All time-dependent transforms and fades are sampled directly, so backward seeking and chapter jumps work. Group opacity is multiplied down the hierarchy.

Run `npm run build:animation` after editing the source. `npm run build` also runs it through prebuild. The bundled browser module is tracked at `public/animation/scene.js` so the static preview is ready to serve. Dependencies are bundled locally; no runtime CDN.

Manual QA entry: `/animation/?t=36&paused`. Controls: play, pause, replay, scrub, six chapters, .5/1/1.5 speed, orbit, reset, fullscreen. Reduced-motion preference starts paused. Loading waits for all assets, and model/network errors have a visible message.

Assets: four GLBs exported from existing Blender projects; original keyboard case STL; original hand scan aligned to the existing landmark coordinate system; measured keyboard/hand JSON. Common mm-to-scene map is `(x,y,z) => (y*.022,1.9-z*.022,-(x-85)*.022)`. Do not recenter these hand/keyboard assets independently. Source links and modeling notes are in `/animation/sources.html`.
