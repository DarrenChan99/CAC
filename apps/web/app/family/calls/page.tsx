"use client";

import Link from "next/link";
import { useState } from "react";
import { calls, speakerColor, type CallItem } from "@/lib/mocks/calls";

const FILTERS = [
  { id: "all", label: "All calls" },
  { id: "memories", label: "With memories" },
  { id: "missed", label: "Missed" },
] as const;

/** F4 Calls list. Scan history and see at a glance who held the floor. */
export default function CallsList() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const visible = calls.filter((c) => {
    if (filter === "missed") return c.missed;
    if (filter === "memories") return c.tags.some((t) => t.includes("memor"));
    return true;
  });

  const groups = ["This week", "Last week"] as const;

  return (
    <div className="mx-auto max-w-[1200px] p-8">
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-f-h1">Calls</h1>
          <p className="text-f-small text-muted">{calls.length} calls with Grandma Mei</p>
        </div>
        <div className="ml-auto flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`min-h-[44px] rounded-[12px] px-3 text-f-small transition-colors ${
                filter === f.id ? "bg-tint font-medium text-primary" : "text-muted hover:bg-tint/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-5">
        {groups.map((group) => {
          const rows = visible.filter((c) => c.period === group);
          if (rows.length === 0) return null;
          return (
            <div key={group}>
              <div className="mb-2 font-mono text-f-label uppercase text-muted">{group}</div>
              <div className="flex flex-col gap-2.5">
                {rows.map((c) => (
                  <Row key={c.id} call={c} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ call }: { call: CallItem }) {
  return (
    <Link
      href={`/family/calls/${call.id}`}
      className={`flex items-center gap-5 rounded-[12px] border p-4 transition-colors hover:border-primary ${
        call.missed ? "border-tint bg-surface" : "border-tint bg-surface"
      }`}
    >
      <div className="w-14 flex-none text-center">
        <div className={`text-lg font-semibold ${call.missed ? "text-muted" : "text-text"}`}>{call.day}</div>
        <div className="text-f-small text-muted">{call.time}</div>
      </div>
      <div className="h-11 w-px flex-none bg-tint" />
      <div className="min-w-0 flex-1">
        <div className={`text-f-body font-semibold ${call.missed ? "text-muted" : "text-text"}`}>
          {call.title}
        </div>
        <div className="truncate text-f-small text-muted">{call.participants}</div>
      </div>

      {!call.missed ? (
        <div className="w-[220px] flex-none">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-[#F0F0EA]">
            {call.segments.map((s, i) => (
              <span
                key={i}
                style={{
                  width: `${((s.endMs - s.startMs) / (call.durationMin! * 60)) * 100}%`,
                  background: speakerColor[s.speakerId] ?? speakerColor.unknown,
                }}
              />
            ))}
          </div>
          {call.floorNote && <div className="mt-1 text-f-small text-muted">{call.floorNote}</div>}
        </div>
      ) : (
        <div className="w-[220px] flex-none text-f-small text-muted">Rang for 60 seconds</div>
      )}

      <div className="flex w-[148px] flex-none flex-wrap justify-end gap-1.5">
        {call.tags.map((t) => (
          <span
            key={t}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              t === "Missed" ? "bg-[#F0F0EA] text-muted" : "bg-tint text-primary"
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="w-14 flex-none text-right text-f-body font-semibold text-primary">
        {call.missed ? "—" : `${call.durationMin} min`}
      </div>
    </Link>
  );
}
