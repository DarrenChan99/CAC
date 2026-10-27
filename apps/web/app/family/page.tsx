"use client";

import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/Button";
import { CapturedRow } from "@/components/CapturedRow";
import { PersonAvatar } from "@/components/PersonAvatar";
import { PanelHeading } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { approvals } from "@/lib/mocks/approvals";
import { calls, minutes } from "@/lib/mocks/calls";
import { get } from "@/lib/mocks/family";
import { needsConfirm } from "@/lib/residentFeed";

/** F1 Home — what needs you, then your recent calls. */
export default function FamilyHome() {
  const { resolved, resolve, restore } = useDemo();
  const waiting = needsConfirm(resolved);

  return (
    <div className="mx-auto max-w-[760px] p-8">
      <header className="mb-8 flex flex-wrap items-center gap-4">
        <PersonAvatar initial="M" personId="mei" size="family" />
        <h1 className="min-w-0 flex-1 text-f-h1">Grandma Mei</h1>
        <Link href="/family/call">
          <Button variant="primary">
            <Phone size={18} aria-hidden /> Start call
          </Button>
        </Link>
      </header>

      {waiting.length > 0 && (
        <section className="mb-8">
          <PanelHeading
            title="Needs you"
            note={`${waiting.length} to confirm`}
            action={
              <Link href="/family/approvals" className="text-f-small text-primary hover:underline">
                See all captured
              </Link>
            }
          />
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {waiting.map((a) => (
                <CapturedRow key={a.id} item={a} resolved={resolved} onResolve={resolve} onRestore={restore} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      <section>
        <PanelHeading title="Recent calls" />
        <div className="divide-y divide-tint overflow-hidden rounded-[12px] border border-tint bg-surface">
          {calls.map((c) => {
            const n = c.capturedIds.filter((id) => approvals.some((a) => a.id === id)).length;
            return (
              <Link
                key={c.id}
                href={`/family/calls/${c.id}`}
                className="flex min-h-[64px] items-center gap-4 px-4 py-3 transition-colors hover:bg-bg"
              >
                <div className="flex -space-x-2">
                  {c.participantIds.slice(0, 4).map((id) => (
                    <PersonAvatar
                      key={id}
                      initial={get(id).initial} personId={id}
                      size="small"
                      className="ring-2 ring-[var(--color-surface)]"
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-f-body font-medium">{c.label}</div>
                  <div className="truncate text-f-small text-muted">
                    {c.participantIds.map((id) => get(id).name).join(", ")}
                  </div>
                </div>
                <div className="flex-none text-right text-f-small tabular-nums text-muted">
                  <div>{minutes(c.durationSec)}</div>
                  {n > 0 && <div>{n} captured</div>}
                </div>
                <ChevronRight size={18} aria-hidden className="flex-none text-muted" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
