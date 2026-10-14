"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, Phone, X } from "lucide-react";
import { Button } from "@/components/Button";
import { PersonAvatar } from "@/components/PersonAvatar";
import { PanelHeading } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { weekSpeakers } from "@/lib/mocks/content";
import { CALL_END, CALL_START, formatCallTime } from "@/lib/mocks/call-timeline";
import { get } from "@/lib/mocks/family";
import { pending } from "@/lib/residentFeed";
import { relationship } from "@/lib/relationships";
import { spring, springQuick } from "@/lib/motion";

/** F1 Home — the one thing that needs doing, then who spoke. */
export default function FamilyHome() {
  const { resolved, resolve } = useDemo();
  const waiting = pending(resolved);

  return (
    <div className="mx-auto max-w-[1200px] p-8">
      <header className="mb-8 flex flex-wrap items-center gap-4">
        <PersonAvatar initial="M" size="family" />
        <h1 className="min-w-0 flex-1 text-f-h1">Grandma Mei</h1>
        <Link href="/family/call">
          <Button variant="primary">
            <Phone size={18} aria-hidden /> Start call
          </Button>
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[12px] border border-tint bg-surface p-5 lg:row-span-2">
          <PanelHeading
            title="Needs approval"
            note={waiting.length ? `${waiting.length} waiting` : undefined}
            action={
              <Link href="/family/approvals" className="text-f-small text-primary hover:underline">
                Open all
              </Link>
            }
          />
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {waiting.map((a) => {
                const med = a.kind === "med";
                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, transition: springQuick }}
                    transition={spring}
                    className={`flex items-center gap-3 rounded-[12px] border p-3 ${
                      med ? "border-[#EADFC4] bg-warn-bg" : "border-tint bg-bg"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className={`font-mono text-f-label uppercase ${med ? "text-warn" : "text-muted"}`}>
                        {a.kindLabel}
                      </div>
                      <div className={`text-f-body font-medium ${med ? "text-warn" : "text-text"}`}>
                        {a.title}
                      </div>
                      <div className={`text-f-small ${med ? "text-warn" : "text-muted"}`}>
                        {a.quoteBy} · {a.source}
                      </div>
                    </div>
                    <IconButton label={`Approve ${a.title}`} onClick={() => resolve(a.id, "approved")}>
                      <Check size={20} aria-hidden />
                    </IconButton>
                    <IconButton label={`Reject ${a.title}`} onClick={() => resolve(a.id, "rejected")}>
                      <X size={20} aria-hidden />
                    </IconButton>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {waiting.length === 0 && <div className="text-f-body text-muted">All caught up</div>}
          </div>
        </section>

        <section className="rounded-[12px] border border-tint bg-surface p-5">
          <PanelHeading title="Who spoke this week" />
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

        <Link
          href="/family/call"
          className="flex items-center gap-4 rounded-[12px] border border-tint bg-surface p-5 transition-colors hover:border-primary"
        >
          <div className="min-w-0 flex-1">
            <div className="text-f-h3">Last call</div>
            <div className="text-f-small text-muted">
              Sunday · {formatCallTime(CALL_END - CALL_START)}
            </div>
          </div>
          <div className="flex -space-x-2">
            {["lisa", "emily", "david", "ken"].map((id) => (
              <PersonAvatar
                key={id}
                initial={get(id).initial}
                size="small"
                className="ring-2 ring-[var(--color-surface)]"
              />
            ))}
          </div>
        </Link>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 flex-none items-center justify-center rounded-[12px] border border-tint bg-surface text-primary transition-colors hover:bg-tint"
    >
      {children}
    </motion.button>
  );
}
