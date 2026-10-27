import { approvals } from "./mocks/approvals.ts";
import { memories, news, TOPICS, type Memory, type NewsItem, type TopicId } from "./mocks/content.ts";

/** "removed" = the family took it back off (or dismissed it); "confirmed" = a person/tree edit was accepted. */
export type Resolved = Record<string, "removed" | "confirmed">;

/** People and tree edits still need one tap: an unknown voice is never given a guessed name. */
export const needsConfirm = (resolved: Resolved) =>
  approvals.filter((a) => (a.kind === "person" || a.kind === "tree") && !resolved[a.id]);

/**
 * Everything the resident can see that came from a call. Memories auto-publish
 * unless the family removed them — med notes, people and tree edits never reach
 * her, and that is enforced here by kind, not by hoping a page remembers to filter.
 */
export function residentFeed(resolved: Resolved): { memories: Memory[]; news: NewsItem[] } {
  const approved: Memory[] = approvals
    .filter((a) => a.kind === "memory" && a.personId && resolved[a.id] !== "removed")
    .map((a) => ({ id: a.id, personId: a.personId!, text: a.title, when: "today", activity: a.activity }));

  return {
    memories: [...approved, ...memories],
    news: [
      ...approved.map((m) => ({
        id: m.id,
        topic: "family" as const,
        when: m.when,
        headline: m.text,
        body: quoteOf(m.id),
      })),
      ...news,
    ],
  };
}

/** The topics on her news rail. Family is always there; the rest follow the family's switches. */
export const visibleTopics = (n: NewsPrefs) =>
  TOPICS.filter((t) => t.id === "family" || (n.on && !n.off.includes(t.id)));

export interface NewsPrefs {
  on: boolean;
  off: TopicId[];
}

const quoteOf = (id: string) => `“${approvals.find((a) => a.id === id)!.quote}”`;

/**
 * Who is talking right now, after the family's speaker corrections: a personId,
 * "unknown" for a voice nobody has named, or null. Every resident surface that
 * names a speaker goes through this, so a voice marked unknown is never named.
 */
export function activeSpeaker(
  bubbles: { id: string; speakerId: string | null; transcribing: boolean }[],
  speakers: Record<string, string | null>,
): string | null {
  const b = bubbles.find((x) => x.transcribing);
  if (!b) return null;
  return (b.id in speakers ? speakers[b.id] : b.speakerId) ?? "unknown";
}
