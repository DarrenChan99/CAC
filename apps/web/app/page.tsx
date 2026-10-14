import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function Landing() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg px-6 text-center font-family-view text-text">
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
    </main>
  );
}
