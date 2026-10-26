import stats from "@/lib/how/stats.json";
import { Panel, Term } from "./Term";

export const seriesColor = (i: number) => `var(--color-series-${(i % 6) + 1})`;
const pct = (x: number, d = 1) => `${(100 * x).toFixed(d)}%`;
const names = stats.people.map((p) => p.name);

export function Kpis() {
  const win = stats.confusion.window;
  const n = stats.people.length;
  const right = win.slice(0, n).reduce((a, r, i) => a + r[i], 0) / win.slice(0, n).reduce((a, r) => a + r.reduce((x, y) => x + y, 0), 0);
  const seconds = stats.per_person && Object.values(stats.per_person).reduce((a, p) => a + p.seconds, 0);
  const tiles = [
    { v: pct(stats.det.eer, 2), l: "equal error rate", k: <Term k="eer" /> },
    { v: stats.det.auc.toFixed(4), l: "ROC area", k: <Term k="auc" /> },
    { v: pct(right), l: "live windows named correctly", k: <>2 s windows, leave-one-clip-out</> },
    { v: pct(stats.strangers.named, 1), l: `of ${stats.strangers.windows} stranger windows given a name`, k: <>{stats.strangers.speakers} LibriSpeech voices</> },
    { v: `${n}`, l: "enrolled voices", k: <>{Math.round(seconds)} s of enrollment audio</> },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {tiles.map((t) => (
        <div key={t.l} className="rounded-[12px] border border-tint bg-surface p-4">
          <div className="text-f-h1 font-bold tabular-nums text-primary">{t.v}</div>
          <div className="text-f-small">{t.l}</div>
          <div className="mt-1 text-f-label text-muted">{t.k}</div>
        </div>
      ))}
    </div>
  );
}

