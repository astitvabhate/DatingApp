import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatch } from "@/lib/db";
import { timeAgo } from "@/lib/time";
import { ChevronLeftIcon } from "@/components/icons";
import ProfileView from "@/components/ProfileView";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) notFound(); // same response for every non-mutual id

  const { profile, matchedAt } = match;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 px-5 pb-2 pt-1">
        <Link
          href="/discover/matches"
          aria-label="Back to Matches"
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-white transition active:scale-90"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <p className="text-sm font-bold text-ink/55">Matches</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <ProfileView profile={profile} matchedLabel={timeAgo(matchedAt, true)} />
      </div>

      <div className="shrink-0 border-t-2 border-ink/10 px-5 py-3">
        <button
          type="button"
          disabled
          className="chunky flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-[17px] font-bold opacity-60"
        >
          Chat
        </button>
      </div>
    </div>
  );
}
