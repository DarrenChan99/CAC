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
        <p className="text-f-small text-muted">what reaches Grandma&apos;s iPad</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_396px]">
        <div className="flex flex-col gap-5">
          <div className="rounded-[12px] border-2 border-primary bg-surface p-5">
            <label className="flex min-h-[44px] cursor-pointer items-center justify-between">
              <div>
                <div className="text-f-body font-semibold">Show Family News on Grandma&apos;s iPad</div>
                <div className="text-f-small text-muted">
                  When off, the news tile disappears from her home screen entirely.
                </div>
              </div>
              <Toggle checked={masterOn} onChange={setMasterOn} />
            </label>
          </div>

          <section className="rounded-[12px] border border-tint bg-surface p-5">
            <div className="mb-1 text-f-h3">Feeds</div>
            <p className="mb-3 text-f-small text-muted">
              Three stories a day, chosen from the feeds you turn on.
            </p>
            <div className="flex flex-col gap-2">
              {feeds.map((f) => (
                <label
                  key={f.id}
                  className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-[12px] px-2 hover:bg-bg"
                >
                  <div>
                    <div className="text-f-body font-medium">{f.name}</div>
                    <div className="text-f-small text-muted">{f.note}</div>
                  </div>
                  <Toggle checked={f.on} onChange={() => toggle(f.id)} />
                </label>
              ))}
            </div>
          </section>

          <div className="rounded-[12px] border border-tint bg-surface p-5">
            <div className="text-f-h3">Keep it gentle</div>
            <p className="mt-1 text-f-small text-muted">
              Filters out violence, disasters, and death before anything reaches her screen. About
              one story in four is held back.
            </p>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-[12px] border border-tint bg-surface p-4">
            <div className="mb-2 text-f-h3">Today on her iPad</div>
            <div className="flex flex-col gap-2">
              {todayStories.map((s) => (
                <div key={s.headline} className="rounded-[12px] bg-bg p-2.5">
                  <div className="font-mono text-xs uppercase text-muted">{s.source}</div>
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
                  <div className="font-mono text-xs uppercase text-muted">
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
      className={`relative h-6 w-11 flex-none rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-tint"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
