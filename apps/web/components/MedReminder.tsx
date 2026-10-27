"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pill } from "lucide-react";
import { Button } from "./Button";
import { spring } from "@/lib/motion";

const KEY = "caretaker-med-reminder";
/** How long after she first opens her view the demo reminder arrives. */
const DELAY_MS = 6000;

/**
 * The demo's one medication reminder, shown once per session a little after
 * the resident view opens. It waits for her tap — it never times out.
 * ponytail: a fixed demo moment; real reminders come from a schedule.
 */
export function MedReminder() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) return;
    } catch {}
    const t = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem(KEY, "shown");
      } catch {}
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={spring}
          role="alertdialog"
          aria-labelledby="med-reminder-title"
          className="fixed inset-x-0 top-8 z-50 mx-auto flex w-[min(720px,calc(100%-48px))] items-center gap-8 rounded-[16px] border-2 border-primary bg-surface p-8 shadow-lg"
        >
          <div className="flex h-[96px] w-[96px] flex-none items-center justify-center rounded-full bg-tint text-primary">
            <Pill size={48} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div id="med-reminder-title" className="text-r-h2">
              Time for your blood pressure pill
            </div>
            <div className="mt-2 text-r-body text-muted">Kevin reminded you on Sunday&apos;s call</div>
          </div>
          <Button scale="resident" variant="primary" onClick={() => setOpen(false)}>
            Done
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
