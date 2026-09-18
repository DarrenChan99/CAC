import { ResidentHeader } from "@/components/ResidentHeader";
import { EmptyState } from "@/components/ui";
import { events } from "@/lib/mocks/content";

/**
 * R7 Today. What is happening, in the order it happens. Times are written the
 * way they are spoken ("2:00 in the afternoon"), not as 14:00.
 */
export default function Today() {
  return (
    <div className="mx-auto min-h-dvh max-w-[1180px] p-12">
      <ResidentHeader title="Today" note="Saturday, 14 March" />

      {events.length > 0 ? (
        <div className="flex flex-col gap-6">
          {events.map((e) => (
            <div
              key={e.id}
              className="flex items-start gap-10 rounded-[16px] border border-tint bg-surface p-8"
            >
              <div className="w-[240px] flex-none">
                <div className="text-r-h1">{e.time}</div>
                <div className="text-r-body text-muted">in the {e.part}</div>
              </div>
              <div className="min-w-0">
                <div className="text-r-h2">{e.title}</div>
                <div className="mt-2 text-r-lead text-muted">{e.note}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          scale="resident"
          title="Nothing planned today"
          note="Your family will add things here."
        />
      )}
    </div>
  );
}
