"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PersonAvatar } from "@/components/PersonAvatar";
import { MemoryCard } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { byId } from "@/lib/mocks/family";
import { relationshipToResident } from "@/lib/relationships";
import { residentFeed } from "@/lib/residentFeed";

/**
 * F7 Person. The relationship is read-only text derived from the tree, never
 * a field a user can type into.
 */
export default function PersonDetail({ params }: PageProps<"/family/tree/[id]">) {
  const { id } = use(params);
  const { resolved } = useDemo();
  const person = byId(id);
  if (!person) notFound();

  const memories = residentFeed(resolved).memories.filter((m) => m.personId === id);

  return (
    <div className="mx-auto max-w-[800px] p-8">
      <Link href="/family/tree" className="text-f-small text-muted hover:text-primary">
        ← Family tree
      </Link>
      <header className="mb-8 mt-3 flex items-center gap-4">
        <PersonAvatar initial={person.initial} personId={person.id} size="family" deceased={person.deceased} />
        <div>
          <h1 className="text-f-h1">{person.name}</h1>
          <p className="text-f-small text-muted">
            {relationshipToResident(id).replace("your ", "")}
            {person.voiceEnrolled && " · voice enrolled"}
          </p>
        </div>
      </header>

      <h2 className="mb-3 text-f-h3">Memories</h2>
      <div className="flex flex-col gap-2">
        {memories.map((m) => (
          <MemoryCard key={m.id} text={m.text} when={m.when} activity={m.activity} />
        ))}
        {memories.length === 0 && <div className="text-f-body text-muted">None yet</div>}
      </div>
    </div>
  );
}
