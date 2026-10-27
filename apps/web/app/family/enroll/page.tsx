"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Banner, ConsentBlock } from "@/components/ui";
import { spring } from "@/lib/motion";

const STEPS = ["Consent", "Read aloud", "Quality", "Test me"];

const PROMPTS = [
  "The garden looks different every time I visit.",
  "We should call on Sunday afternoon like we always do.",
  "Seven bright blue umbrellas were left by the door.",
];

/**
 * F8 Voice enrollment. Consent comes first and is a real choice — the whole
 * feature depends on people agreeing to a voiceprint, so the ask is plain
 * about what is stored and what is not.
 */
export default function VoiceEnrollment() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [consented, setConsented] = useState(false);
  const [recorded, setRecorded] = useState(0);
  const [done, setDone] = useState(false);

  function go(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(Math.max(0, Math.min(STEPS.length - 1, next)));
  }

  return (
    <div className="mx-auto max-w-[720px] p-8">
      <header className="mb-6">
        <h1 className="text-f-h1">Set up your voice</h1>
      </header>

      {/* Stepper — the marker slides between steps rather than redrawing. */}
      <div className="mb-8 flex gap-2">
        {STEPS.map((label, i) => {
          const on = i === step;
          const done = i < step;
          return (
            <div
              key={label}
              className="relative flex flex-1 items-center gap-2 rounded-[12px] border border-tint px-3 py-2"
            >
              {on && (
                <motion.span
                  layoutId="enroll-step"
                  transition={spring}
                  className="absolute inset-0 -z-10 rounded-[12px] bg-primary"
                />
              )}
              <span
                className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-f-label font-medium tabular-nums ${
                  on ? "bg-white text-primary" : "bg-tint text-primary"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={`text-f-small ${on ? "text-white" : "text-muted"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Steps travel on one axis, in and out the same way. */}
      <div className="relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -32 }}
            transition={spring}
          >
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <ConsentBlock
                  title="Your voiceprint, your choice"
                  body="We store a mathematical voiceprint — not recordings. It is used only to label who is speaking during family calls."
                  checkboxLabel="I agree to a voiceprint being made from my speech."
                  checked={consented}
                  onChange={setConsented}
                />
                <Banner tone="info">Audio retention is off by default.</Banner>
                <div className="flex gap-2">
                  <Button variant="primary" disabled={!consented} onClick={() => go(1)}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="rounded-[12px] border border-tint bg-surface p-5">
                  <div className="text-f-label font-medium text-muted">
                    Step 2 · Read aloud · {Math.min(recorded + 1, PROMPTS.length)} of{" "}
                    {PROMPTS.length}
                  </div>
                  <div className="mt-2 text-f-h3">Read this out in your normal voice</div>
                  <p className="mt-4 rounded-[12px] bg-bg p-4 text-f-h3 leading-relaxed">
                    {PROMPTS[Math.min(recorded, PROMPTS.length - 1)]}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-f-small text-muted">Microphone level</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-tint">
                      <motion.div
                        animate={{ scaleX: [0.35, 0.8, 0.5, 0.72] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        style={{ transformOrigin: "left" }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                    <span className="text-f-label font-medium tabular-nums text-primary">good</span>
                  </div>

                  <div className="mt-3 text-f-small text-muted">
                    {recorded} prompt{recorded === 1 ? "" : "s"} recorded · about{" "}
                    {recorded * 10} seconds so far
                  </div>
                </div>

                <div className="flex gap-2">
                  {recorded < PROMPTS.length ? (
                    <Button variant="primary" onClick={() => setRecorded((r) => r + 1)}>
                      Record this prompt
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={() => go(2)}>
                      Continue
                    </Button>
                  )}
                  <Button variant="quiet" onClick={() => go(0)}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="rounded-[12px] border border-tint bg-surface p-5">
                  <div className="text-f-label font-medium text-muted">
                    Step 3 · Quality
                  </div>
                  <div className="mt-2 text-f-h3">Your recording looks usable</div>
                  <dl className="mt-4 flex flex-col gap-2">
                    {[
                      ["Duration", "31 seconds", "enough"],
                      ["Background noise", "low", "good"],
                      ["Clipping", "none detected", "good"],
                    ].map(([k, v, verdict]) => (
                      <div key={k} className="flex items-center justify-between gap-3">
                        <dt className="text-f-body text-muted">{k}</dt>
                        <dd className="flex items-center gap-2 text-f-body">
                          {v}
                          <span className="rounded-full bg-tint px-2 py-0.5 text-f-label font-medium tabular-nums text-primary">
                            {verdict}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => go(3)}>
                    Continue
                  </Button>
                  <Button variant="quiet" onClick={() => go(1)}>
                    Record again
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="rounded-[12px] border border-tint bg-surface p-5">
                  <div className="text-f-label font-medium text-muted">
                    Step 4 · Test me
                  </div>
                  <div className="mt-2 text-f-h3">Say anything, and see who we think it is</div>
                  <div className="mt-4 flex items-center gap-3 rounded-[12px] bg-bg p-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tint text-xl font-bold text-primary">
                      K
                    </span>
                    <div>
                      <div className="text-f-body font-semibold">David Chen</div>
                      <div className="text-f-label font-medium tabular-nums text-muted">matched</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => setDone(true)} disabled={done}>
                    {done ? "Done" : "Finish setup"}
                  </Button>
                  <Button variant="quiet" onClick={() => go(2)}>
                    Back
                  </Button>
                  {done && (
                    <Button variant="quiet" onClick={() => { setDone(false); setConsented(false); setRecorded(0); go(0); }}>
                      <Trash2 size={18} aria-hidden /> Delete voiceprint
                    </Button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
