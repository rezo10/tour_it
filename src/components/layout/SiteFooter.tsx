import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-navy-900/10 bg-cream-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex gap-4">
          <Image
            src="/tour-it-logo.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-coral-200/60"
          />
          <div>
            <p className="text-sm font-semibold text-navy-900">Tour It</p>
            <p className="mt-1 max-w-md text-sm text-navy-600">
              Travel planning and community — explore the world with calm,
              structured journeys.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-navy-600">
          <Link href="/plan" className="hover:text-coral-700">
            Plan a trip
          </Link>
          <Link href="/explore" className="hover:text-coral-700">
            Explore
          </Link>
          <Link href="/utility" className="hover:text-coral-700">
            Utilities
          </Link>
        </div>
      </div>
      <div className="border-t border-navy-900/5 bg-cream-100/80 py-3 text-center text-xs text-navy-500">
        © {new Date().getFullYear()} Tour It
      </div>
    </footer>
  );
}
