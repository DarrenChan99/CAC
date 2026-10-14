"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/Button";
import { ResidentHeader } from "@/components/ResidentHeader";
import { PhotoSlot } from "@/components/ui";
import { topicLabel } from "@/lib/mocks/content";
import { useDemo } from "@/lib/demo-store";
import { residentFeed } from "@/lib/residentFeed";
import { pressResident, pressTransition } from "@/lib/motion";

/**
 * R6 Story. "Read to me" uses the browser's own speech synthesis — no service,
 * no key, and it works offline. The voice stops at the end of the story and
 * nothing moves on by itself; "Up next" waits for her tap.
 */
export default function Story({ params }: PageProps<"/resident/news/[id]">) {
  const { id } = use(params);
  const { resolved } = useDemo();
  const [speaking, setSpeaking] = useState(false);

  // Never leave a voice talking about a story that is no longer on screen.
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const all = residentFeed(resolved).news;
  const story = all.find((n) => n.id === id);
  if (!story) notFound();

  const inTopic = all.filter((n) => n.topic === story.topic);
  const next = inTopic[(inTopic.indexOf(story) + 1) % inTopic.length];
  const label = topicLabel(story.topic);
  const back = story.topic === "family" ? "family news" : label.toLowerCase();

  function readAloud() {
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(`${story!.headline}. ${story!.body}`);
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    synth.speak(utterance);
    setSpeaking(true);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-[1180px] flex-col p-12">
      <ResidentHeader
        title={label}
        back={{ href: `/resident/news?topic=${story.topic}`, label: `Back to ${back}` }}
      />

      <article className="flex flex-1 gap-10">
        <PhotoSlot label="photo" scale="resident" className="h-[320px] w-[400px] flex-none" />
        <div className="min-w-0 flex-1">
          <div className="text-r-body font-bold text-muted">{story.when}</div>
          <h2 className="mt-3 text-r-h1">{story.headline}</h2>
          {story.body.split("\n\n").map((p) => (
            <p key={p} className="mt-6 text-r-lead">
              {p}
            </p>
          ))}
        </div>
      </article>

      <div className="mt-10 flex flex-none items-stretch gap-6">
        <Button scale="resident" variant="primary" onClick={readAloud} className="min-w-[280px]">
          {speaking ? "Stop reading" : "Read to me"}
        </Button>

        {next !== story && (
          <motion.div whileTap={pressResident} transition={pressTransition} className="flex min-w-0 flex-1">
            <Link
              href={`/resident/news/${next.id}`}
              onClick={() => window.speechSynthesis?.cancel()}
              className="flex min-h-[72px] min-w-0 flex-1 flex-col justify-center rounded-[16px] bg-tint px-8 py-4 text-primary"
            >
              <span className="text-r-body text-muted">Up next in {back}</span>
              <span className="truncate text-r-body font-bold">{next.headline}</span>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
