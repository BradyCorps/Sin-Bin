import type { CSSProperties, ReactNode } from "react";
import { StageScaler } from "./StageScaler";

export type PreviewKind = "direct" | "bridge" | "break";

const VIOLETTA_PORTRAIT = "/assets/characters/violetta/violetta-live-card-placeholder-v1.png";

export function ActiveCard({ role, name, number, energy, maximum, preview, caption }: { role: string; name: string; number?: number; energy: number; maximum: number; preview: PreviewKind; caption: string }) {
  const previewLabel = preview === "direct" ? "DIRECT ✓" : preview === "bridge" ? "BRIDGE ∞" : "BREAKS CHAIN ×";
  return <button className={`sb-active-card ${preview}`} type="button">
    <span className="sb-card-rail"><b>{role}</b><em>{previewLabel}</em></span>
    <span className="sb-active-portrait" aria-hidden="true"><i /><small>{caption}</small></span>
    <span className="sb-card-footer"><strong>{name} {number && <small>#{number}</small>}</strong><em>ENERGY {energy} / {maximum}</em><span>{Array.from({ length: maximum }, (_, index) => <i className={index < energy ? "filled" : ""} key={index} />)}</span></span>
  </button>;
}

export function BenchCard({ name = "VIOLETTA", selected = true, portrait = VIOLETTA_PORTRAIT }: { name?: string; selected?: boolean; portrait?: string }) {
  return <button className={`sb-bench-card ${selected ? "selected" : ""}`} type="button">
    {/* A native image keeps this shared Storybook/app primitive framework-neutral. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={portrait} alt={`${name}, player 57`} />
    <span><small>{selected ? "SELECTED" : "FLEX"}</small><strong>{name}</strong><b>BRIDGE · FLEX</b><em>ENERGY 8 / 8</em></span>
  </button>;
}

export function DisruptionPanel() {
  return <section className="sb-disruption material-cream-enamel"><span>NEXT 04</span><strong>HIGH FORECHECK</strong><small>ABSORB · OUTRUN · SPEND CHAIN</small><b>3.4<em>s</em></b></section>;
}

export function CausalCall({ children = "VIOLETTA IN · CHOOSE DESTINATION" }: { children?: ReactNode }) {
  return <div className="sb-causal material-printed-paper">{children}</div>;
}

export function ActionCard({ kind = "dump" }: { kind?: "dump" | "sinbin" }) {
  return <button type="button" className={`sb-action ${kind === "sinbin" ? "sinbin" : "dump"}`}><strong>{kind === "sinbin" ? "SIN BIN" : <>DUMP &<br />FULL CHANGE</>}</strong><small>{kind === "sinbin" ? <>OVERCHARGE<br />2 RES EXPOSURE</> : <>SURRENDER PRESSURE<br />RESET CHAIN · +THREAT</>}</small></button>;
}

function Meter({ label, value, tone }: { label: string; value: string; tone: "blue" | "amber" | "red" }) {
  return <div className={`sb-meter ${tone} material-cream-enamel`}><span>{label}</span><strong>{value}</strong>{label !== "CHAIN" && <i><b style={{ width: label === "PRESSURE" ? "63%" : "41%" }} /></i>}</div>;
}

function StandinBench({ name }: { name: string }) {
  return <button type="button" className="sb-bench-card"><i className="sb-neutral-portrait" aria-hidden="true" /><span><small>BENCH</small><strong>{name}</strong><b>ROLE · EFFECT</b><em>ENERGY 7 / 8</em></span></button>;
}

export function CanonicalLiveMatch() {
  return <StageScaler className="sinbin-story-viewport"><section className="sinbin-stage material-dark-wood" aria-label="Canonical Violetta substitution preview">
    <header className="sb-toprail">
      <div className="sb-team home material-copper-red"><span>SINBIN</span><strong>1</strong><small>HOME · FIRST TO 3</small></div>
      <div className="sb-resolution material-cream-enamel"><span>RESOLUTION</span><strong>04 <small>/ 12</small></strong><i>5 SEC</i></div>
      <div className="sb-team away material-rink-blue"><span>THE VICE</span><strong>0</strong><small>VISITOR · FORECHECK</small></div>
      <div className="sb-crt material-crt-glass"><span>LIVE FEED · THE VICE COLLAPSES HIGH</span></div>
      <button type="button" className="sb-pause material-navy-metal" aria-label="Pause">Ⅱ<small>PAUSE</small></button>
    </header>
    <div className="sb-status"><Meter label="PRESSURE" value="63" tone="blue" /><Meter label="CHAIN" value="×2.34" tone="amber" /><Meter label="THREAT" value="41" tone="red" /><DisruptionPanel /></div>
    <div className="sb-active"><ActiveCard role="RECOVER" name="NYX" number={8} energy={7} maximum={9} preview="direct" caption="ABSORBS THE ENTRY" /><ActiveCard role="CREATE" name="SABLE" energy={5} maximum={8} preview="bridge" caption="RELAY WINDOW OPEN" /><ActiveCard role="FINISH" name="LISEL" energy={6} maximum={8} preview="break" caption="CREATE → FINISH LOST" /></div>
    <CausalCall />
    <section className="sb-bench material-navy-metal"><h2>BENCH · INCOMING FIRST</h2><div><BenchCard /><StandinBench name="ORLA" /><StandinBench name="ROOK" /></div></section>
    <section className="sb-actions"><ActionCard /><ActionCard kind="sinbin" /></section>
  </section></StageScaler>;
}

export const isolatedStoryStyle = { width: 306, height: 142, "--sinbin-isolated": 1 } as CSSProperties;
