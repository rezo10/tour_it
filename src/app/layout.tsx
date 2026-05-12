/**
 * Root layout shared by every page. Sets up global metadata, the Poppins
 * web font, and wraps the page content in MainShell (which renders the
 * header, footer and Supabase config notice).
 */
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { MainShell } from "@/components/layout/MainShell";
import "./globals.css";

// Self-hosted Google font; `swap` shows a fallback until the file loads.
const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tour It — Travel planning & community",
  description:
    "Plan trips with structured itineraries, explore public plans, and connect with travelers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${poppins.className} min-h-full flex flex-col bg-cream-100 text-navy-900`}
      >
        <MainShell>{children}</MainShell>
      </body>
    </html>
  );
}
