"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/Button";
import { ResidentHeader } from "@/components/ResidentHeader";
import { PhotoSlot } from "@/components/ui";
import { useDemo } from "@/lib/demo-store";
import { residentFeed } from "@/lib/residentFeed";
import { spring } from "@/lib/motion";

/**
 * R6 Family news. One story fills the screen. "Read to me" uses the browser's
 * own speech synthesis — no service, no key, and it works offline.
 */
export default function FamilyNews() {
  const [index, setIndex] = useState(0);
  // Direction drives the transition, so a story always leaves the way the next
  // one arrives — forward pushes left, back pushes right.
  const [direction, setDirection] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  const { resolved } = useDemo();
  const { news } = residentFeed(resolved);
  const story = news[index] ?? news[0];

  // Never leave a voice talking about a story that is no longer on screen.
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  function readAloud() {
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(`${story.headline}. ${story.body}`);
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    synth.speak(utterance);
    setSpeaking(true);
  }

  function go(next: number) {
    // Changing story stops the voice — it is caused by the tap, so it belongs
    // here rather than in an effect chasing the index.
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setDirection(next > index ? 1 : -1);
    setIndex((next + news.length) % news.length);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-[1180px] flex-col p-12">
      <ResidentHeader title="Family news" note={`Story ${index + 1} of ${news.length}`} />

      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.article
            key={story.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -48 }}
            transition={spring}
            className="flex gap-10"
          >
            <PhotoSlot label="photo" scale="resident" className="h-[360px] w-[420px] flex-none" />

            <div className="min-w-0 flex-1">
              <div className="text-r-body font-bold text-muted">
                {story.category} · {story.when}
              </div>
              <h2 className="mt-4 text-r-h1">{story.headline}</h2>
              <p className="mt-6 text-r-lead">{story.body}</p>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex flex-none gap-6">
        <Button scale="resident" variant="primary" onClick={readAloud} className="min-w-[280px]">
          {speaking ? "Stop reading" : "Read to me"}
        </Button>
        <Button scale="resident" variant="secondary" onClick={() => go(index - 1)}>
          Previous
        </Button>
        <Button scale="resident" variant="secondary" onClick={() => go(index + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
