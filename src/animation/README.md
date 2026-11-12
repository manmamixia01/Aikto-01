# Business-card motion study

Standalone route `/animation/` (also `/animation`). No camera, permission prompt, tracking, or AR state is involved.

`card-scene.js` builds the shared Three.js scene and deterministic 64-second timeline. `main.js` provides the standalone player, while `ar-scene.js` maps the same scene onto the tracked XY card plane in `/ar`. Card coordinates are X/Z, Y up; the card is 9.1 × 5.5 scene units. All time-dependent transforms and fades are sampled directly, so backward seeking and chapter jumps work. Group opacity is multiplied down the hierarchy.

Run `npm run build:animation` after editing the source. `npm run build` also runs it through prebuild. Generated browser modules are tracked at `public/animation/scene.js` and `public/ar/scene.js`. Standalone dependencies are bundled locally; the AR bundle uses the AR page's existing Three.js import map to avoid loading a second copy.

The lunar opening leaves a 3 mm border on a 91 × 55 mm card. AR uses depth-only masking outside the opening to preserve the camera image, and updates the door clipping planes with the tracked anchor transform. Point-light intensity and range follow the AR scale. Recognition starts the complete 64-second animation from launch; losing and finding the card restarts it.

Camera-free AR rendering QA: `/ar?preview=1&t=18&paused`. This uses the same AR scene, lighting and Three.js version, a sample card image and a rotated anchor, with play/scrub controls. It does not start the camera or validate image recognition. Normal `/ar` retains the camera flow. Run `node scripts/check-lunar-sequence.mjs` for portal borders, occlusion, transformed clipping planes, stage sinking and timeline determinism.

Manual QA entry: `/animation/?t=36&paused`. Controls: play, pause, replay, scrub, six chapters, .5/1/1.5 speed, orbit, reset, fullscreen. Reduced-motion preference starts paused. Loading waits for all assets, and model/network errors have a visible message.

Assets: four GLBs exported from existing Blender projects; original keyboard case STL; original hand scan aligned to the existing landmark coordinate system; measured keyboard/hand JSON. Common mm-to-scene map is `(x,y,z) => (y*.022,1.9-z*.022,-(x-85)*.022)`. Do not recenter these hand/keyboard assets independently. Source links and modeling notes are in `/animation/sources.html`.
