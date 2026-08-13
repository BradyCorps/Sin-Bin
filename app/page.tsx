"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  CADENCES, PLAYERS, RECRUIT_OFFERS, RUN_RESOLUTIONS, SEQUENCES,
  advanceClock, createGame, diagnosis, diagnosisSummary, dumpAndChange, getDisruption,
  initialLineup, moveBenchSkater, recruitIntoLineup, selectSlot,
  startGame, substitute, takePenalty,
} from "./game-engine.mjs";

type RosterId = keyof typeof PLAYERS;
type SequenceId = keyof typeof SEQUENCES;
type CadenceId = keyof typeof CADENCES;
type Lineup = { active: string[]; bench: string[] };

const rosterCopy = {
  relay: { title: "RELAY", summary: "Frequent possession bridges and stable Chain." },
  overload: { title: "OVERLOAD", summary: "Explosive charged pairs and dangerous fatigue." },
};
const campaignSequences: SequenceId[] = ["vice", "chase", "static"];

function SkaterCard({ player, selected, onClick, label }: { player: (typeof PLAYERS)[RosterId][string]; selected?: boolean; onClick?: () => void; label?: string }) {
  return <button className={`recruit-card ${selected ? "chosen" : ""}`} onClick={onClick} style={{ "--accent": player.color } as CSSProperties}>
    <span className="label">{label ?? player.role}</span><strong>{player.name}</strong><small>{player.role} · {player.tags.join(" / ")}</small>
    <span className="fit-line">R{player.fit[0]} · C{player.fit[1]} · F{player.fit[2]} · ENERGY {player.energy}</span>
  </button>;
}