function Matrix({ m, rows, cols }: { m: number[][]; rows: string[]; cols: string[] }) {
  return (
    <table className="w-full border-separate border-spacing-1 text-center text-f-small tabular-nums">
      <thead>
        <tr>
          <th />
          {cols.map((c) => <th key={c} className="px-1 pb-1 text-f-label font-medium text-muted">{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {m.map((r, i) => {
          const tot = r.reduce((a, b) => a + b, 0) || 1;
          return (
            <tr key={rows[i]}>
              <th className="pr-2 text-right text-f-label font-medium text-muted">{rows[i]}</th>
              {r.map((v, j) => {
                const f = v / tot;
                return (
                  <td key={j} className="rounded-[6px] py-2"
                    style={{ background: `color-mix(in oklab, var(${j === cols.length - 1 && i !== j ? "--color-warn" : "--color-primary"}) ${Math.round(f * 100)}%, var(--color-surface))`, color: f > 0.5 ? "white" : undefined }}>
                    {v}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function Confusion() {
  const rows = [...names, "stranger"], cols = [...names, "Someone new"];
  return (
    <Panel title="Who the system said, vs. who really spoke" sub={<>A <Term k="confusion" /> from leave-one-clip-out testing. Row = true speaker, column = the label shown. A “stranger” should land in the last column.</>}>
      <div className="grid gap-6 md:grid-cols-2">
        <div><div className="pb-1 text-f-small font-semibold">Whole utterances</div><Matrix m={stats.confusion.clip} rows={rows} cols={cols} /></div>
        <div><div className="pb-1 text-f-small font-semibold">2 s live windows</div><Matrix m={stats.confusion.window} rows={rows} cols={cols} /></div>
      </div>
    </Panel>
  );
}

export function DetCurve() {
  const det = stats.det;
  const S = 270, P = 36;
  const lg = (v: number) => (Math.log10(Math.max(v, 1e-3)) + 3) / 3; // 1e-3..1 -> 0..1
  const px = (v: number) => P + lg(v) * (S - P - 22);
  const py = (v: number) => S - P - lg(v) * (S - P - 22);
  const pts = det.fpr.map((f, i) => `${px(f)},${py(det.fnr[i])}`).join(" ");
  return (
    <Panel title="Trade-off curve" sub={<>The <Term k="det" /> over every possible threshold. EER = {pct(det.eer, 2)} at a score of {det.eer_threshold}; our <Term k="tau" /> of {stats.tau} trades a little extra rejection for fewer wrong names.</>}>
      <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto w-full max-w-[340px]" role="img" aria-label="DET curve, log axes">
        <line x1={px(1e-3)} y1={py(1e-3)} x2={px(1)} y2={py(1)} className="stroke-tint" strokeDasharray="4 3" />
        <polyline points={pts} fill="none" className="stroke-primary" strokeWidth={2} />
        <circle cx={px(det.eer)} cy={py(det.eer)} r={4} className="fill-warn" />
        <circle cx={px(det.at_tau.fpr)} cy={py(det.at_tau.fnr)} r={4} className="fill-text" />
        {[1e-3, 1e-2, 1e-1, 1].map((v) => (
          <g key={v}>
            <text x={px(v)} y={S - P + 14} textAnchor="middle" className="fill-muted text-[10px]">{v >= 1 ? "100%" : `${v * 100}%`}</text>
            <text x={P - 4} y={py(v) + 3} textAnchor="end" className="fill-muted text-[10px]">{v >= 1 ? "100%" : `${v * 100}%`}</text>
          </g>
        ))}
        <text x={S / 2} y={S - 4} textAnchor="middle" className="fill-muted text-[10px]">false accept (stranger named)</text>
        <text transform={`translate(8 ${S / 2}) rotate(-90)`} textAnchor="middle" className="fill-muted text-[10px]">false reject</text>
      </svg>
      <div className="mt-2 flex flex-wrap justify-center gap-4 text-f-small">
        <span className="flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-full bg-warn" />equal error point</span>
        <span className="flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-full bg-text" />operating point (τ)</span>
      </div>
    </Panel>
  );
}

export function EnrollCurve() {
  const c = stats.enrollment_curve;
  const W = 560, H = 230, L = 30, B = 28;
  const x = (s: number) => L + ((s - c[0].seconds) / (c[c.length - 1].seconds - c[0].seconds)) * (W - L - 12);
  const lo = Math.floor(Math.min(...c.map((p) => p.right)) * 10) / 10;
  const y = (v: number) => 10 + (1 - (v - lo) / (1 - lo)) * (H - B - 10);
  return (
    <Panel title="How much enrollment is enough" sub="Seconds of a person's speech used to build the voiceprint, vs. live windows named correctly. Returns flatten near 20 seconds, with no wrong names at any length.">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Accuracy vs enrollment seconds">
        <polyline fill="none" className="stroke-primary" strokeWidth={2} points={c.map((p) => `${x(p.seconds)},${y(p.right)}`).join(" ")} />
        {c.map((p) => (
          <g key={p.seconds}>
            <circle cx={x(p.seconds)} cy={y(p.right)} r={4} className="fill-primary" />
            <text x={x(p.seconds)} y={y(p.right) - 9} textAnchor="middle" className="fill-text text-[10px] tabular-nums">{pct(p.right, 0)}</text>
            <text x={x(p.seconds)} y={H - 8} textAnchor="middle" className="fill-muted text-[10px]">{p.seconds} s</text>
          </g>
        ))}
      </svg>
    </Panel>
  );
}

export function CrossSim() {
  return (
    <Panel title="Voiceprint similarity" sub={<>Cosine between each pair of <Term k="centroid" />s. Off-diagonal values far below <Term k="tau" /> mean the family cannot be confused with each other.</>}>
      <Matrix m={stats.cross_similarity.map((r) => r.map((v) => Math.round(v * 100) / 100))} rows={names} cols={names} />
    </Panel>
  );
}

export function QualityTable() {
  return (
    <Panel title="Recording quality" sub="From the enrollment recorder's own measurements; takes it rejected are counted by reason.">
      <table className="w-full text-f-small tabular-nums">
        <thead><tr className="text-left text-f-label text-muted"><th className="pb-1 font-medium">person</th><th className="font-medium">clips</th><th className="font-medium">speech</th><th className="font-medium">level</th><th className="font-medium">SNR</th><th className="font-medium">rejected takes</th></tr></thead>
        <tbody>
          {stats.quality.map((q, i) => (
            <tr key={q.id} className="border-t border-tint">
              <td className="py-1.5"><i className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ background: seriesColor(i) }} />{q.name}</td>
              <td>{q.clips}</td><td>{q.speech_s} s</td><td>{q.level_db} dB</td><td>{q.snr_db} dB</td>
              <td className="text-muted">{Object.entries(q.rejected).map(([k, v]) => `${v} ${k.replace("-", " ")}`).join(", ") || "none"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
