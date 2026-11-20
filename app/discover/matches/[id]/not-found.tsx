import Link from "next/link";

export default function MatchNotFound() {
  return (
    <div className="flex flex-1 items-center px-5">
      <div className="chunky-lg w-full rounded-[28px] bg-white p-6">
        <h1 className="text-[28px] font-extrabold leading-[1.05] tracking-tight">Match not found</h1>
        <p className="mt-2 text-[15px] font-semibold text-ink/70">
          This profile isn&apos;t one of your matches.
        </p>
        <Link
          href="/discover/matches"
          className="chunky press mt-5 block rounded-full bg-brand py-3.5 text-center text-[17px] font-bold"
        >
          Back to matches
        </Link>
      </div>
    </div>
  );
}
