"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/Button";
import { PersonAvatar } from "@/components/PersonAvatar";
import { spring } from "@/lib/motion";
import { participantIds } from "@/lib/mocks/call-timeline";
import { get } from "@/lib/mocks/family";
import { relationshipToResident } from "@/lib/relationships";

// The call she answers is the replay, so the caller is whoever is on it.
const [callerId, ...withIds] = participantIds;
const caller = get(callerId);
const withNames = withIds.map((id) => get(id).name);

/**
 * R2 Incoming call. It overrides everything else on the screen, so it is a full
 * page rather than a banner over Home. Answer is the large, obvious target;
 * declining is available but quieter — it is never the accidental choice.
 */
export default function IncomingCall() {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1180px] flex-col items-center justify-center gap-12 p-12 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={spring}
        className="text-r-body font-bold text-muted"
      >
        Incoming call
      </motion.div>

      <div className="flex items-center gap-6">
        {/* The caller is largest; the people with her are secondary, and named. */}
        <div className="ct-pulse rounded-full">
          <PersonAvatar initial={caller.initial} personId={caller.id} size="resident" />
        </div>
        {withIds.map((id) => (
          <PersonAvatar key={id} initial={get(id).initial} personId={id} size="family" className="!h-20 !w-20 !text-3xl" />
        ))}
      </div>

      <div>
        <h1 className="text-r-display leading-tight">
          {caller.name}, {relationshipToResident(caller.id)},
          <br />
          is calling
        </h1>
        {withNames.length > 0 && (
          <p className="mt-4 text-r-lead text-muted">
            {withNames.join(" and ")} {withNames.length === 1 ? "is" : "are"} with {caller.gender === "f" ? "her" : "him"}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6">
        <Button
          scale="resident"
          variant="primary"
          className="min-w-[280px] !text-r-h2"
          onClick={() => router.push("/resident/call")}
        >
          Answer
        </Button>
        <Button scale="resident" variant="quiet" onClick={() => router.push("/resident")}>
          Not now
        </Button>
      </div>

      <Link href="/resident" className="sr-only">
        Home
      </Link>
    </div>
  );
}
