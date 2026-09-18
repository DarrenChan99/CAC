import { ResidentNavButton } from "@/components/ResidentHeader";

/**
 * A resident-scoped 404. The default Next page is small type with no way back,
 * which is a dead end in a view whose whole premise is that there is always an
 * obvious way home.
 */
export default function ResidentNotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1180px] flex-col items-center justify-center gap-10 p-12 text-center">
      <h1 className="text-r-h1">That page isn&apos;t here</h1>
      <p className="text-r-lead text-muted">
        Nothing is wrong. Tap Home to go back to your screen.
      </p>
      <ResidentNavButton href="/resident" label="Home" />
    </div>
  );
}
