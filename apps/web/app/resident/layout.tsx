import { Mascot } from "@/components/Mascot";

/**
 * Resident shell. One level of navigation, a Home button always within reach,
 * and the Atkinson scale throughout — the two type scales never mix inside a
 * screen, so the whole subtree is set here. The bottom padding keeps the
 * "Family view" tile clear of every screen's controls.
 */
export default function ResidentLayout({ children }: LayoutProps<"/resident">) {
  return (
    <div className="min-h-dvh bg-bg pb-28 font-resident text-text">
      {children}
      <Mascot view="resident" />
    </div>
  );
}
