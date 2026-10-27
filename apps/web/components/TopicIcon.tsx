import { Heart, House, Leaf, Music, Sprout, Trophy, type LucideIcon } from "lucide-react";
import type { TopicId } from "@/lib/mocks/content";

export const topicIcons: Record<TopicId, LucideIcon> = {
  family: Heart,
  neighbourhood: House,
  garden: Sprout,
  music: Music,
  science: Leaf,
  sport: Trophy,
};

/** Decorative: always sits beside the topic's visible label. */
export function TopicIcon({ topic, size, className }: { topic: TopicId; size?: number; className?: string }) {
  const Icon = topicIcons[topic];
  return <Icon size={size} className={className} aria-hidden />;
}
