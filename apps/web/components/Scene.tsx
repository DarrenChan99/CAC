import type { Activity } from "@/lib/mocks/content";
import { ActivityIcon } from "./ActivityIcon";
import { Portrait } from "./Portrait";

/**
 * A drawn picture: the people in it, side by side, with what they were doing
 * in the corner. It stands where a real picture will go.
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
      className={`relative flex items-end justify-center overflow-hidden rounded-[16px] bg-tint text-primary ${className}`}
    >
      {personIds.map((id) => (
        <Portrait key={id} personId={id} className="h-[85%] max-w-[60%] flex-1" />
      ))}
      <div className="absolute right-4 top-4 rounded-full bg-surface p-3">
        <ActivityIcon activity={activity} size={40} />
      </div>
    </div>
  );
}
