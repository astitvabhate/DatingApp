import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfileWithStatus } from "@/lib/db";
import { ChevronLeftIcon } from "@/components/icons";
import ProfileView from "@/components/ProfileView";

export const dynamic = "force-dynamic";

// Read-only full profile for someone in the Discover deck (swiping happens on
// the deck itself). Only reachable for people the user hasn't swiped on yet —
// a swiped profile must never appear again.
export default async function DiscoverProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getProfileWithStatus(id);
  if (!result) notFound();
  if (result.status === "matched") redirect(`/discover/matches/${id}`);
  if (result.status === "swiped") redirect("/discover");

  const { profile } = result;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 px-5 pb-2 pt-1">
        <Link
          href="/discover"
          aria-label="Back to Discover"
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-white transition active:scale-90"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <p className="text-sm font-bold text-ink/55">Discover</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <ProfileView profile={profile} />
      </div>
    </div>
  );
}
