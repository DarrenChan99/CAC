"use client";

import { useId, useState } from "react";
import stats from "@/lib/how/stats.json";
import { WindowHeatmap } from "./GithubCharts";
import { Scores3D } from "./Scores3D";
import { Kpis, ScoreHist } from "./StatsPanels";
import { Term } from "./Term";

/** One cut-off slider that drives the headline numbers, every test square, the histogram and the 3-D pane together. */
export function ThresholdLab() {
  const [tau, setTau] = useState(stats.tau);
  const id = useId();
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[16px] border border-tint bg-surface p-5">
        <label htmlFor={id} className="flex flex-wrap items-baseline justify-between gap-2 text-f-body font-semibold">
          <span>Try the <Term k="tau">cut-off</Term>: how alike a voice must be to get a name</span>
          <span className="tabular-nums text-primary">{tau.toFixed(2)}{tau === stats.tau && <span className="ml-2 text-f-small font-normal text-muted">(my setting)</span>}</span>
        </label>
        <input id={id} type="range" min={0.1} max={0.9} step={0.01} value={tau} onChange={(e) => setTau(Number(e.target.value))} className="mt-2 h-11 w-full cursor-pointer accent-[var(--color-primary)]" />
        <div className="flex justify-between text-f-small text-muted"><span>forgiving: names more, risks strangers</span><span>strict: names fewer, says “Someone new”</span></div>
        {tau !== stats.tau && <button onClick={() => setTau(stats.tau)} className="mt-2 min-h-[44px] rounded-full border border-tint px-4 text-f-small font-medium text-primary hover:bg-tint">Back to {stats.tau}</button>}
        <p className="mt-2 text-f-label text-muted">Slices are re-counted from their saved scores; the margin rule is not re-run.</p>
      </div>
      <Kpis tau={tau} />
      <WindowHeatmap tau={tau} />
      <ScoreHist tau={tau} />
      <Scores3D tau={tau} />
    </div>
  );
}
