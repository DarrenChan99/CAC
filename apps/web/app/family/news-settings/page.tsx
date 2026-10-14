"use client";

import { useState } from "react";
import { feeds as initialFeeds, todayStories, heldBack } from "@/lib/mocks/news-settings";

/** F11 News settings — control what reaches R6, and see what was filtered out. */
export default function NewsSettings() {
  const [masterOn, setMasterOn] = useState(true);
  const [feeds, setFeeds] = useState(initialFeeds);

  const toggle = (id: string) =>
    setFeeds((fs) => fs.map((f) => (f.id === id ? { ...f, on: !f.on } : f)));

  return (
    <div className="mx-auto max-w-[1200px] p-8">
      <header className="mb-6">
        <h1 className="text-f-h1">News</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_396px]">
        <section className="h-fit divide-y divide-tint rounded-[12px] border border-tint bg-surface">
          <label className="flex min-h-[56px] cursor-pointer items-center justify-between px-4">
            <span className="text-f-body font-semibold">Show news on Grandma&apos;s iPad</span>
            <Toggle checked={masterOn} onChange={setMasterOn} label="Show news on Grandma's iPad" />
          </label>

          {feeds.map((f) => (
            <label
              key={f.id}
              className={`flex min-h-[56px] items-center justify-between gap-4 px-4 py-2 transition-opacity ${
                masterOn ? "cursor-pointer" : "pointer-events-none opacity-40"
              }`}
            >
              <span>
                <span className="block text-f-body font-medium">{f.name}</span>
                <span className="block text-f-small text-muted">{f.note}</span>
              </span>
              <Toggle checked={f.on} onChange={() => toggle(f.id)} label={f.name} disabled={!masterOn} />
            </label>
          ))}
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-[12px] border border-tint bg-surface p-4">
            <div className="mb-2 text-f-h3">On her iPad today</div>
            <div className="flex flex-col gap-2">
              {todayStories.map((s) => (
                <div key={s.headline} className="rounded-[12px] bg-bg p-2.5">
                  <div className="text-f-label font-medium text-muted">{s.source}</div>
                  <div className="text-f-body font-semibold">{s.headline}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-tint bg-surface p-4">
            <div className="mb-2 text-f-h3">Held back this week</div>
            <div className="flex flex-col gap-2">
              {heldBack.map((s) => (
                <div key={s.headline} className="text-f-small">
                  <div className="text-f-label font-medium text-muted">
                    {s.source} · {s.reason}
                  </div>
                  <div className="text-muted line-through">{s.headline}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
      className={`relative h-7 w-12 flex-none rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted/30"
      }`}
    >
      {/* left-0.5 pins the knob to the track's left edge; without it the knob
          starts centred and slides off the end when on. */}
      <span
        className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
