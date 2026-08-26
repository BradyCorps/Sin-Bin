import { StageScaler } from "./StageScaler";
import { SelectedViolettaBenchCard } from "./BenchCardSkin";
import "./canonical-fixture.css";

type LinkKind = "direct" | "bridge" | "break";

function ConnectionMark({ kind }: { kind: LinkKind }) {
  if (kind === "direct") return <svg viewBox="0 0 88 42" role="img" aria-label="Solid directional handoff">
    <path className="connection-glow" d="M5 12h45V4l31 17-31 17v-8H5z" />
    <path d="M5 12h45V4l31 17-31 17v-8H5z" />
  </svg>;
  if (kind === "bridge") return <svg viewBox="0 0 104 42" role="img" aria-label="Interlocking bridge link">
    <path className="ice-link" d="M7 21 20 8h22l12 13-12 13H20z" />
    <path className="copper-link" d="M36 21 49 8h22l12 13-12 13H49z" />
    <path className="handoff" d="M75 14h12V7l12 14-12 14v-7H75" />
  </svg>;
  return <svg viewBox="0 0 104 42" role="img" aria-label="Broken red causal link">
    <path d="M7 21 20 8h22l9 10M50 24l-8 10H20zM59 8h12l10 10M80 25l-9 9H59l-8-9" />
    <path className="break-slash" d="m51 10-7 9 10 3-8 10" />
    <path className="handoff" d="M76 14h11V7l12 14-12 14v-7H76" />
  </svg>;
}

function ProductionArtPlaceholder({ name, compact = false }: { name: string; compact?: boolean }) {
  return <div className={`cf-production-placeholder${compact ? " compact" : ""}`} role="img" aria-label={`${name} production portrait placeholder`}>
    <span>PRODUCTION</span><b>ART PENDING</b>
  </div>;
}

