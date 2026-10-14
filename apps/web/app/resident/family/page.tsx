"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PersonAvatar } from "@/components/PersonAvatar";
import { ResidentHeader } from "@/components/ResidentHeader";
import { family, get, RESIDENT_ID, type Person } from "@/lib/mocks/family";
import { relationshipToResident } from "@/lib/relationships";
import { pressResident, pressTransition } from "@/lib/motion";

/**
 * R4 My family. A tree that reads like one: couples side by side, children
 * below, joined by thin decorative lines. Faces lead — they are recognised
 * for longer than names or diagrams.
 */
export default function MyFamily() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-[1180px] p-12">
      <ResidentHeader title="Your family" />
      <div className="flex justify-center pb-12">
        <Branch person={get(RESIDENT_ID)} beside={family.filter((p) => p.siblingOf === RESIDENT_ID)} />
      </div>
    </div>
  );
}

/** A person, their spouse beside them, and their children's branches below. */
function Branch({ person, beside = [] }: { person: Person; beside?: Person[] }) {
  const spouse = family.find((p) => p.spouseOf === person.id);
  const children = family.filter((p) =>
    p.parentIds?.some((id) => id === person.id || id === spouse?.id),
  );

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-start">
        {/* Siblings sit to the side without widening the tree below. */}
        {beside.length > 0 && (
          <div className="absolute right-full mr-12 flex gap-6">
            {beside.map((p) => (
              <Face key={p.id} person={p} />
            ))}
          </div>
        )}
        <Face person={person} />
        {spouse && (
          <>
            <span className="mt-12 w-6 flex-none border-t-2 border-accent" aria-hidden />
            <Face person={spouse} />
          </>
        )}
      </div>

      {children.length > 0 && (
        <>
          <span className="h-8 border-l-2 border-accent" aria-hidden />
          <div className="flex">
            {children.map((c, i) => (
              <div key={c.id} className="relative flex flex-col items-center px-3 pt-8">
                {children.length > 1 && (
                  <span
                    className={`absolute top-0 border-t-2 border-accent ${i === 0 ? "left-1/2" : "left-0"} ${
                      i === children.length - 1 ? "right-1/2" : "right-0"
                    }`}
                    aria-hidden
                  />
                )}
                <span className="absolute left-1/2 top-0 h-8 border-l-2 border-accent" aria-hidden />
                <Branch person={c} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Face({ person }: { person: Person }) {
  const label = relationshipToResident(person.id);
  const isYou = Boolean(person.isResident);

  const inner = (
    <>
      <PersonAvatar
        initial={person.initial}
        size="resident"
        deceased={person.deceased}
        className="!h-24 !w-24 !text-[40px]"
      />
      <div className="text-center">
        <div className="text-r-lead font-bold">{isYou ? "You" : person.name}</div>
        <div className="text-r-body text-muted">{label}</div>
      </div>
    </>
  );

  // No destructive or dead-end taps: the resident's own card and the people
  // without accounts are shown, but they are not pretend buttons.
  if (isYou || person.deceased) {
    return (
      <div className="flex w-[200px] flex-col items-center gap-2 rounded-[16px] p-2 opacity-90">
        {inner}
      </div>
    );
  }

  return (
    <motion.div whileTap={pressResident} transition={pressTransition}>
      <Link
        href={`/resident/family/${person.id}`}
        className="flex min-h-[72px] w-[200px] flex-col items-center gap-2 rounded-[16px] p-2"
      >
        {inner}
      </Link>
    </motion.div>
  );
}
