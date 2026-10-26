"use client";

import type { RefObject } from "react";
import { media } from "@/lib/mocks/call-timeline";

/** The recording, in the camera person's tile. Its element drives the replay clock (useReplay). */
export function CallVideo({ videoRef }: { videoRef: RefObject<HTMLVideoElement | null> }) {
  if (!media) return null;
  return (
    <video
      ref={videoRef}
      src={media}
      playsInline
      preload="auto"
      className="absolute inset-0 h-full w-full rounded-[inherit] object-cover"
    />
  );
}
