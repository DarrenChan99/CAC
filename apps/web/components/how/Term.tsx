import type { ReactNode } from "react";
import { glossary, type TermKey } from "@/lib/how/glossary";

/** A technical term with its plain-language definition on hover or keyboard focus. */
export function Term({ k, children }: { k: TermKey; children?: ReactNode }) {
  const g = glossary[k];
  return (
    <span className="group relative inline-block">
      <span
        tabIndex={0}
        className="cursor-help underline decoration-accent decoration-2 underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {children ?? g.term}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-0 z-30 mb-2 w-[300px] rounded-[10px] border border-tint bg-surface p-3 text-f-small font-normal text-text opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        <b className="block pb-1 text-primary">{g.term}</b>
        {g.gloss}
      </span>
    </span>
  );
}

/** Section frame used by every panel on the page. */
export function Panel({ title, sub, children }: { title: string; sub?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[16px] border border-tint bg-surface p-6">
      <h3 className="text-f-h3 font-semibold">{title}</h3>
      {sub && <p className="mt-1 max-w-[70ch] text-f-small text-muted">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
