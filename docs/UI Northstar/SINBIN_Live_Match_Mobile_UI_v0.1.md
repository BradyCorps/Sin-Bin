# SINBIN Live Match Mobile UI v0.1

**Status:** Foundation specification  
**Date:** 2026-08-13  
**Primary platform:** Smartphone, landscape  
**Reference canvas:** 844 × 390 logical pixels  
**Minimum validation canvas:** 667 × 375 logical pixels  
**Large-phone validation canvas:** 915 × 412 logical pixels  
**Mechanic baseline:** experiment/live-shift-lab-3b, inspected 2026-08-13

## Prototype asset status

The character images and character-data files added with the first UI reference commit are examples and placeholders only. They are not production-ready assets or working application endpoints.

- Files under `docs/Characters/` are visual references for art direction and should not be loaded by the application.
- The duplicated JPG reference sheets under `public/assets/characters/` should be deleted before production integration. They are not optimized live-card assets.
- Create purpose-built, game-ready portrait crops in the approved final art style. Export transparent PNGs where the UI needs isolated character silhouettes; use an appropriately optimized web format when transparency is not required.
- Standardize each live portrait's crop, eye-line, silhouette, lighting, and resolution so mixed characters remain equally readable in active and bench cards.
- Optimize dimensions and file sizes for the actual responsive card slots, with only the required density variants shipped to the client.
- `data/characters/nyx.json` and `data/characters/violetta.json` are empty placeholders. Replace them with validated manifests before importing or exposing them as endpoints; until then, code must not depend on them.
- Nyx and the remaining roster art are incomplete. Do not treat Violetta's JPG references as the production style or mix them with unfinished placeholders in a release build.

The UI geometry and interaction states should be validated with temporary rectangles or neutral stand-ins before production portraits are integrated.

## 1. Purpose

This specification defines the live-match screen that will become the visual and interaction foundation for SINBIN.

The screen must preserve the proven live-rewire mechanic:

- Three active skaters in Recover, Create and Finish.
- Three visible bench skaters.
- Five- or eight-second automatic resolution windows.
- One mutually exclusive decision per window: substitute, Dump and Full Change, intentional penalty, or no action.
- Continuous Pressure decay.
- Pressure, Chain and Threat as immediately readable live state.
- Fatigue, supported handoffs, unsupported breaks, shorthanded survival and return triggers.
- Automatic resolution with no player-facing Resolve Now control.

The interface must make the next decision faster to understand without making it automatic.

## 2. Locked product decisions

1. Smartphone landscape is the design master. Desktop is an expanded responsive version of this screen.
2. A live match always fits in one viewport. There is no vertical or horizontal scrolling.
3. The three-player causal chain is the visual centre of the screen.
4. Character art follows the Nyx and Violetta construction standard: clean contours, controlled line weight, simplified hair masses and hard cel-shadow shapes.
5. The CRT is atmospheric and explanatory secondary feedback. No required gameplay information appears only on the CRT.
6. All critical interactions are tap-based. There is no hover dependency or required drag-and-drop.
7. The primary substitution flow is incoming-first: tap a bench skater, inspect the three destination consequences, then tap an active slot.
8. One accepted decision locks every other line action until the next resolution.
9. No fake broadcast statistics are shown. Period, shots on goal and match-clock treatments are excluded unless future mechanics make them real.
10. There are no innate character power tiers. Prestige editions may alter portrait art, inner trim, foil and presentation, but functional geometry and gameplay-state overlays remain standardized.

## 3. Current gameplay truths represented by the screen

| System | Current rule | Required live representation |
|---|---|---|
| Match length | 12 resolution windows, or first side to three goals | Resolution count and score |
| Cadence | Five or eight seconds per window | Large resolution countdown |
| Decisions | One substitution, Full Change, penalty or no action per window | Available/committed state |
| Pressure | Scores a goal at 100 and decays continuously | Numeric value and animated gauge |
| Threat | Scores against at 100 | Numeric value and animated gauge |
| Chain | Multiplier from ×1.00 to ×4.50 | Numeric multiplier, connection animation |
| Active line | Recover, Create, Finish | Three permanent role slots |
| Bench | Three ordered skaters who recover Energy | Three visible tappable cards |
| Supported change | Natural fit, incoming Bridge/Flex, or outgoing Handoff | Direct, Bridge or Break preview |
| Full Change | Surrenders Pressure, resets Chain, clears limited Threat and gives up the attempt | Permanent cost preview |
| SIN BIN | Selected active skater leaves for two resolutions and later triggers a return | Empty slot, remaining resolutions and return state |
| Match end | Win, tie or loss based on goals | Input lock and transition to diagnosis |

