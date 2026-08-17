"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import {
  CADENCES, PLAYERS, RECRUIT_OFFERS, RUN_RESOLUTIONS, SEQUENCES,
  advanceClock, createGame, diagnosis, diagnosisSummary, dumpAndChange, getDisruption,
  getSubstitutionPreview, initialLineup, moveBenchSkater, recruitIntoLineup, selectSlot,
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
  const [selectedBench, setSelectedBench] = useState<number | null>(null);
  const [previewResolution, setPreviewResolution] = useState(0);
  const [penaltyMode, setPenaltyMode] = useState(false);
  const [paused, setPaused] = useState(false);
  const [comparisonFixture, setComparisonFixture] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const players = PLAYERS[game.conditions.roster as RosterId];
  const disruption = getDisruption(game);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    if (game.phase === "running" && !paused && !comparisonFixture) timer.current = setInterval(() => {
      if (!document.hidden && !window.matchMedia("(orientation: portrait)").matches) setGame((current) => advanceClock(current, 100));
    }, 100);
    return () => { if (timer.current) clearInterval(timer.current); timer.current = null; };
  }, [game.phase, game.conditions.roster, game.conditions.sequence, game.conditions.cadence, paused, comparisonFixture]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("fixture") !== "violetta-preview") return;
    const fixtureTimer = window.setTimeout(() => {
      const fixtureLineup = { active: ["nyx", "lux", "sabine"], bench: ["halley", "orla", "rook"] };
      const fixture = startGame(createGame({ roster: "overload", sequence: "vice", cadence: "control", seed: 3, lineup: fixtureLineup }));
      Object.assign(fixture, { pressure: 63, chain: 2.34, threat: 41, clockMs: 3400, resolution: 0, goalsFor: 1 });
      setConditions({ roster: "overload", cadence: "control", seed: 3 });
      setLineup(fixtureLineup);
      setGame(fixture);
      setPreviewResolution(0);
      setSelectedBench(0);
      setComparisonFixture(true);
    }, 0);
    return () => window.clearTimeout(fixtureTimer);
  }, []);

  useEffect(() => {
    const obscure = () => { if (document.hidden || window.matchMedia("(orientation: portrait)").matches) setPaused(true); };
    document.addEventListener("visibilitychange", obscure); window.addEventListener("orientationchange", obscure);
    return () => { document.removeEventListener("visibilitychange", obscure); window.removeEventListener("orientationchange", obscure); };
  }, []);

  const intermissionDiagnosis = diagnosisSummary(game);
  const benchPreview = previewResolution === game.resolution && !game.windowDecision ? selectedBench : null;
  const penaltyPreview = previewResolution === game.resolution && !game.windowDecision && penaltyMode;

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
  function chooseBench(index: number) {
    if (game.phase !== "running" || game.windowDecision) return;
    setPreviewResolution(game.resolution); setPenaltyMode(false); setSelectedBench((current) => current === index && previewResolution === game.resolution ? null : index);
  }
  function chooseDestination(slot: number) {
    if (game.phase !== "running" || game.windowDecision || !game.active[slot]) return;
    if (benchPreview !== null) {
      setGame((state) => substitute(selectSlot(state, slot), benchPreview)); setSelectedBench(null); return;
    }
    if (penaltyPreview) {
      setGame((state) => takePenalty(selectSlot(state, slot))); setPenaltyMode(false);
    }
  }

  return <main className={`site-shell ${screen === "game" ? "match-mode" : ""}`}>
    <header className="masthead"><div><p className="eyebrow">SINBIN // MECHANIC TEST 03B</p><h1>THREE-GAME SHIFT</h1></div><div className="lab-thesis"><span>STABILIZATION</span><strong>Recruitment passed. Can the live loop resist generic play?</strong></div></header>

    {game.phase === "ready" && !comparisonFixture && <div className="match-setup-backdrop"><section className="condition-panel match-setup" role="dialog" aria-modal="true" aria-labelledby="match-setup-title">
      <header><span>SINBIN · LIVE SHIFT</span><h2 id="match-setup-title">LOCK IN THE MACHINE</h2><p>Choose the line identity and decision cadence before the clock starts.</p></header>
      <div><span className="label">STARTING MACHINE</span><div className="choice-grid two">{Object.entries(rosterCopy).map(([id, copy]) => <button key={id} className={conditions.roster === id ? "chosen" : ""} onClick={() => changeCondition("roster", id)}><strong>{copy.title}</strong><small>{copy.summary}</small><i>{conditions.roster === id ? "SELECTED" : "SELECT"}</i></button>)}</div></div>
      <div><span className="label">RESOLUTION CADENCE</span><div className="choice-grid two">{Object.entries(CADENCES).map(([id, ms]) => <button key={id} className={conditions.cadence === id ? "chosen" : ""} onClick={() => changeCondition("cadence", id)}><strong>{ms / 1000} SECONDS</strong><small>{id === "control" ? "Fast control condition" : "Slower planning condition"}</small><i>{conditions.cadence === id ? "SELECTED" : "SELECT"}</i></button>)}</div></div>
      <p className="campaign-rule">THE VICE → THE CHASE → STATIC ICE · FIRST TO 3 · 12 RESOLUTIONS</p>
      <button className="primary-action" onClick={() => setGame(startGame)}>START GAME 1 · {rosterCopy[conditions.roster].title} · {CADENCES[conditions.cadence] / 1000} SEC</button>
    </section></div>}

    <div className="match-viewport"><section className={`match-stage ${comparisonFixture ? "comparison-fixture" : ""}`} aria-label="Live match">
      <header className="match-rail">
        <div className="team-panel home"><span>SIN BIN</span><small>HOME · FIRST TO 3</small><strong>{game.goalsFor}</strong></div>
        <div className="resolution-panel"><span>RESOLUTION</span><strong>{String(comparisonFixture ? 4 : Math.min(game.resolution + 1, RUN_RESOLUTIONS)).padStart(2, "0")} <small>/ {RUN_RESOLUTIONS}</small></strong><i>{CADENCES[game.conditions.cadence as CadenceId] / 1000} SEC</i></div>
        <div className="team-panel visitor"><span>{SEQUENCES[game.conditions.sequence as SequenceId].name}</span><small>VISITOR · GAME {gameNumber}/3</small><strong>{game.goalsAgainst}</strong></div>
        <div className="crt-panel" aria-label="Atmospheric live feed"><span>LIVE FEED</span><div><i /><i /><i /></div><small>{game.feed[0]}</small></div>
        <button className="stage-pause" onClick={() => setPaused(true)} aria-label="Pause match">Ⅱ<span>PAUSE</span></button>
      </header>

      <div className="stage-status">
        <div className="stage-meter pressure"><span>PRESSURE</span><strong>{Math.round(game.pressure)}</strong><div><i style={{ width: `${Math.min(100, game.pressure)}%` }} /></div></div>
        <div className="stage-chain"><span>CHAIN</span><strong>×{game.chain.toFixed(2)}</strong><div>○—○—○</div></div>
        <div className="stage-meter threat"><span>THREAT</span><strong>{Math.round(game.threat)}</strong><div><i style={{ width: `${Math.min(100, game.threat)}%` }} /></div></div>
        <div className="stage-disruption"><span>NEXT {String(comparisonFixture ? 4 : Math.min(game.resolution + 1, RUN_RESOLUTIONS)).padStart(2, "0")}</span><strong>{disruption.name}</strong><small>{disruption.hint}</small><b>{game.phase === "ready" ? "—" : `${(game.clockMs / 1000).toFixed(1)}s`}</b></div>
      </div>

      <div className="stage-active">
        {game.active.map((id: string | null, slot: number) => {
          if (!id) return <div className="stage-skater shorthanded" key={`empty-${slot}`}><span>{["RECOVER", "CREATE", "FINISH"][slot]}</span><strong>SHORT-HANDED</strong><small>{game.sinBin?.remaining} RES UNTIL RETURN</small></div>;
          const p = players[id]; const enginePreview = benchPreview === null ? null : getSubstitutionPreview(game, benchPreview, slot);
          const preview = comparisonFixture && benchPreview !== null ? { kind: ["direct", "bridge", "break"][slot] } : enginePreview;
          const eligiblePenalty = penaltyPreview && !game.penaltiesUsed.includes(id) && !game.sinBin;
          return <button key={id} onClick={() => chooseDestination(slot)} disabled={game.phase !== "running" || Boolean(game.windowDecision) || (benchPreview === null && !penaltyPreview)} className={`stage-skater ${preview?.kind ?? ""} ${eligiblePenalty ? "penalty-target" : ""}`} style={{ "--accent": p.color } as CSSProperties}>
            <span>{["RECOVER", "CREATE", "FINISH"][slot]} <b>{preview ? preview.kind === "direct" ? "DIRECT ✓" : preview.kind === "bridge" ? "BRIDGE ∞" : "BREAKS CHAIN ×" : eligiblePenalty ? "OVERCHARGE" : ""}</b></span>
            <div className={`portrait-frame portrait-${slot}`} aria-hidden="true"><span className="portrait-silhouette" /><small>{preview?.kind === "direct" ? "ABSORBS THE ENTRY" : preview?.kind === "bridge" ? "RELAY WINDOW OPEN" : preview?.kind === "break" ? "CREATE → FINISH LOST" : p.role.toUpperCase()}</small></div>
            <footer><strong>{p.name} {comparisonFixture && id === "nyx" ? <em>#8</em> : ""}</strong><small>ENERGY {comparisonFixture ? ["7 / 9", "5 / 8", "6 / 8"][slot] : `${game.energy[id]} / ${p.energy}`}</small><div className="stage-energy">{Array.from({ length: comparisonFixture ? [9, 8, 8][slot] : p.energy }, (_, i) => <i key={i} className={i < (comparisonFixture ? [7, 5, 6][slot] : game.energy[id]) ? "filled" : ""} />)}</div></footer>
          </button>;
        })}
      </div>

      <div className="causal-chip">{game.windowDecision ? `DECISION COMMITTED · ${game.windowDecision.toUpperCase()}` : benchPreview !== null ? `${comparisonFixture ? "VIOLETTA" : players[game.bench[benchPreview]].name} IN · CHOOSE DESTINATION` : penaltyPreview ? "SIN BIN · CHOOSE ACTIVE SKATER" : game.feed[0]}</div>

      <div className="stage-lower">
        <section className="stage-bench"><h2>BENCH · INCOMING FIRST</h2><div>{game.bench.map((id: string, index: number) => { const p = players[id]; const isVioletta = comparisonFixture && index === 0; return <button key={id} onClick={() => chooseBench(index)} disabled={game.phase !== "running" || Boolean(game.windowDecision)} className={`${benchPreview === index ? "selected" : ""} ${isVioletta ? "violetta-card" : ""}`} style={{ "--accent": p.color } as CSSProperties}>{isVioletta ? <Image src="/assets/characters/violetta/violetta-live-card-placeholder-v1.png" alt="Violetta, player 57" width={60} height={73} unoptimized /> : <i aria-hidden="true"><span /></i>}<span><small>{benchPreview === index ? "SELECTED" : p.role.toUpperCase()}</small><strong>{isVioletta ? "VIOLETTA" : p.name}</strong><b>{isVioletta ? "BRIDGE · FLEX" : p.tags.slice(0, 2).join(" · ").toUpperCase()}</b><em>ENERGY {isVioletta ? "8 / 8" : `${game.energy[id]} / ${p.energy}`}</em></span></button>; })}</div></section>
        <section className="stage-actions"><button disabled={game.phase !== "running" || Boolean(game.windowDecision)} onClick={() => { setSelectedBench(null); setPenaltyMode(false); setGame(dumpAndChange); }}><strong>DUMP &<br/>FULL CHANGE</strong><small>SURRENDER PRESSURE<br/>RESET CHAIN · +THREAT</small></button><button className={penaltyPreview ? "selected" : ""} disabled={game.phase !== "running" || Boolean(game.windowDecision) || Boolean(game.sinBin)} onClick={() => { setPreviewResolution(game.resolution); setSelectedBench(null); setPenaltyMode((value) => previewResolution === game.resolution ? !value : true); }}><strong>SIN BIN</strong><small>{game.sinBin ? `${game.sinBin.remaining} RES LEFT` : "OVERCHARGE\n2 RES EXPOSURE"}</small></button></section>
      </div>

      {paused && <div className="stage-obscure"><strong>PAUSED</strong><small>Tactical state obscured</small><button onClick={() => setPaused(false)}>RESUME</button></div>}
    </section></div>

    {screen === "game" && game.phase === "ended" && <div className="result-backdrop"><section className={`result-card ${game.outcome?.result}`}><p className="eyebrow">GAME {gameNumber} DIAGNOSIS · {SEQUENCES[game.conditions.sequence as SequenceId].name}</p><h2>{game.outcome?.result === "win" ? "THE MACHINE WON" : game.outcome?.result === "tie" ? "THE MACHINE SURVIVED" : "THE PLAY CAME APART"}</h2><p className="result-subtitle">{game.outcome?.result === "tie" ? "The score finished level. Pressure and Threat remain diagnostic values, not a hidden tiebreaker." : game.outcome?.result === "win" ? "The machine finished ahead on goals." : "The opponent finished ahead on goals."}</p><div className="result-score"><strong>{game.goalsFor}</strong><span>—</span><strong>{game.goalsAgainst}</strong></div><div className="diagnosis-list">{diagnosis(game).map((line: string) => <p key={line}>{line}</p>)}</div><button className="primary-action" onClick={recordRun}>{gameNumber === 3 ? "COMPLETE THREE-GAME TEST" : "FACE THE RECRUITS"}</button><button className="text-action" onClick={replayGame}>Replay identical game</button></section></div>}

    {screen === "recruit" && <div className="result-backdrop"><section className="result-card recruit-screen"><p className="eyebrow">BETWEEN GAMES · DIAGNOSE → RECRUIT → RELEASE → ORDER</p><h2>WHAT WAS MISSING?</h2><div className="intermission-diagnosis"><span>PREVIOUS GAME DIAGNOSIS</span><p>{intermissionDiagnosis.failures}</p><p>{intermissionDiagnosis.lastBrokenLink}</p>{intermissionDiagnosis.recruitDeployment && <p>{intermissionDiagnosis.recruitDeployment}</p>}</div><p className="result-subtitle">Choose a mechanical future. There is no aggregate rating: compare fit, Energy capacity, and effects.</p><div className="recruit-grid">{RECRUIT_OFFERS[gameNumber - 1].map((id) => <SkaterCard key={id} player={players[id]} selected={chosenRecruit === id} onClick={recruitConfirmed ? undefined : () => setChosenRecruit(id)} label={id === RECRUIT_OFFERS[gameNumber - 1][0] ? "POSSESSION BRIDGE" : id === RECRUIT_OFFERS[gameNumber - 1][1] ? "STABILIZER" : "VOLATILE SPECIALIST"} />)}</div><span className="label intermission-label">RELEASE ONE CURRENT SKATER</span><div className="release-grid">{[...lineup.active, ...lineup.bench].map((id) => <button disabled={recruitConfirmed} className={releaseId === id ? "chosen" : ""} key={id} onClick={() => setReleaseId(id)}><strong>{players[id].name}</strong><small>{players[id].role} · ENERGY {players[id].energy}</small><small>R{players[id].fit[0]} · C{players[id].fit[1]} · F{players[id].fit[2]}</small><small>{players[id].tags.join(" / ")}</small></button>)}</div>{chosenRecruit && releaseId && !recruitConfirmed && <div className="tradeoff"><div><span>GAIN</span><strong>{players[chosenRecruit].name} · {players[chosenRecruit].role}</strong><small>Energy {players[chosenRecruit].energy} · {players[chosenRecruit].tags.join(" / ")}</small></div><b>↔</b><div><span>LOSE</span><strong>{players[releaseId].name} · {players[releaseId].role}</strong><small>Energy {players[releaseId].energy} · {players[releaseId].tags.join(" / ")}</small></div></div>}{!recruitConfirmed ? <button className="primary-action" disabled={!chosenRecruit || !releaseId} onClick={confirmRecruit}>CONFIRM TRADEOFF</button> : <><span className="label intermission-label">SET BENCH ORDER · EARLIER CARDS ARE EASIER TO FIND LIVE</span><div className="bench-order">{lineup.bench.map((id, index) => <div key={id}><b>{index + 1}</b><span><strong>{players[id].name}</strong><small>{players[id].role} · Energy {players[id].energy} · {players[id].tags.join(" / ")}</small></span><button disabled={index === 0} onClick={() => setLineup((current) => moveBenchSkater(current, index, -1))}>↑</button><button disabled={index === lineup.bench.length - 1} onClick={() => setLineup((current) => moveBenchSkater(current, index, 1))}>↓</button></div>)}</div><button className="primary-action" onClick={beginNextGame}>START GAME {gameNumber + 1} · {SEQUENCES[campaignSequences[gameNumber]].name}</button></>}</section></div>}

    {screen === "complete" && <div className="result-backdrop"><section className="result-card"><p className="eyebrow">LSL-3B · THREE-GAME DIAGNOSIS</p><h2>RUN COMPLETE</h2><div className="campaign-summary">{runHistory.map((run) => <div key={run.game}><strong>GAME {run.game} · {run.result.toUpperCase()}</strong><p>{run.diagnosis[1]}</p>{run.diagnosis.find((line) => line.startsWith("Recruited ")) && <p>{run.diagnosis.find((line) => line.startsWith("Recruited "))}</p>}<p>{run.diagnosis.at(-1)}</p><small>{run.recruit && run.released ? `Next move: recruited ${players[run.recruit].name}, released ${players[run.released].name}.` : "Final game."}</small></div>)}</div><button className="primary-action" onClick={() => resetCampaign()}>RUN A NEW THREE-GAME TEST</button></section></div>}
    <footer><span>SINBIN // LIVE SHIFT LAB 3B</span><span>STABILIZE THE MACHINE. ADD NOTHING ELSE.</span></footer>
  </main>;
}
