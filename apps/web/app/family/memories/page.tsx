"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { EmptyState, PhotoSlot } from "@/components/ui";
import { memories } from "@/lib/mocks/content";
import { get } from "@/lib/mocks/family";

/**
 * F9 Memories and search, with the two F9b empty states folded in as the
 * natural result of an unmatched query or a family with nothing saved yet.
 */
export default function Memories() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const results = useMemo(() => {
    if (!submitted) return memories;
    const q = submitted.toLowerCase();
    return memories.filter(
      (m) => m.text.toLowerCase().includes(q) || get(m.personId).name.toLowerCase().includes(q),
    );
  }, [submitted]);

  if (memories.length === 0) {
    return (
      <div className="mx-auto max-w-[708px] p-8">
        <EmptyState
          title="Memories come from your calls"
          note="When someone shares news on a call, we draft a memory and hold it here until a family member approves it."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] p-8">
      <header className="mb-6">
        <h1 className="text-f-h1">Memories</h1>
        <p className="text-f-small text-muted">{memories.length} saved across 14 calls</p>
      </header>

      <div className="mb-6 rounded-[12px] border border-tint bg-surface p-5">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSubmitted(query)}
            placeholder="Emily's graduation"
            className="min-h-[44px] flex-1 rounded-[12px] border-2 border-primary bg-bg px-3 text-f-body"
          />
          <Button variant="primary" onClick={() => setSubmitted(query)}>
            Search
          </Button>
        </div>
        <p className="mt-2 text-f-small text-muted">
          Searches meaning, not just words — &ldquo;graduation&rdquo; finds &ldquo;passed her course&rdquo; too.
        </p>
      </div>

      <div className="mb-3 text-f-small text-muted">
        {submitted ? `${results.length} results · best match first` : `${results.length} memories`}
      </div>

      {results.length === 0 ? (
        <div className="max-w-[708px]">
          <EmptyState title={`No match for "${submitted}"`} note="Try a different word, or clear the search." />
          <Button variant="secondary" className="mt-4" onClick={() => (setQuery(""), setSubmitted(""))}>
            Clear search
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {results.map((m) => {
            const person = get(m.personId);
            return (
              <div
                key={m.id}
                className="flex items-center gap-5 rounded-[12px] border border-tint bg-surface p-4 transition-colors hover:border-primary"
              >
                {m.hasPhoto && <PhotoSlot label="photo" className="h-[76px] w-[76px] flex-none" />}
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-f-label uppercase text-muted">Memory</div>
                  <div className="text-f-h3">{m.text}</div>
                  <blockquote className="mt-1 border-l-2 border-tint pl-2 text-f-small text-muted">
                    &ldquo;{m.text}&rdquo;
                  </blockquote>
                  <div className="mt-1 text-f-small text-muted">
                    Said by <strong className="text-text">{person.name}</strong> · {m.when}
                  </div>
                </div>
                <div className="w-[152px] flex-none text-center">
                  <Button variant="secondary" className="w-full">
                    Play moment
                  </Button>
                  <div className="mt-1 text-xs text-muted">Shown on {person.name}&apos;s page</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
