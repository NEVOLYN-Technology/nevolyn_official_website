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

const resolveApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_OFFICE_API_URL) {
    return process.env.NEXT_PUBLIC_OFFICE_API_URL;
  }
  if (typeof window !== "undefined") {
    return "/office/api/backend";
  }
  const raw =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8080";
  const normalized = raw.trim().replace(/\/+$/, "").replace(/\/api\/v1$/, "");
  return `${normalized}/api/v1`;
};

let isRedirecting = false;

interface HttpResponse<T> {
  data: T;
  status: number;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  customHeaders?: Record<string, string>
): Promise<HttpResponse<T>> {
  const baseUrl = resolveApiBaseUrl().replace(/\/+$/, "");
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    ...(customHeaders || {}),
  };

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (isFormData) {
    delete headers["Content-Type"];
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nevolyn_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const serializedBody =
    body === undefined
      ? undefined
      : isFormData
        ? (body as FormData)
        : JSON.stringify(body);

  let res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: serializedBody,
  });

  if (
    (res.status === 502 || res.status === 503 || res.status === 504) &&
    typeof window !== "undefined" &&
    baseUrl === "/office/api/backend"
  ) {
    const directUrl = `/api/v1${path.startsWith("/") ? "" : "/"}${path}`;
    const fallbackRes = await fetch(directUrl, {
      method,
      headers,
      credentials: "include",
      body: serializedBody,
    }).catch(() => null);
    if (fallbackRes && fallbackRes.ok) {
      res = fallbackRes;
    }
  }

  const contentType = res.headers.get("content-type") || "";
  const parsedData = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : null;

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      document.cookie = "nevolyn_session=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "nevolyn_access_token=; path=/; max-age=0; SameSite=Lax";
      localStorage.removeItem("nevolyn_token");

      const pathname = window.location.pathname;
      if (!pathname.endsWith("/login") && !isRedirecting) {
        isRedirecting = true;
        const cleanPath = pathname.replace(/^\/office/, "") || "/";
        const search = cleanPath !== "/" ? `?from=${encodeURIComponent(cleanPath)}` : "";
        window.location.href = `/office/login${search}`;
      }
    }

    const errorObj = {
      response: {
        status: res.status,
        data: parsedData,
      },
      message:
        (parsedData && typeof parsedData === "object" && "message" in parsedData
          ? String((parsedData as { message: unknown }).message)
          : null) || `Request failed with status ${res.status}`,
    };
    throw errorObj;
  }

  return {
    data: parsedData as T,
    status: res.status,
  };
}

const api = {
  defaults: {
    baseURL: resolveApiBaseUrl(),
  },
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown, config?: { headers?: Record<string, string> }) =>
    request<T>("POST", path, body, config?.headers),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

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
  getEmployee: (username?: string) =>
    username
      ? api.get<EmployeeDashboardData>(`/dashboard/employee/${username}`)
      : api.get<EmployeeDashboardData>("/dashboard/employee"),
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

