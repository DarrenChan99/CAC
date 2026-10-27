import Image from "next/image";
import Link from "next/link";
import { Image as ImageIcon, Mail, Phone, Users } from "lucide-react";
import { Tile } from "@/components/ui";
import { events } from "@/lib/mocks/content";

/**
 * R1 Home. Four things she can do on her own and what is on today. Every tile carries a
 * text label next to its icon.
 */
export default function ResidentHome() {
  const next = events[0];
  const icon = (I: typeof Phone) => <I size={64} strokeWidth={1.75} />;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-[1180px] flex-col gap-10 p-12">
      <header className="flex items-start gap-8">
        <div className="flex-1">
          <h1 className="text-r-display">Good morning, Mei</h1>
          <p className="mt-3 text-r-lead text-muted">
            Saturday, 14 March · 10:24 in the morning
          </p>
        </div>
        <Image src="/tile.png" alt="Caretaker" width={64} height={73} className="mt-3 flex-none" />
      </header>

      <div className="grid flex-1 grid-cols-4 gap-6">
        <Tile icon={icon(Phone)} label="Call family" href="/resident/call" />
        <Tile icon={icon(Users)} label="My family" href="/resident/family" />
        <Tile icon={icon(Mail)} label="Family news" href="/resident/news" />
        <Tile icon={icon(ImageIcon)} label="Family pictures" href="/resident/photos" />
      </div>

      <Link
        href="/resident/today"
        className="block rounded-[16px] border border-tint bg-surface p-8"
      >
        <div className="text-r-body font-bold text-muted">Today</div>
        <div className="mt-3 text-r-h2">
          {next.title} at {next.time} this {next.part}.
        </div>
      </Link>
    </div>
  );
}
