import type { CSSProperties, ReactNode } from "react";
import "./bench-card-skin.css";

const VIOLETTA_PORTRAIT = "/assets/characters/violetta/violetta-live-card-placeholder-v1.png";
const NEUTRAL_FRAME = "/assets/ui/live-match/frames/frame-bench-neutral-9slice.png";
const ENERGY_PIP = "/assets/ui/live-match/icons/energy-pip.svg";

type NineSliceStyle = CSSProperties & {
  "--nine-slice-source": string;
  "--nine-slice-slice": number;
  "--nine-slice-border-width": string;
};

export type NineSliceFrameProps = {
  src: string;
  slice: number;
  borderWidth: number;
  selected: boolean;
  children: ReactNode;
};

export function NineSliceFrame({ src, slice, borderWidth, selected, children }: NineSliceFrameProps) {
  const style: NineSliceStyle = {
    "--nine-slice-source": `url("${src}")`,
    "--nine-slice-slice": slice,
    "--nine-slice-border-width": `${borderWidth}px`,
  };

  return <div className={`sb-nine-slice-frame${selected ? " selected" : ""}`} data-selected={selected} style={style}>
    {children}
  </div>;
}

function EnergyPip({ active }: { active: boolean }) {
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img className={`sb-skin-energy-pip${active ? " active" : ""}`} src={ENERGY_PIP} alt="" aria-hidden="true" />;
}

export type SelectedViolettaBenchCardProps = {
  selected: boolean;
  currentEnergy: number;
  maximumEnergy: number;
  playerName: string;
  rolePrimary: string;
  roleSecondary: string;
};

export function SelectedViolettaBenchCard({
  selected,
  currentEnergy,
  maximumEnergy,
  playerName,
  rolePrimary,
  roleSecondary,
}: SelectedViolettaBenchCardProps) {
  const normalizedMaximum = Math.max(1, Math.floor(maximumEnergy));
  const normalizedCurrent = Math.min(normalizedMaximum, Math.max(0, Math.floor(currentEnergy)));
  const stateLabel = selected ? "SELECTED" : "BENCH";

  return <button
    className="sb-skin-bench-card"
    type="button"
    aria-label={`${playerName}, ${rolePrimary} ${roleSecondary}, Energy ${normalizedCurrent} of ${normalizedMaximum}, ${selected ? "selected" : "not selected"}`}
    aria-pressed={selected}
  >
    <NineSliceFrame src={NEUTRAL_FRAME} slice={48} borderWidth={5} selected={selected}>
      <span className="sb-skin-material" aria-hidden="true" />
      <figure className="sb-skin-portrait">
        {/* The isolated proof intentionally loads the supplied runtime PNG directly. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={VIOLETTA_PORTRAIT} alt="" />
      </figure>
      <i className="sb-skin-wear" aria-hidden="true" />
      <span className="sb-skin-content">
        <small>{stateLabel}</small>
        <strong>{playerName}</strong>
        <b>{rolePrimary} · {roleSecondary}</b>
        <em>ENERGY {normalizedCurrent} / {normalizedMaximum}</em>
        <span className="sb-skin-energy" aria-hidden="true">
          {Array.from({ length: normalizedMaximum }, (_, index) => <EnergyPip active={index < normalizedCurrent} key={index} />)}
        </span>
      </span>
    </NineSliceFrame>
  </button>;
}
