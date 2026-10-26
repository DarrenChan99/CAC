"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLink } from "@/components/BrandLink";
import { SiteLinks } from "@/components/SiteLinks";

const TABS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Stats", href: "/how-it-works/stats" },
];

/** Shared header for How it works + Stats: brand → landing, two tabs, demo, GitHub. */
const ANCHORS: Record<string, [string, string][]> = {
  "/how-it-works": [["pipeline", "Pipeline"], ["encoder", "Encoder"], ["space", "Voice space"], ["decision", "Decision"], ["glossary", "Glossary"]],
  "/how-it-works/stats": [["evidence", "Evidence"], ["call", "Demo call"], ["accuracy", "Accuracy"], ["system", "System"]],
};

export function ExplainerNav() {
  const path = usePathname();
  const anchors = ANCHORS[path];
  return (
    <header className="sticky top-0 z-30 border-b border-tint px-6 py-1.5" style={{ background: "var(--ct-chrome-bg)", backdropFilter: "var(--ct-chrome-blur)", WebkitBackdropFilter: "var(--ct-chrome-blur)" }}>
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-1">
        <BrandLink />
        <nav className="flex gap-1" aria-label="Explainer">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} aria-current={path === t.href ? "page" : undefined}
              className={`flex min-h-[44px] items-center rounded-[12px] px-3 text-f-body ${path === t.href ? "bg-tint font-semibold text-primary" : "text-muted hover:bg-tint/50"}`}>
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/family" className="flex min-h-[44px] items-center px-2 text-f-small font-medium text-primary hover:underline">Try the demo →</Link>
          <SiteLinks />
        </div>
      </div>
      {anchors && (
        <nav className="mx-auto flex max-w-[1180px] flex-wrap gap-x-5 text-f-small text-muted" aria-label="On this page">
          {anchors.map(([id, l]) => <a key={id} href={`#${id}`} className="py-2 hover:text-primary hover:underline">{l}</a>)}
        </nav>
      )}
    </header>
  );
}
