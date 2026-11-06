/**
 * Central date and time formatting utilities.
 */

/**
 * Formats an ISO date string into a user-friendly format (e.g., "Sep 6, 2026").
 *
 * @param dateString ISO-8601 date string or null
 * @returns formatted human-readable date or "-" fallback
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats a 24-hour time string ("14:30:00") into a 12-hour AM/PM format ("2:30 PM").
 *
 * @param timeString time string in HH:mm:ss format
 * @returns 12-hour formatted time or original string/hyphen fallback
 */
export function formatTime(timeString?: string | null): string {
  if (!timeString) return "-";
  // If format is HH:mm:ss, convert to 12-hour AM/PM
  const parts = timeString.split(":");
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${hour}:${minute} ${ampm}`;
  }
  return timeString;
}

/**
 * Formats a decimal hours number into two decimal places with an "h" suffix (e.g. "8.50h").
 *
 * @param hours numeric or string representation of total working hours
 * @returns formatted string with two decimal precision
 */
export function formatHours(hours?: number | string | null): string {
  if (hours == null) return "0.00h";
  const num = typeof hours === "string" ? parseFloat(hours) : hours;
  if (isNaN(num)) return "0.00h";
  return `${num.toFixed(2)}h`;
}