export default function Home() {
  const [conditions, setConditions] = useState<{ roster: RosterId; cadence: CadenceId; seed: number }>({ roster: "relay", cadence: "control", seed: 3 });
  const [gameNumber, setGameNumber] = useState(1);
  const [lineup, setLineup] = useState<Lineup>(() => initialLineup("relay"));
  const [game, setGame] = useState(() => createGame({ ...conditions, sequence: campaignSequences[0], lineup }));
  const [screen, setScreen] = useState<"game" | "recruit" | "complete">("game");
  const [chosenRecruit, setChosenRecruit] = useState<string | null>(null);
  const [releaseId, setReleaseId] = useState<string | null>(null);
  const [recruitConfirmed, setRecruitConfirmed] = useState(false);
  const [runHistory, setRunHistory] = useState<Array<{ game: number; result: "win" | "tie" | "loss"; diagnosis: string[]; recruit?: string; released?: string }>>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const players = PLAYERS[game.conditions.roster as RosterId];
  const disruption = getDisruption(game);
  const selected = game.selectedSlot === null ? null : game.active[game.selectedSlot];
  const selectedPlayer = selected ? players[selected] : null;
  const clockPercent = game.clockMs / CADENCES[game.conditions.cadence as CadenceId] * 100;

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    if (game.phase === "running") timer.current = setInterval(() => setGame((current) => advanceClock(current, 100)), 100);
    return () => { if (timer.current) clearInterval(timer.current); timer.current = null; };
  }, [game.phase, game.conditions.roster, game.conditions.sequence, game.conditions.cadence]);

  const recentCauses = useMemo(() => game.events.filter((event: { type: string }) => ["failure", "fatigue", "chain-break"].includes(event.type)).slice(-3).reverse(), [game.events]);
  const intermissionDiagnosis = diagnosisSummary(game);

  function resetCampaign(nextConditions = conditions) {
    const freshLineup = initialLineup(nextConditions.roster);
    setConditions(nextConditions); setGameNumber(1); setLineup(freshLineup); setScreen("game"); setChosenRecruit(null); setReleaseId(null); setRecruitConfirmed(false); setRunHistory([]);
    setGame(createGame({ ...nextConditions, sequence: campaignSequences[0], lineup: freshLineup }));
  }
  function changeCondition(key: "roster" | "cadence", value: string) { resetCampaign({ ...conditions, [key]: value } as typeof conditions); }
  function recordRun() {
    setRunHistory((history) => [...history, { game: gameNumber, result: game.outcome?.result ?? "loss", diagnosis: diagnosis(game) }]);
    if (gameNumber === 3) setScreen("complete"); else setScreen("recruit");
  }
  function confirmRecruit() {
    if (!chosenRecruit || !releaseId) return;
    const next = recruitIntoLineup(lineup, releaseId, chosenRecruit);
    setLineup(next); setRecruitConfirmed(true);
    setRunHistory((history) => history.map((run, index) => index === history.length - 1 ? { ...run, recruit: chosenRecruit, released: releaseId } : run));
  }
  function beginNextGame() {
    const nextNumber = gameNumber + 1; const nextSequence = campaignSequences[nextNumber - 1];
    setGameNumber(nextNumber); setChosenRecruit(null); setReleaseId(null); setRecruitConfirmed(false); setScreen("game");
    setGame(startGame(createGame({ ...conditions, sequence: nextSequence, lineup, recruitId: chosenRecruit, seed: conditions.seed + nextNumber - 1 })));
  }
  function replayGame() { setScreen("game"); setGame(startGame(createGame(game.conditions))); }

  return <main className="site-shell">
    <header className="masthead"><div><p className="eyebrow">SINBIN // MECHANIC TEST 03B</p><h1>THREE-GAME SHIFT</h1></div><div className="lab-thesis"><span>STABILIZATION</span><strong>Recruitment passed. Can the live loop resist generic play?</strong></div></header>

    {game.phase === "ready" && <section className="condition-panel" aria-label="Campaign conditions">
      <div><span className="label">STARTING MACHINE</span><div className="choice-grid two">{Object.entries(rosterCopy).map(([id, copy]) => <button key={id} className={conditions.roster === id ? "chosen" : ""} onClick={() => changeCondition("roster", id)}><strong>{copy.title}</strong><small>{copy.summary}</small></button>)}</div></div>
      <div><span className="label">CONTROLLED CADENCE</span><div className="choice-grid two">{Object.entries(CADENCES).map(([id, ms]) => <button key={id} className={conditions.cadence === id ? "chosen" : ""} onClick={() => changeCondition("cadence", id)}><strong>{ms / 1000} SECONDS</strong><small>{id === "control" ? "Quick control" : "Slower planning condition"}</small></button>)}</div></div>
      <p className="campaign-rule">Three games: The Vice → The Chase → Static Ice. Diagnose, recruit one face-up specialist, release one skater, order the bench, and operate the changed machine.</p>
      <button className="primary-action" onClick={() => setGame(startGame)}>START GAME 1 // {rosterCopy[conditions.roster].title}</button>
    </section>}

    <section className="campaign-ribbon"><span>GAME <b>{gameNumber}</b> / 3</span>{campaignSequences.map((id, index) => <i className={index + 1 === gameNumber ? "current" : index + 1 < gameNumber ? "done" : ""} key={id}>{SEQUENCES[id].name}</i>)}</section>
    <section className="score-ribbon" aria-label="Game status"><div className="score-team ours"><span>SINBIN</span><strong>{game.goalsFor}</strong></div><div className="shift-readout"><span>RESOLUTION</span><strong>{Math.min(game.resolution + 1, RUN_RESOLUTIONS)} / {RUN_RESOLUTIONS}</strong></div><div className="score-team theirs"><strong>{game.goalsAgainst}</strong><span>{SEQUENCES[game.conditions.sequence as SequenceId].name}</span></div></section>

    <div className="game-layout"><section className="play-column">
      <div className="meters-row"><div className="meter-block pressure-block"><div className="meter-label"><span>LIVE PRESSURE</span><strong>{Math.round(game.pressure)}</strong></div><div className="meter-track"><span style={{ width: `${Math.min(100, game.pressure)}%` }} /></div><small>100 = goal · bleeds continuously</small></div><div className="chain-block"><span>CHAIN</span><strong>×{game.chain.toFixed(2)}</strong><small>{game.conditions.roster === "relay" ? "Bridges grow it quickly" : "Charged pairs spend fatigue"}</small></div><div className="meter-block threat-block"><div className="meter-label"><span>COUNTER THREAT</span><strong>{Math.round(game.threat)}</strong></div><div className="meter-track"><span style={{ width: `${Math.min(100, game.threat)}%` }} /></div><small>100 = goal against</small></div></div>
      <div className="disruption-card"><div><span className="label">NEXT // {Math.min(game.resolution + 1, RUN_RESOLUTIONS)}</span><strong>{disruption.name}</strong></div><div className="disruption-demand"><span>DEFENSIBLE FUTURES</span><strong>{disruption.hint}</strong></div><div className="clock-wrap"><div className="clock-text"><span>NEXT RESOLUTION</span><strong>{game.phase === "ready" ? "—" : `${(game.clockMs / 1000).toFixed(1)}s`}</strong></div><div className="clock-track"><span style={{ width: `${game.phase === "ready" ? 100 : clockPercent}%` }} /></div></div></div>
      <section className="rink" aria-label="Active line"><div className="ice-label">ON THE ICE // {rosterCopy[game.conditions.roster as RosterId].title}</div><div className="active-line">{game.active.map((id: string | null, slot: number) => id ? <button key={id} disabled={game.phase !== "running"} aria-pressed={game.selectedSlot === slot} className={`player-card active-card ${game.selectedSlot === slot ? "selected" : ""}`} onClick={() => setGame((state) => selectSlot(state, slot))} style={{ "--accent": players[id].color } as CSSProperties}><span className="slot-kicker">{["RECOVER", "CREATE", "FINISH"][slot]}</span><div className="player-name-row"><strong>{players[id].name}</strong><small>{players[id].role}</small></div><div className="energy">{Array.from({ length: players[id].energy }, (_, i) => <span key={i} className={i < game.energy[id] ? "energy-pip filled" : "energy-pip"} />)}</div><span className="fit-line">R{players[id].fit[0]} · C{players[id].fit[1]} · F{players[id].fit[2]}</span><p>{players[id].tags.join(" · ").toUpperCase()}</p><span className="select-cue">{game.selectedSlot === slot ? "SELECTED" : "CLICK TO CHANGE"}</span></button> : <div className="player-card empty-slot" key={`empty-${slot}`}><strong>SHORT-HANDED</strong><small>{game.sinBin?.remaining} resolution(s) until return.</small></div>)}</div></section>
      <section className="bench-section"><div className="section-title-row"><div><span className="label">VISIBLE BENCH // ORDER PRESERVED</span><h2>{selectedPlayer ? `REPLACE ${selectedPlayer.name}` : "SELECT ONE ACTIVE SKATER"}</h2></div></div><div className="bench-grid bench-grid-2a">{game.bench.map((id: string, index: number) => { const p = players[id]; return <button key={id} disabled={game.phase !== "running" || game.selectedSlot === null} className="bench-card" onClick={() => setGame((state) => substitute(state, index))} style={{ "--accent": p.color } as CSSProperties}><span className="bench-topline"><b>{index + 1} · {p.role}</b><i>{p.tags.join(" / ")}</i></span><strong>{p.name}</strong><div className="energy">{Array.from({ length: p.energy }, (_, i) => <span key={i} className={i < game.energy[id] ? "energy-pip filled" : "energy-pip"} />)}</div><span className="fit-line">R{p.fit[0]} · C{p.fit[1]} · F{p.fit[2]}</span></button>; })}</div></section>
      <div className="action-deck action-deck-3b"><button className="secondary-action" disabled={game.phase !== "running" || game.dumpedThisResolution} onClick={() => setGame(dumpAndChange)}><span>{game.dumpedThisResolution ? "FULL CHANGE USED THIS RESOLUTION" : "DUMP & FULL CHANGE"}</span><small>Surrender up to 18 Pressure · reset Chain · clear 4 Threat · once per resolution</small></button><button className="danger-action" disabled={game.phase !== "running" || !selectedPlayer || Boolean(game.sinBin) || Boolean(selected && game.penaltiesUsed.includes(selected))} onClick={() => setGame(takePenalty)}><span>{selectedPlayer ? `SEND ${selectedPlayer.name} TO THE SIN BIN` : "SELECT SKATER // INTENTIONAL PENALTY"}</span><small>State-scaled overcharge · two exposed resolutions · return</small></button></div>
    </section><aside className="side-column"><section className={`sin-bin ${game.sinBin ? "occupied" : ""}`}><div className="side-heading"><span>THE SIN BIN</span><strong>{game.sinBin ? `${game.sinBin.remaining} LEFT` : "EMPTY"}</strong></div><p className="empty-copy">{game.sinBin ? `${players[game.sinBin.id].name}: ${game.sinBin.conceded ? "return payoff halved" : "survive for full return"}.` : "Immediate power, two short resolutions, return trigger."}</p></section><section className="live-feed"><div className="side-heading"><span>LIVE CAUSAL CALL</span><strong>AUTO</strong></div><div className="feed-list">{game.feed.map((text: string, index: number) => <p className="feed-entry" key={`${text}-${index}`}>{text}</p>)}</div></section><section className="field-manual"><div className="side-heading"><span>FAILURE CAUSES</span><strong>{recentCauses.length}</strong></div><div className="feed-list">{recentCauses.length ? recentCauses.map((event: { text: string }, index: number) => <p className="feed-entry bad" key={index}>{event.text}</p>) : <p className="empty-copy">Failures name the broken link here.</p>}</div></section></aside></div>

    {screen === "game" && game.phase === "ended" && <div className="result-backdrop"><section className={`result-card ${game.outcome?.result}`}><p className="eyebrow">GAME {gameNumber} DIAGNOSIS · {SEQUENCES[game.conditions.sequence as SequenceId].name}</p><h2>{game.outcome?.result === "win" ? "THE MACHINE WON" : game.outcome?.result === "tie" ? "THE MACHINE SURVIVED" : "THE PLAY CAME APART"}</h2><p className="result-subtitle">{game.outcome?.result === "tie" ? "The score finished level. Pressure and Threat remain diagnostic values, not a hidden tiebreaker." : game.outcome?.result === "win" ? "The machine finished ahead on goals." : "The opponent finished ahead on goals."}</p><div className="result-score"><strong>{game.goalsFor}</strong><span>—</span><strong>{game.goalsAgainst}</strong></div><div className="diagnosis-list">{diagnosis(game).map((line: string) => <p key={line}>{line}</p>)}</div><button className="primary-action" onClick={recordRun}>{gameNumber === 3 ? "COMPLETE THREE-GAME TEST" : "FACE THE RECRUITS"}</button><button className="text-action" onClick={replayGame}>Replay identical game</button></section></div>}

    {screen === "recruit" && <div className="result-backdrop"><section className="result-card recruit-screen"><p className="eyebrow">BETWEEN GAMES · DIAGNOSE → RECRUIT → RELEASE → ORDER</p><h2>WHAT WAS MISSING?</h2><div className="intermission-diagnosis"><span>PREVIOUS GAME DIAGNOSIS</span><p>{intermissionDiagnosis.failures}</p><p>{intermissionDiagnosis.lastBrokenLink}</p>{intermissionDiagnosis.recruitDeployment && <p>{intermissionDiagnosis.recruitDeployment}</p>}</div><p className="result-subtitle">Choose a mechanical future. There is no aggregate rating: compare fit, Energy capacity, and effects.</p><div className="recruit-grid">{RECRUIT_OFFERS[gameNumber - 1].map((id) => <SkaterCard key={id} player={players[id]} selected={chosenRecruit === id} onClick={recruitConfirmed ? undefined : () => setChosenRecruit(id)} label={id === RECRUIT_OFFERS[gameNumber - 1][0] ? "POSSESSION BRIDGE" : id === RECRUIT_OFFERS[gameNumber - 1][1] ? "STABILIZER" : "VOLATILE SPECIALIST"} />)}</div><span className="label intermission-label">RELEASE ONE CURRENT SKATER</span><div className="release-grid">{[...lineup.active, ...lineup.bench].map((id) => <button disabled={recruitConfirmed} className={releaseId === id ? "chosen" : ""} key={id} onClick={() => setReleaseId(id)}><strong>{players[id].name}</strong><small>{players[id].role} · ENERGY {players[id].energy}</small><small>R{players[id].fit[0]} · C{players[id].fit[1]} · F{players[id].fit[2]}</small><small>{players[id].tags.join(" / ")}</small></button>)}</div>{chosenRecruit && releaseId && !recruitConfirmed && <div className="tradeoff"><div><span>GAIN</span><strong>{players[chosenRecruit].name} · {players[chosenRecruit].role}</strong><small>Energy {players[chosenRecruit].energy} · {players[chosenRecruit].tags.join(" / ")}</small></div><b>↔</b><div><span>LOSE</span><strong>{players[releaseId].name} · {players[releaseId].role}</strong><small>Energy {players[releaseId].energy} · {players[releaseId].tags.join(" / ")}</small></div></div>}{!recruitConfirmed ? <button className="primary-action" disabled={!chosenRecruit || !releaseId} onClick={confirmRecruit}>CONFIRM TRADEOFF</button> : <><span className="label intermission-label">SET BENCH ORDER · EARLIER CARDS ARE EASIER TO FIND LIVE</span><div className="bench-order">{lineup.bench.map((id, index) => <div key={id}><b>{index + 1}</b><span><strong>{players[id].name}</strong><small>{players[id].role} · Energy {players[id].energy} · {players[id].tags.join(" / ")}</small></span><button disabled={index === 0} onClick={() => setLineup((current) => moveBenchSkater(current, index, -1))}>↑</button><button disabled={index === lineup.bench.length - 1} onClick={() => setLineup((current) => moveBenchSkater(current, index, 1))}>↓</button></div>)}</div><button className="primary-action" onClick={beginNextGame}>START GAME {gameNumber + 1} · {SEQUENCES[campaignSequences[gameNumber]].name}</button></>}</section></div>}

    {screen === "complete" && <div className="result-backdrop"><section className="result-card"><p className="eyebrow">LSL-3 · THREE-GAME DIAGNOSIS</p><h2>RUN COMPLETE</h2><div className="campaign-summary">{runHistory.map((run) => <div key={run.game}><strong>GAME {run.game} · {run.result.toUpperCase()}</strong>{run.diagnosis.slice(-2).map((line) => <p key={line}>{line}</p>)}<small>{run.recruit && run.released ? `Next move: recruited ${players[run.recruit].name}, released ${players[run.released].name}.` : "Final game."}</small></div>)}</div><button className="primary-action" onClick={() => resetCampaign()}>RUN A NEW THREE-GAME TEST</button></section></div>}
    <footer><span>SINBIN // LIVE SHIFT LAB 3B</span><span>STABILIZE THE MACHINE. ADD NOTHING ELSE.</span></footer>
  </main>;
}