The live HUD must use the engine’s actual resolution count and cadence. The concept-art value 02:11 is not part of v0.1.

## 4. Reference-canvas layout

All measurements below use the 844 × 390 reference canvas.

### 4.1 Safe areas and grid

- Outer safe inset: 16 px left/right, 8 px top, 12 px bottom.
- Internal gap: 6–8 px.
- Base spacing unit: 4 px.
- Minimum interactive height: 48 px.
- Minimum interactive width: 48 px.
- No critical text or interaction may occupy a hardware safe-area inset.

### 4.2 Primary regions

| Region | X | Y | Width | Height | Purpose |
|---|---:|---:|---:|---:|---|
| Top rail | 16 | 8 | 812 | 64 | Score, resolution, opponent, CRT and pause |
| Meter group | 16 | 78 | 484 | 44 | Pressure, Chain and Threat |
| Disruption panel | 506 | 78 | 322 | 44 | Upcoming disruption, hint and countdown |
| Active line | 16 | 128 | 812 | 142 | Recover → Create → Finish |
| Causal call chip | 326 | 258 | 192 | 18 | Latest supported link, break or committed state |
| Bench | 16 | 276 | 500 | 102 | Three incoming choices |
| Action deck | 522 | 276 | 306 | 102 | Dump and Full Change; SIN BIN |

The companion SVG is the coordinate authority for v0.1.

## 5. Information hierarchy

The player’s attention should move in this order:

1. Upcoming disruption and time remaining.
2. Current active line and connection state.
3. Bench candidates and possible destination consequences.
4. Pressure, Chain, Threat and score.
5. Emergency actions.
6. CRT feedback and flavour.

The television must never become visually louder than the active line during a decision window.

## 6. Component specification

### 6.1 Top rail

The top rail contains five fixed components:

| Component | Content |
|---|---|
| SINBIN score | Team wordmark and goals for |
| Resolution module | Current window, total windows and cadence mode |
| Opponent score | Opponent sequence identity and goals against |
| CRT | Non-interactive hockey feedback |
| Pause | 48 px mechanical button |

Example state:

- SINBIN 1
- RESOLUTION 04 / 12
- THE VICE 0

The resolution countdown lives in the disruption panel, not in the top rail. The top rail should not present a fictitious period or shots-on-goal total.

### 6.2 Pressure

- Shows the label PRESSURE, integer value and 0–100 gauge.
- Gauge animates linearly with live decay.
- At 80+, the final fifth of the gauge gains a restrained pulse.
- At 100, the goal animation empties the gauge to its carried remainder.
- Pressure uses ice blue and cream. It must not use the same outer glow as a valid substitution target.

### 6.3 Chain

- Shows CHAIN and the exact multiplier, such as ×2.34.
- Chain is not represented as a false 0–100 percentage.
- A small three-link diagram mirrors Recover → Create → Finish.
- When Chain resets, the failed link breaks at the responsible connection.
- Chain growth uses a short directional light sweep, never a looping neon effect.

### 6.4 Threat

- Shows THREAT, integer value and 0–100 gauge.
- Threat uses copper red and orange.
- At 80+, the gauge uses a slow warning pulse plus a warning icon.
- At 100, the opponent scores, the gauge clears to its remainder and the exact cause appears in the causal call.

### 6.5 Disruption panel

Required fields:

- NEXT plus resolution number.
- Disruption name.
- One concise defensible-futures hint.
- Countdown in tenths of a second above one second and whole seconds below one second only if readability testing prefers it.

Example:

- NEXT 04
- HIGH FORECHECK
- Absorb it, outrun it, or spend Chain.
- 3.4s

Timing treatment:

- Above 2.0s: neutral cream/navy.
- 2.0s to 1.0s: amber edge pulse.
- Below 1.0s: copper-red countdown and one haptic warning, if enabled.
- At 0: resolve automatically. There is no resolve button.

### 6.6 Active cards

Each active card has the same outer geometry. From top to bottom:

1. Role label: RECOVER, CREATE or FINISH.
2. Shoulder-to-waist character crop.
3. Character name and jersey number.
4. Current Energy versus maximum Energy.
5. Temporary state badge.

Full R/C/F fit numbers and tag lists are excluded from the default live card. The consequence-preview system exposes the information needed for the current decision more quickly.

Card states:

