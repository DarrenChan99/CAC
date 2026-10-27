import { get } from "@/lib/mocks/family";
import type { Activity } from "@/lib/mocks/content";
import { ActivityIcon } from "./ActivityIcon";

/**
 * A stand-in picture: the letter of each person in it, with what they were
 * doing in the corner. It stands where a real picture will go.
 */
export function Scene({
  personIds,
  activity,
  className = "",
}: {
  personIds: string[];
  activity?: Activity;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center gap-6 overflow-hidden rounded-[16px] bg-tint text-primary ${className}`}
    >
      {personIds.map((id) => (
        <div
          key={id}
          className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-surface text-[44px] font-bold"
        >
          {get(id).initial}
        </div>
      ))}
      <div className="absolute right-4 top-4 rounded-full bg-surface p-3">
        <ActivityIcon activity={activity} size={40} />
      </div>
    </div>
  );
}
