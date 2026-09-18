/**
 * Resident shell. One level of navigation, a Home button always within reach,
 * and the Atkinson scale throughout — the two type scales never mix inside a
 * screen, so the whole subtree is set here.
 */
export default function ResidentLayout({ children }: LayoutProps<"/resident">) {
  return (
    <div className="min-h-dvh bg-bg font-resident text-text">{children}</div>
  );
}
