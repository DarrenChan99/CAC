import { approvals } from "./mocks/approvals.ts";
import { memories, news, type Memory, type NewsItem } from "./mocks/content.ts";

export type Resolved = Record<string, "approved" | "rejected">;

export const pending = (resolved: Resolved) => approvals.filter((a) => !resolved[a.id]);

/**
 * Everything the resident can see that came from a call. Only approved
 * *memories* pass — med notes, people and tree edits never reach her, and
 * that is enforced here by kind, not by hoping a page remembers to filter.
 */
export function residentFeed(resolved: Resolved): { memories: Memory[]; news: NewsItem[] } {
  const approved: Memory[] = approvals
    .filter((a) => a.kind === "memory" && a.personId && resolved[a.id] === "approved")
    .map((a) => ({ id: a.id, personId: a.personId!, text: a.title, when: "today" }));

  return {
    memories: [...approved, ...memories],
    news: [
      ...approved.map((m) => ({
        id: m.id,
        category: "From your family",
        when: m.when,
        headline: m.text,
        body: quoteOf(m.id),
        readTime: "",
      })),
      ...news,
    ],
  };
}

const quoteOf = (id: string) => `“${approvals.find((a) => a.id === id)!.quote}”`;
