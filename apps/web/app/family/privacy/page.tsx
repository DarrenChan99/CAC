"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { PersonAvatar } from "@/components/PersonAvatar";
import { consents, dataHeld } from "@/lib/mocks/settings";

/** F12 Privacy and data — consent, retention, and deletion, made legible. */
export default function Privacy() {
  const [retainAudio, setRetainAudio] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="mx-auto max-w-[1200px] p-8">
      <header className="mb-6">
        <h1 className="text-f-h1">Privacy and data</h1>
        <p className="text-f-small text-muted">Chen family</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_396px]">
        <div className="flex flex-col gap-5">
          <section className="rounded-[12px] border border-tint bg-surface p-5">
            <div className="mb-1 text-f-h3">What each person has agreed to</div>
            <p className="mb-3 text-f-small text-muted">
              Everyone consents for themselves. Nobody can consent on another adult&apos;s behalf.
            </p>
            <div className="flex flex-col gap-2">
              {consents.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <PersonAvatar initial={c.name[0]} size="small" />
                  <div>
                    <div className="text-f-body font-medium">{c.name}</div>
                    <div className="text-f-small text-muted">{c.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[12px] border border-tint bg-surface p-5">
            <label className="flex min-h-[44px] cursor-pointer items-center justify-between">
              <div>
                <div className="text-f-body font-semibold">Keep call audio</div>
                <div className="text-f-small text-muted">
                  Off by default. We keep voiceprints — mathematical fingerprints that cannot be
                  played back.
                </div>
              </div>
              <input
                type="checkbox"
                checked={retainAudio}
                onChange={(e) => setRetainAudio(e.target.checked)}
                className="h-5 w-5 accent-[var(--color-primary)]"
              />
            </label>
          </section>

          <section className="rounded-[12px] border border-[#EADFC4] bg-surface p-5">
            <div className="text-f-h3">Your own data</div>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary">Export my data</Button>
              <Button variant="quiet" onClick={() => setConfirming(true)}>
                Delete my voiceprint
              </Button>
            </div>
          </section>
        </div>

        <aside className="rounded-[12px] border border-tint bg-surface p-4">
          <div className="mb-2 text-f-h3">What we hold right now</div>
          <div className="flex flex-col">
            {dataHeld.map((d) => (
              <div key={d.label} className="flex justify-between border-b border-[#F0F0EA] py-2 text-f-small last:border-0">
                <span className="text-muted">{d.label}</span>
                <span className="font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {confirming && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(27,42,33,0.34)] p-4"
          onClick={() => setConfirming(false)}
        >
          <div
            className="w-full max-w-[568px] rounded-[12px] border border-[#DCE4D9] bg-surface p-7 shadow-[0_8px_32px_rgba(27,42,33,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-f-h2">Delete Ken&apos;s voiceprint?</h2>
            <div className="mt-3 rounded-[12px] border border-[#EADFC4] bg-warn-bg p-4 text-f-small text-warn">
              <div className="mb-1 font-semibold">This is what you lose</div>
              <ul className="list-disc pl-4">
                <li>Ken will show as an unknown voice on calls until re-enrolled</li>
                <li>Nothing already said on past calls is affected</li>
              </ul>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="quiet" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => setConfirming(false)}
                className="!bg-warn text-white"
              >
                Delete voiceprint
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
