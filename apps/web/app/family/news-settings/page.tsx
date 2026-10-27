"use client";

import { TopicIcon } from "@/components/TopicIcon";
import { useDemo } from "@/lib/demo-store";
import { news as stories, TOPICS, topicLabel, type TopicId } from "@/lib/mocks/content";
import { feedNotes, heldBack } from "@/lib/mocks/news-settings";
import { visibleTopics } from "@/lib/residentFeed";

/** F11 News settings — control what reaches R6, and see what was filtered out. */
export default function NewsSettings() {
  const { news, setNews } = useDemo();
  const masterOn = news.on;
  const setMasterOn = (on: boolean) => setNews({ ...news, on });
  const toggle = (id: TopicId) =>
    setNews({ ...news, off: news.off.includes(id) ? news.off.filter((t) => t !== id) : [...news.off, id] });

  const feeds = TOPICS.filter((t) => t.id !== "family");
  const shown = visibleTopics(news).map((t) => t.id);
  const today = stories.filter((s) => shown.includes(s.topic)).slice(0, 3);

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
              <span className="flex items-center gap-3">
                <TopicIcon topic={f.id} size={20} className="flex-none text-primary" />
                <span>
                  <span className="block text-f-body font-medium">{f.label}</span>
                  <span className="block text-f-small text-muted">{feedNotes[f.id]}</span>
                </span>
              </span>
              <Toggle
                checked={!news.off.includes(f.id)}
                onChange={() => toggle(f.id)}
                label={f.label}
                disabled={!masterOn}
              />
            </label>
          ))}
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-[12px] border border-tint bg-surface p-4">
            <div className="mb-2 text-f-h3">On her iPad today</div>
            <div className="flex flex-col gap-2">
              {today.length === 0 && <div className="text-f-small text-muted">Only family news.</div>}
              {today.map((s) => (
                <div key={s.id} className="rounded-[12px] bg-bg p-2.5">
                  <div className="text-f-label font-medium text-muted">{topicLabel(s.topic)}</div>
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
