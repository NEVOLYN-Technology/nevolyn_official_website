/**
 * Central application constants, status maps, and badge styling definitions.
 * Modify here to update status labels, options, or visual badges across the entire frontend.
 */

export const TASK_STATUSES = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const TASK_PRIORITIES = [
  { value: "ALL", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
] as const;

export const PROJECT_STATUSES = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const USER_ROLES = [
  { value: "employee", label: "Employee" },
  { value: "admin", label: "Administrator" },
] as const;

export const SESSION_TYPES = [
  { value: "ALL", label: "All Session Types" },
  { value: "Training", label: "Training" },
  { value: "Meeting", label: "Meeting" },
  { value: "Technical Review", label: "Technical Review" },
] as const;

export const DEVELOPMENT_STAGES = [
  "Prototyping",
  "Lab Testing",
  "Pilot Run",
  "Industrial Scale",
  "Final Commercial",
] as const;

export const ACCEPTED_FILE_EXTENSIONS = [
  "pdf", "xlsx", "xls", "docx", "doc", "jpg", "jpeg", "png", "txt", "csv"
] as const;

export const MAX_FILE_SIZE_BYTES = 16 * 1024 * 1024; // 16MB

/**
 * Visual badge theme classes mapping standard statuses to Tailwind styles.
 */
export const STATUS_BADGE_STYLES: Record<string, string> = {
  // Common Active / Progress
  IN_PROGRESS: "bg-sky-50 text-sky-700 border-sky-200 font-bold",
  "In Progress": "bg-sky-50 text-sky-700 border-sky-200 font-bold",

  // Success / Concluded
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
  CONCLUDED: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
  PRESENT: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
  Present: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
  "On Time": "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",

  // Pending / Planned / Caution
  PENDING: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
  Pending: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
  PLANNED: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
  Planned: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
  ON_HOLD: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
  "On Hold": "bg-amber-50 text-amber-700 border-amber-200 font-bold",
  Late: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200 font-bold",

  // Danger / Terminated / High Priority
  CRITICAL: "bg-rose-50 text-rose-700 border-rose-200 font-extrabold",
  HIGH: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
  ABSENT: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
  Absent: "bg-rose-50 text-rose-700 border-rose-200 font-bold",

  // Neutral / Low
  LOW: "bg-slate-100 text-slate-700 border-slate-200 font-semibold",
  DEFAULT: "bg-slate-100 text-slate-700 border-slate-200 font-semibold",
};

export const PRIORITY_BADGE_STYLES: Record<string, string> = {
  CRITICAL: "bg-rose-50 text-rose-700 border-rose-200 font-extrabold",
  HIGH: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
  LOW: "bg-slate-100 text-slate-700 border-slate-200 font-semibold",
};
