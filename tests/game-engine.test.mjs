import assert from "node:assert/strict";
import test from "node:test";
import {
  CADENCES, PENALTY_RESOLUTIONS, PLAYERS, RECRUIT_OFFERS, SEQUENCES,
  advanceClock, createGame, diagnosis, diagnosisSummary, dumpAndChange, getDisruption,
  getSubstitutionPreview, initialLineup, moveBenchSkater, recruitIntoLineup, resolve, selectSlot,
  startGame, substitute, takePenalty,
} from "../app/game-engine.mjs";

function running(conditions) { return startGame(createGame(conditions)); }

test("substitution previews use the same direct, bridge and break rules as resolution", () => {
  const state = running({ roster: "overload" });
  assert.equal(getSubstitutionPreview(state, 0, 0).kind, "direct");
  assert.equal(getSubstitutionPreview(state, 1, 1).kind, "bridge");
  assert.equal(getSubstitutionPreview(state, 2, 1).kind, "break");
  assert.equal(getSubstitutionPreview(state, 0, 3), null);
});

test("identical conditions and decisions replay deterministically", () => {
  function play() {
    let state = running({ roster: "relay", sequence: "static", cadence: "slow", seed: 19 });
    state = selectSlot(state, 0); state = substitute(state, 0); state = resolve(state);
    state = selectSlot(state, 1); state = takePenalty(state);
    while (state.phase === "running") state = resolve(state);
    return state;
  }
  assert.deepEqual(play(), play());
});

test("fresh games reset clock, state and instrumentation cleanly", () => {
  let state = running({ roster: "relay", sequence: "vice", cadence: "control" });
  state = advanceClock(state, 1400); state = selectSlot(state, 0); state = substitute(state, 0); state = resolve(state);
  const reset = createGame(state.conditions);
  assert.equal(reset.phase, "ready"); assert.equal(reset.clockMs, CADENCES.control); assert.equal(reset.resolution, 0);
  assert.equal(reset.stats.substitutions, 0); assert.equal(reset.events.length, 0); assert.equal(reset.selectedSlot, null);
});

test("Relay bridges grow Chain while Overload charged entries create burst Pressure", () => {
  let relay = running({ roster: "relay" }); relay = selectSlot(relay, 0); relay = substitute(relay, 0);
  let overload = running({ roster: "overload" }); overload = selectSlot(overload, 0); overload = substitute(overload, 1);
  assert.ok(relay.chain > overload.chain, `${relay.chain} should exceed ${overload.chain}`);
  assert.ok(overload.events.some((event) => event.type === "overload"));
  assert.ok(relay.events.some((event) => event.type === "bridge"));
});

test("penalty lasts exactly two resolutions and return trigger agrees with state", () => {
  let state = running({ roster: "relay", sequence: "vice" }); state = selectSlot(state, 0); state = takePenalty(state);
  const pressureAfterPenalty = state.pressure; assert.equal(state.sinBin.remaining, PENALTY_RESOLUTIONS); assert.equal(state.active[0], null);
  state = resolve(state); assert.equal(state.sinBin.remaining, 1); assert.equal(state.active[0], null);
  state = resolve(state); assert.equal(state.sinBin, null); assert.equal(state.active[0], "vale"); assert.equal(state.stats.returns, 1);
  const returned = state.events.findLast((event) => event.type === "return"); assert.equal(returned.survived, true); assert.match(returned.text, /exactly 2 resolutions/);
  assert.ok(state.pressure !== pressureAfterPenalty);
});

