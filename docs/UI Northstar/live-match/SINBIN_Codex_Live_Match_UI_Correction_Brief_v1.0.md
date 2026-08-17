# SINBIN Codex Live-Match UI Correction Brief v1.0

**Task type:** Visual-integration correction  
**Target:** Landscape smartphone live-match screen  
**Foundation viewport:** 844 × 390 logical px  
**Validation viewports:** 667 × 375, 844 × 390, and 915 × 412  
**Scope:** Presentation, layout, assets, and visual QA only. Preserve the deterministic engine and gameplay rules.

## 1. Why this correction pass exists

The current implementation is not an acceptable approximation of the approved live-match design. It has structural collisions, uses a different fixture, omits the approved character-art layer, and treats the screen as a generic debug dashboard.

This task is not another exploratory mockup. It is a visual-integration pass that must reproduce the approved composition closely enough to become the foundation for the remaining match states.

For this pass, this brief supersedes only the final sentence of Section 17 of `SINBIN_Live_Match_Mobile_UI_v0.1.md`, which deferred final illustration and texture. The behavioural rules and acceptance criteria in that document remain authoritative.

## 2. Required source files and authority order

Place these files together in the repository, for example under `docs/ui/live-match/`:

1. `SINBIN_Live_Match_Mobile_UI_v0.1.md`
2. `SINBIN_Live_Match_Mobile_UI_v0.1_wireframe.svg`
3. `SINBIN_Live_Match_Visual_North_Star_v0.2.png`
4. This correction brief

Use each source for a different purpose:

1. **Markdown = behaviour and information.** It governs gameplay truth, visible data, interaction states, hierarchy, responsive rules, and accessibility.
2. **SVG = geometry.** It governs the 844 × 390 composition, region coordinates, card equality, gaps, containment, and stacking.
3. **PNG = appearance.** It governs visual weight, materials, palette balance, character prominence, portrait treatment, typography character, and the 1970s/early-1980s alpine Canadiana/Nordic hockey atmosphere.
4. **Approved character bibles and assets = identity.** They override any incorrect face, hair, jersey number, uniform detail, or name accidentally rendered in the concept PNG.
5. **The deterministic engine = outcomes.** Do not alter mechanics or duplicate support logic in presentation code.

If two sources appear to conflict, apply the order above according to the subject in question. Do not treat the PNG as a literal source for fake scores, names, or generated text. Do not treat the wireframe's simple drawings as the appearance target.

## 3. Current implementation failures to correct

The supplied current screenshot shows these objective failures:

- The active-card content exceeds the active-line band and overlaps the bench.
- The causal-call chip is positioned against the wrong containing block and collides with the bench/card boundary.
- The disruption hint and countdown compete for the same horizontal space.
- The screen uses content-driven card heights inside a fixed-height composition.
- The active cards and bench use letter avatars instead of approved portraits.
- The displayed roster and values are not the canonical comparison fixture.
- Direct, Bridge, and Breaks Chain consequences are not all clearly visible in the selected-bench state.
- The flat placeholder treatment does not reproduce the approved enamel, printed-paper, navy-metal, brass, copper-red, rink-blue, or amber-display hierarchy.
- The current screenshot therefore cannot be accepted merely because the page builds or the controls work.

Treat these as layout-system failures, not as isolated margin tweaks.

## 4. Canonical comparison fixture

First implement and validate one deterministic fixture before touching the other 15 debug states:

- State: bench substitution preview
- Selected incoming skater: Violetta
- Recover destination: `DIRECT`
- Create destination: `BRIDGE`
- Finish destination: `BREAKS CHAIN`
- Disruption: `HIGH FORECHECK`
- Countdown: `3.4s`
- Pressure: `63`
- Chain: `×2.34`
- Threat: `41`
- Nyx uses the approved canonical model and jersey number `#8`

The fixture must be accessible through the existing debug-state mechanism or a stable local query/route. Do not hard-code these values into production components.

## 5. Foundation geometry at 844 × 390

The SVG is the coordinate authority. At the reference viewport, use these primary bounds with a tolerance of ±1 px:

| Region | X | Y | Width | Height |
|---|---:|---:|---:|---:|
| Top rail | 16 | 8 | 812 | 64 |
| Meter group | 16 | 78 | 484 | 44 |
| Disruption panel | 506 | 78 | 322 | 44 |
| Active line | 16 | 128 | 812 | 142 |
| Causal-call chip | 326 | 258 | 192 | 18 |
| Bench | 16 | 276 | 500 | 102 |
| Action deck | 522 | 276 | 306 | 102 |

Implementation requirements:

- Establish an explicit 844 × 390 logical stage before styling its children.
- Keep the seven primary regions out of normal content-driven vertical flow.
- Use fixed grid tracks or stage-relative positioning derived from the SVG.
- Every component must be clipped or internally laid out within its assigned region.
- Do not use `min-height`, wrapping, or intrinsic image size in a way that can enlarge a primary region.
- The three active cards must have identical outer width and height.
- The three bench cards must remain inside the bench region.
- The causal chip may tab over nonessential active-card art as specified, but it may not overlap the bench, names, Energy values, or destination outcomes.
- Use explicit `min-width: 0` and controlled text overflow in narrow flex/grid children.
- Preserve the composition as a single stage. Extra desktop space may letterbox or hold separate side panels; it must not reflow the live stage.
- Solve 844 × 390 first. Then add the compact 667 × 375 rules and large 915 × 412 rules from Section 11 without changing the topology.

## 6. Visual target

The result must read as a finished SINBIN match interface, not a developer dashboard.

Required visual characteristics:

