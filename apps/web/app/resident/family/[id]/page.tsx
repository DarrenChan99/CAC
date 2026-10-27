"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/Button";
import { ResidentHeader } from "@/components/ResidentHeader";
import { MemoryCard } from "@/components/ui";
import { Portrait } from "@/components/Portrait";
import { byId } from "@/lib/mocks/family";
import { useDemo } from "@/lib/demo-store";
import { residentFeed } from "@/lib/residentFeed";
import { relationshipToResident } from "@/lib/relationships";
import { spring } from "@/lib/motion";

/**
 * R5 Person page. A large portrait, who they are to her, and the things they
 * have told her — each memory big enough to read without leaning in.
 */
export default function PersonPage({ params }: PageProps<"/resident/family/[id]">) {
  const { id } = use(params);
  const router = useRouter();
  const { resolved } = useDemo();
  const person = byId(id);
  if (!person) notFound();

  const memories = residentFeed(resolved).memories.filter((m) => m.personId === id);

  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-[1180px] p-12">
      <ResidentHeader
        title={person.name}
        back={{ href: "/resident/family", label: "Back to family" }}
      />

      <div className="flex items-start gap-12">
        {/* The portrait settles in rather than appearing, so the jump from the
            face she tapped reads as continuous. */}
        <motion.div
          initial={{ scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="flex-none"
        >
          <div className={`flex h-[320px] w-[280px] items-end justify-center overflow-hidden rounded-[16px] bg-tint text-primary ${person.deceased ? "opacity-60" : ""}`}>
            <Portrait personId={id} className="h-[280px] w-[280px]" />
          </div>
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="text-r-display">{person.name}</div>
          <div className="mt-2 text-r-h2 text-muted">{relationshipToResident(id)}</div>

          {person.callable && (
            <Button
              scale="resident"
              variant="primary"
              className="mt-8 min-w-[280px]"
              onClick={() => router.push("/resident/call")}
            >
              Call {person.name}
            </Button>
          )}

          <h2 className="mb-6 mt-12 text-r-h2">Things {person.name} told you</h2>

          {memories.length > 0 ? (
            <div className="flex flex-col gap-6">
              {memories.map((m) => (
                <MemoryCard
                  key={m.id}
                  text={m.text}
                  when={m.when}
                  activity={m.activity}
                  scale="resident"
                />
              ))}
            </div>
          ) : (
            <p className="text-r-lead text-muted">Nothing yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
