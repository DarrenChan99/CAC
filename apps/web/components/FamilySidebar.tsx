"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { PersonAvatar } from "./PersonAvatar";
import { useDemo } from "@/lib/demo-store";
import { needsConfirm } from "@/lib/residentFeed";
import { spring } from "@/lib/motion";

const NAV = [
  { label: "Home", href: "/family" },
  { label: "Live call", href: "/family/call" },
  { label: "Captured", href: "/family/approvals", badge: true },
  { label: "Family tree", href: "/family/tree" },
] as const;

export function FamilySidebar() {
  const pathname = usePathname();
  const { resolved } = useDemo();
  const waiting = needsConfirm(resolved).length;

  const link = (href: string) => {
    const active = href === pathname || (href !== "/family" && pathname.startsWith(href + "/"));
    return `relative flex min-h-[44px] items-center justify-between rounded-[12px] px-3 text-f-body transition-colors ${
      active ? "font-semibold text-primary" : "text-muted hover:bg-tint/50"
    }`;
  };

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
        <Image src="/tile.png" alt="" width={24} height={28} />
        <span className="text-f-h3 tracking-tight">Caretaker</span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = item.href === pathname || (item.href !== "/family" && pathname.startsWith(item.href + "/"));
          return (
            <Link key={item.label} href={item.href} className={link(item.href)}>
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
              {"badge" in item && waiting > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-f-label font-medium tabular-nums text-white">
                  {waiting}
                </span>
              )}
            </Link>
          );
        })}

        <div className="my-2 border-t border-tint" />
        <Link href="/family/news-settings" className={link("/family/news-settings")}>
          News
        </Link>
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <Link href="/resident" className={link("/resident")}>
          <span className="flex items-center gap-2">
            <Image src="/tile.png" alt="" width={18} height={21} />
            Grandma&apos;s iPad
          </span>
        </Link>
        <Link
          href="/family/enroll"
          className="flex min-h-[44px] items-center gap-3 rounded-[12px] p-2 transition-colors hover:bg-tint/50"
        >
          <PersonAvatar initial="K" size="small" />
          <div className="min-w-0 truncate text-f-body font-medium">Ken Chen</div>
        </Link>
      </div>
    </aside>
  );
}