function CanonicalActiveCard({ role, name, number, energy, maximum, kind, caption, portrait }: { role: string; name: string; number: number; energy: number; maximum: number; kind: LinkKind; caption: string; portrait?: { src: string; alt: string } }) {
  const label = kind === "direct" ? "DIRECT ✓" : kind === "bridge" ? "BRIDGE ∞" : "BREAKS CHAIN ×";
  return <article className={`cf-active-card ${kind}`} aria-label={`${role}: ${name}, ${label}`}>
    <header><strong>{role}</strong><span>{label}</span></header>
    <div className={`cf-art-window ${portrait ? "has-portrait" : "portrait-pending"}`}>
      <div className="cf-eye-line" aria-hidden="true" />
      <ConnectionMark kind={kind} />
      {/* The story primitive needs a framework-neutral native image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {portrait ? <img className="cf-active-portrait" src={portrait.src} alt={portrait.alt} /> : <ProductionArtPlaceholder name={name} />}
      <small>{caption}</small>
    </div>
    <footer><strong>{name} <small>#{number}</small></strong><span>ENERGY {energy}/{maximum}</span><div>{Array.from({ length: maximum }, (_, index) => <i className={index < energy ? "filled" : ""} key={index} />)}</div></footer>
  </article>;
}

function Meter({ label, value, fill, tone }: { label: string; value: string; fill?: string; tone: "ice" | "amber" | "copper" }) {
  return <div className={`cf-meter ${tone} material-cream-enamel`}><span>{label}</span><strong>{value}</strong>{fill && <i><b style={{ width: fill }} /></i>}{label === "CHAIN" && <div className="cf-chain-mini"><i /><i /><i /></div>}</div>;
}

function BenchChoice({ name }: { name: string }) {
  return <div className="cf-bench-choice unavailable"><ProductionArtPlaceholder name={name} compact/><span><small>BENCH</small><strong>{name}</strong><b>ROLE · EFFECT</b><em>ENERGY 7/8</em></span></div>;
}

function ViolettaChoice() {
  return <div className="cf-approved-violetta-slot">
    <SelectedViolettaBenchCard
      selected
      currentEnergy={8}
      maximumEnergy={8}
      playerName="VIOLETTA"
      rolePrimary="BRIDGE"
      roleSecondary="FLEX"
    />
  </div>;
}

function HockeyFreezeFrame() {
  return <div className="cf-crt material-crt-glass" role="img" aria-label="Static hockey freeze-frame">
    <svg viewBox="0 0 350 56" aria-hidden="true">
      <path className="rink" d="M4 13c45-8 97-11 171-11s126 3 171 11v30c-45 8-97 11-171 11S49 51 4 43z" />
      <path className="rink-line" d="M27 28h296M175 4v48M52 13v30M298 13v30" />
      <circle className="rink-line" cx="175" cy="28" r="9" />
      <g className="skater one"><circle cx="148" cy="17" r="3"/><path d="m147 20-5 11 9 8m-6-12-10 1m13 2 12 3"/></g>
      <g className="skater two"><circle cx="184" cy="18" r="3"/><path d="m183 21 5 10-7 9m5-12 10-3m-8 7 12 4"/></g>
      <g className="skater three"><circle cx="214" cy="13" r="3"/><path d="m213 16-4 10 7 7m-6-11-8 1"/></g>
      <path className="puck-line" d="M151 38c23 8 43 6 59 0" /><circle className="puck" cx="211" cy="38" r="2" />
    </svg>
    <i className="cf-crt-scanlines" aria-hidden="true" />
    <span>LIVE FEED · THE VICE COLLAPSES HIGH</span>
  </div>;
}

function ActionMedallion({ kind }: { kind: "dump" | "sinbin" }) {
  return <span className="cf-medallion" aria-hidden="true">{kind === "dump" ? <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23"/><path d="M12 32c9-1 18-6 24-17l5 3c-4 12-12 20-25 23zM14 35l3 6m5-8 3 6m5-10 3 6"/></svg> : <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23"/><circle cx="26" cy="15" r="5"/><path d="M18 23h16v20H18zM22 23v20m8-20v20M16 24l-4-10m24 10 4-10M10 14l3-2m26 2-3-2"/></svg>}</span>;
}

export function CanonicalArtDirectionFixture() {
  return <StageScaler className="cf-viewport"><section className="canonical-fixture material-dark-wood" aria-label="Canonical Violetta substitution preview">
    <header className="cf-toprail">
      <div className="cf-team home material-copper-red"><span>SINBIN</span><strong>1</strong><small>HOME · FIRST TO 3</small></div>
      <div className="cf-resolution material-cream-enamel"><span>RESOLUTION</span><strong>04 <small>/ 12</small></strong><i>5 SEC</i></div>
      <div className="cf-team away material-rink-blue"><span>THE VICE</span><strong>0</strong><small>VISITOR · FORECHECK</small></div>
      <HockeyFreezeFrame />
      <button className="cf-pause material-navy-metal" type="button" aria-label="Pause"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="2" width="6" height="20" rx="1"/><rect x="14" y="2" width="6" height="20" rx="1"/></svg></button>
    </header>
    <div className="cf-status"><Meter label="PRESSURE" value="63" fill="63%" tone="ice"/><Meter label="CHAIN" value="×2.34" tone="amber"/><Meter label="THREAT" value="41" fill="41%" tone="copper"/><section className="cf-disruption material-cream-enamel"><span>NEXT 04</span><strong>HIGH FORECHECK</strong><small>ABSORB · OUTRUN · SPEND CHAIN</small><b>3.4s</b></section></div>
    <div className="cf-active-line"><CanonicalActiveCard role="RECOVER" name="NYX" number={8} energy={7} maximum={9} kind="direct" caption="ABSORBS THE ENTRY"/><CanonicalActiveCard role="CREATE" name="SABLE" number={8} energy={5} maximum={8} kind="bridge" caption="RELAY WINDOW OPEN"/><CanonicalActiveCard role="FINISH" name="LISEL" number={27} energy={6} maximum={8} kind="break" caption="CREATE → FINISH LOST"/></div>
    <div className="cf-causal material-printed-paper">VIOLETTA IN · CHOOSE DESTINATION</div>
    <section className="cf-bench material-navy-metal"><h2>BENCH · INCOMING FIRST</h2><div><ViolettaChoice/><BenchChoice name="ORLA"/><BenchChoice name="ROOK"/></div></section>
    <section className="cf-actions"><button className="cf-action dump" type="button"><ActionMedallion kind="dump"/><span><strong>DUMP &<br/>FULL CHANGE</strong><small>SURRENDER PRESSURE<br/>RESET CHAIN · +THREAT</small></span></button><button className="cf-action sinbin" type="button"><ActionMedallion kind="sinbin"/><span><strong>SIN BIN</strong><small>OVERCHARGE<br/>2 RES EXPOSURE</small></span></button></section>
  </section></StageScaler>;
}
