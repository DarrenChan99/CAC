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
    <Panel title="System map" sub="Solid boxes run today. Dashed boxes are the 2.0 path: the same scoring code behind a live audio stream.">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <Node t="Enrollment recorder" s="6 sentences · room-relative quality gate" />
          <Node t="Voiceprints" s="centroid per person · voiceprints.npz" />
          <Node t="Offline pipeline" s="VAD → ECAPA → decide → smooth, Whisper in parallel" />
          <Node t="Timeline JSON" s="who · when · text · score" />
          <Node t="Next.js app" s="family view and resident view replay it" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Node dashed t="LiveKit / WebRTC call" s="audio tracks from the room" />
          <Node dashed t="WebSocket stream" s="512-sample blocks into stream.run" />
          <Node dashed t="LLM notetaker" s="memories and tree edits from the transcript" />
        </div>
      </div>
    </Panel>
  );
}