| State | Visual treatment | Text/icon requirement |
|---|---|---|
| Neutral | Role trim, no outer glow | Role label |
| Valid direct fit | Solid ice-blue outer trace | DIRECT plus straight handoff icon |
| Valid bridge | Copper/ice interlocking trace | BRIDGE plus interlocking-link icon |
| Unsupported | Red broken outer trace | BREAKS CHAIN plus broken-link icon |
| Selected for penalty | Red latch treatment | OVERCHARGE preview |
| Low Energy | Amber diagonal energy hatch | LOW |
| Empty Energy | Red empty pips and subdued portrait | EMPTY |
| Shorthanded | Portrait removed; striped vacancy | Return countdown |
| Decision committed | All cards desaturate slightly | DECISION LOCKED |

Colour is never the sole differentiator.

### 6.7 Bench cards

The bench always shows three ordered skaters.

Each card contains:

- Portrait crop.
- Name or approved short form.
- Role icon.
- Current/max Energy.
- One small mechanical signature icon.

On selection:

- Card rises 2 px and receives a cream/yellow focus trace.
- All three active slots immediately show DIRECT, BRIDGE or BREAKS CHAIN.
- The disruption panel remains visible and unchanged.
- Tapping the selected bench card again cancels.
- Tapping another bench card changes the preview without committing.

### 6.8 Substitution interaction

Primary flow:

1. Tap a bench skater.
2. The active line previews the exact consequence in every destination.
3. Tap Recover, Create or Finish.
4. The engine accepts or rejects the action.
5. Only after acceptance does the visual substitution animate.
6. The causal call names the outgoing player, incoming player and result.
7. Every further line action locks until resolution.

An unsupported substitution does not require an additional confirmation. The two-step bench-plus-destination flow already represents deliberate intent.

If the timer expires between the two taps, selection clears and the resolution proceeds with no decision.

### 6.9 Dump and Full Change

- Large blue button in the lower-right action deck.
- One-tap commit.
- Permanent cost line: SURRENDER PRESSURE · RESET CHAIN · +REGROUP THREAT.
- Exact numerical cost may preview from state when reliable.
- Disabled immediately after any other decision.
- After commit, label changes to FULL CHANGE COMMITTED and the button displays the remaining countdown.
- No repeated press is accepted before the next resolution.

### 6.10 Intentional penalty

Primary flow:

1. Tap SIN BIN.
2. The button latches into penalty-selection mode.
3. Each eligible active card shows its state-scaled Pressure overcharge and TWO RES exposure.
4. Ineligible cards are visibly locked and name the reason.
5. Tap one active skater to commit.
6. The selected card moves into the SIN BIN treatment and the role slot becomes shorthanded.

Tapping SIN BIN again cancels penalty-selection mode. Selecting a bench skater cancels penalty-selection mode, and entering penalty-selection mode clears a bench preview.

While occupied:

- The SIN BIN button becomes a status module rather than an action.
- It shows the skater portrait, 2 or 1 resolutions remaining and FULL RETURN or HALVED RETURN.
- The empty active role remains visible in the causal chain.

### 6.11 Action commitment

After an accepted substitution, Full Change or penalty:

- Bench, active destinations and both action buttons reject further input.
- The causal call reads DECISION COMMITTED plus the selected action.
- The countdown continues.
- The player can still read the disruption, gauges, Energy and CRT.
- The interface unlocks only after the automatic resolution completes.

The UI must not visually acknowledge an action that the engine rejected at the resolution boundary.

### 6.12 Causal call

The 192 × 18 chip tabs out from the bottom of the centre active card and displays one short statement. It may cover nonessential portrait space or decorative card copy, but never name, role, Energy value or destination outcome.

Examples:

- VIOLETTA BRIDGES → NYX · CHAIN ×2.34
- UNSUPPORTED EXIT · CREATE → FINISH BROKE
- NYX TO SIN BIN · +18 PRESSURE · 2 RES
- FULL CHANGE COMMITTED
- HIGH FORECHECK FAILED · +34 THREAT

The chip is an immediate explanation, not a scrolling event log. Full diagnostics remain post-game.

### 6.13 CRT

The CRT:

- Is never interactive during the live window.
- Shows simplified hockey silhouettes, telestrator marks, reaction shots or a freeze-frame.
- Responds to success, goal, failure, Full Change, penalty and return.
- Does not contain unique numbers, instructions or required warnings.
- May run at a deliberately reduced animation rate while the UI itself remains responsive.

At the minimum viewport, the CRT may crop more tightly but may not force other components below the fold.

### 6.14 Pause and device interruption

