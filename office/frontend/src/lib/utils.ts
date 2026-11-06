import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Used by all shadcn/ui components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string for display.
 */
export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a time string for display (12h format).
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return "—";
  if (time.includes("T")) {
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Get a dynamic greeting based on time of day.
 * Mirrors the original Flask greeting logic.
 */
export function getDynamicGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Format decimal hours as "8h 30m".
 */
export function formatHours(hours: number | null | undefined): string {
  if (!hours) return "0h 0m";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

/**
 * Returns Tailwind CSS styling classes for presence indicators (PRESENT, IN HOUSE, ABSENT).
 *
 * @param badge presence status keyword
 * @returns class string for background, text, and border styling
 */
export function getPresenceBadgeClass(badge: string): string {
  switch (badge) {
    case "PRESENT": return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    case "IN HOUSE": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "ABSENT":   return "bg-red-500/20 text-red-400 border border-red-500/30";
    default:         return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
  }
}

/**
 * Returns Tailwind CSS styling classes for task priority levels.
 *
 * @param priority priority string (Critical, High, Medium, Low)
 * @returns class string for badge styling
 */
export function getTaskPriorityClass(priority: string): string {
  switch (priority) {
    case "Critical": return "bg-red-500/20 text-red-400 border border-red-500/30";
    case "High":     return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    case "Medium":   return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    case "Low":      return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
    default:         return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
  }
}

/**
 * Returns Tailwind CSS styling classes for lifecycle and operational statuses.
 *
 * @param status status name (Completed, In Progress, Pending, On Hold, Cancelled)
 * @returns class string for badge styling
 */
export function getStatusClass(status: string): string {
  switch (status) {
    case "Completed":   return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    case "In Progress": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Pending":     return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    case "On Hold":     return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    case "Cancelled":   return "bg-red-500/20 text-red-400 border border-red-500/30";
    default:            return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
  }
}