- Warm cream enamel/printed-paper fields against a deep navy metal and dark-wood shell.
- Barn/copper red for SINBIN and threat; rink blue for supported play and Pressure; amber for the mechanical countdown/display language.
- Brass or aged-metal separators and restrained surface wear.
- Texture remains low contrast behind text and faces.
- Condensed late-1970s athletic display type, with highly legible condensed sans-serif labels and tabular/mechanical numbers.
- The active causal chain is the visual centre. The CRT remains secondary.
- Active-card portraits use consistent shoulder-to-waist crops, eye-line, and visual scale.
- Nyx and Violetta use their approved clean cel-shaded models. Other portraits must meet the same rendering standard.
- Gameplay overlays are standardized. No rarity stars, tier letters, differently prestigious outer frames, or prestige effects that resemble selection or consequence states.

Do not use letter circles, generic silhouette icons, debug borders, fake broadcast statistics, fictitious period/SOG data, or a player-facing resolve button.

## 7. Required implementation sequence

1. Read all four source files and locate the approved character assets before editing.
2. Inspect the current component tree and CSS. Identify which rules create the overflow and wrong stacking context.
3. Expose the canonical comparison fixture.
4. Rebuild the 844 × 390 region geometry without changing engine logic.
5. Capture an unstyled geometry screenshot and verify every primary bound.
6. Wire approved character portraits and deterministic crop/focal-position metadata. No letter avatars may remain in the canonical fixture.
7. Apply the PNG's material, palette, typography, and hierarchy.
8. Capture and compare the finished 844 × 390 screenshot against both the SVG and PNG.
9. Validate 667 × 375 and 915 × 412.
10. Only after the canonical fixture passes, propagate the component system to the remaining 15 required states.

Do not redesign the engine, invent new statistics, rename gameplay concepts, or broaden the task into unrelated screens.

## 8. Automated validation gates

Use a real browser and Playwright or the repository's existing equivalent. A successful build is not visual acceptance.

At all three validation viewports, assert:

- `document.documentElement.scrollWidth <= window.innerWidth`
- `document.documentElement.scrollHeight <= window.innerHeight`
- No body-level vertical or horizontal scrolling.
- Every primary region is fully inside the live stage.
- Primary regions do not intersect, except for the explicitly allowed causal-chip tab into nonessential active-card art.
- The causal chip does not intersect the bench region.
- Active-card outer bounds are equal within 1 px.
- Each visible text container has no unintended horizontal or vertical overflow.
- Every required portrait image is loaded with a nonzero `naturalWidth`.
- All three active cards, all three bench cards, both emergency actions, all meters, score, resolution, disruption, and countdown are visible.
- Critical controls remain at least 48 × 48 logical px.

Save screenshots for:

- `667x375/substitution-preview.png`
- `844x390/substitution-preview.png`
- `915x412/substitution-preview.png`

For the 844 × 390 image, also produce a side-by-side or opacity overlay with the SVG and a side-by-side comparison with the north-star PNG. Iterate until the structural mismatches and obvious art-direction mismatches are corrected.

Do not declare the task complete without returning the three screenshots and a short list of any remaining known deviations.

## 9. Repository-level `AGENTS.md` guardrail

Add the following section to the repository's root `AGENTS.md` (or to the closest applicable `AGENTS.md` for the live-match UI):

```md
## SINBIN live-match UI authorities

Before changing the live-match screen, read:

- `docs/ui/live-match/SINBIN_Live_Match_Mobile_UI_v0.1.md`
- `docs/ui/live-match/SINBIN_Live_Match_Mobile_UI_v0.1_wireframe.svg`
- `docs/ui/live-match/SINBIN_Live_Match_Visual_North_Star_v0.2.png`
- `docs/ui/live-match/SINBIN_Codex_Live_Match_UI_Correction_Brief_v1.0.md`

Authority is divided by subject: Markdown for behaviour/information, SVG for geometry, PNG for appearance, approved character assets/bibles for identity, and the engine for outcomes.

Never accept a live-match UI change based only on build/test success. Run browser validation at 667 × 375, 844 × 390, and 915 × 412; verify no scrolling or unintended intersections; and return screenshots for visual comparison. Preserve the deterministic engine unless the task explicitly changes gameplay.
```

Start a new Codex task after adding or changing `AGENTS.md` so the instruction chain is loaded at task start.

## 10. Paste-ready Codex task

```text
Correct the existing SINBIN live-match UI so it closely matches the approved design authorities in docs/ui/live-match/.

Read these completely before editing:
1. SINBIN_Live_Match_Mobile_UI_v0.1.md — behaviour and information authority.
2. SINBIN_Live_Match_Mobile_UI_v0.1_wireframe.svg — exact 844×390 geometry authority.
3. SINBIN_Live_Match_Visual_North_Star_v0.2.png — appearance and art-direction authority.
4. SINBIN_Codex_Live_Match_UI_Correction_Brief_v1.0.md — correction and validation contract.

This is a visual-integration correction, not another rough prototype. Preserve the deterministic engine and current gameplay rules. Begin with only the canonical Violetta substitution-preview fixture defined in the correction brief. Diagnose the current collisions, rebuild the region geometry from the SVG, wire the approved character assets, and then apply the north-star material and typography language.

Use a real browser to validate 667×375, 844×390, and 915×412. The task is not complete when it merely builds: verify no scrolling, no unintended intersections, equal active-card geometry, loaded portraits, and all required content visible. Return the three viewport screenshots and list any remaining deviations. Do not proceed to the other 15 states until the canonical 844×390 fixture is visually accepted.
```

