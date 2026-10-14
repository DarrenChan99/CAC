"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/Button";
import { PersonAvatar } from "@/components/PersonAvatar";
import { spring } from "@/lib/motion";

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
          <PersonAvatar initial="L" size="resident" />
        </div>
        <PersonAvatar initial="E" size="family" className="!h-20 !w-20 !text-3xl" />
        <PersonAvatar initial="K" size="family" className="!h-20 !w-20 !text-3xl" />
      </div>

      <div>
        <h1 className="text-r-display leading-tight">
          Lisa, your daughter,
          <br />
          is calling
        </h1>
        <p className="mt-4 text-r-lead text-muted">Emily and Ken are with her</p>
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
