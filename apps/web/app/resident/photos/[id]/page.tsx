"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ResidentHeader } from "@/components/ResidentHeader";
import { PhotoSlot } from "@/components/ui";
import { photos } from "@/lib/mocks/content";
import { get } from "@/lib/mocks/family";
import { relationship, relationshipToResident } from "@/lib/relationships";

/** R7 One photo, big, with who is in it said from her point of view. */
export default function PhotoPage({ params }: PageProps<"/resident/photos/[id]">) {
  const { id } = use(params);
  const router = useRouter();
  const i = photos.findIndex((p) => p.id === id);
  if (i === -1) notFound();

  const photo = photos[i];
  const people = photo.personIds.map(get);
  // "David, your grandson, at his graduation". Wei reads "remembered" on the
  // tree; in a photo he is still her husband.
  const who = people
    .map((p) => `${p.name}, ${p.deceased ? `your ${relationship(p.id)}` : relationshipToResident(p.id)},`)
    .join(" and ");
  const callee = people.find((p) => p.callable);
  const go = (step: number) => router.push(`/resident/photos/${photos[(i + step + photos.length) % photos.length].id}`);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-[1180px] flex-col p-12">
      <ResidentHeader title="Photos" back={{ href: "/resident/photos", label: "Back to photos" }} />

      <div className="flex flex-1 gap-10">
        <PhotoSlot label="photo" scale="resident" className="h-[460px] w-[620px] flex-none" />
        <div className="min-w-0 flex-1">
          <p className="text-r-h2">
            {who} {photo.caption}
          </p>
          <p className="mt-3 text-r-lead text-muted">{photo.when}</p>
          {callee && (
            <Button scale="resident" variant="primary" className="mt-10 min-w-[280px]" onClick={() => router.push("/resident/call")}>
              Call {callee.name}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-none gap-6">
        <Button scale="resident" variant="secondary" onClick={() => go(-1)}>
          Previous
        </Button>
        <Button scale="resident" variant="secondary" onClick={() => go(1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
