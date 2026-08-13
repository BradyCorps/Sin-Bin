export const CADENCES = { control: 5000, slow: 8000 };
export const RUN_RESOLUTIONS = 12;
export const PENALTY_RESOLUTIONS = 2;

const sharedRecruits = {
  ada: { name: "ADA", role: "Outlet", fit: [4, 4, 3], energy: 6, tags: ["bridge", "handoff"], color: "#8fd0bd", penalty: 15, returned: 13 },
  briar: { name: "BRIAR", role: "Shield", fit: [5, 5, 2], energy: 6, tags: ["control", "grit"], color: "#72a99a", penalty: 13, returned: 11 },
  cato: { name: "CATO", role: "Cannon", fit: [1, 5, 9], energy: 2, tags: ["charge", "burst", "finish"], color: "#ef806f", penalty: 41, returned: 29 },
  dove: { name: "DOVE", role: "Pivot", fit: [3, 5, 4], energy: 5, tags: ["bridge", "flex"], color: "#aaa0e4", penalty: 18, returned: 15 },
  echo: { name: "ECHO", role: "Cover", fit: [6, 4, 2], energy: 5, tags: ["control", "screen"], color: "#76b6c5", penalty: 16, returned: 14 },
  fox: { name: "FOX", role: "Gambler", fit: [3, 8, 7], energy: 2, tags: ["charge", "shot"], color: "#e9ba59", penalty: 37, returned: 27 },
};

export const RECRUIT_OFFERS = [
  ["ada", "briar", "cato"],
  ["dove", "echo", "fox"],
];

export const PLAYERS = {
  relay: {
    vale: { name: "VALE", role: "Retriever", fit: [8, 2, 1], energy: 4, tags: ["recover", "handoff"], color: "#75c8d8", penalty: 20, returned: 14 },
    marlow: { name: "MARLOW", role: "Playmaker", fit: [2, 8, 4], energy: 3, tags: ["create", "handoff", "thread"], color: "#e8c55a", penalty: 25, returned: 16 },
    vera: { name: "VERA", role: "Sniper", fit: [1, 2, 9], energy: 3, tags: ["finish", "shot"], color: "#ef7468", penalty: 32, returned: 24 },
    inez: { name: "INEZ", role: "Bridge", fit: [5, 3, 3], energy: 6, tags: ["bridge", "grit"], color: "#9acb89", penalty: 16, returned: 12 },
    kestrel: { name: "KESTREL", role: "Rover", fit: [4, 5, 4], energy: 5, tags: ["bridge", "flex"], color: "#b89be8", penalty: 18, returned: 14 },
    june: { name: "JUNE", role: "Screen", fit: [2, 3, 6], energy: 5, tags: ["bridge", "screen"], color: "#ed9b62", penalty: 21, returned: 16 },
    ...sharedRecruits,
  },
  overload: {
    rook: { name: "ROOK", role: "Breaker", fit: [9, 2, 1], energy: 3, tags: ["recover", "charge"], color: "#70bad0", penalty: 30, returned: 20 },
    lux: { name: "LUX", role: "Spark", fit: [2, 9, 6], energy: 2, tags: ["create", "burst"], color: "#f2dc7d", penalty: 39, returned: 28 },
    sabine: { name: "SABINE", role: "Pest", fit: [2, 3, 10], energy: 3, tags: ["finish", "charge"], color: "#d66f9b", penalty: 44, returned: 30 },
    halley: { name: "HALLEY", role: "Anchor", fit: [5, 6, 2], energy: 6, tags: ["control", "handoff"], color: "#6eb7a0", penalty: 14, returned: 12 },
    nyx: { name: "NYX", role: "Fuse", fit: [3, 7, 5], energy: 4, tags: ["charge", "flex"], color: "#bd92e0", penalty: 27, returned: 22 },
    orla: { name: "ORLA", role: "Netfront", fit: [2, 2, 7], energy: 5, tags: ["screen", "grit"], color: "#e48e62", penalty: 23, returned: 18 },
    ...sharedRecruits,
  },
};

