import { countsAt } from "@/lib/how/atTau";
import stats from "@/lib/how/stats.json";
import { Panel, Term } from "./Term";

export const seriesColor = (i: number) => `var(--color-series-${(i % 6) + 1})`;
const pct = (x: number, d = 1) => `${(100 * x).toFixed(d)}%`;
const names = stats.people.map((p) => p.name);

export function Kpis({ tau = stats.tau }: { tau?: number }) {
  const c = countsAt(tau);
  const n = stats.people.length;
  const seconds = stats.per_person && Object.values(stats.per_person).reduce((a, p) => a + p.seconds, 0);
  const tiles = [
    { v: pct(stats.det.eer, 2), l: "error rate at the balance point", k: <Term k="eer" /> },
    { v: stats.det.auc.toFixed(4), l: "separation score (1 = perfect)", k: <Term k="auc" /> },
    { v: pct(c.right / c.family), l: "family slices named correctly", k: <>{c.right} of {c.family} 2-second slices it had never seen</> },
    { v: pct(c.strangerNamed / c.strangers, 1), l: "of stranger slices given a name", k: <>{c.strangerNamed} of {c.strangers} slices, {stats.strangers.speakers} LibriSpeech voices</> },
    { v: `${n}`, l: "family voices recorded", k: <>{Math.round(seconds)} s of enrollment audio</> },
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
    <Panel title="So how do we know who really spoke?" sub={<>Each row is who really spoke; each column is the name Caretaker showed. Right answers sit on the <Term k="confusion">diagonal</Term>, and strangers should land in the last column, unnamed.</>}>
      <div className="grid gap-6 md:grid-cols-2">
        <div><div className="pb-1 text-f-small font-semibold">Whole sentences</div><Matrix m={stats.confusion.clip} rows={rows} cols={cols} /></div>
        <div><div className="pb-1 text-f-small font-semibold">2-second live slices</div><Matrix m={stats.confusion.window} rows={rows} cols={cols} /></div>
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
    <Panel title="Strict or forgiving?" sub={<>A stricter <Term k="tau">cut-off</Term> names fewer strangers but misses more family. The <Term k="det">curve</Term> shows every setting; both mistakes are equally rare ({pct(det.eer, 2)}) at {det.eer_threshold}. I set it to {stats.tau}, so it would rather say “Someone new” than give a wrong name.</>}>
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
    <Panel title="How much recording does it need?" sub="More seconds of someone's voice means more correct names, up to about 20 seconds. It never gave a wrong name at any length.">
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

export function QualityTable() {
  return (
    <Panel title="How good were the recordings?" sub="Measured by the recorder as each clip was made. Rejected takes are counted by reason.">
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

/** Both families' score distributions on one flat axis: where the cut-off sits and what it keeps on each side. */
export function ScoreHist({ tau = stats.tau }: { tau?: number }) {
  const d = stats.distributions;
  const W = 640, H = 220, L = 34, B = 30, T = 10;
  const x = (v: number) => L + ((v - d.bins[0]) / (d.bins[d.bins.length - 1] - d.bins[0])) * (W - L - 8);
  const rows = [
    { key: "stranger" as const, label: "strangers", color: "var(--color-stranger)" },
    { key: "other_person" as const, label: "another family member", color: "var(--color-series-2)" },
    { key: "target" as const, label: "the right person", color: "var(--color-series-1)" },
  ];
  const share = rows.map((r) => { const t = d[r.key].reduce((a, b) => a + b, 0) || 1; return d[r.key].map((v) => v / t); });
  const top = Math.max(...share.flat());
  const y = (v: number) => H - B - (v / top) * (H - B - T);
  const path = (s: number[]) => `M${x(d.bins[0])},${y(0)} ` + s.map((v, i) => `L${x(d.bins[i])},${y(v)} L${x(d.bins[i + 1])},${y(v)}`).join(" ") + ` L${x(d.bins[s.length])},${y(0)} Z`;
  return (
    <Panel title="How close does each voice get?" sub={<>Every test slice is scored by how alike it is to a <Term k="centroid">voiceprint</Term> (<Term k="cosine">1 means identical</Term>). The right person (green) piles up on the right and everyone else piles up on the left. Anything to the right of the line gets a name.</>}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Score distributions with the cut-off line">
        <rect x={x(tau)} y={T} width={x(1) - x(tau)} height={H - B - T} className="fill-tint" opacity={0.6} />
        {rows.map((r, k) => <path key={r.key} d={path(share[k])} fill={r.color} fillOpacity={0.45} stroke={r.color} strokeWidth={1.5} />)}
        <line x1={x(tau)} x2={x(tau)} y1={T} y2={H - B} className="stroke-text" strokeWidth={2} />
        <text x={x(tau) + 6} y={T + 12} className="fill-text text-[11px] font-semibold">cut-off {tau.toFixed(2)}: named from here →</text>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => <text key={v} x={x(v)} y={H - B + 16} textAnchor="middle" className="fill-muted text-[10px]">{v}</text>)}
        <text x={(W + L) / 2} y={H - 4} textAnchor="middle" className="fill-muted text-[10px]">how alike to the voiceprint (cosine)</text>
      </svg>
      <div className="mt-2 flex flex-wrap justify-center gap-4 text-f-small">
        {rows.map((r) => <span key={r.key} className="flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-full" style={{ background: r.color }} />{r.label}</span>)}
      </div>
    </Panel>
  );
}

/**
 * The real decision rule, flat: every tested 2-second slice placed by its match to the first person (across)
 * and the second (up). Green and blue zones are "named"; everywhere else is "Someone new".
 */
export function DecisionMap2D({ tau = stats.tau }: { tau?: number }) {
  const E = stats.embeddings, m = stats.margin, [A, B] = stats.people;
  const sims = E.centroid_sim as Record<string, number[]>;
  const S = 340, P = 38, lo = -0.1, hi = 1;
  const p = (v: number) => P + ((v - lo) / (hi - lo)) * (S - P - 10);
  const q = (v: number) => S - P - ((v - lo) / (hi - lo)) * (S - P - 10);
  const zoneA = `${p(tau)},${q(lo)} ${p(tau)},${q(tau - m)} ${p(hi)},${q(hi - m)} ${p(hi)},${q(lo)}`;
  const zoneB = `${p(lo)},${q(tau)} ${p(tau - m)},${q(tau)} ${p(hi - m)},${q(hi)} ${p(lo)},${q(hi)}`;
  const dots = E.who.map((w, i) => ({ w, i })).filter(({ w }) => !w.startsWith("centroid:"));
  const color = (w: string) => (w === A.id ? "var(--color-series-1)" : w === B.id ? "var(--color-series-2)" : "var(--color-stranger)");
  return (
    <Panel title="The rule, on the real test slices" sub={<>Each dot is one 2-second slice from the tests. Across is how alike it is to {A.name}&apos;s voiceprint, up is how alike to {B.name}&apos;s. A slice is named only if it lands in a shaded zone: past the <Term k="tau">cut-off</Term> and clearly ahead of the other person (the <Term k="margin">margin</Term>). The white middle is “Someone new”.</>}>
      <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto w-full max-w-[460px]" role="img" aria-label="Decision map of tested slices">
        <polygon points={zoneA} fill="var(--color-series-1)" fillOpacity={0.14} />
        <polygon points={zoneB} fill="var(--color-series-2)" fillOpacity={0.14} />
        <line x1={p(tau)} x2={p(tau)} y1={q(lo)} y2={q(hi)} className="stroke-muted" strokeDasharray="4 3" />
        <line x1={p(lo)} x2={p(hi)} y1={q(tau)} y2={q(tau)} className="stroke-muted" strokeDasharray="4 3" />
        {dots.map(({ w, i }) => <circle key={i} cx={p(sims[A.id][i])} cy={q(sims[B.id][i])} r={w === "stranger" ? 2.6 : 3.2} fill={color(w)} fillOpacity={0.75} />)}
        <text x={p(0.78)} y={q(0.1)} textAnchor="middle" className="fill-text text-[11px] font-semibold">named {A.name}</text>
        <text x={p(0.15)} y={q(0.92)} textAnchor="middle" className="fill-text text-[11px] font-semibold">named {B.name}</text>
        <text x={p(0.14)} y={q(0.12)} textAnchor="middle" className="fill-muted text-[11px]">Someone new</text>
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <text x={p(v)} y={S - P + 14} textAnchor="middle" className="fill-muted text-[10px]">{v}</text>
            <text x={P - 6} y={q(v) + 3} textAnchor="end" className="fill-muted text-[10px]">{v}</text>
          </g>
        ))}
        <text x={(S + P) / 2} y={S - 6} textAnchor="middle" className="fill-muted text-[10px]">match to {A.name}</text>
        <text transform={`translate(10 ${(S - P) / 2}) rotate(-90)`} textAnchor="middle" className="fill-muted text-[10px]">match to {B.name}</text>
      </svg>
      <div className="mt-2 flex flex-wrap justify-center gap-4 text-f-small">
        <span className="flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-full" style={{ background: "var(--color-series-1)" }} />{A.name} speaking</span>
        <span className="flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-full" style={{ background: "var(--color-series-2)" }} />{B.name} speaking</span>
        <span className="flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-full bg-stranger" />strangers</span>
      </div>
    </Panel>
  );
}
