import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { SignOutButton } from "@/components/layout/SignOutButton";

const nav = [
  { href: "/", label: "Home" },
  { href: "/plan", label: "Plan" },
  { href: "/explore", label: "Explore" },
  { href: "/community", label: "Community" },
  { href: "/utility", label: "Utility" },
  { href: "/profile", label: "Profile" },
] as const;

export function SiteHeader({
  user,
}: {
  user: { email: string; nick: string | null } | null;
}) {
  const shownName = user?.nick ?? (user?.email ? user.email.split("@")[0] : "");
  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/10 bg-cream-50/90 shadow-sm shadow-navy-900/5 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-semibold tracking-tight text-navy-900"
        >
          <Image
            src="/tour-it-logo.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-full object-cover shadow-md ring-2 ring-coral-200/70"
            priority
          />
          <span className="font-semibold tracking-tight">Tour It</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-navy-600 transition hover:bg-coral-50 hover:text-navy-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span
                className="hidden max-w-[160px] truncate text-sm font-medium text-navy-800 sm:inline"
                title={user.nick ? user.email : undefined}
              >
                @{shownName}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-navy-600 transition hover:text-navy-900 sm:inline"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-gradient-to-r from-coral-500 to-coral-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-coral-500/25 transition hover:from-coral-600 hover:to-coral-700"
              >
                Join
              </Link>
            </>
          )}
          <details className="relative md:hidden">
            <summary className="list-none rounded-lg p-2 text-navy-600 hover:bg-coral-50 [&::-webkit-details-marker]:hidden">
              <Menu className="h-6 w-6" />
            </summary>
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-navy-900/10 bg-cream-50 py-2 shadow-xl shadow-navy-900/10">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 text-sm text-navy-700 hover:bg-coral-50"
                >
                  {item.label}
                </Link>
              ))}
              {!user ? (
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm text-navy-700 hover:bg-coral-50"
                >
                  Sign in
                </Link>
              ) : (
                <div className="border-t border-navy-900/10 px-2 py-2">
                  <p
                    className="truncate px-2 text-xs font-medium text-navy-800"
                    title={user.email}
                  >
                    @{shownName}
                  </p>
                  <p
                    className="truncate px-2 text-[10px] text-navy-500"
                    title={user.email}
                  >
                    {user.email}
                  </p>
                  <div className="px-0">
                    <SignOutButton />
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