const templates = {
  forecheck: { name: "HIGH FORECHECK", hint: "Absorb it, outrun it, or spend Chain.", fail: "The first touch was stripped below the goal line.", threat: 27, passes: (s) => fit(s, 0) >= 5 || tags(s).has("grit") || s.chain >= 1.75 },
  collapse: { name: "SLOT COLLAPSE", hint: "Screen it, finish through it, or stabilize possession.", fail: "The shooting lane closed before the release.", threat: 26, passes: (s) => fit(s, 2) >= 6 || tags(s).has("screen") || tags(s).has("control") },
  long: { name: "LONG CHANGE", hint: "Fresh legs, Control, or a live bridge can survive.", fail: "Tired legs were caught above the puck.", threat: 32, passes: (s) => activeEnergy(s) >= 8 || tags(s).has("control") || s.lastBridge },
  pin: { name: "BOARD PIN", hint: "Grit, a bridge, or enough stored Pressure can escape.", fail: "The cycle was sealed against the wall.", threat: 29, passes: (s) => tags(s).has("grit") || tags(s).has("bridge") || s.pressure >= 58 },
  match: { name: "HARD MATCH", hint: "Change shape, overcharge, or trust a hot Chain.", fail: "Fresh checkers smothered the unchanged unit.", threat: 34, passes: (s) => s.changedThisResolution || Boolean(s.sinBin) || s.chain >= 2.05 },
  rush: { name: "COUNTER RUSH", hint: "Control it, keep two fresh skaters, or race with Pressure.", fail: "The last skater was beaten in open ice.", threat: 38, passes: (s) => tags(s).has("control") || freshCount(s) >= 2 || s.pressure >= 70 },
  chaos: { name: "CHAOS PUCK", hint: "Bridge the bounce, use Flex, or preserve a strong Chain.", fail: "A bad bounce severed the sequence.", threat: 35, passes: (s) => tags(s).has("bridge") || tags(s).has("flex") || s.chain >= 2.2 },
  press: { name: "FINAL PRESS", hint: "Balanced fit, no empty tanks, or a Screen can hold.", fail: "The final wave died before the horn.", threat: 43, passes: (s) => (fit(s, 0) + fit(s, 1) + fit(s, 2) >= 14 && noGassed(s)) || tags(s).has("screen") },
};

export const SEQUENCES = {
  vice: { name: "THE VICE", description: "Contact and containment alternate.", events: ["forecheck", "pin", "collapse", "long", "match", "pin", "rush", "collapse", "chaos", "long", "forecheck", "press"] },
  chase: { name: "THE CHASE", description: "Speed tests punish stale lines.", events: ["rush", "long", "match", "forecheck", "chaos", "rush", "collapse", "match", "long", "pin", "chaos", "press"] },
  static: { name: "STATIC ICE", description: "Broken structure rewards adaptable futures.", events: ["chaos", "collapse", "pin", "forecheck", "match", "chaos", "long", "collapse", "rush", "pin", "match", "press"] },
};

const starts = {
  relay: { active: ["vale", "marlow", "vera"], bench: ["inez", "kestrel", "june"] },
  overload: { active: ["rook", "lux", "sabine"], bench: ["halley", "nyx", "orla"] },
};

export function initialLineup(rosterId) { return structuredClone(starts[rosterId]); }

export function recruitIntoLineup(lineup, outgoingId, incomingId) {
  if (!RECRUIT_OFFERS.flat().includes(incomingId)) return lineup;
  const next = structuredClone(lineup);
  const activeIndex = next.active.indexOf(outgoingId);
  const benchIndex = next.bench.indexOf(outgoingId);
  if (activeIndex >= 0) next.active[activeIndex] = incomingId;
  else if (benchIndex >= 0) next.bench[benchIndex] = incomingId;
  else return lineup;
  return next;
}

export function moveBenchSkater(lineup, index, direction) {
  const target = index + direction;
  if (index < 0 || target < 0 || target >= lineup.bench.length) return lineup;
  const next = structuredClone(lineup);
  [next.bench[index], next.bench[target]] = [next.bench[target], next.bench[index]];
  return next;
}

