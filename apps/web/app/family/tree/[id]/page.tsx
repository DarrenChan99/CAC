"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { PhotoSlot } from "@/components/ui";
import { byId } from "@/lib/mocks/family";
import { memoriesFor } from "@/lib/mocks/content";
import { relationshipToResident } from "@/lib/relationships";

/**
 * F7 Person detail — the family-side counterpart to R5. The relationship is
 * read-only text derived from the tree, never a field a user can type into.
 */
export default function PersonDetail({ params }: PageProps<"/family/tree/[id]">) {
  const { id } = use(params);
  const person = byId(id);
  if (!person) notFound();

  const memories = memoriesFor(id);
  const waiting = memories.filter((m) => !m.hasPhoto).length;

  return (
    <div className="mx-auto max-w-[1200px] p-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/family/tree" className="text-f-small text-muted hover:text-primary">
            ← Back to tree
          </Link>
          <h1 className="mt-1 text-f-h1">{person.name}</h1>
          <p className="text-f-small text-muted">
            {relationshipToResident(id).replace("your ", "")} · {memories.length} memories
          </p>
        </div>
        <Button variant="primary">Save changes</Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[424px_1fr]">
        <div className="flex flex-col gap-4">
          <div className="rounded-[12px] border border-tint bg-surface p-5">
            <div className="flex items-center gap-3">
              <PhotoSlot label="portrait" className="h-16 w-16 rounded-full" />
              <div>
                <Button variant="secondary">Replace photo</Button>
                <p className="mt-1 text-f-small text-muted">Shown at 220px on Grandma&apos;s iPad</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <Field label="Name" value={person.name} />
              <Field label="Voice status" value={person.voiceEnrolled ? "Enrolled" : "Not enrolled"} />
            </div>
          </div>

          <div className="rounded-[12px] bg-tint p-4">
            <div className="text-f-small font-medium text-muted">Relationship to Mei</div>
            <div className="mt-1 text-f-body font-semibold text-primary">
              {relationshipToResident(id).replace("your ", "")}
            </div>
            <p className="mt-1 text-f-small text-muted">
              Derived from the tree, so it cannot be typed here.
            </p>
            <Link href="/family/tree" className="mt-1 inline-block text-f-small text-primary underline">
              Edit the links
            </Link>
          </div>

          <div className="rounded-[12px] border border-[#EADFC4] bg-warn-bg p-4">
            <div className="flex items-center gap-2">
              <span className="text-f-h3">Voice profile</span>
              <span className="rounded-full bg-warn/10 px-2 py-0.5 text-xs font-semibold text-warn">
                needs re-enrolment
              </span>
            </div>
            <p className="mt-2 text-f-small text-warn">
              {person.name}&apos;s voiceprint was made two years ago and matched wrongly twice on
              Sunday&apos;s call. Ninety seconds fixes it.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary">Send re-enrol link</Button>
              <Button variant="quiet">Delete voiceprint</Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[12px] border border-tint bg-surface p-5">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-f-h3">{person.name}&apos;s memories</h2>
              <span className="text-f-small text-muted">
                {memories.length} saved{waiting ? ` · ${waiting} waiting` : ""}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {memories.map((m) => (
                <div key={m.id} className="rounded-[12px] border border-tint bg-bg p-3">
                  <div className="text-f-small font-medium">{m.text}</div>
                  <div className="text-f-small text-muted">{m.when}</div>
                </div>
              ))}
              {memories.length === 0 && (
                <p className="text-f-small text-muted">Nothing saved yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-[12px] border border-tint bg-surface p-5">
            <h2 className="text-f-h3">
              Every mention of {person.name}
            </h2>
            <p className="text-f-small text-muted">pulled from call transcripts</p>
            <div className="mt-3 flex flex-col gap-2">
              {memories.map((m) => (
                <Link
                  key={m.id}
                  href="/family/calls"
                  className="rounded-[12px] p-2 text-f-small transition-colors hover:bg-bg"
                >
                  <span className="font-mono text-muted">{m.when} · </span>
                  &ldquo;{m.text}&rdquo;
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-f-label uppercase text-muted">{label}</div>
      <div className="mt-1 rounded-[12px] bg-bg px-3 py-2 text-f-body">{value}</div>
    </div>
  );
}
