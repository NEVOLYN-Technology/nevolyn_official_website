"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { usersApi, getApiErrorMessage } from "@/lib/api";
import { User } from "@/types";
import {
  ShieldCheck,
  UserPlus,
  Power,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Crown,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Send,
  UserCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

// ── Create Admin Modal ────────────────────────────────────────────

function generateInitialPassword(username: string): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  const specials = "!@#$*";
  let randomSegment = "";
  for (let i = 0; i < 4; i++) {
    randomSegment += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = clean.length > 0 ? clean.charAt(0).toUpperCase() + clean.slice(1, 4) : "Nev";
  const special = specials.charAt(Math.floor(Math.random() * specials.length));
  return `Nev@${base}${randomSegment}${special}26`;
}

function CreateAdminModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    employeeId: "",
    username: "",
    password: "",
    fullName: "",
    email: "",
    designation: "Administrator",
    joiningDate: new Date().toISOString().split("T")[0],
    role: "admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedType, setCopiedType] = useState<"msg" | "pass" | null>(null);

  const [createdAdmin, setCreatedAdmin] = useState<{
    fullName: string;
    username: string;
    employeeId: string;
    email: string;
    designation: string;
    role: string;
    joiningDate: string;
    password: string;
  } | null>(null);

  const isAutoEmployeeId =
    !formData.employeeId ||
    formData.employeeId.startsWith("nev_");

  const buildEmployeeId = (username: string, joiningDate: string) => {
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (!cleanUser) return "";
    return `nev_${cleanUser}_${joiningDate || new Date().toISOString().split("T")[0]}`;
  };

  React.useEffect(() => {
    if (!formData.password) {
      setFormData((prev) => ({
        ...prev,
        password: generateInitialPassword(prev.username || "admin"),
      }));
    }
  }, []);

  const createMutation = useMutation({
    mutationFn: () => usersApi.create(formData),
    onSuccess: () => {
      setCreatedAdmin({ ...formData });
      onSuccess();
    },
    onError: (err: unknown) => {
      setErrorMsg(getApiErrorMessage(err, "Failed to create administrator account"));
    },
  });

  const getOnboardingInstructionText = () => {
    return `@all 
Office portal e nijer phone and bank details and password change er authority admin er rakha hoy nai aita employeee hisebe login korei kora lagbe including personal phone number.
So make sure sobai kore feilen

Jar jar initial password sobaik provide kora hoise already

And bank details duita provide koiren sobai`;
  };

  const buildShareableMessage = () => {
    if (!createdAdmin) return "";
    const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/office/login` : "https://nevolyn.com/office/login";

    return `━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 NEVOLYN OFFICE PORTAL — ADMINISTRATOR CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Full Name: ${createdAdmin.fullName}
🆔 Employee ID: ${createdAdmin.employeeId}
🏷️ Username: ${createdAdmin.username}
📧 Work Email: ${createdAdmin.email || "—"}
💼 Designation: ${createdAdmin.designation || "Administrator"}
🔑 Initial Temporary Password: ${createdAdmin.password}
🌐 Portal Login: ${portalUrl}

📢 IMPORTANT INSTRUCTIONS / নির্দেশনা:
${getOnboardingInstructionText()}
━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(buildShareableMessage());
      setCopiedType("msg");
      setTimeout(() => setCopiedType(null), 3000);
    } catch {}
  };

  const handleCopyPasswordOnly = async () => {
    if (!createdAdmin) return;
    try {
      await navigator.clipboard.writeText(createdAdmin.password);
      setCopiedType("pass");
      setTimeout(() => setCopiedType(null), 3000);
    } catch {}
  };

  const handlePrintSlip = () => {
    if (!createdAdmin) return;
    const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/office/login` : "https://nevolyn.com/office/login";

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nevolyn Administrator Onboarding Slip - ${createdAdmin.fullName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; margin: 0; background: #fff; }
            .slip { max-width: 580px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; text-align: left; }
            .logo { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; }
            .sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #d97706; font-weight: 700; margin-top: 4px; }
            .row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
            .label { color: #64748b; font-weight: 600; }
            .val { font-weight: 700; font-family: monospace; color: #0f172a; }
            .pass-box { background: #fffbeb; border: 1px solid #fde68a; padding: 12px 16px; border-radius: 10px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
            .pass-label { font-size: 12px; font-weight: 700; color: #92400e; }
            .pass-val { font-size: 16px; font-weight: 900; font-family: monospace; color: #b45309; letter-spacing: 0.5px; }
            .notice { margin-top: 24px; padding: 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 12px; line-height: 1.6; }
            .notice-title { font-weight: 800; color: #0f172a; margin-bottom: 6px; }
            .url-row { font-size: 11px; color: #64748b; margin-top: 14px; text-align: center; }
            @media print {
              body { padding: 0; }
              .slip { border: 1.5px solid #000; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="slip">
            <div class="header">
              <div class="logo">NEVOLYN OFFICIAL PORTAL</div>
              <div class="sub">Confidential Administrator Credentials Slip</div>
            </div>
            <div class="row"><span class="label">Full Legal Name:</span><span class="val">${createdAdmin.fullName}</span></div>
            <div class="row"><span class="label">Employee ID:</span><span class="val">${createdAdmin.employeeId}</span></div>
            <div class="row"><span class="label">Username:</span><span class="val">${createdAdmin.username}</span></div>
            <div class="row"><span class="label">Official Email:</span><span class="val">${createdAdmin.email || "—"}</span></div>
            <div class="row"><span class="label">Designation:</span><span class="val">${createdAdmin.designation || "Administrator"}</span></div>
            <div class="row"><span class="label">Role Tier:</span><span class="val">ADMINISTRATOR</span></div>
            <div class="row"><span class="label">Effective Joining Date:</span><span class="val">${createdAdmin.joiningDate}</span></div>

            <div class="pass-box">
              <span class="pass-label">Initial Login Password:</span>
              <span class="pass-val">${createdAdmin.password}</span>
            </div>

            <div class="notice">
              <div class="notice-title">MANDATORY INSTRUCTIONS / নির্দেশনা:</div>
              Office portal e nijer phone and bank details and password change er authority admin er rakha hoy nai aita employeee hisebe login korei kora lagbe including personal phone number.<br/><br/>
              <strong>So make sure sobai kore feilen.</strong><br/>
              Jar jar initial password sobaik provide kora hoise already.<br/>
              And bank details duita provide koiren sobai.
            </div>

            <div class="url-row">
              Portal Access: <strong>${portalUrl}</strong>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-5 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              {createdAdmin ? "Administrator Credentials Slip" : "Create Administrator Account"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── SCREEN 2: SUCCESS & PRINTABLE SLIP / WHATSAPP MESSAGE ──────────── */}
        {createdAdmin ? (
          <div className="space-y-5">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs text-amber-900">
                <p className="font-bold">Administrator Provisioned!</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Initial credentials generated for <strong>{createdAdmin.fullName}</strong>.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="font-bold text-slate-900">{createdAdmin.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Employee ID:</span>
                <span className="font-mono font-bold text-teal-700">{createdAdmin.employeeId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Username:</span>
                <span className="font-mono font-bold text-slate-800">@{createdAdmin.username}</span>
              </div>
              {createdAdmin.email && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Official Email:</span>
                  <span className="font-bold text-slate-800">{createdAdmin.email}</span>
                </div>
              )}

              {/* Password Box */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                    Initial Login Password
                  </span>
                  <span className="font-mono text-sm font-extrabold text-amber-900">
                    {createdAdmin.password}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPasswordOnly}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  {copiedType === "pass" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === "pass" ? "Copied" : "Copy Password"}</span>
                </button>
              </div>
            </div>

            {/* Instruction Notice */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-700 text-xs leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-slate-900">
                <Send className="w-3.5 h-3.5 text-teal-600" />
                <span>Instruction Message for Administrator:</span>
              </p>
              <p className="text-[11px] text-slate-600 whitespace-pre-line font-medium pl-5">
                {getOnboardingInstructionText()}
              </p>
            </div>

            {/* Handout Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Print / Download Slip</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedType === "msg" ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                <span>{copiedType === "msg" ? "Copied WhatsApp Message!" : "Copy WhatsApp Message"}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── SCREEN 1: CREATE ADMIN FORM (NO PHONE, NO BANK DETAILS) ──────── */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <strong>⚠️ Privileged Operation:</strong> This creates an <strong>ADMIN</strong> account with full office management access. Only provision accounts for trusted personnel.
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-slate-700 mb-1 font-bold">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. jdoe"
                  value={formData.username}
                  onChange={(e) => {
                    const nextUser = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
                    setFormData({
                      ...formData,
                      username: nextUser,
                      employeeId: isAutoEmployeeId ? buildEmployeeId(nextUser, formData.joiningDate) : formData.employeeId,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Joining Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.joiningDate}
                  onChange={(e) => {
                    const nextDate = e.target.value;
                    setFormData({
                      ...formData,
                      joiningDate: nextDate,
                      employeeId: isAutoEmployeeId ? buildEmployeeId(formData.username, nextDate) : formData.employeeId,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Generated Employee ID */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Generated Employee ID <span className="text-teal-600 font-normal">(Auto)</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.employeeId}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-teal-800 font-mono font-semibold focus:outline-none"
                />
              </div>

              {/* Official Email */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Official Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@nevolyn.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Designation */}
              <div className="sm:col-span-2">
                <label className="block text-slate-700 mb-1 font-bold">
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Office Manager / Systems Admin"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Auto-Generated Initial Password */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">
                    Initial Administrator Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        password: generateInitialPassword(prev.username || "admin"),
                      }))
                    }
                    className="text-[11px] text-teal-700 hover:text-teal-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate Password</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:border-slate-900 focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || !formData.fullName || !formData.username || !formData.password}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-slate-900/15 flex items-center gap-2 cursor-pointer"
              >
                {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <UserPlus className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{createMutation.isPending ? "Creating..." : "Create Admin & Generate Slip"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main Admin Management Page ────────────────────────────────────

export default function AdminManagementPage() {
  const { isSuperAdmin } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Redirect non-super-admins
  React.useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/office/dashboard");
    }
  }, [isSuperAdmin, router]);

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const res = await usersApi.getAll(0, 100);
      return res.data?.content ?? [];
    },
    enabled: isSuperAdmin,
  });

  const adminUsers: User[] = (allUsers ?? []).filter(
    (u: User) => u.role === "admin" || u.role === "super_admin"
  );

  const toggleMutation = useMutation({
    mutationFn: (userId: number) => usersApi.toggleStatus(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      setSuccessMsg("Account status updated.");
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const handleSuccess = (msg: string) => {
    void queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    setShowCreateModal(false);
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (!isSuperAdmin) return null;

  const roleBadge = (role: string) => {
    if (role === "super_admin")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300/80 text-amber-800 text-[10px] font-bold">
          <Crown className="w-2.5 h-2.5 text-amber-600" /> SUPER ADMIN
        </span>
      );
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-300/80 text-teal-800 text-[10px] font-bold">
        ADMIN
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
            Admin Management
          </h1>
          <p className="text-slate-500 font-medium text-xs mt-1">
            Manage administrator accounts — Super Admin access only
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15 transition-all"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          Create Administrator
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <strong>Security Policy:</strong> Passwords, banking credentials, and phone numbers are protected personal data maintained exclusively by account holders via the Profile &amp; Security portal. Maximum 2 active Super Administrator accounts are permitted. ADMIN accounts can be activated or deactivated by Super Administrators.
        </div>
      </div>

      {/* Admin accounts table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900">
            Administrator Accounts ({adminUsers.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500 text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading administrators...
          </div>
        ) : adminUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No administrator accounts found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {adminUsers.map((admin) => {
              const isSA = admin.role === "super_admin";
              return (
                <div
                  key={admin.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Avatar */}
                    <EmployeeAvatar user={admin} size="md" shape="circle" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{admin.fullName}</span>
                        {roleBadge(admin.role)}
                        {!admin.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            INACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        @{admin.username} · <span className="font-mono text-teal-700 font-semibold">{admin.employeeId}</span>
                        {admin.designation && ` · ${admin.designation}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions — only for ADMIN (not SUPER_ADMIN) */}
                  {!isSA && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleMutation.mutate(admin.id)}
                        disabled={toggleMutation.isPending}
                        title={admin.isActive ? "Deactivate account" : "Activate account"}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          admin.isActive
                            ? "bg-slate-100 text-slate-600 border-slate-200 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* SUPER_ADMIN: protected badge instead of action buttons */}
                  {isSA && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300/80 rounded-lg px-2.5 py-1 shrink-0">
                      Protected Account
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => handleSuccess("Administrator account created successfully.")}
        />
      )}
    </div>
  );
}
