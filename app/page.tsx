"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

const SHIFT_MS = 5200;
const MAX_GOALS = 3;

type Phase = "ready" | "running" | "paused" | "ended";
type Tone = "good" | "bad" | "neutral" | "system";

type Player = {
  id: string;
  name: string;
  number: string;
  role: string;
  color: string;
  fit: [number, number, number];
  maxEnergy: number;
  tags: string[];
  live: string;
  entry: string;
  exit: string;
  sin: string;
  sinPower: number;
  return: string;
  returnPower: number;
};

type LogEntry = {
  id: number;
  tone: Tone;
  text: string;
};

type SinBinState = {
  id: string;
  slot: number;
  remaining: number;
  conceded: boolean;
};

type Stats = {
  changes: number;
  cleanChanges: number;
  brokenChanges: number;
  dumps: number;
  penalties: number;
  survivedPenalties: number;
  goals: number;
};

type Outcome = {
  won: boolean;
  title: string;
  subtitle: string;
};

type GameState = {
  phase: Phase;
  shift: number;
  clockMs: number;
  active: Array<string | null>;
  bench: string[];
  energy: Record<string, number>;
  pressure: number;
  threat: number;
  goalsFor: number;
  goalsAgainst: number;
  combo: number;
  maxCombo: number;
  selectedSlot: number | null;
  sinBin: SinBinState | null;
  penaltiesUsed: string[];
  eventIndex: number;
  madeChange: boolean;
  feed: LogEntry[];
  logSeq: number;
  chain: string[];
  chainSeq: number;
  celebration: string | null;
  outcome: Outcome | null;
  stats: Stats;
  lastMistake: string;
};

type Disruption = {
  name: string;
  cue: string;
  fail: string;
  threat: number;
  check: (state: GameState) => boolean;
};

const SLOT_NAMES = ["RECOVER", "CREATE", "FINISH"];

const PLAYERS: Record<string, Player> = {
  vale: {
    id: "vale",
    name: "VALE",
    number: "16",
    role: "RETRIEVER",
    color: "#75c8d8",
    fit: [8, 2, 1],
    maxEnergy: 4,
    tags: ["RECOVER", "HANDOFF"],
    live: "Wins the first touch. +4 when the circuit is complete.",
    entry: "Reclaims a loose puck for +6 Pressure.",
    exit: "Leaves a live puck; her replacement keeps the chain.",
    sin: "Late hit creates an immediate offensive-zone scramble.",
    sinPower: 22,
    return: "Jumps on the loose puck and restores the circuit.",
    returnPower: 18,
  },
  marlow: {
    id: "marlow",
    name: "MARLOW",
    number: "08",
    role: "PLAYMAKER",
    color: "#e8c55a",
    fit: [2, 8, 4],
    maxEnergy: 3,
    tags: ["CREATE", "THREAD", "HANDOFF"],
    live: "Threads a FINISHER for +8 Pressure.",
    entry: "Enters the middle lane with +0.15 Chain.",
    exit: "Slides the puck behind her; next entry stays live.",
    sin: "Runs an illegal pick and opens the seam instantly.",
    sinPower: 30,
    return: "Returns unseen through the weak side: +0.65 Chain.",
    returnPower: 12,
  },
  vera: {
    id: "vera",
    name: "VERA",
    number: "91",
    role: "SNIPER",
    color: "#ef7468",
    fit: [1, 2, 9],
    maxEnergy: 3,
    tags: ["FINISH", "SHOT"],
    live: "Converts a threaded puck into the largest finish.",
    entry: "Enters the finish lane for +10 Pressure.",
    exit: "No safety valve. A poor replacement breaks the play.",
    sin: "Crashes the crease and turns chaos into raw Pressure.",
    sinPower: 38,
    return: "Steps out onto a breakaway.",
    returnPower: 30,
  },
  inez: {
    id: "inez",
    name: "INEZ",
    number: "24",
    role: "GRINDER",
    color: "#9acb89",
    fit: [6, 3, 3],
    maxEnergy: 6,
    tags: ["RECOVER", "GRIT", "BRIDGE"],
    live: "Absorbs pressure and cuts opponent Threat by 5.",
    entry: "Any substitution stays alive; clears 9 Threat.",
    exit: "A simple rim keeps the next change safe.",
    sin: "Wins the collision but takes two shifts for it.",
    sinPower: 18,
    return: "Returns with possession already secured.",
    returnPower: 16,
  },
  kestrel: {
    id: "kestrel",
    name: "KESTREL",
    number: "12",
    role: "ROVER",
    color: "#b89be8",
    fit: [5, 6, 5],
    maxEnergy: 4,
    tags: ["FLEX", "BRIDGE"],
    live: "Completes any lane, but never dominates one.",
    entry: "Fits any open slot and adds +0.15 Chain.",
    exit: "Rotates high; the play remains connected.",
    sin: "Pinches recklessly to keep the puck below the dots.",
    sinPower: 26,
    return: "Re-enters in whichever lane is weakest.",
    returnPower: 20,
  },
  june: {
    id: "june",
    name: "JUNE",
    number: "47",
    role: "NETFRONT",
    color: "#ed9b62",
    fit: [3, 2, 7],
    maxEnergy: 5,
    tags: ["FINISH", "SCREEN", "BRIDGE"],
    live: "Screens the finish and defeats shot blockers.",
    entry: "At FINISH, tips the live puck for +8 Pressure.",
    exit: "Ties up a defender; a fit replacement stays live.",
    sin: "Creates crease chaos at a manageable cost.",
    sinPower: 27,
    return: "Returns directly to the goalmouth.",
    returnPower: 22,
  },
  halley: {
    id: "halley",
    name: "HALLEY",
    number: "06",
    role: "ANCHOR",
    color: "#6eb7a0",
    fit: [4, 6, 2],
    maxEnergy: 5,
    tags: ["CONTROL", "CREATE"],
    live: "Protects the counter and cuts opponent Threat by 8.",
    entry: "Settles the play and immediately clears 12 Threat.",
    exit: "No handoff; replace her with a natural fit.",
    sin: "Stops a rush before it starts.",
    sinPower: 14,
    return: "Restores structure and erases 18 Threat.",
    returnPower: 10,
  },
  sabine: {
    id: "sabine",
    name: "SABINE",
    number: "77",
    role: "PEST",
    color: "#d66f9b",
    fit: [5, 4, 3],
    maxEnergy: 4,
    tags: ["GRIT", "RECOVER"],
    live: "Disrupts clean matchups and feeds on broken plays.",
    entry: "Turns a messy change into +0.10 Chain.",
    exit: "Leaves disorder behind; use a natural slot fit.",
    sin: "Her specialty: maximum overload, maximum exposure.",
    sinPower: 46,
    return: "Draws an even-up and drains opponent Threat.",
    returnPower: 24,
  },
  lux: {
    id: "lux",
    name: "LUX",
    number: "19",
    role: "SPARK",
    color: "#f2dc7d",
    fit: [2, 7, 7],
    maxEnergy: 2,
    tags: ["CREATE", "FINISH", "BURST"],
    live: "Explosive while fresh; fades after two resolutions.",
    entry: "Detonates for +16 Pressure immediately.",
    exit: "No bridge. Time the next change carefully.",
    sin: "Burns everything on one illegal burst.",
    sinPower: 34,
    return: "Comes back fully charged.",
    returnPower: 26,
  },
};

