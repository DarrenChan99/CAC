import Image from "next/image";
import Link from "next/link";
import { BarChart3, Workflow } from "lucide-react";
import { Button } from "@/components/Button";
import { SiteLinks } from "@/components/SiteLinks";

export default function Landing() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg px-6 text-center font-family-view text-text">
      <Image src="/tile.png" alt="" width={96} height={110} priority className="ct-pop" />
      <h1 className="text-[clamp(2.5rem,7vw,4rem)] font-bold leading-none tracking-[-0.02em]">
        Caretaker
      </h1>
      <p className="text-f-h3 text-muted">Family video calls that know who&apos;s talking.</p>
      <Link href="/family">
        <Button variant="primary" className="mt-2 !min-h-[52px] !px-8 !text-f-body">
          Try the demo
        </Button>
      </Link>
      <footer className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-x-2 border-t border-tint px-6 py-3">
        {[["/how-it-works", "How it works", <Workflow key="w" size={22} aria-hidden />], ["/how-it-works/stats", "Stats", <BarChart3 key="b" size={22} aria-hidden />]].map(([href, label, icon]) => (
          <Link key={href as string} href={href as string} className="flex min-h-[44px] items-center gap-2 rounded-[12px] px-3 text-f-small font-medium text-muted transition-colors hover:bg-tint/50 hover:text-primary">
            {icon}{label}
          </Link>
        ))}
        <SiteLinks labels />
      </footer>
    </main>
  );
}
