"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  CADENCES, PLAYERS, RUN_RESOLUTIONS, SEQUENCES, advanceClock, createGame,
  diagnosis, dumpAndChange, getDisruption, resolve, selectSlot, startGame,
  substitute, takePenalty,
} from "./game-engine.mjs";

type RosterId = keyof typeof PLAYERS;
type SequenceId = keyof typeof SEQUENCES;
type CadenceId = keyof typeof CADENCES;

const rosterCopy = {
  relay: { title: "RELAY", summary: "Rotate often. Handoffs and lower-output bridges preserve possession and steadily grow Chain." },
  overload: { title: "OVERLOAD", summary: "Keep charged pairs together for explosive output. Their short Energy makes removal and return timing dangerous." },
};

export default function Home() {
  const [conditions, setConditions] = useState<{ roster: RosterId; sequence: SequenceId; cadence: CadenceId; seed: number }>({ roster: "relay", sequence: "vice", cadence: "control", seed: 2 });
  const [game, setGame] = useState(() => createGame(conditions));
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const players = PLAYERS[game.conditions.roster as RosterId];
  const disruption = getDisruption(game);
  const selected = game.selectedSlot === null ? null : game.active[game.selectedSlot];
  const selectedPlayer = selected ? players[selected as keyof typeof players] : null;
  const clockPercent = game.clockMs / CADENCES[game.conditions.cadence as CadenceId] * 100;

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    if (game.phase === "running") timer.current = setInterval(() => setGame((current) => advanceClock(current, 100)), 100);
    return () => { if (timer.current) clearInterval(timer.current); timer.current = null; };
  }, [game.phase, game.conditions.roster, game.conditions.sequence, game.conditions.cadence]);

  const recentCauses = useMemo(() => game.events.filter((event: { type: string }) => ["failure", "fatigue", "chain-break"].includes(event.type)).slice(-3).reverse(), [game.events]);

  function changeCondition(key: "roster" | "sequence" | "cadence", value: string) {
    const next = { ...conditions, [key]: value } as typeof conditions;
    setConditions(next); setGame(createGame(next));
  }
  function replay() { setGame(createGame(game.conditions)); }

  return (
    <main className="site-shell">
      <header className="masthead"><div><p className="eyebrow">SINBIN // MECHANIC TEST 2A</p><h1>LIVE SHIFT LAB</h1></div><div className="lab-thesis"><span>THE TEST</span><strong>Can two different machines reward planning under pressure?</strong></div></header>

      {game.phase === "ready" && <section className="condition-panel" aria-label="Experiment conditions">
        <div><span className="label">STARTING ROSTER</span><div className="choice-grid two">{Object.entries(rosterCopy).map(([id, copy]) => <button key={id} className={conditions.roster === id ? "chosen" : ""} onClick={() => changeCondition("roster", id)}><strong>{copy.title}</strong><small>{copy.summary}</small></button>)}</div></div>
        <div><span className="label">OPPONENT SCRIPT</span><div className="choice-grid three">{Object.entries(SEQUENCES).map(([id, sequence]) => <button key={id} className={conditions.sequence === id ? "chosen" : ""} onClick={() => changeCondition("sequence", id)}><strong>{sequence.name}</strong><small>{sequence.description}</small></button>)}</div></div>
        <div><span className="label">RESOLUTION CADENCE</span><div className="choice-grid two cadence">{Object.entries(CADENCES).map(([id, ms]) => <button key={id} className={conditions.cadence === id ? "chosen" : ""} onClick={() => changeCondition("cadence", id)}><strong>{ms / 1000} SECONDS</strong><small>{id === "control" ? "Control pace" : "Slower planning condition"}</small></button>)}</div></div>
        <button className="primary-action" onClick={() => setGame((state) => startGame(state))}>DROP THE PUCK // {rosterCopy[conditions.roster].title}</button>
      </section>}

      <section className="score-ribbon" aria-label="Run status"><div className="score-team ours"><span>SINBIN</span><strong>{game.goalsFor}</strong></div><div className="shift-readout"><span>RESOLUTION</span><strong>{Math.min(game.resolution + 1, RUN_RESOLUTIONS)} / {RUN_RESOLUTIONS}</strong></div><div className="score-team theirs"><strong>{game.goalsAgainst}</strong><span>{SEQUENCES[game.conditions.sequence as SequenceId].name}</span></div></section>

      <div className="game-layout"><section className="play-column">
        <div className="meters-row"><div className="meter-block pressure-block"><div className="meter-label"><span>LIVE PRESSURE</span><strong>{Math.round(game.pressure)}</strong></div><div className="meter-track"><span style={{ width: `${Math.min(100, game.pressure)}%` }} /></div><small>100 = goal · bleeds continuously</small></div><div className="chain-block"><span>CHAIN</span><strong>×{game.chain.toFixed(2)}</strong><small>{game.conditions.roster === "relay" ? "Bridges grow it quickly" : "Charged pairs spend fatigue"}</small></div><div className="meter-block threat-block"><div className="meter-label"><span>COUNTER THREAT</span><strong>{Math.round(game.threat)}</strong></div><div className="meter-track"><span style={{ width: `${Math.min(100, game.threat)}%` }} /></div><small>100 = goal against</small></div></div>
        <div className="disruption-card"><div><span className="label">NEXT // {Math.min(game.resolution + 1, RUN_RESOLUTIONS)}</span><strong>{disruption.name}</strong></div><div className="disruption-demand"><span>DEFENSIBLE FUTURES</span><strong>{disruption.hint}</strong></div><div className="clock-wrap"><div className="clock-text"><span>NEXT RESOLUTION</span><strong>{game.phase === "ready" ? "—" : `${(game.clockMs / 1000).toFixed(1)}s`}</strong></div><div className="clock-track"><span style={{ width: `${game.phase === "ready" ? 100 : clockPercent}%` }} /></div></div></div>
        <section className="rink" aria-label="Active line"><div className="ice-label">ON THE ICE // {rosterCopy[game.conditions.roster as RosterId].title}</div><div className="active-line">{game.active.map((id: string | null, slot: number) => id ? <button key={id} disabled={game.phase !== "running"} aria-pressed={game.selectedSlot === slot} className={`player-card active-card ${game.selectedSlot === slot ? "selected" : ""}`} onClick={() => setGame((state) => selectSlot(state, slot))} style={{ "--accent": players[id as keyof typeof players].color } as CSSProperties}><span className="slot-kicker">{["RECOVER", "CREATE", "FINISH"][slot]}</span><div className="player-name-row"><strong>{players[id as keyof typeof players].name}</strong><small>{players[id as keyof typeof players].role}</small></div><div className="energy" aria-label={`${game.energy[id]} energy`}>{Array.from({ length: players[id as keyof typeof players].energy }, (_, i) => <span key={i} className={i < game.energy[id] ? "energy-pip filled" : "energy-pip"} />)}</div><span className="fit-line">R{players[id as keyof typeof players].fit[0]} · C{players[id as keyof typeof players].fit[1]} · F{players[id as keyof typeof players].fit[2]}</span><p>{players[id as keyof typeof players].tags.join(" · ").toUpperCase()}</p><span className="select-cue">{game.selectedSlot === slot ? "SELECTED" : "CLICK TO CHANGE"}</span></button> : <div className="player-card empty-slot" key={`empty-${slot}`}><span className="slot-kicker">{["RECOVER", "CREATE", "FINISH"][slot]}</span><strong>SHORT-HANDED</strong><small>{game.sinBin?.remaining} resolution(s) until return.</small></div>)}</div></section>
        <section className="bench-section"><div className="section-title-row"><div><span className="label">VISIBLE BENCH</span><h2>{selectedPlayer ? `REPLACE ${selectedPlayer.name}` : "SELECT ONE ACTIVE SKATER"}</h2></div><span className="bench-note">One-skater live changes. Bench Energy recovers.</span></div><div className="bench-grid bench-grid-2a">{game.bench.map((id: string, index: number) => { const p = players[id as keyof typeof players]; return <button key={id} disabled={game.phase !== "running" || game.selectedSlot === null} className="bench-card" onClick={() => setGame((state) => substitute(state, index))} style={{ "--accent": p.color } as CSSProperties}><span className="bench-topline"><b>{p.role}</b><i>{p.tags.join(" / ")}</i></span><strong>{p.name}</strong><div className="energy">{Array.from({ length: p.energy }, (_, i) => <span key={i} className={i < game.energy[id] ? "energy-pip filled" : "energy-pip"} />)}</div><span className="fit-line">R{p.fit[0]} · C{p.fit[1]} · F{p.fit[2]}</span></button>; })}</div></section>
        <div className="action-deck"><button className="secondary-action" disabled={game.phase !== "running"} onClick={() => setGame(dumpAndChange)}><span>DUMP &amp; FULL CHANGE</span><small>Surrender up to 18 Pressure · reset Chain · clear 8 Threat</small></button><button className="danger-action" disabled={game.phase !== "running" || !selectedPlayer || Boolean(game.sinBin) || Boolean(selected && game.penaltiesUsed.includes(selected))} onClick={() => setGame(takePenalty)}><span>{selectedPlayer ? `SEND ${selectedPlayer.name} TO THE SIN BIN` : "SELECT SKATER // INTENTIONAL PENALTY"}</span><small>{selectedPlayer ? `+${selectedPlayer.penalty} now · two exposed resolutions · +${selectedPlayer.returned} return` : "State-dependent overcharge, disadvantage, return"}</small></button><button className="pause-action" disabled={game.phase !== "running"} onClick={() => setGame(resolve)}>RESOLVE NOW</button></div>
      </section><aside className="side-column"><section className={`sin-bin ${game.sinBin ? "occupied" : ""}`}><div className="side-heading"><span>THE SIN BIN</span><strong>{game.sinBin ? `${game.sinBin.remaining} LEFT` : "EMPTY"}</strong></div><p className="empty-copy">{game.sinBin ? `${players[game.sinBin.id as keyof typeof players].name}: ${game.sinBin.conceded ? "return payoff halved" : "survive for full return trigger"}.` : "Overcharge now, play short for exactly two resolutions, then trigger a return."}</p></section><section className="live-feed"><div className="side-heading"><span>LIVE CAUSAL CALL</span><strong>AUTO</strong></div><div className="feed-list" aria-live="polite">{game.feed.map((text: string, index: number) => <p className="feed-entry" key={`${text}-${index}`}>{text}</p>)}</div></section><section className="field-manual"><div className="side-heading"><span>FAILURE CAUSES</span><strong>{recentCauses.length}</strong></div><div className="feed-list">{recentCauses.length ? recentCauses.map((event: { text: string }, index: number) => <p className="feed-entry bad" key={index}>{event.text}</p>) : <p className="empty-copy">Resolved failures will name the broken link and values here.</p>}</div></section></aside></div>

      {game.phase === "ended" && <div className="result-backdrop"><section className={`result-card ${game.outcome?.won ? "win" : "loss"}`}><p className="eyebrow">2A RUN DIAGNOSIS // {rosterCopy[game.conditions.roster as RosterId].title} · {SEQUENCES[game.conditions.sequence as SequenceId].name} · {CADENCES[game.conditions.cadence as CadenceId] / 1000}s</p><h2>{game.outcome?.won ? "THE MACHINE HELD" : "THE PLAY CAME APART"}</h2><div className="result-score"><strong>{game.goalsFor}</strong><span>—</span><strong>{game.goalsAgainst}</strong></div><div className="diagnosis-list">{diagnosis(game).map((line: string) => <p key={line}>{line}</p>)}</div><button className="primary-action" onClick={replay}>REPLAY IDENTICAL CONDITIONS</button><button className="text-action" onClick={() => setGame(createGame(conditions))}>CHANGE CONDITIONS</button><small className="same-seed">Same roster · same sequence · same cadence · seed {game.conditions.seed}</small></section></div>}
      <footer><span>SINBIN // LIVE SHIFT LAB 2A</span><span>RECTANGLES FIRST. MECHANICAL DEPTH ONLY.</span></footer>
    </main>
  );
}
