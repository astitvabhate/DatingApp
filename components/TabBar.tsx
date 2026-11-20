"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlameIcon, HomeIcon } from "./icons";

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon, match: (p: string) => p === "/", disabled: true },
  { href: "/discover", label: "Discover", Icon: FlameIcon, match: (p: string) => p.startsWith("/discover"), disabled: false },
];

const base = "flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition";

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="flex shrink-0 gap-2 border-t-2 border-ink bg-white px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3">
      {TABS.map(({ href, label, Icon, match, disabled }) => {
        if (disabled) {
          return (
            <span
              key={href}
              aria-disabled="true"
              title="Coming soon"
              className={`${base} cursor-not-allowed select-none border-2 border-transparent text-ink/25`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </span>
          );
        }
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${base} ${
              active ? "chunky press bg-lilac text-ink" : "border-2 border-transparent text-ink/45 hover:text-ink"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
