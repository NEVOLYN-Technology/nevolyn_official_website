import React from "react";
import { STATUS_BADGE_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Props for the {@link StatusBadge} component.
 */
interface StatusBadgeProps {
  /** The status string or enum keyword to display. */
  status: string;
  /** Optional custom CSS classes. */
  className?: string;
}

/**
 * Reusable visual badge component rendering consistent status color schemes
 * for tasks, projects, attendance punch states, and priorities.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const badgeStyle = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.DEFAULT;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border tracking-wide uppercase",
        badgeStyle,
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