function activePlayers(state: GameState) {
  return state.active
    .filter((id): id is string => Boolean(id))
    .map((id) => PLAYERS[id]);
}

function hasTag(state: GameState, tag: string) {
  return activePlayers(state).some((player) => player.tags.includes(tag));
}

function fitAt(state: GameState, slot: number) {
  const id = state.active[slot];
  if (!id) return 0;
  const player = PLAYERS[id];
  const energyRatio = state.energy[id] / player.maxEnergy;
  return player.fit[slot] * (0.48 + energyRatio * 0.52);
}

function totalEnergy(state: GameState) {
  return state.active.reduce(
    (sum, id) => sum + (id ? state.energy[id] : 0),
    0,
  );
}

const DISRUPTIONS: Disruption[] = [
  {
    name: "HIGH FORECHECK",
    cue: "RECOVER 5+",
    fail: "The first touch is lost below the goal line.",
    threat: 26,
    check: (state) => fitAt(state, 0) >= 5,
  },
  {
    name: "SLOT COLLAPSE",
    cue: "FINISH 6+ or SCREEN",
    fail: "The shooting lane disappears.",
    threat: 25,
    check: (state) => fitAt(state, 2) >= 6 || hasTag(state, "SCREEN"),
  },
  {
    name: "LONG CHANGE",
    cue: "9 total Energy",
    fail: "Tired legs are caught above the puck.",
    threat: 34,
    check: (state) => totalEnergy(state) >= 9,
  },
  {
    name: "BOARD PIN",
    cue: "GRIT or ROVER",
    fail: "The cycle is sealed against the wall.",
    threat: 29,
    check: (state) => hasTag(state, "GRIT") || hasTag(state, "FLEX"),
  },
  {
    name: "BROKEN COVERAGE",
    cue: "CREATE + FINISH 10+",
    fail: "Nobody finds the exposed seam in time.",
    threat: 28,
    check: (state) => fitAt(state, 1) + fitAt(state, 2) >= 10,
  },
  {
    name: "HARD MATCH",
    cue: "Make a live change",
    fail: "The same unit is smothered by fresh checkers.",
    threat: 36,
    check: (state) => state.madeChange,
  },
  {
    name: "HEAVY CYCLE",
    cue: "CONTROL or 2 fresh skaters",
    fail: "The Saints grind the line into a turnover.",
    threat: 33,
    check: (state) =>
      hasTag(state, "CONTROL") ||
      state.active.filter(
        (id) => id && state.energy[id] / PLAYERS[id].maxEnergy >= 0.6,
      ).length >= 2,
  },
  {
    name: "SHOT BLOCKERS",
    cue: "SCREEN or FINISH 7+",
    fail: "Every release is swallowed before the net.",
    threat: 29,
    check: (state) => hasTag(state, "SCREEN") || fitAt(state, 2) >= 7,
  },
  {
    name: "THREE-LANE OVERLOAD",
    cue: "3 different roles",
    fail: "The attack becomes predictable and collapses.",
    threat: 31,
    check: (state) =>
      new Set(activePlayers(state).map((player) => player.role)).size >= 3,
  },
  {
    name: "COUNTER RUSH",
    cue: "CONTROL or 55 Pressure",
    fail: "The last player is beaten in open ice.",
    threat: 40,
    check: (state) => hasTag(state, "CONTROL") || state.pressure >= 55,
  },
  {
    name: "CHAOS PUCK",
    cue: "BRIDGE or Chain ×2.2",
    fail: "One bad bounce severs the entire sequence.",
    threat: 36,
    check: (state) => hasTag(state, "BRIDGE") || state.combo >= 2.2,
  },
  {
    name: "FINAL PRESS",
    cue: "No gassed skaters + Fit 15",
    fail: "The final wave dies before the horn.",
    threat: 46,
    check: (state) =>
      state.active.every((id) => id && state.energy[id] > 0) &&
      fitAt(state, 0) + fitAt(state, 1) + fitAt(state, 2) >= 15,
  },
];

