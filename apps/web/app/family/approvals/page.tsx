"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CapturedRow } from "@/components/CapturedRow";
import { EmptyState } from "@/components/ui";
import { approvals, FILTERS } from "@/lib/mocks/approvals";
import { useDemo } from "@/lib/demo-store";
import { spring } from "@/lib/motion";

/**
 * F5 Captured. The call takes notes; memories go straight to Grandma's iPad.
 * This is where the family takes one back, or confirms a new person or tree edit.
 */
export default function Captured() {
  const [filter, setFilter] = useState<string>("all");
  const { resolved, resolve, restore } = useDemo();

  const active = FILTERS.find((f) => f.id === filter)!;
  const visible = approvals.filter(
    (a) => active.kinds === null || (active.kinds as readonly string[]).includes(a.kind),
  );

  return (
    <div className="mx-auto max-w-[760px] p-8">
      <header className="mb-6">
        <h1 className="text-f-h1">Captured</h1>
        <p className="text-f-small text-muted">What the calls picked up. Memories show on her iPad.</p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-1">
        {FILTERS.map((f) => {
          const on = f.id === filter;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`relative flex min-h-[44px] items-center rounded-[12px] px-3 text-f-small transition-colors ${
                on ? "font-semibold text-primary" : "text-muted hover:bg-tint/50"
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
            </button>
          );
        })}
      </div>

      <motion.div layout className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item) => (
            <CapturedRow key={item.id} item={item} resolved={resolved} onResolve={resolve} onRestore={restore} />
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <EmptyState title="Nothing here" note="New items from calls land here." />
        )}
      </motion.div>
    </div>
  );
}
