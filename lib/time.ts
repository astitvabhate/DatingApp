export function timeAgo(iso: string, long = false) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const fmt = (n: number, short: string, word: string) =>
    long ? `${n} ${word}${n === 1 ? "" : "s"} ago` : `${n}${short}`;
  if (s < 60) return long ? "just now" : "now";
  if (s < 3600) return fmt(Math.floor(s / 60), "m", "minute");
  if (s < 86400) return fmt(Math.floor(s / 3600), "h", "hour");
  return fmt(Math.floor(s / 86400), "d", "day");
}
