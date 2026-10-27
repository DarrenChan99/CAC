"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Activity } from "@/lib/mocks/content";
import { pressResident, pressTransition } from "@/lib/motion";
import { ActivityIcon } from "./ActivityIcon";

/* ---------- Banners ---------- */

export function Banner({
  tone = "warn",
  children,
  scale = "family",
}: {
  tone?: "warn" | "info";
  children: ReactNode;
  scale?: "resident" | "family";
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[12px] px-4 py-3 ${
        tone === "warn" ? "bg-warn-bg text-warn" : "bg-tint text-primary"
      } ${scale === "resident" ? "text-r-body" : "text-f-body"}`}
    >
      <span
        className={`flex-none rounded-full ${
          tone === "warn" ? "bg-warn" : "bg-primary"
        } ${scale === "resident" ? "h-3 w-3" : "h-2 w-2"}`}
        aria-hidden
      />
      <div>{children}</div>
    </div>
  );
}

/* ---------- Empty states ---------- */

export function EmptyState({
  title,
  note,
  scale = "family",
}: {
  title: string;
  note: string;
  scale?: "resident" | "family";
}) {
  return (
    <div
      className={`rounded-[16px] border border-dashed border-tint bg-surface text-center ${
        scale === "resident" ? "px-8 py-14" : "px-6 py-10"
      }`}
    >
      <div className={scale === "resident" ? "text-r-h2" : "text-f-h3"}>{title}</div>
      <div
        className={`mt-2 text-muted ${scale === "resident" ? "text-r-body" : "text-f-body"}`}
      >
        {note}
      </div>
    </div>
  );
}

/* ---------- Memory card ---------- */

export function MemoryCard({
  text,
  when,
  activity,
  scale = "family",
}: {
  text: string;
  when: string;
  activity?: Activity;
  scale?: "resident" | "family";
}) {
  if (scale === "resident") {
    return (
      <div className="flex items-center gap-6 rounded-[16px] border border-tint bg-surface p-6">
        <div className="flex h-[120px] w-[120px] flex-none items-center justify-center rounded-[12px] bg-tint text-primary">
          <ActivityIcon activity={activity} size={56} />
        </div>
        <div>
          <div className="text-r-lead">{text}</div>
          <div className="mt-2 text-r-body text-muted">{when}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-tint bg-surface p-3">
      <div className="flex h-12 w-12 flex-none items-center justify-center rounded-[8px] bg-tint text-primary">
        <ActivityIcon activity={activity} size={24} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-f-body font-medium">{text}</div>
        <div className="text-f-small text-muted">{when}</div>
      </div>
    </div>
  );
}

/* ---------- News card ---------- */

export function NewsCard({
  category,
  when,
  headline,
  readTime,
}: {
  category: string;
  when: string;
  headline: string;
  readTime: string;
}) {
  return (
    <div className="rounded-[12px] border border-tint bg-surface p-4">
      <div className="text-f-label font-medium text-muted">
        {category} · {when}
      </div>
      <div className="mt-2 text-f-h3">{headline}</div>
      <div className="mt-2 text-f-small text-muted">Positive filter on · {readTime}</div>
    </div>
  );
}

/* ---------- Resident home tile ----------
   72px min, and an icon never ships without its text label. */

export function Tile({
  icon,
  label,
  href,
}: {
  icon: ReactNode;
  label: string;
  href: string;
}) {
  return (
    <motion.div whileTap={pressResident} transition={pressTransition} className="flex">
      <Link
        href={href}
        className="flex min-h-[260px] flex-1 flex-col items-center justify-center gap-6 rounded-[16px] border border-tint bg-surface p-6 text-center"
      >
        <span className="flex h-[136px] w-[136px] items-center justify-center rounded-full bg-tint text-primary" aria-hidden>
          {icon}
        </span>
        <span className="flex min-h-[2.4em] items-center text-r-h2">{label}</span>
      </Link>
    </motion.div>
  );
}

/* ---------- Consent block ---------- */

export function ConsentBlock({
  title,
  body,
  checkboxLabel,
  checked,
  onChange,
}: {
  title: string;
  body: string;
  checkboxLabel: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="rounded-[12px] border border-tint bg-surface p-5">
      <div className="text-f-h3">{title}</div>
      <p className="mt-2 text-f-body text-muted">{body}</p>
      <label className="mt-4 flex min-h-[44px] cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 accent-[var(--color-primary)]"
        />
        <span className="text-f-body">{checkboxLabel}</span>
      </label>
    </div>
  );
}

/* ---------- Section heading, family view ---------- */

export function PanelHeading({
  title,
  note,
  action,
}: {
  title: string;
  note?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <div>
        <div className="text-f-h3">{title}</div>
        {note && <div className="text-f-small text-muted">{note}</div>}
      </div>
      {action}
    </div>
  );
}