function roster(state) { return PLAYERS[state.conditions.roster]; }
function player(state, id) { return roster(state)[id]; }
function tags(state) { return new Set(state.active.flatMap((id) => id ? player(state, id).tags : [])); }
function fit(state, slot) { const id = state.active[slot]; if (!id) return 0; const p = player(state, id); return p.fit[slot] * (0.45 + 0.55 * state.energy[id] / p.energy); }
function activeEnergy(state) { return state.active.reduce((n, id) => n + (id ? state.energy[id] : 0), 0); }
function freshCount(state) { return state.active.filter((id) => id && state.energy[id] / player(state, id).energy >= 0.6).length; }
function noGassed(state) { return state.active.every((id) => id && state.energy[id] > 0); }
function copy(state) { return structuredClone(state); }
function record(state, type, text, detail = {}) { state.events.push({ resolution: state.resolution, type, text, ...detail }); state.feed = [text, ...state.feed].slice(0, 8); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

export function getDisruption(state) {
  const sequence = SEQUENCES[state.conditions.sequence];
  return templates[sequence.events[Math.min(state.resolution, RUN_RESOLUTIONS - 1)]];
}

export function createGame(conditions = {}) {
  const selected = { roster: conditions.roster ?? "relay", sequence: conditions.sequence ?? "vice", cadence: conditions.cadence ?? "control", seed: conditions.seed ?? 2, lineup: structuredClone(conditions.lineup ?? starts[conditions.roster ?? "relay"]), recruitId: conditions.recruitId ?? null };
  selected.recruitStarted = Boolean(selected.recruitId && selected.lineup.active.includes(selected.recruitId));
  const lineup = selected.lineup;
  const available = PLAYERS[selected.roster];
  return {
    phase: "ready", conditions: selected, resolution: 0, clockMs: CADENCES[selected.cadence], active: [...lineup.active], bench: [...lineup.bench],
    energy: Object.fromEntries(Object.entries(available).map(([id, p]) => [id, p.energy])), pressure: 18, threat: 0, chain: 1, maxChain: 1,
    selectedSlot: null, sinBin: null, penaltiesUsed: [], changedThisResolution: false, dumpedThisResolution: false, lastBridge: false, goalsFor: 0, goalsAgainst: 0,
    feed: [`${SEQUENCES[selected.sequence].name}: ${SEQUENCES[selected.sequence].description}`], events: [], outcome: null,
    stats: { substitutions: 0, bridges: 0, chainBreaks: 0, fatigueFailures: 0, dumps: 0, surrendered: 0, penalties: 0, survived: 0, returns: 0, recruitEntries: 0, recruitResolutions: 0 },
  };
}

export function startGame(state) { if (state.phase !== "ready") return state; const next = copy(state); next.phase = "running"; return next; }
export function selectSlot(state, slot) { if (state.phase !== "running" || !state.active[slot]) return state; const next = copy(state); next.selectedSlot = next.selectedSlot === slot ? null : slot; return next; }

export function substitute(state, benchIndex) {
  if (state.phase !== "running" || state.selectedSlot === null || !state.bench[benchIndex]) return state;
  const next = copy(state); const slot = next.selectedSlot; const outgoingId = next.active[slot]; const incomingId = next.bench[benchIndex];
  if (!outgoingId || !incomingId) return state;
  const outgoing = player(next, outgoingId); const incoming = player(next, incomingId);
  const bridge = incoming.tags.includes("bridge") || incoming.tags.includes("flex") || outgoing.tags.includes("handoff");
  const natural = incoming.fit[slot] >= 5; const kept = natural || bridge;
  next.active[slot] = incomingId; next.bench[benchIndex] = outgoingId; next.selectedSlot = null; next.changedThisResolution = true; next.lastBridge = bridge;
  next.stats.substitutions += 1;
  if (incomingId === next.conditions.recruitId) next.stats.recruitEntries += 1;
  if (kept) {
    if (bridge) next.stats.bridges += 1;
    const relayGain = next.conditions.roster === "relay" ? 0.28 : 0.1;
    next.chain = clamp(next.chain + relayGain + (natural ? 0.08 : 0), 1, 4.5);
    next.pressure += next.conditions.roster === "relay" ? (bridge ? 2 : 0) : 1;
    record(next, bridge ? "bridge" : "substitution", `${outgoing.name} → ${incoming.name}: ${bridge ? "possession bridge" : "clean lane change"}; Chain ×${next.chain.toFixed(2)}.`, { outgoing: outgoingId, incoming: incomingId, slot });
  } else {
    const before = next.chain; next.chain = 1; next.pressure = Math.max(0, next.pressure - 20); scoreThreat(next, 12, `${incoming.name} entered without a supported exit.`); next.stats.chainBreaks += 1;
    record(next, "chain-break", `${incoming.name} could not receive ${outgoing.name}'s exit in ${["Recover", "Create", "Finish"][slot]}; Chain ${before.toFixed(2)} → 1.00.`, { outgoing: outgoingId, incoming: incomingId, slot, cause: "unsupported live change" });
  }
  if (next.conditions.roster === "overload" && incoming.tags.includes("charge") && next.energy[incomingId] === incoming.energy) {
    next.pressure += 13; record(next, "overload", `${incoming.name} entered fully charged: +13 Pressure.`);
  }
  next.maxChain = Math.max(next.maxChain, next.chain); return next;
}

export function dumpAndChange(state) {
  if (state.phase !== "running" || state.dumpedThisResolution) return state; const next = copy(state); const surrendered = Math.min(18, Math.round(next.pressure));
  const oldActive = next.active.filter(Boolean); const remaining = [...next.bench]; const assigned = [];
  for (let slot = 0; slot < next.active.length; slot += 1) {
    if (!next.active[slot]) { assigned.push(null); continue; }
    let bestIndex = 0;
    for (let index = 1; index < remaining.length; index += 1) {
      const candidate = remaining[index]; const best = remaining[bestIndex];
      const score = player(next, candidate).fit[slot] + next.energy[candidate] / player(next, candidate).energy;
      const bestScore = player(next, best).fit[slot] + next.energy[best] / player(next, best).energy;
      if (score > bestScore) bestIndex = index;
    }
    assigned.push(remaining.splice(bestIndex, 1)[0]);
  }
  next.active = assigned; next.bench = [...remaining, ...oldActive];
  next.pressure = Math.max(0, next.pressure - surrendered); next.threat = Math.max(0, next.threat - 4); next.chain = 1; next.selectedSlot = null; next.changedThisResolution = true; next.dumpedThisResolution = true; next.lastBridge = false;
  next.stats.dumps += 1; next.stats.surrendered += surrendered; record(next, "dump", `Dump and change surrendered ${surrendered} Pressure and reset Chain to 1.00.`); return next;
}

export function takePenalty(state) {
  if (state.phase !== "running" || state.selectedSlot === null || state.sinBin) return state; const id = state.active[state.selectedSlot];
  if (!id || state.penaltiesUsed.includes(id)) return state; const next = copy(state); const p = player(next, id); const slot = next.selectedSlot;
  const stateMultiplier = 0.48 + Math.min(0.28, next.threat / 220) + Math.min(0.16, Math.max(0, next.chain - 1) * 0.1);
  const overcharge = Math.max(7, Math.round(p.penalty * stateMultiplier));
  next.active[slot] = null; next.sinBin = { id, slot, remaining: PENALTY_RESOLUTIONS, conceded: false }; next.penaltiesUsed.push(id); next.selectedSlot = null; next.pressure += overcharge; next.chain = clamp(next.chain + 0.25, 1, 4.5); next.stats.penalties += 1;
  record(next, "penalty", `${p.name} overcharged +${overcharge} Pressure from the current Threat/Chain state; ${PENALTY_RESOLUTIONS} shorthanded resolutions begin.`, { skater: id, overcharge }); return next;
}

function scorePressure(next, amount) { next.pressure += amount; while (next.pressure >= 100) { next.pressure -= 100; next.goalsFor += 1; record(next, "goal", "Pressure reached 100: goal, play remains live."); } }
function scoreThreat(next, amount, cause) { next.threat += amount; while (next.threat >= 100) { next.threat -= 100; next.goalsAgainst += 1; next.pressure = Math.max(0, next.pressure - 18); if (next.sinBin) next.sinBin.conceded = true; record(next, "goal-against", `Threat reached 100: ${cause}`, { cause }); } }

export function resolve(state) {
  if (state.phase !== "running") return state; const next = copy(state); const disruption = getDisruption(next); next.resolution += 1;
  if (next.conditions.recruitId && next.active.includes(next.conditions.recruitId)) next.stats.recruitResolutions += 1;
  const passed = disruption.passes(next); const fits = [fit(next, 0), fit(next, 1), fit(next, 2)]; const complete = fits.every((v) => v >= 4);
  let output = Math.round(fits.reduce((a, b) => a + b, 0) * (0.8 + next.chain * 0.25));
  if (complete) output += 7;
  if (next.conditions.roster === "relay") { if (next.lastBridge) output += 8; output = Math.round(output * 0.94); }
  else { const charged = next.active.filter((id) => id && player(next, id).tags.includes("charge") && next.energy[id] > 0).length; const chargeOnline = next.chain >= 1.55; if (chargeOnline) output += charged * 7; if (charged >= 2 && chargeOnline) { output += 10; record(next, "overload", `Charged pair detonated through a preserved Chain: +${charged * 7 + 10} output before fatigue.`); } }
  if (next.sinBin) output = Math.round(output * 0.64);
  if (passed) { scorePressure(next, output + 4); next.threat = Math.max(0, next.threat - 4); next.chain = clamp(next.chain + 0.16, 1, 4.5); record(next, "resolution", `${disruption.name} survived by the current machine: +${output + 4} Pressure.`); }
  else { const danger = Math.round(disruption.threat * (next.sinBin ? 1.5 : 1)); next.pressure = Math.max(0, next.pressure - 18); next.chain = 1; next.stats.chainBreaks += 1; scoreThreat(next, danger, disruption.fail); record(next, "failure", `${disruption.fail} No Pressure generated; −18 Pressure, +${danger} Threat; Chain reset to ×1.00.`, { cause: disruption.fail, disruption: disruption.name, threat: danger }); }
  for (const id of next.active) if (id) { const before = next.energy[id]; next.energy[id] = Math.max(0, before - 1); if (before === 0) { const cause = `${player(next, id).name} stayed active with no Energy and lost the next link.`; next.pressure = Math.max(0, next.pressure - 8); next.stats.fatigueFailures += 1; scoreThreat(next, 14, cause); record(next, "fatigue", `${cause} −8 Pressure, +14 Threat.`, { cause, skater: id }); } }
  for (const id of next.bench) next.energy[id] = Math.min(player(next, id).energy, next.energy[id] + 1);
  if (next.sinBin) { next.sinBin.remaining -= 1; if (next.sinBin.remaining === 0) { const { id, slot, conceded } = next.sinBin; const p = player(next, id); next.active[slot] = id; next.energy[id] = p.energy; const value = conceded ? Math.round(p.returned / 2) : p.returned; next.sinBin = null; next.stats.returns += 1; if (!conceded) next.stats.survived += 1; next.chain = conceded ? 1 : clamp(next.chain + 0.5, 1, 4.5); scorePressure(next, value); record(next, "return", `${p.name} returned after exactly ${PENALTY_RESOLUTIONS} resolutions: +${value} Pressure; ${conceded ? "concession halved the trigger" : "shorthanded interval survived"}.`, { skater: id, survived: !conceded, value }); } }
  next.changedThisResolution = false; next.dumpedThisResolution = false; next.lastBridge = false; next.selectedSlot = null; next.maxChain = Math.max(next.maxChain, next.chain); next.clockMs = CADENCES[next.conditions.cadence];
  if (next.resolution >= RUN_RESOLUTIONS || next.goalsFor >= 3 || next.goalsAgainst >= 3) { const result = next.goalsFor > next.goalsAgainst ? "win" : next.goalsFor < next.goalsAgainst ? "loss" : "tie"; next.phase = "ended"; next.outcome = { result, won: result === "win", explanation: next.events.filter((e) => e.type === "failure" || e.type === "fatigue" || e.type === "chain-break").at(-1)?.text ?? "The machine reached the horn without a broken link." }; record(next, "end", `Run ended ${result}: ${next.goalsFor}–${next.goalsAgainst}; Pressure ${Math.round(next.pressure)}, Threat ${Math.round(next.threat)}.`); }
  return next;
}

export function advanceClock(state, elapsed) { if (state.phase !== "running") return state; const next = copy(state); next.pressure = Math.max(0, next.pressure - elapsed / 1000 * (next.sinBin ? 1.8 : 0.9)); next.clockMs -= elapsed; return next.clockMs <= 0 ? resolve(next) : next; }

export function diagnosis(state) {
  const count = (type) => state.events.filter((event) => event.type === type).length;
  const disruptionFailures = count("failure");
  const substitutionBreaks = count("chain-break");
  const fatigueFailures = count("fatigue");
  const finalCause = state.events.filter((event) => ["failure", "fatigue", "chain-break"].includes(event.type)).at(-1)?.text;
  return [
    `${state.stats.substitutions} substitutions; ${state.stats.bridges} possession bridges.`,
    `${disruptionFailures} disruption failures; ${substitutionBreaks} unsupported substitution breaks; ${fatigueFailures} fatigue failures.`,
    `${state.stats.dumps} dumps surrendered ${state.stats.surrendered} Pressure.`,
    `${state.stats.penalties} penalties; ${state.stats.survived} shorthanded intervals survived; ${state.stats.returns} return triggers.`,
    ...(state.conditions.recruitId ? [`Recruited ${player(state, state.conditions.recruitId).name}: ${state.conditions.recruitStarted ? "started on ice" : "started on bench"}; ${state.stats.recruitEntries} live substitution entries; ${state.stats.recruitResolutions} resolutions played.`] : []),
    finalCause ? `Last broken link: ${finalCause}` : "No broken link recorded.",
  ];
}
