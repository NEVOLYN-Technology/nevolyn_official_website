import axios from "axios";
import {
  AdminAttendanceRecord,
  AdminDashboardData,
  ApiResponse,
  AttendanceRecord,
  AuditLog,
  DevelopmentRecord,
  EmployeeDashboardData,
  Experiment,
  FileDto,
  LoginResponse,
  MonthlyAttendanceReport,
  PagedResponse,
  ProjectDetail,
  ReportSummary,
  RndProject,
  RndReport,
  Task,
  TasksReport,
  TrainingMeeting,
  User,
  WorkLog,
} from "@/types";

/**
 * Resolves the Office Management backend API base URL:
 * 1. NEXT_PUBLIC_OFFICE_API_URL if explicitly configured.
 * 2. In browser, defaults to the same-origin Next.js proxy `/office/api/backend`
 *    (which forwards to `http://office-backend:8080/api/v1` in Docker or `http://localhost:8081/api/v1` locally).
 * 3. Server-side fallback: `http://localhost:8081/api/v1`.
 */
const resolveApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_OFFICE_API_URL) {
    return process.env.NEXT_PUBLIC_OFFICE_API_URL;
  }
  if (typeof window !== "undefined") {
    return "/office/api/backend";
  }
  return process.env.INTERNAL_API_URL || "http://localhost:8081/api/v1";
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nevolyn_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Clear all session indicators immediately to break any potential ping-pong loops with proxy
        document.cookie = "nevolyn_session=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "nevolyn_access_token=; path=/; max-age=0; SameSite=Lax";
        localStorage.removeItem("nevolyn_token");

        const pathname = window.location.pathname;
        if (!pathname.endsWith("/login") && !isRedirecting) {
          isRedirecting = true;
          const cleanPath = pathname.replace(/^\/office/, "") || "/";
          const search = cleanPath !== "/" ? `?from=${encodeURIComponent(cleanPath)}` : "";
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = `/office/login${search}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(err: unknown, defaultMessage = "An error occurred"): string {
  if (err && typeof err === "object") {
    const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
    return errorObj.response?.data?.message || errorObj.message || defaultMessage;
  }
  return defaultMessage;
}

export default api;

// ── Authentication & Profile ──────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post<ApiResponse<LoginResponse>>("/auth/login", { username, password }),
  logout: () => api.post<ApiResponse<void>>("/auth/logout"),
  me: () => api.get<ApiResponse<LoginResponse>>("/auth/me"),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.patch<ApiResponse<void>>("/auth/profile/password", data),
};

// ── Dashboards ────────────────────────────────────────────────
export const dashboardApi = {
  getAdmin: () => api.get<AdminDashboardData>("/dashboard/admin"),
  getEmployee: () => api.get<EmployeeDashboardData>("/dashboard/employee"),
};

// ── Attendance ────────────────────────────────────────────────
export const attendanceApi = {
  checkIn: () => api.post<AttendanceRecord>("/attendance/check-in"),
  checkOut: () => api.post<AttendanceRecord>("/attendance/check-out"),
  getToday: () => api.get<AttendanceRecord>("/attendance/today"),
  getHistory: () => api.get<AttendanceRecord[]>("/attendance/history"),
  getAdminDaily: (date?: string) =>
    api.get<AdminAttendanceRecord[]>(`/admin/attendance${date ? `?date=${date}` : ""}`),
  correct: (data: {
    userId: number;
    date: string;
    checkInTime?: string;
    checkOutTime?: string;
    status?: string;
    reason: string;
  }) => api.post<AttendanceRecord>("/admin/attendance/correct", data),
  getQrInfo: () => api.get<{ serverIp: string; serverPort: string; attendanceUrl: string }>("/admin/qr-info"),
};

// ── Users & Employees ─────────────────────────────────────────
export const usersApi = {
  getAll: (page = 0, size = 20) =>
    api.get<PagedResponse<User>>(`/users?page=${page}&size=${size}`),
  getActiveEmployees: () => api.get<User[]>("/users/employees"),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: {
    employeeId: string;
    username: string;
    password: string;
    fullName: string;
    designation?: string;
    joiningDate?: string;
    phone?: string;
    email?: string;
    bankName?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankBranch?: string;
    bankRoutingNumber?: string;
    role: string;
  }) => api.post<User>("/users", data),
  update: (
    id: number,
    data: {
      fullName: string;
      designation?: string;
      joiningDate?: string;
      phone?: string;
      email?: string;
      bankName?: string;
      bankAccountName?: string;
      bankAccountNumber?: string;
      bankBranch?: string;
      bankRoutingNumber?: string;
      role: string;
    }
  ) => api.patch<User>(`/users/${id}`, data),
  toggleStatus: (id: number) => api.patch<User>(`/users/${id}/toggle-status`),
  resetPassword: (id: number, newPassword: string) =>
    api.patch<void>(`/users/${id}/reset-password`, { newPassword }),
};

// ── R&D Projects ──────────────────────────────────────────────
export const projectsApi = {
  getAll: () => api.get<RndProject[]>("/projects"),
  getById: (id: number) => api.get<RndProject>(`/projects/${id}`),
  getDetail: (id: number) => api.get<ProjectDetail>(`/projects/${id}/detail`),
  create: (data: {
    code: string;
    name: string;
    objective?: string;
    description?: string;
    responsibleId?: number;
    startDate?: string;
    targetDate?: string;
    status?: string;
    remarks?: string;
  }) => api.post<RndProject>("/projects", data),
  updateStatus: (
    id: number,
    data: {
      status: string;
      progressPct?: number;
      remarks?: string;
    }
  ) => api.patch<RndProject>(`/projects/${id}/status`, data),
};

// ── Experiments & Development Records ────────────────────────
export const experimentsApi = {
  getByProject: (projectId: number) =>
    api.get<Experiment[]>(`/projects/${projectId}/experiments`),
  create: (
    projectId: number,
    data: {
      title: string;
      experimentDate?: string;
      researcherId?: number;
      objective?: string;
      procedure?: string;
      result?: string;
      observation?: string;
      conclusion?: string;
      remarks?: string;
    }
  ) => api.post<Experiment>(`/projects/${projectId}/experiments`, data),
};

export const developmentApi = {
  getByProject: (projectId: number) =>
    api.get<DevelopmentRecord[]>(`/projects/${projectId}/development-records`),
  create: (
    projectId: number,
    data: {
      productName: string;
      stage: string;
      version?: string;
      recordDate?: string;
      responsibleId?: number;
      result?: string;
      issues?: string;
      nextAction?: string;
    }
  ) => api.post<DevelopmentRecord>(`/projects/${projectId}/development-records`, data),
};

// ── Tasks ────────────────────────────────────────────────────
export const tasksApi = {
  getAll: () => api.get<Task[]>("/tasks"),
  getById: (id: number) => api.get<Task>(`/tasks/${id}`),
  create: (data: {
    projectId?: number;
    title: string;
    description?: string;
    assignedToId: number;
    startDate?: string;
    deadline?: string;
    priority?: string;
  }) => api.post<Task>("/tasks", data),
  update: (
    id: number,
    data: {
      status: string;
      progressPct?: number;
      remarks?: string;
    }
  ) => api.patch<Task>(`/tasks/${id}`, data),
};

// ── Work Logs ────────────────────────────────────────────────
export const workLogsApi = {
  getAll: () => api.get<WorkLog[]>("/work-logs"),
  create: (data: {
    logDate?: string;
    workCompleted: string;
    timeSpentHours?: number;
    issues?: string;
    nextAction?: string;
    remarks?: string;
  }) => api.post<WorkLog>("/work-logs", data),
};

// ── Training & Meetings ──────────────────────────────────────
export const trainingApi = {
  getAll: () => api.get<TrainingMeeting[]>("/training"),
  create: (data: {
    title: string;
    type: string;
    sessionDate: string;
    trainerPresenter?: string;
    participants?: string;
    durationMinutes?: number;
    notes?: string;
    outcome?: string;
    remarks?: string;
  }) => api.post<TrainingMeeting>("/training", data),
};

// ── Reports ──────────────────────────────────────────────────
export const reportsApi = {
  getSummary: () => api.get<ReportSummary>("/reports/summary"),
  getMonthlyAttendance: (month?: string) =>
    api.get<MonthlyAttendanceReport>(`/reports/attendance${month ? `?month=${month}` : ""}`),
  getTasks: () => api.get<TasksReport>("/reports/tasks"),
  getRnd: () => api.get<RndReport>("/reports/rnd"),
};

// ── Audit Logs ───────────────────────────────────────────────
export const auditApi = {
  getAll: (page = 0, size = 50, action?: string, query?: string) =>
    api.get<PagedResponse<AuditLog>>(
      `/audit?page=${page}&size=${size}${action ? `&action=${action}` : ""}${query ? `&query=${query}` : ""}`
    ),
};

// ── Files ────────────────────────────────────────────────────
export const filesApi = {
  upload: (entityType: string, entityId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<FileDto>(`/files/upload/${entityType}/${entityId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  downloadUrl: (id: number) => `${api.defaults.baseURL}/files/${id}/download`,
};