function createInitialGame(): GameState {
  return {
    phase: "ready",
    shift: 0,
    clockMs: SHIFT_MS,
    active: ["vale", "marlow", "vera"],
    bench: ["inez", "kestrel", "june", "halley", "sabine", "lux"],
    energy: Object.fromEntries(
      Object.values(PLAYERS).map((player) => [player.id, player.maxEnergy]),
    ),
    pressure: 18,
    threat: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    combo: 1,
    maxCombo: 1,
    selectedSlot: null,
    sinBin: null,
    penaltiesUsed: [],
    eventIndex: 0,
    madeChange: false,
    feed: [
      {
        id: 1,
        tone: "system",
        text: "SCOUT: The Redline Saints trap tired units and counter broken changes.",
      },
    ],
    logSeq: 1,
    chain: ["VALE recovers", "MARLOW creates", "VERA finishes"],
    chainSeq: 0,
    celebration: null,
    outcome: null,
    stats: {
      changes: 0,
      cleanChanges: 0,
      brokenChanges: 0,
      dumps: 0,
      penalties: 0,
      survivedPenalties: 0,
      goals: 0,
    },
    lastMistake: "",
  };
}

function cloneGame(state: GameState): GameState {
  return {
    ...state,
    active: [...state.active],
    bench: [...state.bench],
    energy: { ...state.energy },
    penaltiesUsed: [...state.penaltiesUsed],
    feed: [...state.feed],
    chain: [...state.chain],
    sinBin: state.sinBin ? { ...state.sinBin } : null,
    stats: { ...state.stats },
    outcome: state.outcome ? { ...state.outcome } : null,
  };
}

function addLog(state: GameState, text: string, tone: Tone = "neutral") {
  state.logSeq += 1;
  state.feed = [{ id: state.logSeq, tone, text }, ...state.feed].slice(0, 9);
}

function endEarly(state: GameState) {
  if (state.goalsFor >= MAX_GOALS) {
    state.phase = "ended";
    state.outcome = {
      won: true,
      title: "THE ZONE BROKE OPEN",
      subtitle: `Three goals in ${state.shift || "open"} shifts. The machine held.`,
    };
  } else if (state.goalsAgainst >= MAX_GOALS) {
    state.phase = "ended";
    state.outcome = {
      won: false,
      title: "THE PLAY CAME APART",
      subtitle:
        state.lastMistake || "The Saints found three breaks before you found three goals.",
    };
  }
}

function applyPressure(state: GameState, amount: number, source: string) {
  state.pressure = Math.max(0, state.pressure + amount);
  while (state.pressure >= 100 && state.goalsFor < MAX_GOALS) {
    state.pressure -= 100;
    state.goalsFor += 1;
    state.stats.goals += 1;
    state.combo = Math.min(4.5, state.combo + 0.35);
    state.celebration = `GOAL — ${source}`;
    addLog(state, `GOAL: ${source}. The chain stays live.`, "good");
  }
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  endEarly(state);
}

function applyThreat(state: GameState, amount: number, source: string) {
  state.threat = Math.max(0, state.threat + amount);
  while (state.threat >= 100 && state.goalsAgainst < MAX_GOALS) {
    state.threat -= 100;
    state.goalsAgainst += 1;
    state.pressure = Math.max(0, state.pressure - 18);
    state.combo = Math.max(1, state.combo - 0.65);
    if (state.sinBin) state.sinBin.conceded = true;
    state.celebration = "GOAL AGAINST — THE CHAIN SNAPPED";
    addLog(state, `GOAL AGAINST: ${source}`, "bad");
  }
  endEarly(state);
}

function finishAtHorn(state: GameState) {
  if (state.phase === "ended" || state.shift < DISRUPTIONS.length) return;

  const differential = state.goalsFor - state.goalsAgainst;
  const pressureEdge = state.pressure - state.threat;
  const won = differential > 0 || (differential === 0 && pressureEdge >= 0);
  state.phase = "ended";
  state.outcome = won
    ? {
        won: true,
        title: "PRESSURE HELD TO THE HORN",
        subtitle:
          differential === 0
            ? `Tied on goals; your live Pressure won the zone ${Math.round(state.pressure)}–${Math.round(state.threat)}.`
            : `You outscored the Saints ${state.goalsFor}–${state.goalsAgainst}.`,
      }
    : {
        won: false,
        title: "THE HORN ENDED THE CYCLE",
        subtitle:
          state.lastMistake ||
          `The Saints took the sequence ${state.goalsAgainst}–${state.goalsFor}.`,
      };
}

