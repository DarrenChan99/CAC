import Link from "next/link";
import { Section } from "@/components/how/Section";
import { DecisionSphere } from "@/components/how/DecisionSphere";
import { EcapaNet3D } from "@/components/how/EcapaNet3D";
import { EmbeddingSpace } from "@/components/how/EmbeddingSpace";
import { WorkflowRun } from "@/components/how/GithubCharts";
import { Spectrogram3D } from "@/components/how/Spectrogram3D";
import { Term } from "@/components/how/Term";
import { VoiceprintRings } from "@/components/how/VoiceprintRings";
import { glossary } from "@/lib/how/glossary";

export const metadata = { title: "How it works · Caretaker" };

export default function HowItWorks() {
  return (
    <>
      <main className="mx-auto flex max-w-[1180px] flex-col gap-14 px-6 py-10">
        <div>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold leading-tight tracking-[-0.02em]">How Caretaker knows who is speaking</h1>
          <p className="mt-3 max-w-[70ch] text-f-h3 font-normal text-muted">
            <Term k="vad" /> → <Term k="ecapa" /> → <Term k="openset" />. Every chart and 3-D scene below is drawn from our own recordings.
          </p>
        </div>

        <Section id="pipeline" n="1" title="The pipeline">
          <WorkflowRun />
          <Spectrogram3D />
        </Section>

        <Section id="encoder" n="2" title="The encoder">
          <EcapaNet3D />
          <VoiceprintRings />
        </Section>

        <Section id="space" n="3" title="The voice space">
          <EmbeddingSpace />
        </Section>

        <Section id="decision" n="4" title="The decision">
          <DecisionSphere />
        </Section>

        <section id="glossary" className="scroll-mt-20">
          <details className="group rounded-[16px] border border-tint bg-surface p-6">
            <summary className="flex min-h-[44px] cursor-pointer items-center text-f-h2 font-bold">Glossary<span className="ml-3 text-f-small font-normal text-muted">{Object.keys(glossary).length} terms</span></summary>
            <dl className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
              {Object.values(glossary).map((g) => (
                <div key={g.term} className="border-t border-tint pt-3">
                  <dt className="text-f-body font-semibold text-primary">{g.term}</dt>
                  <dd className="text-f-small text-muted">{g.gloss}</dd>
                </div>
              ))}
            </dl>
          </details>
        </section>
        <Link href="/how-it-works/stats" className="flex min-h-[44px] items-center justify-end text-f-body font-semibold text-primary hover:underline">Next: the stats →</Link>
      </main>
    </>
  );
}
