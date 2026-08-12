# Live Shift experiment log

This file records what each mechanical prototype was intended to test, what remained controlled, what happened, and what decision followed. Add results here before treating an experimental branch as a new baseline.

## Experiment index

| ID | Branch | Question | Status | Decision |
|---|---|---|---|---|
| LSL-1 | `control/live-shift-lab-v1` | Is rewiring a hockey line while its scoring play remains alive inherently fun? | Completed internally | Passed as the immutable control |
| LSL-2A | `experiment/live-shift-lab-2a` | Does the hook support different machines, planning, and repeatable depth? | Ready to implement | Pending |

---

## LSL-1 — Live Shift Lab control

**Date:** 2026-08-12  
**Commit:** [`11bc77d`](https://github.com/BradyCorps/Sin-Bin/commit/11bc77dadc19bf319b96632464e4e29935eb6fd7)  
**Playable checkpoint:** [SINBIN Live Shift Lab](https://sinbin-live-shift-lab.m1asmic.chatgpt.site)

### Hypothesis

> Rewiring a hockey line in real time while trying to preserve a scoring chain is inherently fun without art, progression, or presentation polish.

### Test conditions

- Approximately one-minute run.
- Approximately five seconds between live resolutions.
- Three active skaters and six visible bench skaters.
- Clock continues while the player decides.
- One-skater live substitutions.
- Pressure, Chain, fatigue, and opponent disruption are visible.
- Dump and change provides a safe reset with a cost.
- An intentional penalty provides immediate overcharge, two exposed shorthanded shifts, and a return trigger.
- Replay restores the same roster and disruption sequence.
- Rectangles and text only; no character art, campaign, drafting, collection, or economy.

### Observed result

The creator-player described the prototype as:

- Short.
- Quick.
- Fun with rectangles.
- Physically tense enough to make their hands sweat.

The mechanic created distinguishable clean and broken relays, roster-dependent responses, and an immediate sacrifice → disadvantage → return arc through the SIN BIN.

### Interpretation

The internal hypothesis passed:

> Live rewiring is fun for the intended creator-player and deserves to become SINBIN's core interaction.

The result does **not** establish broad appeal, long-term depth, non-hockey accessibility, or whether the excitement comes mainly from countdown stress.

### Decision

- Preserve LSL-1 unchanged as the control.
- Rebuild later SINBIN systems around the live-rewire action rather than adding it to the old automatic match-resolution loop.
- Test depth before progression, content, or visual polish.

---

## LSL-2A — Two different machines

**Branch:** `experiment/live-shift-lab-2a`  
**Status:** Ready to implement

### Primary question

> Does live rewiring remain compelling when the player operates two mechanically different rosters, and does it reward planning rather than only rapid counter-matching?

### Roster conditions

| Roster | Intended rhythm | Intended player thought |
|---|---|---|
| Relay | Frequent substitutions, possession bridges, stable Pressure | “I can keep rotating if I connect the pieces correctly.” |
| Overload | Explosive combinations, dangerous fatigue, difficult removals and timed returns | “I cannot afford to remove her yet, but leaving her out could collapse everything.” |

The rosters must differ through interactions and decision patterns, not only ratings or multipliers.

### Independent variables

- Starting roster: Relay or Overload.
- Opponent disruption sequence: several fixed, reproducible sequences.
- Resolution cadence: five-second control and a slower condition such as eight seconds.

### Controlled variables

Unless explicitly revised in this log:

- Approximately one-minute total run length.
- Three active skaters.
- Visible bench.
- One-player live changes.
- Continuous decision clock.
- Pressure and Chain model.
- Fatigue risk.
- Dump-and-change release valve.
- Intentional-penalty structure.
- Immediate causal explanations.
- Identical replay conditions.
- Rectangle-only presentation.

### Minimum instrumentation

Record enough local run data to diagnose behaviour without influencing outcomes:

- Roster, disruption seed, and cadence.
- Run result and final Pressure or score.
- Every substitution, including outgoing and incoming skater, time, fatigue, and Chain before/after.
- Successful possession bridges.
- Chain breaks and their stated causes.
- Fatigue failures.
- Dumps and the value surrendered.
- Intentional penalties, shorthanded survival, and return triggers.
- Time between a disruption preview and the player's next action.
- Replay count for the same condition.

A concise post-run diagnosis should expose patterns; it should not assign a generic grade.

### Behavioural pass signals

- The player voluntarily replays a condition.
- Relay and Overload produce visibly different substitution patterns.
- The player leaves a tired skater active for a specific chain-related reason.
- The player can explain why a play failed and name an alternative.
- A weaker specialist is preferred over a stronger generalist in some states.
- The player plans at least two changes ahead.
- Multiple answers to a disruption are viable but lead to different futures.
- The slower cadence still produces meaningful choices.

### Failure or redesign signals

- Always replacing the most-fatigued skater is close to optimal.
- Each disruption maps to one obvious counter.
- Bench order barely matters.
- Roster choice changes totals but not decisions.
- The player watches Pressure more than the trigger chain.
- Intentional penalties are used whenever available.
- Explanations prescribe the answer instead of clarifying the failure.
- Added diagnostics interrupt the live rhythm.
- The interaction becomes generic combo continuation rather than live line management.

### Cadence interpretation

- If both five- and eight-second conditions work, strategic thought is carrying part of the experience.
- If five seconds works and eight seconds feels empty, the current hook may be primarily reflex-driven.
- If eight seconds improves planning but reduces physical tension, later modes may support different paces.
- Cadence results should classify the game before they are used to rebalance it.

### Decision gate

Do not add recruitment or a miniature campaign until:

1. Both rosters are independently enjoyable.
2. Their substitution patterns are materially different.
3. Failures remain legible.
4. At least one disruption has multiple defensible responses.
5. Replay remains attractive after the initial novelty.

---

## Next experiment, if 2A passes

**Provisional ID:** LSL-3  
**Question:** Does one face-up recruit between games create a natural “I need that missing skater” collection motive?

Planned shape:

1. Play a 45–60 second game.
2. Choose one of three visible recruits.
3. Release or reposition one skater.
4. Set bench order.
5. Face a different opponent pattern.
6. Repeat for three games.

Exclude currency, shops, permanent stat upgrades, randomized paid acquisition, and win-gated access to recovery.

---

## Result-entry template

Copy this section for every completed experiment.

### [ID] — [Name]

**Date:**  
**Branch:**  
**Commit:**  
**Build or playable URL:**  

**Question:**  

**Hypothesis:**  

**Changed variables:**  

**Controlled variables:**  

**Testers and context:**  

**Observed behaviour:**  

**Quantitative diagnostics:**  

**What surprised us:**  

**Failure modes:**  

**Interpretation:**  

**Decision:** Keep / revise / reject / needs more evidence  

**Next test:**  
