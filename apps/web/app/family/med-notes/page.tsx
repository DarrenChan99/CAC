"use client";

import { Banner } from "@/components/ui";
import { Button } from "@/components/Button";
import { medNotes, pendingMedNote, accessList } from "@/lib/mocks/med-notes";

/**
 * F10 Med notes — family-only. This route, and the mock it reads from, are
 * never imported anywhere under app/resident/: the wall is structural, not a
 * hidden link.
 */
export default function MedNotes() {
  const approved = medNotes.filter((n) => n.status === "approved");

  return (
    <div className="mx-auto max-w-[1200px] p-8">
      <header className="mb-4">
        <h1 className="text-f-h1">Med notes</h1>
        <p className="text-f-small text-muted">{approved.length} approved · 1 waiting</p>
      </header>

      <Banner tone="warn">
        <div className="font-semibold">These are notes from your family — not medical instructions</div>
        <div className="mt-0.5">
          Written down from what someone said on a call. They are not checked by a nurse or doctor,
          and they never appear on her iPad.
        </div>
      </Banner>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_336px]">
        <section>
          <div className="mb-2 text-f-small text-muted">newest first</div>
          <div className="flex flex-col gap-2.5">
            {approved.map((n) => (
              <div key={n.id} className="rounded-[12px] border border-tint bg-surface p-4">
                <div className="text-f-body font-semibold">{n.title}</div>
                <blockquote className="mt-1 border-l-2 border-tint pl-2 text-f-small text-muted italic">
                  &ldquo;{n.quote}&rdquo;
                </blockquote>
                <div className="mt-1 text-f-small text-muted">
                  {n.quoteBy} · {n.quoteMeta} · approved by {n.approvedBy}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-[12px] border border-[#EADFC4] bg-warn-bg p-4">
            <div className="font-mono text-f-label uppercase text-warn">Waiting for approval</div>
            <div className="mt-1 text-f-body font-semibold text-warn">{pendingMedNote.title}</div>
            <p className="mt-1 text-f-small text-warn">
              {pendingMedNote.quoteBy} · {pendingMedNote.quoteMeta}. {pendingMedNote.note}
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="primary">Approve</Button>
              <Button variant="quiet">Reject</Button>
            </div>
          </div>

          <div className="rounded-[12px] border border-tint bg-surface p-4">
            <div className="mb-2 text-f-h3">Who can see these</div>
            <div className="flex flex-col gap-2">
              {accessList.map((a) => (
                <div key={a.name} className="flex items-center justify-between text-f-small">
                  <span>
                    {a.name} <span className="text-muted">· {a.relationship}</span>
                  </span>
                  <span className="text-muted">{a.access}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
