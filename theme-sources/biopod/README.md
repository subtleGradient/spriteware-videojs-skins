# BIOPOD registered artwork theme

Ultraviolet glass, silver ribs, coiled tubing, a sculptural chrome horn and a deliberately oversized play control. Theme C preserves the original concept's visual hierarchy with a separate pause control.

This package contains **art and geometry only**. It plugs into the same shared Video.js engine as NEBULA POP. There is no copied player implementation.

## Integrate

- Copy `src/themes/biopod.js` into the shared engine's theme directory and add it to the theme registry.
- Copy `public/themes/biopod/` into the shared public assets.
- Use `theme.filename` (`bio_rhythm.mov`) for the title readout instead of a hardcoded B filename.
- All geometry is in the canonical 1086 × 1448 coordinate system. Controls may have expanded `hit` boxes while retaining exact patch `box` coordinates.

## Artwork contract

`frame.png` is the canonical full image. It contains the normal button faces and **no slider thumbs**. Video aperture and outer perimeter have actual alpha transparency. The five transport controls retain distinct sizes; the play patch is 184 × 150 pixels versus 109 × 109 for pause.

Five independently generated full image states supply normal, hover, pressed, focus and disabled face patches. `scripts/export.py` clips all state changes to the same fixed face masks. It then reconstructs each registered image using the exported patches and asserts exact pixel equality. No generated geometry change outside the face masks can leak into the runtime. Control-face opacity is normalized to avoid alpha double-compositing differences. Chrome rims remain canonical, not regenerated at interaction time.

The seek diamond and volume bead are separately generated original-C style assets with all five states, aspect-ratio-preserving sizing and no baked rail thumb. Pill labels remain native text for accessibility/localization, matching the shared theme contract.

## Verify

Run `python scripts/export.py` (Pillow and NumPy). The script checks alpha, exact patch compositing and zero changed pixels outside permitted face masks. `proof/control-states-contact.png` is an inspected 1× contact sheet; `proof/static-mobile390.png` checks proportional composition at 390px. These are compositing proofs, not a claim of physical Safari testing. Shared-engine browser review remains necessary before publishing.

## License and provenance

Apache-2.0, consistent with the Video.js Skins Design Challenge. The owner-provided original A/B/C design board is the visual reference. OpenAI image generation regenerated C as a canonical transparent full frame and separately generated material-state versions. Prompts required faithful original C silhouette, large-play hierarchy, baked transport glyphs, blank caption/fullscreen pills, empty rails, fixed registration and true alpha. Four follow-up state prompts changed only button faces to bright magenta hover, recessed dark pressed, cyan inner-ring focus and gray-lavender disabled. Generated full-resolution sources and exact masks are retained in `artwork/` and `proof/`.
