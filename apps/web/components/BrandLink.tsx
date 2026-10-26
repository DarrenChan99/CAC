import Image from "next/image";
import Link from "next/link";

/** The 家 tile + title. Same everywhere, always leads back to the landing page. */
export function BrandLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex min-h-[44px] items-center gap-2 ${className}`}>
      <Image src="/tile.png" alt="" width={24} height={28} />
      <span className="text-f-h3 tracking-tight">Caretaker</span>
    </Link>
  );
}
