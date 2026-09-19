"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { PersonAvatar } from "@/components/PersonAvatar";
import { members, roles, devicePairing } from "@/lib/mocks/settings";

/** F13 Settings — people, invite, device pairing. */
export default function Settings() {
  return (
    <div className="mx-auto max-w-[1200px] p-8">
      <header className="mb-6">
        <h1 className="text-f-h1">Settings</h1>
        <p className="text-f-small text-muted">Chen family · {members.length} members</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_396px]">
        <div className="flex flex-col gap-5">
          <section className="rounded-[12px] border border-tint bg-surface p-5">
            <div className="mb-1 text-f-h3">Family members</div>
            <p className="mb-3 text-f-small text-muted">roles decide who can approve things</p>
            <div className="flex flex-col gap-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-[12px] p-2">
                  <PersonAvatar initial={m.name[0]} size="small" />
                  <div className="min-w-0 flex-1">
                    <div className="text-f-body font-medium">{m.name}</div>
                    <div className="text-f-small text-muted">
                      {m.relationship} · {m.voiceStatus}
                    </div>
                  </div>
                  <span className="rounded-full bg-tint px-2.5 py-1 text-xs font-semibold text-primary">
                    {m.role === "family_admin" ? "Admin" : "Family"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[12px] border border-tint bg-surface p-5">
            <div className="mb-1 text-f-h3">Invite someone</div>
            <p className="mb-3 text-f-small text-muted">
              They pick their own name, then enrol their voice. Link expires in 7 days.
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value="caretaker.app/invite/9k2m-chen"
                className="min-h-[44px] flex-1 rounded-[12px] border border-tint bg-bg px-3 font-mono text-f-small text-muted"
              />
              <Button variant="primary">Copy link</Button>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-[12px] bg-tint p-4">
            <div className="mb-2 text-f-h3">Grandma&apos;s iPad</div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] bg-surface text-xl">
                📱
              </div>
              <div>
                <div className="text-f-body font-semibold">{devicePairing.status}</div>
                <div className="text-f-small text-muted">{devicePairing.detail}</div>
              </div>
            </div>
            <Button variant="secondary" className="mt-3 w-full">
              Show pairing code
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {roles.map((r) => (
              <div key={r.role} className="rounded-[12px] bg-bg p-3">
                <div className="text-f-body font-semibold">{r.role}</div>
                <div className="mt-1 text-f-small text-muted">{r.body}</div>
              </div>
            ))}
          </div>

          <Link href="/family/privacy" className="text-f-small text-primary underline">
            Privacy and data →
          </Link>
        </aside>
      </div>
    </div>
  );
}