- A visible pause button is required for a phone game.
- Pausing fully obscures or heavily blurs the tactical state so pause cannot function as an unlimited analysis view.
- Resume uses a 3–2–1 overlay before restoring the cadence.
- App backgrounding, orientation change, OS interruption and lost focus trigger the same obscured pause state.
- A match never advances while the app is not visible.

## 7. Interaction state model

| Current state | Allowed next action | Exit |
|---|---|---|
| Window open | Select bench, enter penalty mode, Full Change, or wait | Preview, committed or automatic resolve |
| Bench preview | Choose another bench card, cancel, or tap active destination | Window open or committed |
| Penalty preview | Cancel or tap eligible active skater | Window open or committed |
| Decision committed | No further gameplay input | Automatic resolve |
| Resolving | No gameplay input | Next window or match ended |
| Paused/obscured | Resume only | Countdown to prior state |
| Match ended | Diagnosis/replay navigation only | New screen |

## 8. Motion, sound and haptics

| Event | Motion target | Audio/haptic target |
|---|---:|---|
| Card selection | 90–120 ms | Light mechanical tick |
| Destination preview | 120 ms | No mandatory sound |
| Supported substitution | 180–220 ms | Soft double click |
| Chain bridge | 260–320 ms | Two-stage relay sound |
| Unsupported break | 220–280 ms | Dry snapped-link sound, warning haptic |
| Decision commit | 120 ms | Medium latch |
| Goal | Maximum 650 ms, non-blocking | Crowd rise and scoreboard clack |
| Penalty | 240–320 ms | Door slam and medium haptic |
| Return | 320–450 ms | Release latch and musical lift |

Rules:

- No animation may delay engine resolution.
- No animation may falsely imply that a rejected action succeeded.
- Reduced-motion mode replaces sweeps and movement with opacity, border and icon changes.
- Haptics and audio are optional reinforcement, never the only signal.

## 9. Visual language

### 9.1 Provisional palette

| Token | Value | Use |
|---|---|---|
| Warm cream | #EEE6D4 | Labels, enamel and readable foreground |
| Deep navy | #0C2638 | Primary shell |
| Ice blue | #79AFC1 | Pressure and supported state |
| Copper red | #A64732 | SINBIN identity and threat |
| Burnt orange | #D66B2C | Warning and period athletic accent |
| Signal yellow | #F2C84B | Current selection and timer warning |
| Danger red | #D64B42 | Break, empty Energy and goal-against risk |
| Spruce | #496B5C | Recover role trim |

Texture is restrained: enamel wear, printed ink and brushed hardware may appear at low contrast. Character faces and state information remain clean.

### 9.2 Typography

- Display: condensed late-1970s athletic face.
- UI labels: condensed sans-serif with high legibility.
- Timer and exact values: tabular or mechanical numeric face.
- Critical labels: minimum 12 logical px at the reference canvas.
- Secondary labels: minimum 11 logical px.
- No critical text uses script, distressed lettering or extreme italics.
- Names may shorten before font size falls below the minimum.

## 10. Character art and collectible editions

### 10.1 Live portrait standard

- Canonical master art remains independent from the UI crop.
- Live cards use consistent shoulder-to-waist framing and eye-line.
- Nyx and Violetta define line weight, eye construction, cel-shadow depth, hair massing and uniform material treatment.
- Other players may vary in face, body, gender expression and appeal but receive the same rendering quality.
- No rough realism portrait may appear beside a canonical cel-shaded player.

### 10.2 Prestige treatment

Prestige belongs to an edition, mastery or achievement, not to innate character strength.

Allowed live-match treatments:

- Inner foil sweep.
- Alternate portrait or uniform.
- Embossed inner trim.
- Small named-edition stamp.
- Intro stinger.

Not allowed:

- Different outer card dimensions.
- Star counts or S/A/B power labels.
- Cosmetic effects covering Energy, name, role or state.
- A prestige glow that can be mistaken for selection, direct fit, bridge, danger or penalty.

Functional state overlays always render above collectible treatments.

### 10.3 Physical-card compatibility

- The full collectible card master should be designed separately at a print-friendly portrait ratio.
- The live card uses a responsive crop of that master; it is not the final physical card layout.
- Character identity, edition name, uniform, portrait and signature icon should map cleanly to future printed cards.
- QR codes, serial numbering, physical-game rules and merchandise production are outside v0.1.

## 11. Responsive behaviour

### 11.1 Minimum landscape: 667 × 375

