import { ShieldCheck } from "lucide-react";

type Props = {
  /** Compact = icon-only pill. Default also shows the "Admin" label. */
  compact?: boolean;
  className?: string;
};

/**
 * Small pill rendered beside a user's display name to indicate they are
 * an admin moderator. Kept visually understated so it doesn't compete
 * with content.
 */
export function AdminBadge({ compact = false, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 ${className}`}
      title="Site moderator"
    >
      <ShieldCheck className="h-3 w-3" aria-hidden />
      {!compact && <span>Admin</span>}
    </span>
  );
}
