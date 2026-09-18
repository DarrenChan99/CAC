import { Tile } from "@/components/ui";
import { events } from "@/lib/mocks/content";

/**
 * R1 Home. Four primary actions, which is the documented ceiling. Every tile
 * carries a text label next to its icon.
 */
export default function ResidentHome() {
  const next = events[0];

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1180px] flex-col gap-12 p-12">
      <header className="flex items-start gap-8">
        <div className="flex-1">
          <h1 className="text-r-display">Good morning, Mei</h1>
          <p className="mt-3 text-r-lead text-muted">
            Saturday, 14 March · 10:24 in the morning
          </p>
        </div>
        <div className="flex flex-none items-center gap-3 pt-3">
          <span className="h-8 w-8 rounded-[10px] bg-primary" aria-hidden />
          <span className="text-r-lead font-bold">Caretaker</span>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-2 gap-8">
        <Tile icon="☏" label="Call family" href="/resident/call" />
        <Tile icon="♡" label="My family" href="/resident/family" />
        <Tile icon="✉" label="Family news" href="/resident/news" />
        <Tile icon="☀" label="Today" href="/resident/today" />
      </div>

      <div className="rounded-[16px] border border-tint bg-surface p-8">
        <div className="font-mono text-r-body uppercase tracking-widest text-muted">
          Today
        </div>
        <div className="mt-3 text-r-h2">
          {next.title} at {next.time} this {next.part}.
        </div>
      </div>
    </div>
  );
}
