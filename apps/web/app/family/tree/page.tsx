"use client";

import Link from "next/link";
import { useState } from "react";
import { PersonAvatar } from "@/components/PersonAvatar";
import { useDemo } from "@/lib/demo-store";
import { family, RESIDENT_ID, byId, type Person } from "@/lib/mocks/family";
import { relationship, generation, GENERATION_LABELS } from "@/lib/relationships";

/**
 * F6 Family tree editor. The canvas is a real layout — people grouped by
 * generation, connected by simple vertical drops — not the hand-positioned
 * geometry in the design mock (SPEC "Fidelity": tree geometry needs judgement).
 */
export default function FamilyTree() {
  const [selectedId, setSelectedId] = useState<string>(RESIDENT_ID);
  const selected = byId(selectedId)!;

  const rows = GENERATION_LABELS.map((label, gen) => ({
    label: label.replace("\n", " "),
    people: family.filter((p) => generation(p.id) === gen),
  })).filter((r) => r.people.length > 0);

  return (
    <div className="p-8">
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-f-h1">Family tree</h1>
          <p className="text-f-small text-muted">{family.length} people · {rows.length} generations</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_336px]">
        <div
          className="overflow-x-auto rounded-[12px] border border-tint p-8"
          style={{
            background:
              "var(--color-bg) radial-gradient(#DCE4D9 1px, transparent 1px) 0 0/20px 20px",
          }}
        >
          <div className="flex flex-col items-center gap-11">
            {rows.map((row) => (
              <div key={row.label} className="flex w-full flex-col items-center gap-2">
                <div className="self-start font-mono text-f-label uppercase text-[#B9C4B5]">
                  {row.label}
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {row.people.map((p) => (
                    <Node
                      key={p.id}
                      person={p}
                      selected={p.id === selectedId}
                      onSelect={() => setSelectedId(p.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Inspector person={selected} />
      </div>
    </div>
  );
}

function Node({
  person,
  selected,
  onSelect,
}: {
  person: Person;
  selected: boolean;
  onSelect: () => void;
}) {
  const status = person.isResident
    ? "resident"
    : person.deceased
      ? "1938–2019"
      : `${relationship(person.id)} · ${person.voiceEnrolled ? "enrolled" : "not enrolled"}`;

  return (
    <button
      onClick={onSelect}
      className={`flex w-[148px] items-center gap-2.5 rounded-[12px] p-2.5 text-left transition-colors ${
        selected
          ? "border-2 border-primary bg-tint shadow-[0_0_0_4px_rgba(30,91,60,0.12)]"
          : person.deceased
            ? "border border-dashed border-[#B9C4B5] bg-surface"
            : "border border-tint bg-surface hover:border-primary"
      }`}
    >
      <PersonAvatar initial={person.initial} size="small" deceased={person.deceased} />
      <div className="min-w-0">
        <div className="truncate text-f-small font-semibold">{person.name}</div>
        <div
          className={`truncate text-xs ${person.isResident ? "font-semibold text-primary" : "text-muted"}`}
        >
          {status}
        </div>
      </div>
    </button>
  );
}

function Inspector({ person }: { person: Person }) {
  const { resolved } = useDemo();
  const links = [
    ...(person.parentIds ?? []).map((id) => `Child of ${byId(id)?.name}`),
    ...(person.spouseOf ? [`Married to ${byId(person.spouseOf)?.name}`] : []),
    ...(person.siblingOf ? [`Sibling of ${byId(person.siblingOf)?.name}`] : []),
  ];

  return (
    <aside className="flex flex-col gap-4">
      <Link
        href={`/family/tree/${person.id}`}
        className="rounded-[12px] border border-tint bg-surface p-4 transition-colors hover:border-primary"
      >
        <div className="flex items-center gap-3">
          <PersonAvatar initial={person.initial} size="family" deceased={person.deceased} />
          <div>
            <div className="text-f-h3">{person.name}</div>
            <div className="text-f-small text-muted">
              {person.isResident ? "the resident" : `${relationship(person.id)} of Mei`}
            </div>
          </div>
        </div>
      </Link>

      {links.length > 0 && (
        <div className="rounded-[12px] border border-tint bg-surface p-4">
          <div className="flex flex-col gap-2 text-f-small">
            {links.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        </div>
      )}

      {!resolved.a2 && (
        <Link
          href="/family/approvals"
          className="rounded-[12px] border border-[#EADFC4] bg-warn-bg p-4"
        >
          <div className="font-mono text-f-label uppercase text-warn">Pending from a call</div>
          <div className="mt-1 text-f-body font-medium text-warn">Marcus — Emily&apos;s partner?</div>
        </Link>
      )}
    </aside>
  );
}
