import { ExplainerNav } from "@/components/how/ExplainerNav";

export default function ExplainerLayout({ children }: LayoutProps<"/how-it-works">) {
  return (
    <div className="min-h-dvh bg-bg font-family-view text-text">
      <ExplainerNav />
      {children}
    </div>
  );
}
