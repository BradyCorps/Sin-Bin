import assert from "node:assert/strict";
import test from "node:test";
import {
  CADENCES, PENALTY_RESOLUTIONS, advanceClock, createGame, diagnosis,
  getDisruption, initialLineup, moveBenchSkater, recruitIntoLineup, resolve,
  selectSlot, startGame, substitute, takePenalty,
} from "../app/game-engine.mjs";

function running(conditions) { return startGame(createGame(conditions)); }

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
