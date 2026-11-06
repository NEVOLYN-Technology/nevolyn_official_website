/**
 * TypeScript types for the Nevolyn Office Management API.
 * These mirror the Spring Boot DTOs exactly.
 */

// ── Auth ────────────────────────────────────────────────────

export interface LoginResponse {
  id: number;
  username: string;
  fullName: string;
  employeeId: string;
  designation: string | null;
  phone?: string | null;
  email?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankBranch?: string | null;
  bankRoutingNumber?: string | null;
  role: "super_admin" | "admin" | "employee";
  token?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: Record<string, string> | null;
}

// ── Attendance ──────────────────────────────────────────────

export interface AttendanceRecord {
  id: number;
  userId: number;
  employeeId: string;
  fullName: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number;
  lateStatus: string;
  earlyCheckout: string;
  status: string;
  presenceBadge: "PRESENT" | "IN HOUSE" | "ABSENT";
}

export interface AdminAttendanceRecord {
  id: number | null;
  userId: number;
  employeeId: string;
  fullName: string;
  designation: string | null;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number;
  status: string;
  lateStatus: string;
  earlyCheckout: string;
  notes: string | null;
}

// ── Users ────────────────────────────────────────────────────

export interface User {
  id: number;
  employeeId: string;
  username: string;
  fullName: string;
  designation: string | null;
  joiningDate: string | null;
  phone: string | null;
  email?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankBranch?: string | null;
  bankRoutingNumber?: string | null;
  role: "super_admin" | "admin" | "employee";
  isActive: boolean;
  createdAt: string;
}

// ── Projects ─────────────────────────────────────────────────

export type ProjectStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";

export interface RndProject {
  id: number;
  code: string;
  name: string;
  objective: string | null;
  description: string | null;
  responsibleId: number | null;
  responsibleName: string | null;
  startDate: string | null;
  targetDate: string | null;
  status: string;
  progressPct: number;
  remarks: string | null;
  createdAt: string;
}

// ── Tasks ────────────────────────────────────────────────────

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Task {
  id: number;
  projectId: number | null;
  projectCode: string | null;
  projectName: string | null;
  title: string;
  description: string | null;
  assignedToId: number;
  assignedToName: string;
  assignedToEmployeeId: string;
  startDate: string | null;
  deadline: string | null;
  priority: string;
  status: string;
  progressPct: number;
  remarks: string | null;
  createdById: number;
  createdByName: string;
  createdAt: string;
}

// ── Experiments & Development Records ────────────────────────

export interface Experiment {
  id: number;
  projectId: number;
  title: string;
  experimentDate: string;
  researcherId: number;
  researcherName: string;
  objective: string | null;
  procedure: string | null;
  result: string | null;
  observation: string | null;
  conclusion: string | null;
  remarks: string | null;
  createdAt: string;
}

export interface DevelopmentRecord {
  id: number;
  projectId: number;
  productName: string;
  stage: string;
  version: string | null;
  recordDate: string;
  responsibleId: number;
  responsibleName: string;
  result: string | null;
  issues: string | null;
  nextAction: string | null;
  createdAt: string;
}

export interface UploadedFile {
  id: number;
  entityType: string;
  entityId: number;
  originalFilename: string;
  storedFilename: string;
  fileSize: number;
  mimeType: string | null;
  uploadedById: number;
  uploadedByName: string;
  uploadedAt: string;
}

export type FileDto = UploadedFile;

export interface ProjectDetail {
  project: RndProject;
  tasks: Task[];
  experiments: Experiment[];
  developmentRecords: DevelopmentRecord[];
  files: UploadedFile[];
}

// ── Work Logs ────────────────────────────────────────────────

export interface WorkLog {
  id: number;
  userId: number;
  employeeId: string;
  fullName: string;
  logDate: string;
  workCompleted: string;
  timeSpentHours: number;
  issues: string | null;
  nextAction: string | null;
  remarks: string | null;
  submittedAt: string;
}

// ── Training & Meetings ──────────────────────────────────────

export interface TrainingMeeting {
  id: number;
  title: string;
  type: string;
  sessionDate: string;
  trainerPresenter: string | null;
  participants: string | null;
  durationMinutes: number;
  notes: string | null;
  outcome: string | null;
  remarks: string | null;
  createdById: number;
  createdByName: string;
  createdAt: string;
}

// ── Audit Logs ───────────────────────────────────────────────

export interface AuditLog {
  id: number;
  username: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  targetEntity: string | null;
  targetId: number | null;
  createdAt: string;
}

// ── Dashboards ───────────────────────────────────────────────

export interface AdminDashboardData {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  currentlyInside: number;
  absentToday: number;
  activeProjects: number;
  pendingTasks: number;
  completedTasks: number;
  todayAttendance: AdminAttendanceRecord[];
  recentAuditLogs: AuditLog[];
}

export interface EmployeeDashboardData {
  greeting: string;
  fullName: string;
  designation: string | null;
  employeeId: string;
  todayAttendance: AttendanceRecord | null;
  myTasks: Task[];
  myProjects: RndProject[];
  myWorkLogs: WorkLog[];
}

// ── Reports ──────────────────────────────────────────────────

export interface MonthlyAttendanceReport {
  month: string;
  elapsedDays: number;
  employees: {
    userId: number;
    employeeId: string;
    fullName: string;
    designation: string | null;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    totalHours: number;
  }[];
}

export interface TasksReport {
  totalTasks: number;
  countByStatus: Record<string, number>;
  countByPriority: Record<string, number>;
  employeeBreakdown: {
    userId: number;
    employeeId: string;
    fullName: string;
    totalAssigned: number;
    completed: number;
    inProgress: number;
    pending: number;
  }[];
}

export interface RndReport {
  totalProjects: number;
  projects: {
    projectId: number;
    code: string;
    name: string;
    status: string;
    progressPct: number;
    responsibleName: string | null;
    tasksCount: number;
    completedTasksCount: number;
    experimentsCount: number;
    developmentRecordsCount: number;
    filesCount: number;
  }[];
}

export interface ReportSummary {
  totalEmployees: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalExperiments: number;
  totalTrainings: number;
}

// ── Pagination ───────────────────────────────────────────────

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
}
