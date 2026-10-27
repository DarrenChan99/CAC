import Link from "next/link";
import { SystemMap } from "@/components/how/Architecture";
import { CallTimeline } from "@/components/how/GithubCharts";
import { Section } from "@/components/how/Section";
import { Confusion, DetCurve, EnrollCurve, QualityTable, VoiceDifference } from "@/components/how/StatsPanels";
import { StressCharts } from "@/components/how/StressCharts";
import { Term } from "@/components/how/Term";
import { ThresholdLab } from "@/components/how/ThresholdLab";
import stats from "@/lib/how/stats.json";

export const metadata = { title: "Stats · Caretaker" };

export default function Stats() {
  return (
    <main className="mx-auto flex max-w-[1180px] flex-col gap-14 px-6 py-10">
      <div>
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold leading-tight tracking-[-0.02em]">How well does it work, and where does it break?</h1>
        <p className="mt-3 max-w-[70ch] text-f-h3 font-normal text-muted">
          I use a voice model that was already trained on thousands of public voices (<Term k="voxceleb">VoxCeleb</Term>) and run it on my recordings, a step called <Term k="inference">inference</Term>. {stats.people.length} self-recorded voices build the voiceprints, and {stats.strangers.speakers} strangers from LibriSpeech, a free library of audiobook recordings, check that it doesn&apos;t name someone it shouldn&apos;t. Every test clip was kept out of the voiceprint it was checked against. Two voices at home is an easy test, so section 3 pushes the same system until it fails.
        </p>
      </div>

      <Section id="evidence" n="1" title="Was every guess right? Move the cut-off and see">
        <ThresholdLab />
        <VoiceDifference />
      </Section>
      <Section id="call" n="2" title="The recorded demo call, second by second">
        <CallTimeline />
      </Section>
      <Section id="limits" n="3" title="Where it breaks">
        <StressCharts />
      </Section>
      <Section id="method" n="4" title="How I tested it">
        <Confusion />
        <div className="grid items-start gap-4 lg:grid-cols-2"><DetCurve /><EnrollCurve /></div>
        <QualityTable />
        <SystemMap />
      </Section>

      <Link href="/how-it-works" className="flex min-h-[44px] items-center text-f-body font-semibold text-primary hover:underline">← How it works</Link>
    </main>
  );
}
