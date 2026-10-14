"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/ui";
import { approvals, FILTERS, type ApprovalItem } from "@/lib/mocks/approvals";
import { useDemo } from "@/lib/demo-store";
import { spring, springQuick } from "@/lib/motion";

/**
 * F5 Approvals. Nothing reaches the resident's iPad until someone here
 * approves it, so every card carries the source quote it came from.
 */
export default function ApprovalQueue() {
  const [filter, setFilter] = useState<string>("all");
  const { resolved, resolve } = useDemo();

  const active = FILTERS.find((f) => f.id === filter)!;
  const visible = approvals.filter(
    (a) =>
      !resolved[a.id] &&
      (active.kinds === null || (active.kinds as readonly string[]).includes(a.kind)),
  );

  const countFor = (kinds: readonly string[] | null) =>
    approvals.filter(
      (a) => !resolved[a.id] && (kinds === null || kinds.includes(a.kind)),
    ).length;

  return (
    <div className="mx-auto max-w-[900px] p-8">
      <header className="mb-6">
        <h1 className="text-f-h1">Approvals</h1>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const on = f.id === filter;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`relative flex min-h-[44px] items-center gap-2 rounded-[12px] px-3 text-f-small transition-colors ${
                on ? "text-primary" : "text-muted hover:bg-tint/50"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="queue-filter"
                  transition={spring}
                  className="absolute inset-0 -z-10 rounded-[12px] bg-tint"
                />
              )}
              {f.label}
              <span className="font-mono">{countFor(f.kinds)}</span>
            </button>
          );
        })}
      </div>

      {/* layout on the list is what closes the gap when a card leaves. */}
      <motion.div layout className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item) => (
            <Card
              key={item.id}
              item={item}
              onResolve={(how) => resolve(item.id, how)}
            />
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyState
              title="All caught up"
              note="New items from calls land here."
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function Card({
  item,
  onResolve,
}: {
  item: ApprovalItem;
  onResolve: (how: "approved" | "rejected") => void;
}) {
  const warn = item.kind === "med";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      // Leaving is the completion signal — the card goes, the list closes up.
      exit={{ opacity: 0, scale: 0.96, transition: springQuick }}
      transition={spring}
      className={`rounded-[12px] border p-5 ${
        warn
          ? "border-[#EADFC4] bg-warn-bg"
          : item.kind === "person"
            ? "border-dashed border-muted bg-surface"
            : "border-tint bg-surface"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 font-mono text-f-label uppercase ${
            warn ? "bg-warn/10 text-warn" : "bg-tint text-muted"
          }`}
        >
          {item.kindLabel}
        </span>
        <span className={`font-mono text-f-label ${warn ? "text-warn" : "text-muted"}`}>
          {item.source}
        </span>
      </div>

      <h2 className={`text-f-h2 ${warn ? "text-warn" : "text-text"}`}>{item.title}</h2>

      {/* The source quote, verbatim, with who said it. The claim is always
          traceable back to the words on the call. */}
      <blockquote
        className={`mt-3 border-l-2 pl-3 text-f-body italic ${
          warn ? "border-warn/40 text-warn" : "border-tint text-muted"
        }`}
      >
        “{item.quote}”
        <div className="mt-1 not-italic">
          <span className="font-semibold">{item.quoteBy}</span>{" "}
          <span className="font-mono text-f-label">{item.quoteMeta}</span>
        </div>
      </blockquote>

      {item.detail && (
        <div className="mt-3 rounded-[12px] bg-bg px-3 py-2 text-f-small">{item.detail}</div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => onResolve("approved")}>
          <Check size={18} aria-hidden /> Approve
        </Button>
        <Button variant="quiet" onClick={() => onResolve("rejected")}>
          <X size={18} aria-hidden /> Reject
        </Button>
      </div>
    </motion.article>
  );
}
