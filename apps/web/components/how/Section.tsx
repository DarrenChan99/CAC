export const Section = ({ id, n, title, lead, children }: { id: string; n: string; title: string; lead?: React.ReactNode; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-32">
    <div className="flex items-baseline gap-3">
      <span className="text-f-h2 font-bold tabular-nums text-primary">{n}</span>
      <h2 className="text-f-h1 font-bold">{title}</h2>
    </div>
    {lead && <p className="mt-2 max-w-[70ch] text-f-body text-muted">{lead}</p>}
    <div className="mt-5 flex flex-col gap-4">{children}</div>
  </section>
);
