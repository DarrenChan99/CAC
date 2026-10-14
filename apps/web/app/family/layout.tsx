import { FamilySidebar } from "@/components/FamilySidebar";
import { Mascot } from "@/components/Mascot";

export default function FamilyLayout({ children }: LayoutProps<"/family">) {
  return (
    <div className="flex min-h-dvh bg-bg font-family-view text-text">
      <FamilySidebar />
      <main className="min-w-0 flex-1">{children}</main>
      <Mascot view="family" />
    </div>
  );
}
