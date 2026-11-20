import { redirect } from "next/navigation";

// Home is a placeholder for now; the app opens straight into Discover.
export default function HomePage() {
  redirect("/discover");
}