- Safe inset reduces to 12 px.
- Gaps reduce to 4 px.
- CRT crops more tightly.
- Bench uses approved short names.
- Secondary signature text becomes icons.
- Role labels, Energy, score, gauges, disruption and action labels remain.
- No component moves into a scroll region.

### 11.2 Reference landscape: 844 × 390

- Uses the coordinate specification in Section 4.
- Displays full names where they remain at least 12 px.
- Displays one-line disruption hint.

### 11.3 Large landscape: 915 × 412 and above

- Extra space increases portrait breathing room and card padding.
- It does not introduce new live statistics.
- The three active cards remain equal width.

### 11.4 Desktop

- The 844 × 390 live stage remains compositionally intact.
- Additional width may expose event history, diagnostics or spectator presentation in side panels.
- Desktop does not become the master layout.

### 11.5 Portrait orientation

- A match does not begin in portrait.
- Portrait shows an illustrated rotate-device gate.
- Rotating during a match triggers obscured pause and a 3–2–1 resume.

## 12. Accessibility

- All information encoded by colour also uses an icon, pattern or text.
- Minimum touch targets are 48 × 48 logical px.
- Visible focus treatment supports keyboard/controller testing.
- Touch uses manipulation behaviour and prevents accidental text selection.
- Reduced motion, haptic off and independent audio sliders are required.
- Timer warning does not depend on sound.
- Critical state text remains readable over every prestige edition.
- Left-handed mirrored lower controls should be supported by the layout architecture, even if delivered after v0.1.
- Screen-reader labels name player, role, Energy, eligibility and predicted consequence.

## 13. Implementation guidance

- Keep engine outcome logic authoritative. The UI previews direct fit, bridge and unsupported results using the same rule function as resolution.
- Do not duplicate support logic in presentation code.
- The incoming-first flow will require a local selected-bench state or an engine-supported pending selection before invoking the existing slot-selection/substitution actions.
- Input remains enabled until the engine accepts a decision or the timer resolves.
- A boundary-race action is shown as committed only after the returned game state confirms it.
- The stage should use dynamic viewport units and hardware safe-area environment variables.
- Disable body scrolling and overscroll during a match.
- Preserve deterministic replay; animation randomness must never affect the game seed.
- Character editions are presentation metadata and never modify engine values.

## 14. Required prototype states

The first interactive implementation must expose a debug switch or reproducible fixture for:

1. Normal window, no selection.
2. Bench skater selected with direct, bridge and unsupported destinations.
3. Decision committed.
4. Pressure and Threat above 80.
5. Active skater at low Energy.
6. Active skater at zero Energy.
7. SIN BIN selection preview.
8. One shorthanded slot with two resolutions remaining.
9. One shorthanded slot with one resolution remaining and halved return.
10. Successful bridge.
11. Unsupported chain break.
12. Goal for.
13. Goal against.
14. Match ended with all gameplay inputs rejected.
15. Pause, rotate and resume.
16. Standard and prestige-edition cards under identical gameplay state.

## 15. Acceptance criteria

The v0.1 live-match UI passes when:

- All three active cards, all three bench cards, both emergency actions, all gauges, score, resolution count, disruption and countdown are visible at 667 × 375 without scrolling.
- A learned player can execute a substitution in two taps.
- Every destination preview agrees with the engine’s supported/bridge/unsupported outcome.
- The screen clearly distinguishes five-second and eight-second cadence conditions.
- One accepted action visibly locks every other action until resolution.
- No player-facing control can resolve early or extend the decision window.
- The SIN BIN vacancy, remaining resolutions and return condition remain understandable without opening another panel.
- Pressure, Chain and Threat can be differentiated without relying on colour.
- The last causal outcome is understandable within 500 ms of resolution.
- Prestige treatments never obscure or imitate gameplay state.
- The screen contains no period, SOG or other decorative statistic unsupported by the engine.
- Backgrounding, rotating or pausing cannot let the unseen game continue.
- Inputs are rejected after the match ends.

## 16. Deferred decisions

These do not block v0.1:

- Final licensed typefaces.
- Final opponent crest system.
- Exact CRT animation-production method.
- Final sound library and musical treatment.
- Whether left-handed mirrored controls ship in the first public build.
- Final physical-card dimensions and print vendor requirements.
- Collection screen, card reveal ceremony and merchandise ordering.

## 17. Next deliverable

Build a non-production interaction prototype from this specification using the existing deterministic engine. Validate the 16 required states at 667 × 375, 844 × 390 and 915 × 412 before applying final illustration, texture or prestige effects.
