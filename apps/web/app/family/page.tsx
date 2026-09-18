"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/Button";
import { PersonAvatar } from "@/components/PersonAvatar";
import { MemoryCard, PanelHeading } from "@/components/ui";
import { approvals } from "@/lib/mocks/approvals";
import { memories, weekSpeakers, weekStats } from "@/lib/mocks/content";
import { get } from "@/lib/mocks/family";
import { relationship } from "@/lib/relationships";
import { spring } from "@/lib/motion";

/** F1 Dashboard — the week at a glance, and the one thing that needs doing. */
export default function FamilyDashboard() {
  return (
    <div className="mx-auto max-w-[1200px] p-8">
      <header className="mb-8 flex flex-wrap items-center gap-4">
        <PersonAvatar initial="M" size="family" />
        <div className="min-w-0 flex-1">
          <h1 className="text-f-h1">Grandma Mei</h1>
          <p className="text-f-small text-muted">
            Pine Ridge, room 12 · iPad online
          </p>
        </div>
        <Link href="/family/call">
          <Button variant="primary">Start call</Button>
        </Link>
      </header>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {weekStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: i * 0.04 }}
            className="rounded-[12px] border border-tint bg-surface p-4"
          >
            <div className="font-mono text-f-label uppercase text-muted">{s.label}</div>
            <div className="mt-1 text-f-h1">{s.value}</div>
            <div className="text-f-small text-muted">{s.note}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[12px] border border-tint bg-surface p-5">
          <PanelHeading title="Grandma's week" note="who spoke, and for how long" />
          <div className="flex flex-col gap-3">
            {weekSpeakers.map((w) => {
              const person = get(w.personId);
              return (
                <div key={w.personId} className="flex items-center gap-3">
                  <PersonAvatar initial={person.initial} size="small" />
                  <div className="w-28 flex-none">
                    <div className="text-f-body font-medium">{person.name}</div>
                    <div className="text-f-small text-muted">{relationship(w.personId)}</div>
                  </div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-tint">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: w.share }}
                      transition={spring}
                      style={{ transformOrigin: "left" }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <div className="w-16 flex-none text-right font-mono text-f-small text-muted">
                    {w.minutes} min
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[12px] border border-tint bg-surface p-5">
          <PanelHeading
            title="Waiting for approval"
            action={
              <Link href="/family/approvals" className="text-f-small text-primary hover:underline">
                Open queue
              </Link>
            }
          />
          <div className="flex flex-col gap-2">
            {approvals.map((a) => (
              <Link
                key={a.id}
                href="/family/approvals"
                className={`block rounded-[12px] border p-3 transition-colors ${
                  a.kind === "med"
                    ? "border-[#EADFC4] bg-warn-bg hover:bg-[#f7e9cd]"
                    : a.kind === "person"
                      ? "border-dashed border-muted bg-bg hover:bg-tint/40"
                      : "border-tint bg-bg hover:bg-tint/40"
                }`}
              >
                <div
                  className={`font-mono text-f-label uppercase ${
                    a.kind === "med" ? "text-warn" : "text-muted"
                  }`}
                >
                  {a.kindLabel}
                </div>
                <div
                  className={`text-f-body font-medium ${
                    a.kind === "med" ? "text-warn" : "text-text"
                  }`}
                >
                  {a.title}
                </div>
                <div
                  className={`text-f-small ${a.kind === "med" ? "text-warn" : "text-muted"}`}
                >
                  {a.quoteBy} · {a.source}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[12px] border border-tint bg-surface p-5">
          <PanelHeading
            title="Recent memories"
            action={<span className="text-f-small text-muted/45">See all · soon</span>}
          />
          <div className="flex flex-col gap-2">
            {memories.slice(0, 3).map((m) => (
              <MemoryCard key={m.id} text={m.text} when={m.when} hasPhoto={m.hasPhoto} />
            ))}
          </div>
        </section>

        <section className="rounded-[12px] border border-tint bg-surface p-5">
          <PanelHeading title="Next visit" />
          <div className="text-f-body">Lisa · Saturday at 2 pm</div>
          <div className="text-f-small text-muted">
            Shown on Grandma&apos;s Today screen
          </div>
        </section>
      </div>
    </div>
  );
}
