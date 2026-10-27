import {
  BookHeart,
  BookOpen,
  Car,
  CookingPot,
  Fish,
  Flower2,
  GraduationCap,
  Heart,
  House,
  MessageCircle,
  Music,
  PaintRoller,
  Phone,
  Scissors,
  Sprout,
  Trophy,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { Activity } from "@/lib/mocks/content";

const icons: Record<Activity, LucideIcon> = {
  book: BookOpen,
  flower: Flower2,
  cooking: CookingPot,
  home: House,
  paint: PaintRoller,
  garden: Sprout,
  trophy: Trophy,
  music: Music,
  fish: Fish,
  talk: MessageCircle,
  sewing: Scissors,
  phone: Phone,
  album: BookHeart,
  graduation: GraduationCap,
  dinner: UtensilsCrossed,
  car: Car,
};

/** What a memory is about, as a plain icon. Anything unmapped gets a heart, never an empty box. */
export function ActivityIcon({
  activity,
  size,
  className = "",
}: {
  activity?: Activity;
  size: number;
  className?: string;
}) {
  const Icon = (activity && icons[activity]) || Heart;
  return <Icon size={size} strokeWidth={1.75} aria-hidden className={className} />;
}
