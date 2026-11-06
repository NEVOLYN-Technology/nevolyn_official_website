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
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "In Progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",

  // Success / Concluded
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CONCLUDED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PRESENT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Present: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "On Time": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",

  // Pending / Planned / Caution
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PLANNED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Planned: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ON_HOLD: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "On Hold": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Late: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",

  // Danger / Terminated / High Priority
  CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
  HIGH: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  ABSENT: "bg-red-500/10 text-red-400 border-red-500/20",
  Absent: "bg-red-500/10 text-red-400 border-red-500/20",

  // Neutral / Low
  LOW: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  DEFAULT: "bg-slate-800 text-slate-300 border-slate-700",
};

export const PRIORITY_BADGE_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20 font-bold",
  HIGH: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  LOW: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};
