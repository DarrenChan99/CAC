"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GitBranch, Heart, Pill, Trash2, UserPlus, type LucideIcon } from "lucide-react";
import type { ApprovalItem } from "@/lib/mocks/approvals";
import type { CapturedItem } from "@/lib/mocks/call-timeline";
import type { Resolved } from "@/lib/residentFeed";
import { spring, springQuick } from "@/lib/motion";

/** Keyed by kind label, which approvals and the call timeline share. */
export const ICON: Record<CapturedItem["kind"], LucideIcon> = {
  Memory: Heart,
  "Med note": Pill,
  "New person": UserPlus,
  "Tree edit": GitBranch,
};

/** One word for the call-bar popover. */
export const STATUS: Record<CapturedItem["kind"], string> = {
  Memory: "Saved",
  "Med note": "Family only",
  "New person": "Needs confirm",
  "Tree edit": "Needs confirm",
};

const CHIP: Record<CapturedItem["kind"], string> = {
  Memory: "Saved as a memory",
  "Med note": "Family-only note",
  "New person": "New person · needs confirm",
  "Tree edit": "Tree edit · needs confirm",
};

/** One quiet line under the transcript line that produced it. No buttons: the call only takes notes. */
export function CapturedChip({ item }: { item: CapturedItem }) {
  const Icon = ICON[item.kind];
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className={`mt-2 inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-f-small ${
        item.warn ? "bg-warn-bg text-warn" : "bg-tint text-primary"
      }`}
    >
      <Icon size={14} aria-hidden className="flex-none" />
      <span className="truncate">
        {CHIP[item.kind]} · {item.title}
      </span>
    </motion.div>
  );
}

const small =
  "flex min-h-[36px] items-center rounded-[10px] px-3 text-f-small font-medium transition-colors";

/**
 * A thin, one-tap row. Click the row to see the words it came from; the
 * buttons on the right are the only actions.
 */
export function CapturedRow({
  item,
  resolved,
  onResolve,
  onRestore,
}: {
  item: ApprovalItem;
  resolved: Resolved;
  onResolve: (id: string, how: "removed" | "confirmed") => void;
  onRestore: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = ICON[item.kindLabel as CapturedItem["kind"]];
  const state = resolved[item.id];
  const warn = item.kind === "med";
  const needsConfirm = (item.kind === "person" || item.kind === "tree") && !state;

  const status =
    state === "removed"
      ? item.kind === "memory" || warn
        ? "Removed"
        : "Dismissed"
      : state === "confirmed"
        ? "Added"
        : item.kind === "memory"
          ? "On her iPad"
          : warn
            ? "Family only"
            : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: state === "removed" ? 0.55 : 1, y: 0 }}
      exit={{ opacity: 0, transition: springQuick }}
      transition={spring}
      className="overflow-hidden rounded-[12px] border border-tint bg-surface"
    >
      <div className="flex items-center gap-1 pr-2">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-h-[52px] min-w-0 flex-1 items-center gap-3 px-3 text-left"
        >
          <Icon size={18} aria-hidden className={`flex-none ${warn ? "text-warn" : "text-primary"}`} />
          <span className="min-w-0 flex-1">
            <span className={`block truncate text-f-body font-medium ${state === "removed" ? "line-through" : ""}`}>
              {item.title}
            </span>
            <span className="block truncate text-f-label text-muted">
              {item.kindLabel} · {item.source}
            </span>
          </span>
          {status && <span className="flex-none text-f-small text-muted">{status}</span>}
        </button>

        {state === "removed" ? (
          <button onClick={() => onRestore(item.id)} className={`${small} text-primary hover:bg-tint`}>
            Undo
          </button>
        ) : needsConfirm ? (
          <>
            <button
              onClick={() => onResolve(item.id, "confirmed")}
              className={`${small} bg-primary text-white hover:bg-primary-hover`}
            >
              Confirm
            </button>
            <button onClick={() => onResolve(item.id, "removed")} className={`${small} text-muted hover:bg-tint`}>
              Dismiss
            </button>
          </>
        ) : state !== "confirmed" ? (
          <button
            onClick={() => onResolve(item.id, "removed")}
            aria-label={`Remove ${item.title}`}
            title="Remove"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-muted transition-colors hover:bg-tint hover:text-text"
          >
            <Trash2 size={16} aria-hidden />
          </button>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
          >
            <div className="border-t border-tint px-4 py-3 text-f-small">
              <p className="text-f-body italic text-muted">“{item.quote}”</p>
              <p className="mt-1 text-muted">
                <span className="font-semibold text-text">{item.quoteBy}</span> {item.quoteMeta}
              </p>
              {item.detail && <p className="mt-2 text-muted">{item.detail}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
