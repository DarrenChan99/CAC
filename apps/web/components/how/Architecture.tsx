import { Panel } from "./Term";

const Node = ({ t, s, dashed }: { t: string; s: string; dashed?: boolean }) => (
  <div className={`flex-1 rounded-[10px] border px-3 py-2 ${dashed ? "border-dashed border-muted" : "border-primary bg-tint"}`}>
    <div className="text-f-small font-semibold">{t}</div>
    <div className="text-f-label text-muted">{s}</div>
  </div>
);

/** Files and services, with what is real today and what is 2.0. */
export function SystemMap() {
  return (
    <Panel title="How the pieces fit together" sub="Solid boxes run today. Dashed boxes come next: the same code, listening to a live call.">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <Node t="Recording a voice" s="Each person reads 6 sentences; takes too quiet or noisy for the room are redone" />
          <Node t="Saving voiceprints" s="One averaged voiceprint per person (centroid), stored in voiceprints.npz" />
          <Node t="Naming the speakers" s="Find speech (VAD) → make a voiceprint (ECAPA) → match a name → steady it; Whisper writes the words alongside" />
          <Node t="The call timeline" s="Who spoke, when, what they said and how sure it was (JSON)" />
          <Node t="The app" s="Family and resident views play the timeline back (Next.js)" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Node dashed t="Live video call" s="Each person's audio arrives straight from the call (LiveKit / WebRTC)" />
          <Node dashed t="Live audio stream" s="Audio sent in 32 ms blocks to the same naming code (WebSocket)" />
          <Node dashed t="AI notetaker" s="A language model (LLM) reads the transcript and picks out memories and family-tree changes" />
        </div>
      </div>
    </Panel>
  );
}
