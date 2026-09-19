"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { PersonAvatar } from "@/components/PersonAvatar";
import { family, RESIDENT_ID, byId, type Person } from "@/lib/mocks/family";
import { relationship, generation, GENERATION_LABELS } from "@/lib/relationships";

/**
 * F6 Family tree editor. The canvas is a real layout — people grouped by
 * generation, connected by simple vertical drops — not the hand-positioned
 * geometry in the design mock (SPEC "Fidelity": tree geometry needs judgement).
 */
export default function FamilyTree() {
  const [selectedId, setSelectedId] = useState<string>(RESIDENT_ID);
  const [addOpen, setAddOpen] = useState(false);
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
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={() => setAddOpen(true)}>
            Add relationship
          </Button>
          <Button variant="primary">Add person</Button>
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

        <Inspector person={selected} onAddRelationship={() => setAddOpen(true)} />
      </div>

      {addOpen && <AddRelationshipModal onClose={() => setAddOpen(false)} />}
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

function Inspector({
  person,
  onAddRelationship,
}: {
  person: Person;
  onAddRelationship: () => void;
}) {
  const links = [
    ...(person.parentIds ?? []).map((id) => `Child of ${byId(id)?.name}`),
    ...(person.spouseOf ? [`Married to ${byId(person.spouseOf)?.name}`] : []),
    ...(person.siblingOf ? [`Sibling of ${byId(person.siblingOf)?.name}`] : []),
  ];

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-[12px] border border-tint bg-surface p-4">
        <div className="flex items-center gap-3">
          <PersonAvatar initial={person.initial} size="family" deceased={person.deceased} />
          <div>
            <div className="text-f-h3">{person.name}</div>
            <div className="text-f-small text-muted">
              {person.isResident ? "the resident" : `${relationship(person.id)} of Mei`}
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" className="flex-1">
            Upload photo
          </Button>
          <Link href={`/family/tree/${person.id}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              Open full profile
            </Button>
          </Link>
        </div>
      </div>

      {links.length > 0 && (
        <div className="rounded-[12px] border border-tint bg-surface p-4">
          <div className="mb-2 text-f-h3">Links</div>
          <div className="flex flex-col gap-2">
            {links.map((l) => (
              <div key={l} className="flex items-center justify-between text-f-small">
                {l}
                <button className="text-primary underline">Remove</button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-f-small text-muted">
            &ldquo;{relationship(person.id) || "Relationship"}&rdquo; is worked out from these links — there is
            nothing to type.
          </p>
        </div>
      )}

      <div className="rounded-[12px] border border-tint bg-surface p-4">
        <div className="mb-2 text-f-h3">Who is the resident?</div>
        <div className="flex items-center gap-2 rounded-[12px] bg-tint p-2 text-f-small font-medium text-primary">
          <PersonAvatar initial="M" size="small" /> Mei Chen
        </div>
        <Button variant="quiet" className="mt-2 w-full">
          Make Emily the resident instead
        </Button>
        <p className="mt-2 text-f-small text-warn">
          Changing this rebuilds every relationship label on the resident&apos;s iPad.
        </p>
      </div>

      <div className="rounded-[12px] border border-[#EADFC4] bg-warn-bg p-4">
        <div className="font-mono text-f-label uppercase text-warn">Pending from a call</div>
        <div className="mt-1 text-f-body font-medium text-warn">Marcus — Emily&apos;s partner?</div>
        <p className="mt-1 text-f-small text-warn">
          Heard Sunday 8:31. Appears on the tree once approved.
        </p>
        <Link href="/family/approvals" className="mt-2 inline-block text-f-small font-medium text-warn underline">
          Review in approvals
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="quiet" className="flex-1" onClick={onAddRelationship}>
          − zoom
        </Button>
        <span className="font-mono text-f-small text-muted">100%</span>
        <Button variant="quiet" className="flex-1" onClick={onAddRelationship}>
          + zoom
        </Button>
      </div>
    </aside>
  );
}

function AddRelationshipModal({ onClose }: { onClose: () => void }) {
  const [linkType, setLinkType] = useState<"parent" | "spouse" | "sibling">("parent");

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(27,42,33,0.34)] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[616px] rounded-[12px] border border-[#DCE4D9] bg-surface p-7 shadow-[0_8px_32px_rgba(27,42,33,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-f-h2">Add a relationship</h2>
        <p className="mt-1 text-f-small text-muted">
          Pick two people and how they are linked. Labels like &ldquo;great-aunt&rdquo; are worked out
          from the structure.
        </p>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="rounded-[12px] bg-bg p-3">
            <PersonAvatar initial="J" size="small" />
            <div className="mt-2 text-f-body font-semibold">Jason</div>
            <div className="text-f-small text-muted">grandson</div>
          </div>
          <div className="text-f-small text-muted">is the</div>
          <div className="rounded-[12px] bg-bg p-3">
            <PersonAvatar initial="A" size="small" />
            <div className="mt-2 text-f-body font-semibold">Ava</div>
            <div className="text-f-small text-muted">great-granddaughter</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-f-small font-medium">Link type</div>
          <div className="grid grid-cols-3 gap-2">
            {(["parent", "spouse", "sibling"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setLinkType(t)}
                className={`min-h-[44px] rounded-[12px] px-3 text-f-small capitalize transition-colors ${
                  linkType === t ? "border-2 border-primary bg-tint" : "border border-tint"
                }`}
              >
                {t} of
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[12px] bg-tint p-4">
          <div className="text-f-small font-medium text-muted">What Grandma will hear</div>
          <p className="mt-1 text-f-body font-semibold">
            Ava is your great-granddaughter — Jason&apos;s daughter.
          </p>
          <p className="mt-1 text-f-small text-muted">
            Derived from Mei → David → Jason → Ava. No label was typed.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onClose}>
            Add relationship
          </Button>
        </div>
      </div>
    </div>
  );
}
