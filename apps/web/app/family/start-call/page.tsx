"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { PersonAvatar } from "@/components/PersonAvatar";
import { PanelHeading } from "@/components/ui";

/**
 * F2 Start call. Identification never gates the call — the device check is a
 * confirmation, not a lock. Ling has no voice profile yet, which is the
 * documented unenrolled empty state, not an error.
 */
export default function StartCall() {
  const [callee, setCallee] = useState<"mei" | "ling">("mei");

  return (
    <div className="mx-auto max-w-[1200px] p-8">
      <header className="mb-6">
        <h1 className="text-f-h1">Start a call</h1>
        <p className="text-f-small text-muted">Sunday 18 Sep · 2:14 pm</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_384px]">
        <div className="flex flex-col gap-6">
          <section>
            <PanelHeading title="Who are you calling?" />
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setCallee("mei")}
                className={`flex min-h-[44px] items-center gap-3 rounded-[12px] p-3 text-left transition-colors ${
                  callee === "mei" ? "border-2 border-primary bg-tint" : "border border-tint bg-bg"
                }`}
              >
                <PersonAvatar initial="M" size="family" />
                <div className="min-w-0">
                  <div className="text-f-body font-semibold">Grandma Mei</div>
                  <div className="text-f-small text-muted">Pine Ridge, room 12 · iPad online</div>
                </div>
              </button>
              <button
                onClick={() => setCallee("ling")}
                className={`flex min-h-[44px] items-center gap-3 rounded-[12px] p-3 text-left transition-colors ${
                  callee === "ling" ? "border-2 border-primary bg-tint" : "border border-tint bg-bg"
                }`}
              >
                <PersonAvatar initial="L" size="family" />
                <div className="min-w-0">
                  <div className="text-f-body font-semibold">Great-aunt Ling</div>
                  <div className="text-f-small text-muted">Home · tablet last seen Thursday</div>
                </div>
              </button>
            </div>
          </section>

          <section className="rounded-[12px] border border-tint bg-surface p-5">
            <PanelHeading title="Invite the rest of the family" />
            <div className="flex gap-2">
              <input
                readOnly
                value="caretaker.app/join/f7x2-mei"
                className="min-h-[44px] flex-1 rounded-[12px] border border-tint bg-bg px-3 font-mono text-f-small text-muted"
              />
              <Button variant="primary">Copy link</Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-f-small text-muted">Already in the waiting room:</span>
              {["Lisa", "Emily"].map((n) => (
                <span
                  key={n}
                  className="flex items-center gap-1.5 rounded-full bg-tint py-1 pl-1 pr-3 text-f-small"
                >
                  <PersonAvatar initial={n[0]} size="small" />
                  {n}
                </span>
              ))}
            </div>
          </section>

          <div className="flex items-center gap-4">
            <Link href="/family/call">
              <Button variant="primary">
                Call {callee === "mei" ? "Grandma Mei" : "Great-aunt Ling"}
              </Button>
            </Link>
            <p className="text-f-small text-muted">
              Her iPad will ring for 60 seconds, then show a missed-call card.
            </p>
          </div>
        </div>

        <aside className="rounded-[12px] border border-tint bg-surface p-5">
          <h2 className="text-f-h3">Device check</h2>
          <p className="mt-1 text-f-small text-muted">
            Confirm your voice is matched to you before Grandma sees a name.
          </p>

          <div className="mt-4 rounded-[12px] border border-tint bg-bg p-3">
            <div className="mb-2 text-f-small font-medium">Mic test</div>
            <div className="flex h-12 items-end gap-[2px]">
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1 flex-1 rounded-full"
                  style={{
                    height: `${20 + Math.abs(Math.sin(i)) * 70}%`,
                    background: i < 18 ? "var(--color-primary)" : i < 24 ? "var(--color-accent)" : "var(--color-tint)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[12px] bg-tint p-4">
            <div className="text-f-small text-muted">Matched to</div>
            <div className="mt-1 flex items-center gap-2">
              <PersonAvatar initial="K" size="small" />
              <div>
                <div className="text-f-body font-semibold">Ken Chen</div>
                <div className="text-f-small font-medium text-primary">high confidence</div>
              </div>
            </div>
            <p className="mt-3 text-f-small text-muted">
              Grandma will see <strong className="text-text">Ken, your grandson</strong> when you speak.
            </p>
            <Button variant="secondary" className="mt-3 w-full">
              Not me — fix this
            </Button>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {["Mic", "Camera", "Connection"].map((label) => (
              <div key={label} className="flex items-center gap-2 text-f-small">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
                {label} ready
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
