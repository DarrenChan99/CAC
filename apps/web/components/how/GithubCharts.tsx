import { outcomeAt } from "@/lib/how/atTau";
import stats from "@/lib/how/stats.json";
import { CALL_END, CALL_START, formatCallTime, participantIds, timeline } from "@/lib/mocks/call-timeline";
import { get } from "@/lib/mocks/family";
import { Panel } from "./Term";

const T = stats.timing;
const num = (x: number, d = 1) => x.toFixed(d);

/** A GitHub-Actions-style run graph: every step of the pipeline as a job, with its measured time. */
export function WorkflowRun() {
  const encode = Math.max(T.embed_ms - T.fbank_ms, 0);
  const perHop = T.vad_ms_per_audio_s + T.embed_ms + T.score_us / 1000;
  const cols = [
    { n: "Listen", s: "16 kHz audio" },
    { n: "Find speech", s: `VAD · ${num(T.vad_ms_per_audio_s)} ms / s` },
    { n: "Take 2 seconds", s: "new slice every 1 s" },
    { n: "Map the pitch", s: `log-Mel · ${num(T.fbank_ms)} ms` },
    { n: "Make voiceprint", s: `ECAPA · ${num(encode)} ms` },
    { n: "Match a name", s: `cosine · ${num(T.score_us)} µs` },
    { n: "Hold the name", s: `hysteresis · ${num(T.smooth_us)} µs` },
    { n: "Show the name", s: "on screen" },
  ];
  const asr = [
    { c: 1, n: "Write the words", s: `Whisper · ${num(T.whisper_s_per_audio_s ?? 0, 2)} s / s` },
    { c: 2, n: "Match words", s: "to each speaker" },
  ];
  const CW = 136, GAP = 22, NH = 58, Y1 = 62, Y2 = 188;
  const x = (c: number) => c * (CW + GAP);
  const W = 8 * CW + 7 * GAP;
  const Node = ({ c, y, n, s }: { c: number; y: number; n: string; s: string }) => (
    <g transform={`translate(${x(c)} ${y})`}>
      <rect width={CW} height={NH} rx={10} className="fill-surface stroke-tint" strokeWidth={1.5} />
      <circle cx={16} cy={NH / 2} r={8} className="fill-primary" />
      <path d={`M${12} ${NH / 2} l3 3 l6 -6`} fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <text x={32} y={NH / 2 - 4} className="fill-text text-[12.5px] font-semibold">{n}</text>
      <text x={32} y={NH / 2 + 13} className="fill-muted text-[11px]">{s}</text>
    </g>
  );
  const link = (a: number, ya: number, b: number, yb: number) => {
    const x1 = x(a) + CW, x2 = x(b), mx = (x1 + x2) / 2;
    return <path key={`${a}-${b}-${ya}-${yb}`} d={`M${x1} ${ya + NH / 2} C${mx} ${ya + NH / 2}, ${mx} ${yb + NH / 2}, ${x2} ${yb + NH / 2}`} fill="none" className="stroke-accent" strokeWidth={2} />;
  };
  return (
    <Panel
      title="Each second of audio, step by step"
      sub={<>Every slice of audio goes through these steps. I timed each one on my laptop: the whole chain takes about <b className="text-text">{num(perHop, 0)} ms per second of audio</b>, roughly {Math.round(1000 / perHop)}× faster than real time.</>}
    >
      <div className="mb-3 flex flex-wrap items-center gap-3 text-f-small">
        <span className="flex items-center gap-2 rounded-full bg-tint px-3 py-1 font-medium text-primary"><i className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />identify-speaker</span>
        <span className="text-muted">on: audio_block · all jobs succeeded · {num(perHop, 0)} ms / 1 s hop</span>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} 262`} className="min-w-[980px] w-full" role="img" aria-label="Pipeline as a workflow graph">
          <text x={0} y={34} className="fill-muted text-[12px] font-medium">Who is speaking</text>
          <text x={0} y={160} className="fill-muted text-[12px] font-medium">What they said</text>
          {cols.slice(0, -1).map((_, i) => link(i, Y1, i + 1, Y1))}
          {link(0, Y1, 1, Y2)}
          {link(1, Y2, 2, Y2)}
          {link(2, Y2, 7, Y1)}
          {cols.map((c, i) => <Node key={c.n} c={i} y={Y1} n={c.n} s={c.s} />)}
          {asr.map((a) => <Node key={a.n} c={a.c} y={Y2} n={a.n} s={a.s} />)}
        </svg>
      </div>
    </Panel>
  );
}

const level = (s: number) => (s < 0.5 ? 25 : s < 0.6 ? 45 : s < 0.7 ? 70 : 100);

/** One square per tested window, like a contribution graph: darker green = more confident correct name. */
export function WindowHeatmap({ tau = stats.tau }: { tau?: number }) {
  const rows = [...stats.people.map((p) => ({ id: p.id, name: p.name, stranger: false })), { id: "stranger", name: "Strangers", stranger: true }];
  const cell = (s: number, o: number, stranger: boolean) =>
    o === 2 ? "var(--color-danger)"
    : o === 1 ? (stranger ? `color-mix(in oklab, var(--color-stranger) ${s < 0.15 ? 35 : s < 0.25 ? 60 : 90}%, var(--color-surface))` : "color-mix(in oklab, var(--color-warn) 55%, var(--color-surface))")
    : `color-mix(in oklab, var(--color-primary) ${level(s)}%, var(--color-surface))`;
  return (
    <Panel
      title="Every test, one square each"
      sub="Each square is 2 seconds of speech the system had never heard before. Green is the right name (darker = more confident). Grey is a stranger correctly left unnamed. Amber is a family member shown as “Someone new”. Red is a wrong name. Hover a square for its score."
    >
      <div className="flex flex-col gap-4">
        {rows.map((r) => {
          const w = ((stats.windows as Record<string, number[][]>)[r.id] ?? []).map((x) => [x[0], outcomeAt(r.stranger, x, tau)]);
          const ok = w.filter((x) => (r.stranger ? x[1] === 1 : x[1] === 0)).length;
          return (
            <div key={r.id} className="flex items-start gap-4">
              <div className="w-[96px] flex-none pt-0.5 text-f-small"><b>{r.name}</b><div className="text-f-label text-muted tabular-nums">{ok}/{w.length} correct</div></div>
              <div className="grid gap-[3px]" style={{ gridAutoFlow: "column", gridTemplateRows: "repeat(7, 13px)", gridAutoColumns: "13px" }}>
                {w.map(([s, o], i) => (
                  <i key={i} title={`${r.name} · window ${i + 1} · cosine ${s.toFixed(2)} · ${o === 0 ? "named correctly" : o === 1 ? (r.stranger ? "refused (correct)" : "Someone new") : "wrong name"}`}
                    className="block rounded-[3px]" style={{ background: cell(s, o, r.stranger) }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-f-label text-muted">
        <span>Less</span>
        {[25, 45, 70, 100].map((l) => <i key={l} className="block h-[13px] w-[13px] rounded-[3px]" style={{ background: `color-mix(in oklab, var(--color-primary) ${l}%, var(--color-surface))` }} />)}
        <span>More confident</span>
        <i className="ml-3 block h-[13px] w-[13px] rounded-[3px]" style={{ background: "color-mix(in oklab, var(--color-warn) 55%, var(--color-surface))" }} /><span>Someone new</span>
        <i className="ml-3 block h-[13px] w-[13px] rounded-[3px]" style={{ background: "var(--color-danger)" }} /><span>wrong name</span>
      </div>
    </Panel>
  );
}

/** Who spoke when in the simulated demo call: one lane per person, one block per utterance. */
export function CallTimeline() {
  const lanes = [...participantIds, "unknown"];
  const W = 1100, L = 120, LH = 36, H = lanes.length * LH + 34;
  const span = Math.max(CALL_END - CALL_START, 1);
  const x = (t: number) => L + ((t - CALL_START) / span) * (W - L - 10);
  const ticks = Array.from({ length: Math.floor(span / 10) + 1 }, (_, i) => CALL_START + i * 10).filter((t) => t <= CALL_END);
  return (
    <Panel title="Who spoke, and when" sub="Each block is one thing someone said; brighter means a closer match to their voiceprint. Diamonds mark what the notetaker saved.">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[760px] w-full" role="img" aria-label="Speaker timeline">
          {lanes.map((id, i) => (
            <g key={id} transform={`translate(0 ${i * LH})`}>
              <rect x={L} width={W - L - 10} height={LH - 6} rx={6} className="fill-bg" />
              <text x={L - 10} y={LH / 2 - 1} textAnchor="end" className="fill-text text-[12.5px] font-medium">{id === "unknown" ? "Someone new" : get(id).name}</text>
            </g>
          ))}
          {timeline.map((u) => {
            const lane = u.speakerId === null ? lanes.length - 1 : lanes.indexOf(u.speakerId);
            if (lane < 0) return null;
            const fill = u.speakerId === null ? "var(--color-warn)" : `var(--color-series-${(lane % 6) + 1})`;
            return (
              <g key={u.id}>
                <rect x={x(u.at)} y={lane * LH + 3} width={Math.max(x(u.at + u.speakFor) - x(u.at), 6)} height={LH - 12} rx={5} fill={fill} opacity={0.35 + 0.65 * Math.min(1, u.speakerScore)} strokeDasharray={u.lowConfidence ? "4 3" : undefined} stroke={u.lowConfidence ? "var(--color-text)" : undefined}>
                  <title>{`${u.speakerId === null ? "Someone new" : get(u.speakerId).name} · ${formatCallTime(u.at)} · match ${u.speakerScore.toFixed(2)} · ${u.text}`}</title>
                </rect>
                {u.captured && <rect x={x(u.at + u.speakFor) - 4} y={lane * LH - 3} width={9} height={9} transform={`rotate(45 ${x(u.at + u.speakFor)} ${lane * LH + 1.5})`} fill={u.captured.warn ? "var(--color-warn)" : "var(--color-primary)"} />}
              </g>
            );
          })}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={lanes.length * LH - 4} y2={lanes.length * LH + 2} className="stroke-muted" />
              <text x={x(t)} y={lanes.length * LH + 18} textAnchor="middle" className="fill-muted text-[11px] tabular-nums">{formatCallTime(t)}</text>
            </g>
          ))}
        </svg>
      </div>
    </Panel>
  );
}
