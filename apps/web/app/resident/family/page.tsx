"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PersonAvatar } from "@/components/PersonAvatar";
import { ResidentHeader } from "@/components/ResidentHeader";
import { family, type Person } from "@/lib/mocks/family";
import { GENERATION_LABELS, generation, relationshipToResident } from "@/lib/relationships";
import { pressResident, pressTransition } from "@/lib/motion";

/**
 * R4 My family. Faces grouped by generation rather than a graph with crossing
 * edges — the point is recognition, and faces are recognised for longer than
 * names or diagrams.
 */
export default function MyFamily() {
  const rows = GENERATION_LABELS.map((label, gen) => ({
    label,
    people: family.filter((p) => generation(p.id) === gen),
  }));

  return (
    <div className="mx-auto min-h-dvh max-w-[1180px] p-12">
      <ResidentHeader title="Your family" note="Tap anyone to call them" />

      <div className="flex flex-col gap-10">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-10">
            {/* Generation rail — the label tells her what she is looking at. */}
            <div className="w-[190px] flex-none whitespace-pre-line pt-6 text-r-body font-bold text-muted">
              {row.label}
            </div>

            <div className="flex flex-1 flex-wrap items-start gap-8 border-l-2 border-accent pl-10">
              {row.people.map((person) => (
                <Face key={person.id} person={person} />
              ))}
            </div>
          </div>
        ))}
      </div>
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
      />
      <div className="text-center">
        <div className="text-r-h2">{isYou ? "You" : person.name}</div>
        <div className="text-r-body text-muted">{label}</div>
      </div>
    </>
  );

  // No destructive or dead-end taps: the resident's own card and the people
  // without accounts are shown, but they are not pretend buttons.
  if (isYou || person.deceased) {
    return (
      <div className="flex w-[180px] flex-col items-center gap-3 rounded-[16px] p-3 opacity-90">
        {inner}
      </div>
    );
  }

  return (
    <motion.div whileTap={pressResident} transition={pressTransition}>
      <Link
        href={`/resident/family/${person.id}`}
        className="flex min-h-[72px] w-[180px] flex-col items-center gap-3 rounded-[16px] p-3"
      >
        {inner}
      </Link>
    </motion.div>
  );
}
