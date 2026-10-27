import stats from "@/lib/how/stats.json";
import { Panel, Term } from "./Term";

const st = stats.stress;
const pct = (x: number, d = 0) => `${(100 * x).toFixed(d)}%`;
const RIGHT = "var(--color-primary)", WRONG = "var(--color-danger)", STRANGER = "var(--color-warn)", ALT = "var(--color-series-3)";

interface Line { label: string; color: string; values: number[]; dashed?: boolean }

/** Categorical x, 0–100% y. Enough for a sweep of 4–8 settings; no library. */
function Lines({ xs, lines, xTitle, label }: { xs: string[]; lines: Line[]; xTitle: string; label: string }) {
  const W = 320, H = 210, L = 40, B = 40, T = 10, R = 10;
  const x = (i: number) => L + (i / (xs.length - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - v) * (H - B - T);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="stroke-tint" />
            <text x={L - 6} y={y(v) + 3} textAnchor="end" className="fill-muted text-[10px]">{pct(v)}</text>
          </g>
        ))}
        {lines.map((l) => (
          <g key={l.label}>
            <polyline fill="none" stroke={l.color} strokeWidth={2} strokeDasharray={l.dashed ? "5 3" : undefined} points={l.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
            {l.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={3} fill={l.color}><title>{`${l.label} · ${xs[i]} · ${pct(v, 1)}`}</title></circle>)}
          </g>
        ))}
        {xs.map((t, i) => <text key={t} x={x(i)} y={H - B + 14} textAnchor="middle" className="fill-muted text-[10px]">{t}</text>)}
        <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" className="fill-muted text-[10px]">{xTitle}</text>
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-f-label">
        {lines.map((l) => <span key={l.label} className="flex items-center gap-1.5"><i className="inline-block h-0.5 w-4" style={{ background: l.color }} />{l.label}</span>)}
      </div>
    </>
  );
}

const col = <K extends string>(rows: Record<K, number>[], k: K) => rows.map((r) => r[k]);
const kinds = (rows: { right: number; wrong_name: number; stranger_named: number }[]): Line[] => [
  { label: "family named correctly", color: RIGHT, values: col(rows, "right") },
  { label: "wrong name", color: WRONG, values: col(rows, "wrong_name") },
  { label: "stranger given a name", color: STRANGER, values: col(rows, "stranger_named"), dashed: true },
];

/** The stress tests: what happens as the family grows, the room gets noisy, and the clip gets short. */
export function StressCharts() {
  const fam = st.family_size, white = st.noise.white, talker = st.noise.talker, clip = st.clip_len;
  const worst = talker[talker.length - 1];
  const half = clip[0];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Panel title="A bigger family?" sub={<>I enrolled {fam[0].n} to {fam[fam.length - 1].n} different people at a time from {st.meta.speakers} LibriSpeech voices and tested on audio they hadn&apos;t been enrolled with. Average of {st.meta.trials} random families per point.</>}>
          <Lines xs={fam.map((r) => String(r.n))} lines={kinds(fam)} xTitle="people in the family" label="Accuracy against family size" />
          <p className="mt-3 text-f-small">Going from {fam[0].n} to {fam[fam.length - 1].n} people moves correct names from {pct(fam[0].right, 1)} to {pct(fam[fam.length - 1].right, 1)}. <b>Size is not the weak point.</b></p>
        </Panel>
        <Panel title="A noisy room?" sub={<>Noise is added to the test audio only; the voiceprints were made in quiet. The x-axis is <Term k="snr">signal-to-noise</Term>: how much louder the voice is than the noise, so 0 dB means they are equally loud. Family of {st.meta.family_for_sweeps}.</>}>
          <Lines xs={white.map((r) => String(r.snr))} lines={[
            { label: "steady hiss: named correctly", color: RIGHT, values: col(white, "right") },
            { label: "another person talking: named correctly", color: ALT, values: col(talker, "right") },
            { label: "another person talking: wrong name", color: WRONG, values: col(talker, "wrong_name") },
          ]} xTitle="voice vs noise in dB (lower = noisier)" label="Accuracy against background noise" />
          <p className="mt-3 text-f-small">It holds up to about 20 dB, then drops. <b>This is the real weak point</b>: with someone else talking just as loud, {pct(worst.wrong_name, 1)} of slices get the wrong name and {pct(1 - worst.right - worst.wrong_name)} become “Someone new”.</p>
        </Panel>
        <Panel title="A shorter clip?" sub={<>The live system scores 2 seconds at a time. Here the same test audio is cut shorter or longer before it is turned into a voiceprint to compare. Family of {st.meta.family_for_sweeps}.</>}>
          <Lines xs={clip.map((r) => `${r.seconds}`)} lines={kinds(clip)} xTitle="seconds of audio scored" label="Accuracy against clip length" />
          <p className="mt-3 text-f-small">At {half.seconds} s only {pct(half.right)} are named, but the wrong-name rate stays at {pct(half.wrong_name, 1)}. <b>It stays quiet instead of guessing.</b> That is why the live loop waits for 2 s.</p>
        </Panel>
      </div>
      <PairSpread />
    </div>
  );
}

/** How alike are two *different* people's voiceprints? Against the cut-off, this is the ceiling on confusion. */
function PairSpread() {
  const p = st.pairs;
  const W = 640, H = 170, L = 34, B = 30, T = 10;
  const x = (v: number) => L + ((v - p.bins[0]) / (p.bins[p.bins.length - 1] - p.bins[0])) * (W - L - 8);
  const top = Math.max(...p.count);
  const bw = x(p.bins[1]) - x(p.bins[0]);
  return (
    <Panel title="Could two different people sound alike?" sub={<>I compared the voiceprints of every pair of the {st.meta.speakers} LibriSpeech speakers ({p.n_pairs} pairs). Most are far apart. {p.over_tau} pairs are more alike than the <Term k="tau">cut-off</Term> ({stats.tau}), and the closest is {p.closest[0].toFixed(2)}. For those pairs the <Term k="margin">margin rule</Term> is what stops a wrong name: when the top two scores are this close it answers “Someone new” instead of picking.</>}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Histogram of voiceprint similarity between different people">
        {p.count.map((c, i) => <rect key={i} x={x(p.bins[i]) + 1} width={bw - 2} y={T + (1 - c / top) * (H - B - T)} height={(c / top) * (H - B - T)} fill="var(--color-stranger)" opacity={0.8}><title>{`${c} pairs between ${p.bins[i]} and ${p.bins[i + 1]}`}</title></rect>)}
        <line x1={x(stats.tau)} x2={x(stats.tau)} y1={T} y2={H - B} className="stroke-text" strokeWidth={2} />
        <text x={x(stats.tau) - 6} y={T + 12} textAnchor="end" className="fill-text text-[11px] font-semibold">cut-off {stats.tau}</text>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => <text key={v} x={x(v)} y={H - B + 16} textAnchor="middle" className="fill-muted text-[10px]">{v}</text>)}
        <text x={(W + L) / 2} y={H - 4} textAnchor="middle" className="fill-muted text-[10px]">how alike two different people&apos;s voiceprints are</text>
      </svg>
    </Panel>
  );
}
