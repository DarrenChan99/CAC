"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { PersonAvatar } from "./PersonAvatar";
import { spring } from "@/lib/motion";

const NAV = [
  { label: "Dashboard", href: "/family" },
  { label: "In call", href: "/family/call" },
  { label: "Approvals", href: "/family/approvals", badge: "3" },
  { label: "Family tree", href: null },
  { label: "Memories", href: null },
  { label: "Med notes", href: null },
  { label: "News", href: null },
] as const;

export function FamilySidebar() {
  const pathname = usePathname();

  return (
    /* Translucent structural layer — content scrolls under it rather than being
       boxed out by an opaque strip. */
    <aside
      className="sticky top-0 flex h-dvh w-60 flex-none flex-col gap-1 border-r border-tint p-4"
      style={{
        background: "var(--ct-chrome-bg)",
        backdropFilter: "var(--ct-chrome-blur)",
        WebkitBackdropFilter: "var(--ct-chrome-blur)",
      }}
    >
      <Link href="/" className="mb-4 flex items-center gap-2 px-2 py-2">
        <span className="h-6 w-6 rounded-[7px] bg-primary" aria-hidden />
        <span className="text-f-h3 tracking-tight">Caretaker</span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = item.href === pathname;

          if (!item.href) {
            return (
              <span
                key={item.label}
                title="Designed in a later session"
                className="flex min-h-[44px] cursor-not-allowed items-center justify-between rounded-[12px] px-3 text-f-body text-muted/45"
              >
                {item.label}
                <span className="font-mono text-f-label uppercase">soon</span>
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex min-h-[44px] items-center justify-between rounded-[12px] px-3 text-f-body transition-colors ${
                active ? "font-semibold text-primary" : "text-muted hover:bg-tint/50"
              }`}
            >
              {/* The selection itself slides between items rather than blinking
                  on and off — it reads as one object moving, which it is. */}
              {active && (
                <motion.span
                  layoutId="family-nav-active"
                  transition={spring}
                  className="absolute inset-0 -z-10 rounded-[12px] bg-tint"
                />
              )}
              {item.label}
              {"badge" in item && item.badge && (
                <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-f-label text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/family/enroll"
        className="mt-auto flex min-h-[44px] items-center gap-3 rounded-[12px] p-2 transition-colors hover:bg-tint/50"
      >
        <PersonAvatar initial="K" size="small" />
        <div className="min-w-0">
          <div className="truncate text-f-body font-medium">Ken Chen</div>
          <div className="text-f-small text-muted">voice enrolled</div>
        </div>
      </Link>
    </aside>
  );
}
