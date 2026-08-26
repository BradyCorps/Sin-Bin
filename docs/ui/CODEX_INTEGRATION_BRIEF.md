# SINBIN UI Skin Pack v0.1 — Codex Integration Brief

## Objective

Integrate the asset pack into the isolated `BenchCard` Storybook story and reproduce the selected Violetta bench card from `live-match-reference-v1.jpg`. This is a proof component for the material and frame system. Do not redesign the complete live-match screen in this pass.

## Locked constraints

- Preserve the deterministic engine and all existing gameplay behaviour.
- Keep the 844×390 logical stage and existing scaler unchanged.
- Keep all labels, numbers, Energy values, and state text as accessible HTML.
- The selected yellow frame means **current interaction selection only**. It must never imply rarity, tier, power, or collectible prestige.
- Use the supplied Violetta transparent PNG directly. Do not replace it, redraw it, convert it to initials, or use a silhouette.
- Do not add a predesigned component library.

## Required implementation

1. Copy the supplied runtime files into their matching `public/` paths.
2. Add a reusable `NineSliceFrame` presentation component supporting:
   - `src`
   - `slice`
   - `borderWidth`
   - `selected`
   - `children`
3. Apply the frame using:

   ```css
   border: 8px solid transparent;
   border-image-source: url('/assets/ui/live-match/frames/frame-bench-selected-9slice.png');
   border-image-slice: 48;
   border-image-width: 8px;
   border-image-repeat: stretch;
   ```

4. Keep material layers separate from content:
   - base navy token
   - `texture-painted-navy.webp` on a pseudo-element at the manifest opacity
   - portrait
   - restrained `texture-surface-wear.webp` overlay
   - labels and Energy
   - nine-slice frame above all non-interactive surface layers
5. Inline `energy-pip.svg` as a repeated component. Use eight active pips for the canonical Violetta fixture. Inactive pips reuse the same SVG at reduced opacity.
6. Preserve a clear face-safe area. Labels and meters must not cover Violetta's eyes or face.
7. Keep the card's critical name and Energy value high-contrast cream and on one line.

## Storybook proof

Create or update an isolated story named:

`LiveMatch/Components/BenchCard — Selected Violetta Skin v0.1`

The story should expose only useful display controls:

- selected
- currentEnergy
- maximumEnergy
- playerName
- rolePrimary
- roleSecondary

Do not expose material construction as product-facing controls.

## Reference comparison

Use `live-match-reference-v1.jpg` only as a temporary alignment/reference overlay. Do not ship it as a gameplay background.

Return:

1. A Storybook screenshot of the isolated selected Violetta card.
2. A list of files added or changed.
3. Any browser warnings, accessibility findings, or asset-load failures.

Do not expand the skin to active cards, the scoreboard, CRT, or action buttons until this proof component is approved.
