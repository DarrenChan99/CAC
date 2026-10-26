import Link from "next/link";
import { SystemMap } from "@/components/how/Architecture";
import { CallTimeline, RepoPanel, WindowHeatmap } from "@/components/how/GithubCharts";
import { Scores3D } from "@/components/how/Scores3D";
import { Section } from "@/components/how/Section";
import { Term } from "@/components/how/Term";
import { Confusion, CrossSim, DetCurve, EnrollCurve, Kpis, QualityTable } from "@/components/how/StatsPanels";
import stats from "@/lib/how/stats.json";

export const metadata = { title: "Stats · Caretaker" };

export default function Stats() {
  return (
    <main className="mx-auto flex max-w-[1180px] flex-col gap-14 px-6 py-10">
      <div>
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold leading-tight tracking-[-0.02em]">How well does it work?</h1>
        <p className="mt-3 max-w-[70ch] text-f-h3 font-normal text-muted">
          The charts and diagrams below are based on my own data. I use a voice model that was already trained on thousands of open-source public voices (<Term k="voxceleb">VoxCeleb</Term>) and run it on my recordings, a step called <Term k="inference">inference</Term>. {stats.people.length} self-recorded voices build the voiceprints, and {stats.strangers.speakers} strangers from LibriSpeech, a free library of audiobook recordings, check that it doesn&apos;t name someone it shouldn&apos;t. Every test clip was kept out of the voiceprint it was checked against, so the model never saw the answer ahead of time.
        </p>
      </div>
      <Kpis />

      <Section id="evidence" n="1" title="Was every guess right?">
        <WindowHeatmap />
      </Section>
      <Section id="call" n="2" title="The demo call, second by second">
        <CallTimeline />
      </Section>
      <Section id="accuracy" n="3" title="How often is it wrong?">
        <Confusion />
        <Scores3D />
        <div className="grid items-start gap-4 lg:grid-cols-2"><DetCurve /><EnrollCurve /></div>
      </Section>
      <Section id="system" n="4" title="The data and code behind it">
        <div className="grid items-start gap-4 lg:grid-cols-2"><CrossSim /><RepoPanel /></div>
        <QualityTable />
        <SystemMap />
      </Section>

      <Link href="/how-it-works" className="flex min-h-[44px] items-center text-f-body font-semibold text-primary hover:underline">← How it works</Link>
    </main>
  );
}
