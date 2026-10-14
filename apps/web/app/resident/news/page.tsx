"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ResidentHeader } from "@/components/ResidentHeader";
import { PhotoSlot } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { residentFeed, visibleTopics } from "@/lib/residentFeed";
import { pressResident, pressTransition } from "@/lib/motion";

/**
 * R6 Family news. Topics down the left, that topic's headlines on the right —
 * she picks what to read. The family's News settings decide which topics show.
 */
export default function FamilyNews({ searchParams }: PageProps<"/resident/news">) {
  const { topic: asked } = use(searchParams);
  const { resolved, news: prefs } = useDemo();
  const topics = visibleTopics(prefs);
  // A topic the family has since switched off falls back to family news.
  const topic = topics.find((t) => t.id === asked) ?? topics[0];
  const stories = residentFeed(resolved).news.filter((n) => n.topic === topic.id);

  return (
    <div className="mx-auto flex h-[calc(100dvh-7rem)] max-w-[1180px] flex-col p-12">
      <ResidentHeader title="Family news" />

      <div className="flex min-h-0 flex-1 gap-8">
        <nav className="flex w-[340px] flex-none flex-col gap-6 overflow-y-auto">
          {topics.map((t) => (
            <motion.div key={t.id} whileTap={pressResident} transition={pressTransition}>
              <Link
                href={`/resident/news?topic=${t.id}`}
                aria-current={t.id === topic.id ? "page" : undefined}
                className={`flex min-h-[72px] items-center rounded-[16px] px-6 text-r-body font-bold ${
                  t.id === topic.id ? "bg-primary text-white" : "bg-tint text-primary"
                }`}
              >
                {t.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto">
          {stories.length === 0 && <p className="text-r-lead text-muted">Nothing new yet.</p>}
          {stories.map((s) => (
            <motion.div key={s.id} whileTap={pressResident} transition={pressTransition}>
              <Link
                href={`/resident/news/${s.id}`}
                className="flex min-h-[72px] items-center gap-6 rounded-[16px] border border-tint bg-surface p-5"
              >
                <PhotoSlot label="photo" scale="resident" className="h-[120px] w-[160px] flex-none" />
                <div className="min-w-0">
                  <div className="text-r-lead font-bold">{s.headline}</div>
                  <div className="mt-1 text-r-body text-muted">{s.when}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