function resolveShift(state: GameState): GameState {
  const next = cloneGame(state);
  if (next.phase !== "running") return next;

  next.shift += 1;
  const disruption = DISRUPTIONS[next.eventIndex];
  const onIce = next.active.map((id) => (id ? PLAYERS[id] : null));
  const fits = [fitAt(next, 0), fitAt(next, 1), fitAt(next, 2)];
  const completeCircuit = fits.every((fit) => fit >= 4);
  const chain: string[] = [];

  onIce.forEach((player, index) => {
    if (!player) {
      chain.push(`${SLOT_NAMES[index]} is empty`);
      return;
    }
    const verb = index === 0 ? "recovers" : index === 1 ? "creates" : "finishes";
    chain.push(`${player.name} ${verb} ${fits[index].toFixed(1)}`);
  });

  let bonus = completeCircuit ? 5 : 0;
  if (completeCircuit) chain.push("FULL CIRCUIT +5");

  const middleId = next.active[1];
  const finishId = next.active[2];
  if (
    middleId &&
    PLAYERS[middleId].tags.includes("THREAD") &&
    finishId &&
    PLAYERS[finishId].tags.includes("FINISH")
  ) {
    bonus += 8;
    chain.push("THREAD → FINISH +8");
  }
  if (next.active.includes("vale") && completeCircuit) bonus += 4;
  if (next.active.includes("june")) bonus += 5;
  if (next.active.includes("lux") && next.energy.lux > 0) bonus += 7;
  if (next.active.includes("inez")) {
    next.threat = Math.max(0, next.threat - 5);
    chain.push("INEZ absorbs 5 Threat");
  }
  if (next.active.includes("halley")) {
    next.threat = Math.max(0, next.threat - 8);
    chain.push("HALLEY controls 8 Threat");
  }

  const baseOutput = fits.reduce((sum, fit) => sum + fit, 0) * 1.55 + bonus;
  const engineMultiplier = 0.72 + next.combo * 0.28;
  const shortHandedMultiplier = next.sinBin ? 0.66 : 1;
  const passed = disruption.check(next);
  const eventMultiplier = passed ? 1 : 0.42;
  const output = Math.max(
    0,
    Math.round(baseOutput * engineMultiplier * shortHandedMultiplier * eventMultiplier),
  );

  if (passed) {
    chain.push(`${disruption.name} BEATEN`);
    applyPressure(next, output + 4, `${disruption.name} dismantled`);
    next.threat = Math.max(0, next.threat - 4);
    next.combo = Math.min(4.5, next.combo + 0.18);
    addLog(
      next,
      `SHIFT ${next.shift}: ${disruption.name} beaten. +${output + 4} Pressure.`,
      "good",
    );
  } else {
    const danger = Math.round(disruption.threat * (next.sinBin ? 1.55 : 1));
    const survivingOutput = Math.max(0, output - 10);
    chain.push(`${disruption.name} BREAKS THE PLAY`);
    if (survivingOutput > 0) {
      applyPressure(next, survivingOutput, "a broken-play chance");
    }
    next.pressure = Math.max(0, next.pressure - 12);
    next.combo = Math.max(1, next.combo - 0.42);
    next.lastMistake = disruption.fail;
    applyThreat(next, danger, disruption.fail);
    addLog(
      next,
      `SHIFT ${next.shift}: ${disruption.fail} +${danger} Threat.`,
      "bad",
    );
  }

  onIce.forEach((player) => {
    if (!player) return;
    const before = next.energy[player.id];
    next.energy[player.id] = Math.max(0, before - 1);
    if (before === 0) {
      next.pressure = Math.max(0, next.pressure - 8);
      next.lastMistake = `${player.name} stayed out with nothing left.`;
      applyThreat(next, 14, `${player.name} was caught completely gassed.`);
      chain.push(`${player.name} GASSED −8`);
    }
  });

  next.bench.forEach((id) => {
    next.energy[id] = Math.min(PLAYERS[id].maxEnergy, next.energy[id] + 1);
  });

  if (next.sinBin) {
    next.sinBin.remaining -= 1;
    if (next.sinBin.remaining <= 0 && next.phase !== "ended") {
      const returning = PLAYERS[next.sinBin.id];
      const returnSlot = next.sinBin.slot;
      const survived = !next.sinBin.conceded;
      next.active[returnSlot] = returning.id;
      next.energy[returning.id] = Math.min(
        returning.maxEnergy,
        next.energy[returning.id] + 2,
      );
      next.sinBin = null;

      if (returning.id === "halley" || returning.id === "sabine") {
        next.threat = Math.max(0, next.threat - (returning.id === "sabine" ? 24 : 18));
      }
      const returnValue = survived
        ? returning.returnPower
        : Math.round(returning.returnPower / 2);
      next.combo = survived ? Math.min(4.5, next.combo + 0.5) : 1;
      if (survived) next.stats.survivedPenalties += 1;
      chain.push(`${returning.name} RETURNS +${returnValue}`);
      applyPressure(next, returnValue, `${returning.name} exits the SIN BIN`);
      addLog(
        next,
        `${returning.name} returns: ${returning.return} ${survived ? "Penalty survived." : "The damage cuts the payoff."}`,
        survived ? "good" : "neutral",
      );
    }
  }

  next.combo = Math.min(4.5, next.combo);
  next.maxCombo = Math.max(next.maxCombo, next.combo);
  next.eventIndex = Math.min(next.eventIndex + 1, DISRUPTIONS.length - 1);
  next.madeChange = false;
  next.selectedSlot = null;
  next.clockMs = SHIFT_MS;
  next.chain = chain;
  next.chainSeq += 1;
  finishAtHorn(next);
  return next;
}