test("displayed failure cause is the resolved disruption outcome", () => {
  let state = running({ roster: "overload", sequence: "static" });
  state.chain = 1; const expected = getDisruption(state).fail; state = resolve(state);
  const failure = state.events.find((event) => event.type === "failure"); assert.equal(failure.cause, expected); assert.match(failure.text, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  state.phase = "ended"; state.outcome = { won: false, explanation: failure.text }; assert.ok(diagnosis(state).at(-1).includes(expected));
});

test("all gameplay inputs are rejected after a run ends", () => {
  const ended = running({ roster: "relay" }); ended.phase = "ended";
  assert.equal(selectSlot(ended, 0), ended); assert.equal(substitute(ended, 0), ended); assert.equal(takePenalty(ended), ended);
  assert.equal(resolve(ended), ended); assert.equal(advanceClock(ended, 9999), ended);
});

test("recruitment replaces exactly one skater and persists into a clean next game", () => {
  const original = initialLineup("relay");
  const recruited = recruitIntoLineup(original, "inez", "ada");
  assert.deepEqual(original, { active: ["vale", "marlow", "vera"], bench: ["inez", "kestrel", "june"] });
  assert.deepEqual(recruited, { active: ["vale", "marlow", "vera"], bench: ["ada", "kestrel", "june"] });
  const nextGame = createGame({ roster: "relay", sequence: "chase", cadence: "control", seed: 4, lineup: recruited });
  assert.deepEqual(nextGame.bench, recruited.bench); assert.equal(nextGame.energy.ada, 6); assert.equal(nextGame.resolution, 0);
});

test("bench ordering is explicit, deterministic and boundary safe", () => {
  const lineup = initialLineup("overload");
  assert.equal(moveBenchSkater(lineup, 0, -1), lineup);
  const moved = moveBenchSkater(lineup, 2, -1);
  assert.deepEqual(moved.bench, ["halley", "orla", "nyx"]);
  assert.deepEqual(lineup.bench, ["halley", "nyx", "orla"]);
});

test("tied goals resolve as a tie without a hidden Pressure tiebreaker", () => {
  let state = running({ roster: "relay", sequence: "vice" });
  state.resolution = 11; state.goalsFor = 1; state.goalsAgainst = 1; state.pressure = 40; state.threat = 3;
  state = resolve(state);
  assert.equal(state.goalsFor, 1); assert.equal(state.goalsAgainst, 1);
  assert.equal(state.outcome.result, "tie"); assert.equal(state.outcome.won, false);
});

test("recruit impact counts live entry and resolutions actually played", () => {
  const lineup = recruitIntoLineup(initialLineup("relay"), "inez", "ada");
  let state = running({ roster: "relay", sequence: "vice", lineup, recruitId: "ada" });
  state = selectSlot(state, 0); state = substitute(state, 0);
  assert.equal(state.stats.recruitEntries, 1);
  state = resolve(state);
  assert.equal(state.stats.recruitResolutions, 1);
  assert.ok(diagnosis(state).some((line) => line.includes("ADA: started on bench; 1 live substitution entries; 1 resolutions played")));
});

test("diagnosis separates disruption, substitution and fatigue failures", () => {
  const state = running({ roster: "relay", sequence: "vice" });
  state.events.push(
    { type: "failure", text: "Disruption failed." },
    { type: "chain-break", text: "Substitution broke." },
    { type: "fatigue", text: "Skater was gassed." },
  );
  const lines = diagnosis(state);
  assert.ok(lines.some((line) => /1 disruption failures; 1 unsupported substitution breaks; 1 fatigue failures/.test(line)));
  assert.ok(lines.some((line) => line.startsWith("Last broken link:")));
});

test("recruit diagnosis distinguishes starting on ice from a live entry", () => {
  const lineup = recruitIntoLineup(initialLineup("overload"), "rook", "ada");
  let state = running({ roster: "overload", sequence: "chase", lineup, recruitId: "ada" });
  state = resolve(state);
  assert.equal(state.stats.recruitEntries, 0); assert.equal(state.stats.recruitResolutions, 1);
  assert.ok(diagnosis(state).some((line) => line.includes("ADA: started on ice; 0 live substitution entries; 1 resolutions played")));
});

test("Full Change preserves six unique skaters across recruit and release combinations", () => {
  for (const roster of ["relay", "overload"]) {
    const original = initialLineup(roster);
    for (const recruit of RECRUIT_OFFERS.flat()) {
      for (const released of [...original.active, ...original.bench]) {
        const lineup = recruitIntoLineup(original, released, recruit);
        const changed = dumpAndChange(running({ roster, sequence: "vice", lineup }));
        const ids = [...changed.active.filter(Boolean), ...changed.bench];
        assert.equal(changed.active.filter(Boolean).length, 3, `${roster}/${recruit}/${released} active count`);
        assert.equal(changed.bench.length, 3, `${roster}/${recruit}/${released} bench count`);
        assert.equal(new Set(ids).size, 6, `${roster}/${recruit}/${released} unique count`);
      }
    }
  }
});

test("Full Change is limited to once per resolution", () => {
  const state = running({ roster: "relay", sequence: "vice" });
  const changed = dumpAndChange(state);
  assert.equal(dumpAndChange(changed), changed);
  const afterResolution = resolve(changed);
  assert.notEqual(dumpAndChange(afterResolution), afterResolution);
});

test("one mutually exclusive line decision is accepted per resolution window", () => {
  const initial = running({ roster: "relay", sequence: "vice" });
  let substituted = selectSlot(initial, 0); substituted = substitute(substituted, 0);
  const snapshot = structuredClone(substituted);
  assert.equal(substituted.windowDecision, "substitution");
  assert.equal(substitute(selectSlot(substituted, 1), 1), substituted);
  assert.equal(dumpAndChange(substituted), substituted);
  assert.equal(takePenalty(selectSlot(substituted, 1)), substituted);
  assert.deepEqual(substituted, snapshot);

  let dumped = dumpAndChange(initial);
  assert.equal(dumped.windowDecision, "dump");
  assert.equal(substitute(selectSlot(dumped, 0), 0), dumped);
  assert.equal(takePenalty(selectSlot(dumped, 0)), dumped);

  let penalized = selectSlot(initial, 0); penalized = takePenalty(penalized);
  assert.equal(penalized.windowDecision, "penalty");
  assert.equal(dumpAndChange(penalized), penalized);
  assert.equal(substitute(selectSlot(penalized, 1), 0), penalized);

  const reopened = resolve(substituted);
  assert.equal(reopened.windowDecision, null);
  assert.notEqual(substitute(selectSlot(reopened, 0), 0), reopened);
});

test("repeated clicks cannot farm Pressure or Chain", () => {
  let state = running({ roster: "relay", sequence: "vice" });
  state = selectSlot(state, 0); state = substitute(state, 0);
  const pressure = state.pressure; const chain = state.chain; const roster = [...state.active, ...state.bench];
  for (let count = 0; count < 20; count += 1) {
    state = selectSlot(state, count % 3); state = substitute(state, count % 3); state = dumpAndChange(state); state = takePenalty(state);
  }
  assert.equal(state.pressure, pressure); assert.equal(state.chain, chain);
  assert.deepEqual([...state.active, ...state.bench], roster);
  assert.equal(state.stats.substitutions, 1);
});

function freshnessPolicy(roster, sequence) {
  let state = running({ roster, sequence, cadence: "control" });
  while (state.phase === "running") {
    const activeSlot = state.active.reduce((lowest, id, slot) => id && state.energy[id] < state.energy[state.active[lowest]] ? slot : lowest, 0);
    const benchIndex = state.bench.reduce((highest, id, index) => state.energy[id] > state.energy[state.bench[highest]] ? index : highest, 0);
    state = selectSlot(state, activeSlot); state = substitute(state, benchIndex); state = resolve(state);
  }
  return state.outcome.result;
}

function supportedFreshnessPolicy(roster, sequence, lineup = initialLineup(roster)) {
  let state = running({ roster, sequence, cadence: "control", lineup });
  while (state.phase === "running") {
    const activeSlots = state.active.map((id, slot) => ({ id, slot })).filter(({ id }) => id);
    const orderedSlots = activeSlots.sort((a, b) => state.energy[a.id] / PLAYERS[roster][a.id].energy - state.energy[b.id] / PLAYERS[roster][b.id].energy);
    let changed = false;
    for (const { id: outgoingId, slot } of orderedSlots) {
      const outgoing = PLAYERS[roster][outgoingId];
      const supported = state.bench.map((id, index) => ({ id, index })).filter(({ id }) => {
        const incoming = PLAYERS[roster][id];
        return incoming.fit[slot] >= 5 || incoming.tags.includes("bridge") || incoming.tags.includes("flex") || outgoing.tags.includes("handoff");
      }).sort((a, b) => state.energy[b.id] / PLAYERS[roster][b.id].energy - state.energy[a.id] / PLAYERS[roster][a.id].energy);
      if (supported.length) { state = selectSlot(state, slot); state = substitute(state, supported[0].index); changed = true; break; }
    }
    state = resolve(state);
    if (!changed && state.phase !== "running") break;
  }
  return state.outcome.result;
}

function fullChangePolicy(roster, sequence) {
  let state = running({ roster, sequence, cadence: "control" });
  while (state.phase === "running") { state = dumpAndChange(state); state = resolve(state); }
  return state.outcome.result;
}

function penaltyFirstPolicy(roster, sequence) {
  let state = running({ roster, sequence, cadence: "control" });
  while (state.phase === "running") {
    if (!state.sinBin) {
      const slot = state.active.findIndex((id) => id && !state.penaltiesUsed.includes(id));
      if (slot >= 0) { state = selectSlot(state, slot); state = takePenalty(state); }
    }
    state = resolve(state);
  }
  return state.outcome.result;
}

test("generic freshness and penalty-first policies do not sweep every condition", () => {
  const conditions = Object.keys(PLAYERS).flatMap((roster) => Object.keys(SEQUENCES).map((sequence) => [roster, sequence]));
  const freshnessWins = conditions.filter(([roster, sequence]) => freshnessPolicy(roster, sequence) === "win").length;
  const penaltyWins = conditions.filter(([roster, sequence]) => penaltyFirstPolicy(roster, sequence) === "win").length;
  assert.ok(freshnessWins < conditions.length, `freshness won ${freshnessWins}/${conditions.length}`);
  assert.ok(penaltyWins < conditions.length, `penalty-first won ${penaltyWins}/${conditions.length}`);
});

test("supported freshness policy does not sweep conditions or recruit matrices", () => {
  const conditions = Object.keys(PLAYERS).flatMap((roster) => Object.keys(SEQUENCES).map((sequence) => [roster, sequence]));
  const wins = conditions.filter(([roster, sequence]) => supportedFreshnessPolicy(roster, sequence) === "win").length;
  assert.ok(wins < conditions.length, `supported freshness won ${wins}/${conditions.length}`);
  for (const roster of Object.keys(PLAYERS)) {
    const original = initialLineup(roster); const results = new Set();
    for (const recruit of RECRUIT_OFFERS.flat()) for (const released of [...original.active, ...original.bench]) {
      results.add(supportedFreshnessPolicy(roster, "static", recruitIntoLineup(original, released, recruit)));
    }
    assert.deepEqual([...results].sort(), ["loss", "tie", "win"], `${roster} matrix outcomes`);
  }
});

test("every-resolution Full Change policy has no wins and at least one loss", () => {
  const results = Object.keys(PLAYERS).flatMap((roster) => Object.keys(SEQUENCES).map((sequence) => fullChangePolicy(roster, sequence)));
  assert.equal(results.filter((result) => result === "win").length, 0, results.join(","));
  assert.ok(results.includes("loss"), results.join(","));
});

test("recruitment diagnosis exposes named failure totals, last link and deployment", () => {
  const lineup = recruitIntoLineup(initialLineup("relay"), "inez", "ada");
  const state = running({ roster: "relay", sequence: "vice", lineup, recruitId: "ada" });
  state.events.push({ type: "failure", text: "Failed disruption." }, { type: "chain-break", text: "Broken change." }, { type: "fatigue", text: "Gassed." });
  const summary = diagnosisSummary(state);
  assert.equal(summary.failures, "1 disruption failures; 1 unsupported substitution breaks; 1 fatigue failures.");
  assert.equal(summary.lastBrokenLink, "Last broken link: Gassed.");
  assert.match(summary.recruitDeployment, /Recruited ADA:/);
});

test("recruit and release choices change outcomes under identical generic decisions", () => {
  for (const roster of Object.keys(PLAYERS)) {
    const original = initialLineup(roster); const results = new Set();
    for (const recruit of RECRUIT_OFFERS.flat()) {
      for (const released of [...original.active, ...original.bench]) {
        const lineup = recruitIntoLineup(original, released, recruit);
        let state = running({ roster, sequence: "static", cadence: "control", lineup });
        while (state.phase === "running") {
          const activeSlot = state.active.reduce((lowest, id, slot) => id && state.energy[id] < state.energy[state.active[lowest]] ? slot : lowest, 0);
          const benchIndex = state.bench.reduce((highest, id, index) => state.energy[id] > state.energy[state.bench[highest]] ? index : highest, 0);
          state = selectSlot(state, activeSlot); state = substitute(state, benchIndex); state = resolve(state);
        }
        results.add(state.outcome.result);
      }
    }
    assert.ok(results.size > 1, `${roster} recruit choices all resolved ${[...results].join()}`);
  }
});
