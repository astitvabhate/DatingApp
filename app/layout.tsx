import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import TabBar from "@/components/TabBar";
import { GearIcon } from "@/components/icons";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "coy.",
  description: "Find out if your crush likes you back",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={bricolage.variable}>
      <body className="font-sans antialiased">
        <div className="mx-auto flex h-dvh max-w-md flex-col bg-white sm:border-x-2 sm:border-ink">
          <header className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4">
            <span className="text-[30px] font-extrabold leading-none tracking-tight">
              coy<span className="text-brand">.</span>
            </span>
            <button
              type="button"
              aria-label="Settings"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-ink transition hover:bg-lilac"
            >
              <GearIcon className="h-6 w-6" />
            </button>
          </header>
          <main className="relative flex min-h-0 flex-1 flex-col">{children}</main>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
