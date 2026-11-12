# Animation references and asset provenance

Checked 2026-11-08. The animation is a miniature visual sequence, not a common-scale engineering model or a claim that these missions were connected in real life.

## Rocket: SpaceX Starship / Super Heavy

- [SpaceX Starship](https://new.spacex.com/vehicles/starship): two stages, 9 m vehicle diameter; official vehicle imagery is the visual reference.
- [SpaceX June 2026 prospectus](https://content.spacex.com/cms-assets/FINAL_Documents%20and%20Updates/SpaceX%20-%20EU%20Prospectus%20%28Approved%20by%20Bafin%29%20-%20June%205%2C%202026.pdf): Starship overview states integrated height 124.4 m and diameter 9 m. Preserve its tall, slender silhouette; the booster accounts for approximately the lower three-fifths of the stack.
- [SpaceX updates](https://new.spacex.com/updates): V3 booster grid fins reduced from four to three, each 50% larger. The version must be consistent: use three fins for a V3-inspired model; four fins are appropriate only for an earlier generation.
- [NASA wind tunnel tests](https://www.nasa.gov/directorates/esdmd/artemis-campaign-development-division/human-landing-system-program/nasa-spacex-advance-wind-tunnel-tests-for-starship-rocket/): confirms the 33-engine Super Heavy booster and second-stage Starship.
- Useful recognizable features: reflective steel cylindrical body with circumferential seams, tapered/rounded upper nose, dark heat-shield side on ship, upper and lower ship flaps, interstage band, grid fins near booster top, clustered nozzle bells below. Use geometry rather than external copyrighted photos as textures.
- The rocket-to-satellite sequence is an artistic transition. Super Heavy is a booster and is not itself a satellite.
- Opening revised 2026-11-12: model includes open hot-stage vents, lattice grid fins, heat-shield tile faces and clustered nozzle bells. The tower sinks below the card by 4.3 s; pitching starts at 4.5 s, then stage separation at 6.8 s. The descending tower and compact trajectory are deliberate miniature staging, not a flight simulation.

## HELIOS N1 transmitter and lunar portal (2026-11-12)

- Replaced the AI1 receiver model with the existing gold-sided HELIOS N1 transmitter from the user's PROMETHEUS PV workspace: transmitter_model_hardware_v1/helios_n1_hardware_v1.blend.
- Its source model includes 16 optical heads, four solar-array panels, radiators, gold side skins, equipment boxes and harnesses. scripts/export-transmitter.py retains its material families (with warmer gold for browser readability), bakes modifiers, consolidates meshes, and reduces detail for the browser. The source Blender file is not modified.
- Optical output is Blender +X; the export metadata records its normalized aperture position so the orange beam joins the actual emitting face to the lunar receiver face.
- [NASA lunar surface sustainability concept](https://www.nasa.gov/general/nasa-outlines-lunar-surface-sustainability-concept/): habitat, mobility and supporting surface infrastructure inform the newly modeled pressure modules, airlock and rover. This is an artistic base layout, not an existing installation.
- [NASA lunar regolith](https://science.nasa.gov/biological-physical/what-is-lunar-regolith/): terrain inspiration. Seeded crater bowls, rims and scattered rocks are generated geometry, not survey data.
- Upper-stage expansion and transparency, sliding card doors, and visible orange laser light are narrative effects. The foreground plane has a rectangular opening and the larger lunar landscape sits beneath it, creating actual parallax when the viewer rotates the scene.

## Birdman platform and aircraft

- [Birdman contest organizer, YTV](https://www.ytv.co.jp/birdman/): self-built aircraft fly using human power and compete in distance.
- [Osaka Institute of Technology team](https://www.oit.ac.jp/oit/overthelimit/oit-project/hpa/): platform 10 m above water, 10 m run-up, 3.5-degree incline, fan-shaped plan. Preserve the raised scaffold, repeated vertical posts, horizontal rails and diagonal bracing below its deck; assembly should connect members before takeoff.
- [SOARA team's own description](https://www.soarahpa.com/birdman/): SOARA-X2 is a Lake Biwa-style glider; the team aims for glider division. Typical gliders span 15–25 m and weigh 30–45 kg. Use the user's existing glider geometry when available and do not invent a propeller on that glider.
- [Tokyo University of Science TORICA 2026 aircraft](https://torica-tus.com/2026/09/03/2026/): 25.4 m span, 5.528 m length, high-aspect wings and winglets. Useful cross-check for glider proportions, not a substitute for the user's aircraft.
- [OIT aircraft example](https://www.oit.ac.jp/oit/overthelimit/oit-project/hpa/): 33 m span, 8.5 m length, recumbent cockpit and one-blade propeller; useful only if rendering a powered human-powered aircraft instead of SOARA's glider.

## Reused personal keyboard and hand data

Source workspace:
`C:/Users/hatto/Documents/Codex/2026-06-23/f-vs-code-python-kineticfit-3`

- `personalized_keyboard_study/hands/self/outputs/keyboard_layout/keyboard_layout.json`: final personal 21-key curved layout. `modes.contour` gives per-key position, surface normal, tangent; cap dimensions 18 × 18 × 5 mm. Original placement, orientations and finger assignment retained in `keyboard-data.json`.
- `.../hand_profile.json`: original measured 21 landmarks for open, pressure and fist states. This is a measured hand landmark rig, not a medical bone reconstruction.
- `.../case/contour/case.stl` and `floor.stl`: copied unchanged to `keyboard-case.stl` and `keyboard-floor.stl`.
- `work/hand-viewer-vinext/public/pa-.stl` and `sizen.stl`: existing hand surface scans. Exported as `hand-open.stl` and `hand-pressure.stl`, retaining all original triangles, after applying the exact original viewer centering and palm-local basis.
- `prepare-keyboard.cjs` reproduces all copies/conversions. Alignment verification compares the transformed original viewer's 21 joints with the existing self hand profile; maximum residual < 0.000000000001 mm for both poses.

Coordinate convention for all copied/converted keyboard and hand assets: millimeters; wrist at origin; +X towards middle-finger MCP, Y across palm, +Z toward palm side. Keys are below the palm in +Z, with their top normal mostly -Z. A useful Three.js Y-up mapping is `(x,y,z) -> (y,-z,-x)` followed by one shared scale and translation. Do not separately recenter the hand scan, skeleton, key positions or keyboard case. Skin can fade from the open scan to expose the same-pose landmark rig; interpolate the rig to pressure pose before revealing the matching keyboard.
