# SINBIN repository instructions

## Purpose

This repository contains mechanical prototypes for SINBIN. The current design work is testing whether live hockey line changes can support a durable strategy game.

The defining player action is:

> Rewire your line in real time to keep the scoring play alive.

The design north star is:

> If the game is not compulsively fun with coloured rectangles and text labels, art and content will not save it.

Read `docs/DESIGN_NORTH_STAR.md` before changing gameplay. Record every completed mechanical test in `docs/EXPERIMENT_LOG.md`.

## Branch boundaries

- `control/live-shift-lab-v1` is the immutable control that passed the first rectangle test.
- `experiment/live-shift-lab-2a` is the active depth experiment.
- Never commit to, force-push, rewrite, or merge changes back into the control branch.
- Do not change `main` unless the user explicitly requests it.
- Start later experiments from the control or from an explicitly selected successful experiment; do not silently treat the newest branch as the new baseline.
- Keep experimental branches narrow enough that a change in player response can be attributed to a specific hypothesis.

## Protected control contract

Treat these as control conditions, not incidental implementation details:

- A run lasts approximately one minute.
- The live state resolves approximately every five seconds.
- Three skaters are active and the bench remains visible.
- The clock continues while the player thinks.
- A live change replaces one skater at a time.
- Substitutions immediately alter a visible causal chain.
- Fatigue makes preserving a strong combination increasingly dangerous.
- Dump and change is the safe reset, with an explicit cost to Pressure and Chain.
- An intentional penalty provides immediate overcharge, creates a temporary shorthanded disadvantage, and produces a return trigger.
- Replay restores the same roster and disruption sequence so alternate decisions can be compared.
- Failure explains what broke the play.

A deliberate experiment may change one of these conditions, but the change must be named in the experiment log. Do not alter one as collateral damage from a refactor.

## Live Shift Lab 2A scope

The current experiment may add:

- Two mechanically distinct starting rosters:
  - **Relay:** frequent substitutions, possession bridges, and stable pressure.
  - **Overload:** explosive combinations, dangerous fatigue, and carefully timed removals or returns.
- Several reproducible opponent disruption sequences.
- A run diagnosis showing substitutions, successful relays, chain breaks, fatigue failures, intentional penalties, shorthanded survival, and the stated cause of each lost play.
- A controlled cadence comparison between the five-second control and a slower condition, such as eight seconds.

Do not add during 2A:

- Campaign progression or a multi-game run.
- Drafting, recruits, shops, currency, or permanent upgrades.
- Unlocks, rarity, cosmetics, character art, or monetization.
- Houses, a large trait library, or additional management screens.
- The old intermission coaching loop.
- Visual polish intended to compensate for an unclear mechanic.

## Gameplay requirements

- Opponent disruptions must create competing responses, not one labelled counter.
- A substitution should change the future state of the machine, not merely cancel the current threat.
- Different rosters must produce different substitution rhythms and priorities, not only different scores.
- A lower-rated specialist must sometimes be the correct choice over a stronger generalist.
- Leaving a tired skater active must occasionally be a rational, voluntary danger.
- Sending a skater to the SIN BIN must depend on the current machine state; it must not become an ability used automatically whenever available.
- Every trigger, multiplier, break, and return must agree with the explanation shown to the player.
- Keep skater identities readable at a glance. Complexity should come from interaction among short effects.

## Engineering expectations

- Preserve deterministic replay for fixed rosters and disruption sequences.
- Keep gameplay state and rule resolution separable from presentation and timer code where practical.
- Clear timers and listeners correctly on restart, replay, and unmount.
- Instrument decisions without changing their outcomes.
- Prefer the smallest implementation that tests the stated hypothesis.
- Run repository-defined tests and the production build after gameplay changes. Run lint when a lint script exists.
- Do not commit generated build output, local environment files, credentials, or dependency directories.

## Code Review Rules

### Protect the experiment

Flag any change that modifies the control branch, makes replay non-deterministic, or introduces systems outside the 2A scope.

### Preserve causal trust

Flag any displayed trigger, failure reason, fatigue value, Pressure value, Chain value, penalty duration, or return effect that can disagree with the rule engine.

### Reject shallow counter matching

Flag disruptions with only one practical answer, dominant policies that always replace the most-fatigued skater, and roster differences that reduce to numeric strength.

### Protect the live loop

Flag timer duplication, stale state, input accepted after a run ends, replay conditions that differ from the original run, or changes that pause the decision clock unintentionally.
