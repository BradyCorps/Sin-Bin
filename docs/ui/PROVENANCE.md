# Asset provenance

| Asset | Method | Source/reference | Notes |
|---|---|---|---|
| `texture-painted-navy.webp` | Generated material source, then mechanically mirrored, downsampled, and converted to a seamless lossless WebP tile | User-approved SINBIN live-match target rendering | No text, character, symbol, or interface geometry included |
| `texture-surface-wear.webp` | Generated transparent wear source, then mechanically mirrored, downsampled, and converted to a seamless lossless WebP tile | User-approved SINBIN live-match target rendering | Intended only as a restrained optional overlay |
| `frame-bench-neutral-9slice.png` | Deterministically authored SVG geometry and raster export | Frame/material language traced from the target rendering | Source SVG included in `art-source/` |
| `frame-bench-selected-9slice.png` | Deterministically authored SVG geometry and raster export | Selected Violetta bench-card frame in the target rendering | Yellow denotes selection only |
| `energy-pip.svg` | Deterministically authored vector | Energy-meter language in the target rendering | Repeated programmatically; no baked values |
| `violetta-live-card-placeholder-v1.png` | Existing approved project asset; copied without modification | SINBIN Violetta character work | Runtime character placeholder |
| `live-match-reference-v1.jpg` | User-provided reference | Approved live-match target rendering | Reference/overlay only; never a runtime gameplay background |

## Traceability rule

Runtime text, numbers, labels, and game state are not embedded in raster assets. Every informational element remains data-driven and inspectable in code.