function advanceClock(state: GameState, elapsed: number): GameState {
  if (state.phase !== "running") return state;
  const next = cloneGame(state);
  const decayPerSecond = next.sinBin ? 2.15 : 1.05;
  next.pressure = Math.max(0, next.pressure - decayPerSecond * (elapsed / 1000));
  next.clockMs -= elapsed;
  if (next.clockMs <= 0) return resolveShift(next);
  return next;
}

function fitLabel(player: Player) {
  return `R${player.fit[0]} · C${player.fit[1]} · F${player.fit[2]}`;
}

function energyClass(value: number, max: number) {
  if (value === 0) return "dead";
  if (value / max <= 0.34) return "low";
  return "good";
}

function EnergyPips({ player, energy }: { player: Player; energy: number }) {
  return (
    <div className="energy" aria-label={`${energy} of ${player.maxEnergy} energy`}>
      {Array.from({ length: player.maxEnergy }, (_, index) => (
        <span
          className={index < energy ? "energy-pip filled" : "energy-pip"}
          key={index}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [game, setGame] = useState<GameState>(() => createInitialGame());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGame((current) => advanceClock(current, 100));
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!game.celebration) return;
    const message = game.celebration;
    const timer = window.setTimeout(() => {
      setGame((current) =>
        current.celebration === message
          ? { ...current, celebration: null }
          : current,
      );
    }, 1450);
    return () => window.clearTimeout(timer);
  }, [game.celebration]);

  const selectedPlayer = useMemo(() => {
    if (game.selectedSlot === null) return null;
    const id = game.active[game.selectedSlot];
    return id ? PLAYERS[id] : null;
  }, [game.active, game.selectedSlot]);

  const disruption = DISRUPTIONS[game.eventIndex];
  const clockPercent = Math.max(0, Math.min(100, (game.clockMs / SHIFT_MS) * 100));

  function startGame() {
    setGame((current) => {
      const next = cloneGame(current);
      next.phase = "running";
      next.clockMs = SHIFT_MS;
      addLog(next, "PUCK DOWN: Pressure is now bleeding in real time.", "system");
      return next;
    });
  }

  function selectSlot(slot: number) {
    setGame((current) => {
      if (current.phase !== "running" || !current.active[slot]) return current;
      return {
        ...current,
        selectedSlot: current.selectedSlot === slot ? null : slot,
      };
    });
  }

  function substitute(benchIndex: number) {
    setGame((current) => {
      if (current.phase !== "running" || current.selectedSlot === null) return current;
      const slot = current.selectedSlot;
      const outgoingId = current.active[slot];
      const incomingId = current.bench[benchIndex];
      if (!outgoingId || !incomingId) return current;

      const next = cloneGame(current);
      const outgoing = PLAYERS[outgoingId];
      const incoming = PLAYERS[incomingId];
      const keepsAlive =
        incoming.fit[slot] >= 5 ||
        incoming.tags.includes("BRIDGE") ||
        incoming.tags.includes("FLEX") ||
        outgoing.tags.includes("HANDOFF") ||
        outgoing.id === "inez";

      next.active[slot] = incomingId;
      next.bench[benchIndex] = outgoingId;
      next.selectedSlot = null;
      next.madeChange = true;
      next.stats.changes += 1;

      let entryPressure = 0;
      if (incoming.id === "vale") entryPressure += 6;
      if (incoming.id === "vera" && slot === 2) entryPressure += 10;
      if (incoming.id === "june" && slot === 2) entryPressure += 8;
      if (incoming.id === "lux") entryPressure += 16;
      if (incoming.id === "inez") next.threat = Math.max(0, next.threat - 9);
      if (incoming.id === "halley") next.threat = Math.max(0, next.threat - 12);
      if (incoming.id === "marlow" && slot === 1) next.combo += 0.15;
      if (incoming.id === "kestrel") next.combo += 0.15;
      if (incoming.id === "sabine") next.combo += 0.1;

      if (keepsAlive) {
        next.stats.cleanChanges += 1;
        next.combo = Math.min(4.5, next.combo + 0.16);
        applyPressure(next, 3, "a perfect live change");
        next.chain = [
          `${outgoing.name} exits`,
          `${incoming.name} enters ${SLOT_NAMES[slot]}`,
          "PLAY STAYS LIVE",
        ];
        addLog(
          next,
          `${outgoing.name} → ${incoming.name}: clean relay. Chain ×${next.combo.toFixed(2)}.`,
          "good",
        );
      } else {
        next.stats.brokenChanges += 1;
        next.combo = 1;
        next.pressure = Math.max(0, next.pressure - 22);
        applyThreat(next, 8, `${incoming.name} entered the wrong lane.`);
        next.lastMistake = `${incoming.name} entered the wrong lane after ${outgoing.name}.`;
        next.chain = [
          `${outgoing.name} exits`,
          `${incoming.name} enters ${SLOT_NAMES[slot]}`,
          "TURNOVER −22",
        ];
        addLog(next, `${outgoing.name} → ${incoming.name}: the relay breaks.`, "bad");
      }

      next.chainSeq += 1;
      if (entryPressure) {
        applyPressure(next, entryPressure, `${incoming.name}'s entry trigger`);
      }
      next.maxCombo = Math.max(next.maxCombo, next.combo);
      return next;
    });
  }

  function dumpAndChange() {
    setGame((current) => {
      if (current.phase !== "running") return current;
      const next = cloneGame(current);
      const available = [...next.bench];
      const chosen: string[] = [];

      next.active.forEach((id, slot) => {
        if (!id) return;
        const best = [...available]
          .filter((candidate) => !chosen.includes(candidate))
          .sort((a, b) => {
            const aScore = PLAYERS[a].fit[slot] + next.energy[a] / PLAYERS[a].maxEnergy;
            const bScore = PLAYERS[b].fit[slot] + next.energy[b] / PLAYERS[b].maxEnergy;
            return bScore - aScore;
          })[0];
        if (best) chosen.push(best);
      });

      const outgoing = next.active.filter((id): id is string => Boolean(id));
      const untouched = next.bench.filter((id) => !chosen.includes(id));
      let chosenIndex = 0;
      next.active = next.active.map((id) => (id ? chosen[chosenIndex++] : null));
      next.bench = [...untouched, ...outgoing];
      next.pressure = Math.max(0, next.pressure - 14);
      next.threat = Math.max(0, next.threat - 6);
      next.combo = 1;
      next.clockMs = Math.min(SHIFT_MS, next.clockMs + 650);
      next.selectedSlot = null;
      next.madeChange = true;
      next.stats.dumps += 1;
      next.chain = ["PUCK DUMPED", "FULL CHANGE", "CHAIN RESET ×1"];
      next.chainSeq += 1;
      addLog(next, "Safe dump: −14 Pressure, fresh line, no turnover.", "neutral");
      return next;
    });
  }

  function takePenalty() {
    setGame((current) => {
      if (
        current.phase !== "running" ||
        current.selectedSlot === null ||
        current.sinBin
      ) {
        return current;
      }
      const slot = current.selectedSlot;
      const id = current.active[slot];
      if (!id || current.penaltiesUsed.includes(id)) return current;

      const next = cloneGame(current);
      const player = PLAYERS[id];
      next.active[slot] = null;
      next.sinBin = { id, slot, remaining: 2, conceded: false };
      next.penaltiesUsed.push(id);
      next.selectedSlot = null;
      next.combo = Math.min(4.5, next.combo + 0.38);
      next.stats.penalties += 1;
      next.chain = [
        `${player.name} CROSSES THE LINE`,
        `OVERCHARGE +${player.sinPower}`,
        "SURVIVE 2 SHIFTS",
      ];
      next.chainSeq += 1;
      addLog(
        next,
        `${player.name} takes two: ${player.sin} +${player.sinPower} Pressure now.`,
        "neutral",
      );
      applyPressure(next, player.sinPower, `${player.name} crosses the line`);
      return next;
    });
  }

  function togglePause() {
    setGame((current) => {
      if (current.phase === "running") {
        return { ...current, phase: "paused", selectedSlot: null };
      }
      if (current.phase === "paused") return { ...current, phase: "running" };
      return current;
    });
  }

  function restart() {
    setGame(createInitialGame());
  }

  return (
    <main className="site-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">SINBIN // MECHANIC TEST 01</p>
          <h1>LIVE SHIFT LAB</h1>
        </div>
        <div className="lab-thesis">
          <span>THE TEST</span>
          <strong>Can you rewire the line without killing the play?</strong>
        </div>
      </header>

      <section className="score-ribbon" aria-label="Game score and status">
        <div className="score-team ours">
          <span>SINBIN</span>
          <strong>{game.goalsFor}</strong>
        </div>
        <div className="shift-readout">
          <span>LIVE SHIFT</span>
          <strong>{Math.min(game.shift + 1, 12)} / 12</strong>
        </div>
        <div className="score-team theirs">
          <strong>{game.goalsAgainst}</strong>
          <span>REDLINE SAINTS</span>
        </div>
      </section>

      <div className="game-layout">
        <section className="play-column">
          <div className="meters-row">
            <div className="meter-block pressure-block">
              <div className="meter-label">
                <span>LIVE PRESSURE</span>
                <strong>{Math.round(game.pressure)}</strong>
              </div>
              <div className="meter-track">
                <span style={{ width: `${Math.min(100, game.pressure)}%` }} />
              </div>
              <small>100 = goal · bleeds continuously</small>
            </div>
            <div className="chain-block">
              <span>CHAIN</span>
              <strong>×{game.combo.toFixed(2)}</strong>
              <small>Clean changes grow it</small>
            </div>
            <div className="meter-block threat-block">
              <div className="meter-label">
                <span>COUNTER THREAT</span>
                <strong>{Math.round(game.threat)}</strong>
              </div>
              <div className="meter-track">
                <span style={{ width: `${Math.min(100, game.threat)}%` }} />
              </div>
              <small>100 = goal against</small>
            </div>
          </div>

          <div className="disruption-card">
            <div>
              <span className="label">NEXT // {Math.min(game.shift + 1, 12)}</span>
              <strong>{disruption.name}</strong>
            </div>
            <div className="disruption-demand">
              <span>BEAT IT WITH</span>
              <strong>{disruption.cue}</strong>
            </div>
            <div className="clock-wrap" aria-label={`${Math.ceil(game.clockMs / 1000)} seconds`}>
              <div className="clock-text">
                <span>NEXT RESOLUTION</span>
                <strong>{game.phase === "ready" ? "—" : `${(game.clockMs / 1000).toFixed(1)}s`}</strong>
              </div>
              <div className="clock-track">
                <span style={{ width: `${game.phase === "ready" ? 100 : clockPercent}%` }} />
              </div>
            </div>
          </div>

          <section className="rink" aria-label="Active line">
            <div className="rink-mark center-line" />
            <div className="rink-mark faceoff-ring" />
            <div className="ice-label">ON THE ICE</div>
            <div className="active-line">
              {game.active.map((id, slot) => {
                if (!id) {
                  return (
                    <div className="player-card empty-slot" key={`empty-${slot}`}>
                      <span className="slot-kicker">{SLOT_NAMES[slot]}</span>
                      <strong>SHORT-HANDED</strong>
                      <small>This lane returns when the penalty expires.</small>
                    </div>
                  );
                }
                const player = PLAYERS[id];
                const selected = game.selectedSlot === slot;
                const energy = game.energy[id];
                return (
                  <button
                    aria-pressed={selected}
                    className={`player-card active-card ${selected ? "selected" : ""} energy-${energyClass(energy, player.maxEnergy)}`}
                    key={id}
                    onClick={() => selectSlot(slot)}
                    style={{ "--accent": player.color } as CSSProperties}
                  >
                    <span className="slot-kicker">{SLOT_NAMES[slot]} SLOT</span>
                    <div className="player-name-row">
                      <span className="jersey">{player.number}</span>
                      <div>
                        <strong>{player.name}</strong>
                        <small>{player.role}</small>
                      </div>
                    </div>
                    <EnergyPips player={player} energy={energy} />
                    <p><b>LIVE</b> {player.live}</p>
                    <p className="out-copy"><b>OUT</b> {player.exit}</p>
                    <span className="fit-line">{fitLabel(player)}</span>
                    <span className="select-cue">{selected ? "SELECTED" : "CLICK TO CHANGE"}</span>
                  </button>
                );
              })}
            </div>

            <div className="chain-runner" key={game.chainSeq} aria-live="polite">
              {game.chain.map((item, index) => (
                <span key={`${item}-${index}`}>
                  {item}
                  {index < game.chain.length - 1 && <i>→</i>}
                </span>
              ))}
            </div>

            {game.phase === "ready" && (
              <div className="ready-gate">
                <p className="eyebrow">ONE-MINUTE RECTANGLE TEST</p>
                <h2>Keep the scoring play alive while the game keeps moving.</h2>
                <div className="ready-rules">
                  <span><b>1</b> Read the next disruption.</span>
                  <span><b>2</b> Click an ice card, then a compatible bench card.</span>
                  <span><b>3</b> Pressure bleeds. Tired skaters get caught.</span>
                </div>
                <button className="primary-action" onClick={startGame}>DROP THE PUCK</button>
              </div>
            )}

            {game.phase === "paused" && (
              <div className="pause-gate">
                <strong>HORN // PAUSED</strong>
                <small>Planning is frozen. Changes are disabled.</small>
                <button onClick={togglePause}>RESUME LIVE PLAY</button>
              </div>
            )}
          </section>

          <section className="bench-section" aria-label="Bench">
            <div className="section-title-row">
              <div>
                <span className="label">BENCH // SIX SKATERS</span>
                <h2>
                  {selectedPlayer
                    ? `REPLACE ${selectedPlayer.name} IN ${SLOT_NAMES[game.selectedSlot ?? 0]}`
                    : "SELECT A SKATER ON THE ICE"}
                </h2>
              </div>
              <span className="bench-note">Bench energy recovers every resolution.</span>
            </div>
            <div className="bench-grid">
              {game.bench.map((id, index) => {
                const player = PLAYERS[id];
                const energy = game.energy[id];
                const slot = game.selectedSlot;
                const cleanFit =
                  slot !== null &&
                  (player.fit[slot] >= 5 ||
                    player.tags.includes("BRIDGE") ||
                    player.tags.includes("FLEX") ||
                    Boolean(selectedPlayer?.tags.includes("HANDOFF")));
                return (
                  <button
                    className={`bench-card ${cleanFit ? "clean-fit" : ""}`}
                    disabled={game.phase !== "running" || slot === null}
                    key={`${id}-${index}`}
                    onClick={() => substitute(index)}
                    style={{ "--accent": player.color } as CSSProperties}
                  >
                    <span className="bench-topline">
                      <b>{player.number}</b>
                      <i>{player.role}</i>
                    </span>
                    <strong>{player.name}</strong>
                    <EnergyPips player={player} energy={energy} />
                    <span className="fit-line">{fitLabel(player)}</span>
                    <p><b>IN</b> {player.entry}</p>
                    {slot !== null && (
                      <span className={`fit-verdict ${cleanFit ? "safe" : "risk"}`}>
                        {cleanFit ? "KEEPS PLAY LIVE" : "BREAK RISK"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="action-deck">
            <button
              className="secondary-action"
              disabled={game.phase !== "running"}
              onClick={dumpAndChange}
            >
              <span>DUMP &amp; FULL CHANGE</span>
              <small>−14 Pressure · reset Chain · freshest fit enters</small>
            </button>
            <button
              className="danger-action"
              disabled={
                game.phase !== "running" ||
                !selectedPlayer ||
                Boolean(game.sinBin) ||
                Boolean(selectedPlayer && game.penaltiesUsed.includes(selectedPlayer.id))
              }
              onClick={takePenalty}
            >
              <span>
                {selectedPlayer ? `SEND ${selectedPlayer.name} TO THE SIN BIN` : "SELECT SKATER // CROSS THE LINE"}
              </span>
              <small>
                {selectedPlayer
                  ? `+${selectedPlayer.sinPower} now · survive 2 shifts · +${selectedPlayer.returnPower} return`
                  : "Immediate overload · shorthanded survival · return trigger"}
              </small>
            </button>
            <button
              className="pause-action"
              disabled={!(["running", "paused"] as Phase[]).includes(game.phase)}
              onClick={togglePause}
            >
              {game.phase === "paused" ? "RESUME" : "PAUSE"}
            </button>
          </div>
        </section>

        <aside className="side-column">
          <section className={`sin-bin ${game.sinBin ? "occupied" : ""}`}>
            <div className="side-heading">
              <span>THE SIN BIN</span>
              <strong>
                {game.sinBin
                  ? `${game.sinBin.remaining} ${game.sinBin.remaining === 1 ? "SHIFT" : "SHIFTS"}`
                  : "EMPTY"}
              </strong>
            </div>
            {game.sinBin ? (
              <div className="bin-player">
                <span>{PLAYERS[game.sinBin.id].number}</span>
                <div>
                  <strong>{PLAYERS[game.sinBin.id].name}</strong>
                  <p>{game.sinBin.conceded ? "Damage taken. Return payoff halved." : "Survive and engineer the return."}</p>
                </div>
              </div>
            ) : (
              <p className="empty-copy">
                A penalty is an offensive overcharge followed by two exposed resolutions.
              </p>
            )}
          </section>

          <section className="live-feed">
            <div className="side-heading">
              <span>LIVE CALL</span>
              <strong>AUTO</strong>
            </div>
            <div className="feed-list" aria-live="polite">
              {game.feed.map((entry) => (
                <p className={`feed-entry ${entry.tone}`} key={entry.id}>
                  {entry.text}
                </p>
              ))}
            </div>
          </section>

          <section className="field-manual">
            <div className="side-heading">
              <span>FIELD MANUAL</span>
              <strong>01</strong>
            </div>
            <dl>
              <div><dt>R / C / F</dt><dd>Fit in Recover, Create, Finish.</dd></div>
              <div><dt>Clean relay</dt><dd>Natural fit, Bridge, Flex, or a Handoff exit.</dd></div>
              <div><dt>Gassed</dt><dd>Zero Energy sharply increases turnover danger.</dd></div>
              <div><dt>Penalty</dt><dd>Power now. Empty lane for two resolutions. Return payoff if you survive.</dd></div>
            </dl>
          </section>
        </aside>
      </div>

      {game.celebration && <div className="celebration" role="status">{game.celebration}</div>}

      {game.phase === "ended" && game.outcome && (
        <div className="result-backdrop">
          <section className={`result-card ${game.outcome.won ? "win" : "loss"}`}>
            <p className="eyebrow">LAB RESULT // {game.outcome.won ? "CHAIN HELD" : "CHAIN FAILED"}</p>
            <h2>{game.outcome.title}</h2>
            <p className="result-subtitle">{game.outcome.subtitle}</p>
            <div className="result-score">
              <strong>{game.goalsFor}</strong>
              <span>—</span>
              <strong>{game.goalsAgainst}</strong>
            </div>
            <div className="result-stats">
              <div><span>CLEAN CHANGES</span><strong>{game.stats.cleanChanges}/{game.stats.changes}</strong></div>
              <div><span>HIGH CHAIN</span><strong>×{game.maxCombo.toFixed(2)}</strong></div>
              <div><span>PENALTIES SURVIVED</span><strong>{game.stats.survivedPenalties}/{game.stats.penalties}</strong></div>
              <div><span>SAFE DUMPS</span><strong>{game.stats.dumps}</strong></div>
            </div>
            {!game.outcome.won && game.lastMistake && (
              <p className="regret-line"><b>THE REGRET:</b> {game.lastMistake}</p>
            )}
            <button className="primary-action" onClick={restart}>RUN THE SAME ROSTER BACK</button>
            <small className="same-seed">Same players. Same twelve disruptions. Try a different change pattern.</small>
          </section>
        </div>
      )}

      <footer>
        <span>SINBIN // LIVE SHIFT LAB v0.1</span>
        <span>RECTANGLES FIRST. FLUFF LATER.</span>
      </footer>
    </main>
  );
}
