import Link from "next/link";
import { Section } from "@/components/how/Section";
import { DecisionSphere } from "@/components/how/DecisionSphere";
import { EcapaNet3D } from "@/components/how/EcapaNet3D";
import { EmbeddingSpace } from "@/components/how/EmbeddingSpace";
import { WorkflowRun } from "@/components/how/GithubCharts";
import { DecisionMap2D } from "@/components/how/StatsPanels";
import { Spectrogram3D } from "@/components/how/Spectrogram3D";
import { Term } from "@/components/how/Term";
import { glossary } from "@/lib/how/glossary";

export const metadata = { title: "How it works · Caretaker" };

export default function HowItWorks() {
  return (
    <>
      <main className="mx-auto flex max-w-[1180px] flex-col gap-14 px-6 py-10">
        <div>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold leading-tight tracking-[-0.02em]">How Caretaker knows who is speaking</h1>
          <p className="mt-3 max-w-[70ch] text-f-h3 font-normal text-muted">
            Caretaker <Term k="vad">finds the speech</Term>, <Term k="ecapa">turns each voice into a fingerprint</Term>, and <Term k="openset">only names people it is sure about</Term>. The pages below follow one real clip of my own through every step, and every chart is drawn from real recordings.
          </p>
        </div>

        <Section id="sound" n="1" title="Sound becomes a picture" lead={<>A computer can&apos;t compare two voices by listening. So the first step is to draw the sound: time runs across, pitch runs up, and taller means louder. Different people draw different shapes, even when they say the same words. That picture is all the voice model ever sees.</>}>
          <Spectrogram3D />
        </Section>

        <Section id="model" n="2" title="The picture becomes 192 numbers" lead={<>A <Term k="ecapa">voice model</Term> reads the picture and boils it down to 192 numbers, a voiceprint. It was trained so that two clips of the same person give nearly the same numbers and two different people give different ones. The model is already trained; I only run it.</>}>
          <EcapaNet3D />
        </Section>

        <Section id="space" n="3" title="The numbers put each voice in its own spot" lead={<>192 numbers are a point in a space with 192 directions. We can&apos;t draw that, so below it is squashed to 3. What matters is the pattern: slices of the same person huddle together, and people who aren&apos;t in the family land away from every cloud.</>}>
          <EmbeddingSpace />
        </Section>

        <Section id="decision" n="4" title="A spot becomes a name, or a polite &quot;Someone new&quot;" lead={<>To name a clip, Caretaker measures how close it landed to each family voiceprint. It names someone only if the match is strong (<Term k="tau">the cut-off</Term>) <i>and</i> clearly better than the runner-up (<Term k="margin">the margin</Term>). Otherwise it says “Someone new” rather than guess.</>}>
          <DecisionMap2D />
          <DecisionSphere />
        </Section>

        <Section id="timing" n="5" title="All of it, once a second" lead={<>The whole chain runs on a laptop faster than the audio arrives, so the name can appear while someone is still talking.</>}>
          <WorkflowRun />
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
        <Link href="/how-it-works/stats" className="flex min-h-[44px] items-center justify-end text-f-body font-semibold text-primary hover:underline">Next: how well it works →</Link>
      </main>
    </>
  );
}
