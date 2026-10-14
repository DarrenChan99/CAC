"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CapturedChip, CapturedRow } from "@/components/CapturedRow";
import { PersonAvatar } from "@/components/PersonAvatar";
import { TranscriptBubble } from "@/components/TranscriptBubble";
import { useDemo } from "@/lib/demo-store";
import { approvals } from "@/lib/mocks/approvals";
import { getCall, minutes } from "@/lib/mocks/calls";
import { formatCallTime, timeline } from "@/lib/mocks/call-timeline";
import { get } from "@/lib/mocks/family";
import { relationship } from "@/lib/relationships";

/** A past call: who was on it, what it captured, and what was said. */
export default function CallDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const call = getCall(id);
  const { resolved, resolve, restore, speakers, fixSpeaker } = useDemo();
  if (!call) notFound();

  const candidates = call.participantIds.map((pid) => ({ id: pid, name: get(pid).name }));
  const captured = approvals.filter((a) => call.capturedIds.includes(a.id));

  return (
    <div className="mx-auto max-w-[760px] p-8">
      <Link href="/family" className="mb-4 inline-flex items-center gap-1 text-f-small text-primary hover:underline">
        <ChevronLeft size={16} aria-hidden /> Home
      </Link>

      <header className="mb-6">
        <h1 className="text-f-h1">{call.long}</h1>
        <p className="text-f-small tabular-nums text-muted">
          {minutes(call.durationSec)} · {call.participantIds.length} people
        </p>
      </header>

      <section className="mb-8 flex flex-wrap gap-4">
        {call.participantIds.map((pid) => (
          <div key={pid} className="flex items-center gap-2">
            <PersonAvatar initial={get(pid).initial} size="small" />
            <div className="leading-tight">
              <div className="text-f-small font-medium">{get(pid).name}</div>
              <div className="text-f-label text-muted">{relationship(pid)}</div>
            </div>
          </div>
        ))}
      </section>

      {captured.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-2 text-f-h3">Captured</h2>
          <div className="flex flex-col gap-2">
            {captured.map((a) => (
              <CapturedRow key={a.id} item={a} resolved={resolved} onResolve={resolve} onRestore={restore} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-f-h3">Transcript</h2>
        {call.hasTranscript ? (
          <div className="flex flex-col gap-4 rounded-[12px] border border-tint bg-surface p-4">
            {timeline.map((u) => {
              const speakerId = u.id in speakers ? speakers[u.id] : u.speakerId;
              const person = speakerId ? get(speakerId) : null;
              return (
                <TranscriptBubble
                  key={u.id}
                  name={person?.name ?? ""}
                  initial={person?.initial ?? "?"}
                  meta={`${person ? `${relationship(person.id)} · ` : "· "}${formatCallTime(u.at)}`}
                  text={u.text}
                  lowConfidence={u.lowConfidence}
                  uncertainWord={u.uncertainWord}
                  unknown={!person}
                  candidates={candidates}
                  onReassign={(pid) => fixSpeaker(u.id, pid)}
                >
                  {u.captured && <CapturedChip item={u.captured} />}
                </TranscriptBubble>
              );
            })}
          </div>
        ) : (
          <p className="rounded-[12px] border border-dashed border-tint p-6 text-center text-f-small text-muted">
            Transcript not kept for this call.
          </p>
        )}
      </section>
    </div>
  );
}
