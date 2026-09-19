"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { PersonAvatar } from "@/components/PersonAvatar";
import { byId, speakerColor, type Correction } from "@/lib/mocks/calls";
import { get } from "@/lib/mocks/family";
import { formatCallTime } from "@/lib/mocks/call-timeline";

/**
 * F4b Call detail. Corrections are proposals, not edits — nothing changes
 * until a *different* family member confirms.
 */
export default function CallDetail({ params }: PageProps<"/family/calls/[id]">) {
  const { id } = use(params);
  const call = byId(id);
  if (!call) notFound();

  const [correction, setCorrection] = useState<Correction | undefined>(call.correction);
  const total = call.segments.length ? call.segments[call.segments.length - 1].endMs : 0;

  return (
    <div className="mx-auto max-w-[1200px] p-8">
      <header className="mb-6">
        <Link href="/family/calls" className="text-f-small text-muted hover:text-primary">
          ← Back to calls
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-f-h2">{call.when}</h1>
            <p className="text-f-small text-muted">
              {call.durationMin ? `${call.durationMin} minutes · ` : ""}
              {call.participants}
            </p>
          </div>
          <Button variant="secondary">Export transcript</Button>
        </div>
      </header>

      {call.segments.length > 0 && (
        <div className="mb-6 rounded-[12px] border border-tint bg-surface p-5">
          <div className="mb-1 flex items-baseline justify-between">
            <div className="text-f-h3">Who held the floor</div>
            <div className="text-f-small text-muted">Tap a band to jump to that moment</div>
          </div>
          <div className="mt-3 flex h-10 overflow-hidden rounded-[10px]">
            {call.segments.map((s, i) => {
              const person = s.speakerId === "unknown" ? null : get(s.speakerId);
              const width = ((s.endMs - s.startMs) / total) * 100;
              return (
                <button
                  key={i}
                  style={{ width: `${width}%`, background: speakerColor[s.speakerId] }}
                  className="flex items-center justify-center border-r border-white text-xs font-semibold text-white last:border-r-0"
                  title={person?.name ?? "Unknown"}
                >
                  {width > 12 && (person?.name ?? "Unknown")}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {Object.entries(speakerColor).map(([id, color]) =>
              call.segments.some((s) => s.speakerId === id) ? (
                <span key={id} className="flex items-center gap-1.5 text-f-small text-muted">
                  <span className="h-3 w-3 rounded-[3px]" style={{ background: color }} />
                  {id === "unknown" ? "Unknown voice" : get(id).name}
                </span>
              ) : null,
            )}
            <span className="ml-auto font-mono text-f-small text-muted">
              0:00 · {formatCallTime(total / 2)} · {formatCallTime(total)}
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_392px]">
        <section className="rounded-[12px] border border-tint bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-f-h3">Transcript</h2>
            <input
              placeholder="Search transcript"
              className="min-h-[36px] rounded-[12px] border border-tint bg-bg px-3 text-f-small"
            />
          </div>
          <div className="flex flex-col gap-4">
            {(call.transcript ?? []).map((line) => {
              const person = line.speakerId ? get(line.speakerId) : null;
              const isCorrected = correction && correction.atMs === line.atMs;
              return (
                <div key={line.id} className="flex gap-3">
                  <div className="w-10 flex-none pt-1 font-mono text-f-small text-muted">
                    {formatCallTime(line.atMs)}
                  </div>
                  <PersonAvatar initial={person?.initial ?? "?"} size="small" unknown={!person} />
                  <div
                    className={`min-w-0 flex-1 rounded-[12px] p-3 ${
                      !person ? "border border-dashed border-muted" : "bg-bg"
                    } ${line.lowConfidence ? "bg-warn-bg" : ""}`}
                  >
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="text-f-small font-semibold">
                        {person ? person.name : "Unknown speaker"}
                      </span>
                      {isCorrected && (
                        <span className="rounded-full bg-warn-bg px-2 py-0.5 text-xs font-semibold text-warn">
                          correction pending
                        </span>
                      )}
                      <button className="ml-auto text-f-small text-primary underline">
                        Wrong speaker? Fix it
                      </button>
                    </div>
                    <div className="text-f-body">{line.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          {correction && correction.status === "proposed" && (
            <div className="rounded-[12px] border border-[#EADFC4] bg-warn-bg p-4">
              <div className="font-mono text-f-label uppercase text-warn">
                Correction · waiting for confirmation
              </div>
              <p className="mt-2 text-f-body text-warn">
                {correction.proposedBy} says {formatCallTime(correction.atMs)} was{" "}
                {get(correction.toSpeakerId).name}, not {get(correction.fromSpeakerId).name}.
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-[12px] bg-surface p-2 text-f-small">
                <span className="rounded-full bg-[#F0F0EA] px-2 py-0.5 line-through">
                  {get(correction.fromSpeakerId).name}
                </span>
                →
                <span className="rounded-full bg-tint px-2 py-0.5 text-primary">
                  {get(correction.toSpeakerId).name}
                </span>
              </div>
              <p className="mt-2 text-f-small text-warn">
                Nothing changes until another family member confirms.{" "}
                {get(correction.toSpeakerId).name}&apos;s voice profile is untouched until then.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => setCorrection({ ...correction, status: "confirmed" })}
                >
                  Confirm
                </Button>
                <Button
                  variant="quiet"
                  onClick={() => setCorrection({ ...correction, status: "rejected" })}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
          {correction && correction.status !== "proposed" && (
            <div className="rounded-[12px] border border-tint bg-surface p-4 text-f-small text-muted">
              Correction {correction.status}.
            </div>
          )}

          <div className="rounded-[12px] border border-tint bg-surface p-4">
            <div className="mb-2 text-f-h3">Captured from this call · {call.capturedCount ?? 0} items</div>
            <div className="flex flex-col gap-2">
              {call.transcript
                ?.filter((l) => l.lowConfidence)
                .map((l) => (
                  <div key={l.id} className="rounded-[12px] bg-bg p-2 text-f-small">
                    <div className="flex justify-between font-mono text-f-label uppercase text-muted">
                      <span>Med note</span>
                      <span>{formatCallTime(l.atMs)}</span>
                    </div>
                    <div className="font-medium">Blood pressure pill at 8 am</div>
                    <div className="text-muted">David · waiting for approval</div>
                  </div>
                ))}
              <div className="rounded-[12px] bg-bg p-2 text-f-small">
                <div className="flex justify-between font-mono text-f-label uppercase text-muted">
                  <span>Memory</span>
                  <span>2:14</span>
                </div>
                <div className="font-medium">Emily passed her driving test</div>
                <div className="text-muted">Emily · approved by Lisa</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
