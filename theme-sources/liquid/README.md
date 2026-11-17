# LIQUID ORBIT: registered theme

Electric-aqua glass and liquid chrome form a tiny spacecraft for video. The dominant Play jewel, separate Pause, swept fins and two side-mounted utility controls preserve concept A's distinctive layout.

This directory contains **artwork and a geometry manifest only**. It does not contain or fork the player engine.

## Integration

- Copy `src/themes/liquid.js` into the shared engine's themes.
- Copy `public/themes/liquid/` unchanged into the shared public directory.
- Register `liquid` alongside `nebula` in the existing engine selector.
- Display `theme.filename` (`cosmic_drift.avi`) instead of the engine's currently hardcoded `nebula_pop.mpg`.
- No additional CSS is needed for this theme. Do not use CSS sizing to reinterpret patch dimensions.
- Leave `text` absent: glyphs are already in the artwork. Accessible names remain in the manifest.

`frame.png` is the canonical 1086×1448 full image. Every control patch uses the exact same native coordinate rectangle as its canonical face. The video aperture is transparent, as is the exterior. Empty seek/volume tracks prevent ghost thumbs. Separate jewel images move over them.

## Evidence

`proof/static-mobile390.png` and `static-mobile320.png` show literal compositing with demonstration video imagery, not browser screenshots. `normal-registered.png`, `hover-registered.png`, `pressed-registered.png`, `focus-registered.png`, and `disabled-registered.png` show native-coordinate state substitution.

`proof/registration-report.json` verifies alpha=0 in aperture/exterior, an exactly identical normal recomposition, and **zero changed pixels outside approved control regions** in all state composites. `npm test` verifies every PNG dimension against the manifest, non-overlapping hitboxes, alpha/registration evidence and dominant Play hierarchy. It is not an iOS runtime test.

Regenerate the deterministic exports with `python scripts/export.py` (Pillow required). The runtime output is 51 PNG files: one frame, 40 control patches, 10 jewel states. Source artwork and proof files need not be downloaded at runtime.

## License

Apache-2.0. See LICENSE and NOTICE.md.
