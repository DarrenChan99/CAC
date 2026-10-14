"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ResidentHeader } from "@/components/ResidentHeader";
import { PhotoSlot } from "@/components/ui";
import { photos } from "@/lib/mocks/content";
import { get } from "@/lib/mocks/family";
import { pressResident, pressTransition } from "@/lib/motion";

/** R7 Photos. Pictures the family shared, each with who is in it. */
export default function Photos() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-[1180px] p-12">
      <ResidentHeader title="Photos" />

      <div className="grid grid-cols-3 gap-8">
        {photos.map((p) => (
          <motion.div key={p.id} whileTap={pressResident} transition={pressTransition}>
            <Link href={`/resident/photos/${p.id}`} className="flex flex-col gap-3">
              <PhotoSlot label="photo" scale="resident" className="h-[240px]" />
              <span className="text-r-body font-bold">{p.personIds.map((id) => get(id).name).join(" and ")}</span>
              <span className="-mt-3 text-r-body text-muted">{p.when}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
