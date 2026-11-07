"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, getApiErrorMessage } from "@/lib/api";
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Landmark,
  ShieldCheck,
  User as UserIcon,
  Phone,
  Mail,
  Building2,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Edit3,
  X,
  FileCheck2,
  ShieldAlert,
  Calendar,
  Sparkles,
  Info,
  LogOut,
} from "lucide-react";
import { EmployeeAvatar } from "@/components/shared/EmployeeAvatar";

export default function ProfilePage() {
  const { user, refreshProfile, logout } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"overview" | "banking" | "security">("overview");

  // Notification Banner
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modals state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  // Masking toggles for account numbers
  const [showPrimaryAccount, setShowPrimaryAccount] = useState(false);
  const [showSecondaryAccount, setShowSecondaryAccount] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    phone: user?.phone || "",
    email: user?.email || "",
    currentPassword: "",
  });
  const [contactLoading, setContactLoading] = useState(false);

  // Banking form state
  const [bankForm, setBankForm] = useState({
    bankName: user?.bankName || "",
    bankAccountName: user?.bankAccountName || user?.fullName || "",
    bankAccountNumber: user?.bankAccountNumber || "",
    bankBranch: user?.bankBranch || "",
    bankRoutingNumber: user?.bankRoutingNumber || "",
    secondaryBankName: user?.secondaryBankName || "",
    secondaryBankAccountName: user?.secondaryBankAccountName || "",
    secondaryBankAccountNumber: user?.secondaryBankAccountNumber || "",
    secondaryBankBranch: user?.secondaryBankBranch || "",
    secondaryBankRoutingNumber: user?.secondaryBankRoutingNumber || "",
    currentPassword: "",
  });
  const [bankLoading, setBankLoading] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Reset contact form to user's current data when opening modal
  const handleOpenContactModal = () => {
    setStatusMsg(null);
    setContactForm({
      phone: user?.phone || "",
      email: user?.email || "",
      currentPassword: "",
    });
    setIsContactModalOpen(true);
  };

  // Reset bank form to user's current data when opening modal
  const handleOpenBankModal = () => {
    setStatusMsg(null);
    setBankForm({
      bankName: user?.bankName || "",
      bankAccountName: user?.bankAccountName || user?.fullName || "",
      bankAccountNumber: user?.bankAccountNumber || "",
      bankBranch: user?.bankBranch || "",
      bankRoutingNumber: user?.bankRoutingNumber || "",
      secondaryBankName: user?.secondaryBankName || "",
      secondaryBankAccountName: user?.secondaryBankAccountName || "",
      secondaryBankAccountNumber: user?.secondaryBankAccountNumber || "",
      secondaryBankBranch: user?.secondaryBankBranch || "",
      secondaryBankRoutingNumber: user?.secondaryBankRoutingNumber || "",
      currentPassword: "",
    });
    setIsBankModalOpen(true);
  };

  // Submit Contact Info Update
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!contactForm.currentPassword.trim()) {
      setStatusMsg({
        type: "error",
        text: "Please enter your current password to authorize contact updates.",
      });
      return;
    }

    setContactLoading(true);
    try {
      await authApi.updateProfile({
        phone: contactForm.phone,
        email: contactForm.email,
        currentPassword: contactForm.currentPassword,
      });

      await refreshProfile();
      setIsContactModalOpen(false);
      setStatusMsg({
        type: "success",
        text: "Contact information verified and updated successfully.",
      });
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: getApiErrorMessage(err, "Failed to update contact information."),
      });
    } finally {
      setContactLoading(false);
    }
  };

  // Submit Banking Info Update
  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!bankForm.currentPassword.trim()) {
      setStatusMsg({
        type: "error",
        text: "Security verification required: Enter your current password to sign this banking update.",
      });
      return;
    }

    setBankLoading(true);
    try {
      await authApi.updateProfile({
        bankName: bankForm.bankName,
        bankAccountName: bankForm.bankAccountName,
        bankAccountNumber: bankForm.bankAccountNumber,
        bankBranch: bankForm.bankBranch,
        bankRoutingNumber: bankForm.bankRoutingNumber,
        secondaryBankName: bankForm.secondaryBankName,
        secondaryBankAccountName: bankForm.secondaryBankAccountName,
        secondaryBankAccountNumber: bankForm.secondaryBankAccountNumber,
        secondaryBankBranch: bankForm.secondaryBankBranch,
        secondaryBankRoutingNumber: bankForm.secondaryBankRoutingNumber,
        currentPassword: bankForm.currentPassword,
      });

      await refreshProfile();
      setIsBankModalOpen(false);
      setStatusMsg({
        type: "success",
        text: "Payroll banking details updated successfully and logged in the audit trail.",
      });
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: getApiErrorMessage(err, "Failed to update banking information."),
      });
    } finally {
      setBankLoading(false);
    }
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (passwordForm.newPassword.length < 6) {
      setStatusMsg({
        type: "error",
        text: "New password must be at least 6 characters long.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMsg({
        type: "error",
        text: "New password and confirmation do not match.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setStatusMsg({
        type: "success",
        text: "Your individual employee password has been updated successfully.",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text: getApiErrorMessage(err, "Failed to update password."),
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Helper to mask account number for privacy on screen
  const maskAccountNumber = (acc?: string | null, show = false) => {
    if (!acc) return "Not set";
    if (show) return acc;
    if (acc.length <= 4) return "•••• " + acc;
    return "•••• •••• " + acc.slice(-4);
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const p = passwordForm.newPassword;
    if (!p) return { score: 0, label: "Not entered", color: "bg-slate-200" };
    let score = 0;
    if (p.length >= 6) score += 1;
    if (p.length >= 10) score += 1;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak", color: "bg-rose-500" };
    if (score <= 4) return { score: 2, label: "Good", color: "bg-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500" };
  }, [passwordForm.newPassword]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800">
            Governance
          </span>
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
            Verified Session
          </span>
        </div>
        <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-teal-600 shrink-0" />
          <span>Profile &amp; Security Center</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Manage your personal identity, contact information, payroll bank accounts, and credentials with enterprise protocol.
        </p>
      </div>

      {/* Prominent High-Visibility Tab Navigation Banner */}
      <div className="bg-slate-100/90 p-1.5 sm:p-2 rounded-2xl border-2 border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer text-left ${
            activeTab === "overview"
              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/25 ring-2 ring-slate-900"
              : "bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-2xs"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === "overview"
                  ? "bg-slate-800 border border-slate-700 text-emerald-400"
                  : "bg-slate-100 border border-slate-200 text-slate-600 shadow-2xs"
              }`}
            >
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className={`block text-xs sm:text-sm font-extrabold leading-tight ${
                activeTab === "overview" ? "text-white" : "text-slate-900"
              }`}>
                Overview &amp; Contact
              </span>
              <span
                className={`text-[11px] block mt-0.5 font-medium truncate ${
                  activeTab === "overview" ? "text-slate-300" : "text-slate-500"
                }`}
              >
                Identity, Phone &amp; Email
              </span>
            </div>
          </div>
          {activeTab === "overview" && (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              Active
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("banking")}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer text-left ${
            activeTab === "banking"
              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/25 ring-2 ring-slate-900"
              : "bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-2xs"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === "banking"
                  ? "bg-slate-800 border border-slate-700 text-teal-400"
                  : "bg-slate-100 border border-slate-200 text-slate-600 shadow-2xs"
              }`}
            >
              <Landmark className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className={`block text-xs sm:text-sm font-extrabold leading-tight ${
                activeTab === "banking" ? "text-white" : "text-slate-900"
              }`}>
                Payroll &amp; Banking
              </span>
              <span
                className={`text-[11px] block mt-0.5 font-medium truncate ${
                  activeTab === "banking" ? "text-slate-300" : "text-slate-500"
                }`}
              >
                Direct Deposit Accounts
              </span>
            </div>
          </div>
          {activeTab === "banking" && (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
              Active
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer text-left ${
            activeTab === "security"
              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/25 ring-2 ring-slate-900"
              : "bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-2xs"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === "security"
                  ? "bg-slate-800 border border-slate-700 text-amber-400"
                  : "bg-slate-100 border border-slate-200 text-slate-600 shadow-2xs"
              }`}
            >
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className={`block text-xs sm:text-sm font-extrabold leading-tight ${
                activeTab === "security" ? "text-white" : "text-slate-900"
              }`}>
                Security &amp; Password
              </span>
              <span
                className={`text-[11px] block mt-0.5 font-medium truncate ${
                  activeTab === "security" ? "text-slate-300" : "text-slate-500"
                }`}
              >
                Credentials &amp; Active Session
              </span>
            </div>
          </div>
          {activeTab === "security" && (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Global Status Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs transition-all ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-xs font-bold underline cursor-pointer hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: OVERVIEW & CONTACT DETAILS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Executive Identity Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_32px_-10px_rgba(15,23,42,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
              <div className="flex items-center gap-5">
                <EmployeeAvatar user={user} size="lg" shape="rounded" />
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      {user?.fullName}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono font-bold">
                      @{user?.username}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full ${
                        user?.role === "super_admin"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : user?.role === "admin"
                          ? "bg-teal-100 text-teal-800 border border-teal-300"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}
                    >
                      {user?.role === "super_admin"
                        ? "Super Admin"
                        : user?.role === "admin"
                        ? "Administrator"
                        : "Staff Member"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {user?.designation || "Nevolyn Core Team Member"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Employee ID
                  </span>
                  <span className="font-mono font-extrabold text-teal-800 text-sm">
                    {user?.employeeId}
                  </span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Employee
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_32px_-10px_rgba(15,23,42,0.06)] space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div className="flex items-center gap-2.5">
                <Phone className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Contact &amp; Communication Details
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Your official phone number and notification email address.
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenContactModal}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-md shadow-slate-900/15"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit Contact Details</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Phone Number
                </span>
                <div className="text-sm font-mono font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span>{user?.phone || "No phone number registered"}</span>
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  Used for SMS verification and official office notifications.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Official Email
                </span>
                <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-600" />
                  <span>{user?.email || "No email registered"}</span>
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  Receives system notifications, task alerts, and payslips.
                </p>
              </div>
            </div>

            {/* Governance Protocol Note */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
              <p>
                <span className="font-bold text-slate-800">Security Protocol:</span> In accordance with
                office security policy, modifying your phone number or email requires entering your
                current password and will be recorded in the security audit trail.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: PAYROLL & BANKING DIRECT DEPOSIT
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "banking" && (
        <div className="space-y-6">
          {/* Banking Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_32px_-10px_rgba(15,23,42,0.06)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Payroll &amp; Direct Deposit Banking
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Verified bank accounts used for monthly salary and reimbursement disbursements.
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenBankModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 inline-flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-100" />
                <span>Update Banking Details</span>
              </button>
            </div>

            {/* Bank Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Bank Card */}
              <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs space-y-4 relative">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <span className="font-extrabold text-slate-900 text-xs">
                      Account 1 — Primary Payroll
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    Primary Disbursement
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-semibold">Bank Name</span>
                    <span className="font-bold text-slate-900">{user?.bankName || "Not set"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-semibold">Account Holder</span>
                    <span className="font-semibold text-slate-800">
                      {user?.bankAccountName || user?.fullName || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-semibold">Account Number</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-teal-800 text-xs">
                        {maskAccountNumber(user?.bankAccountNumber, showPrimaryAccount)}
                      </span>
                      {user?.bankAccountNumber && (
                        <button
                          type="button"
                          onClick={() => setShowPrimaryAccount(!showPrimaryAccount)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title={showPrimaryAccount ? "Hide account number" : "Show account number"}
                        >
                          {showPrimaryAccount ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-semibold">Branch Name</span>
                    <span className="font-semibold text-slate-800">
                      {user?.bankBranch || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-semibold">Routing / SWIFT</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {user?.bankRoutingNumber || "Not set"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Bank Card */}
              <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs space-y-4 relative">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span className="font-extrabold text-slate-900 text-xs">
                      Account 2 — Secondary / Alternate
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Backup Disbursement
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-semibold">Bank Name</span>
                    <span className="font-bold text-slate-900">
                      {user?.secondaryBankName || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-semibold">Account Holder</span>
                    <span className="font-semibold text-slate-800">
                      {user?.secondaryBankAccountName || user?.fullName || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-semibold">Account Number</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {maskAccountNumber(user?.secondaryBankAccountNumber, showSecondaryAccount)}
                      </span>
                      {user?.secondaryBankAccountNumber && (
                        <button
                          type="button"
                          onClick={() => setShowSecondaryAccount(!showSecondaryAccount)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title={showSecondaryAccount ? "Hide account number" : "Show account number"}
                        >
                          {showSecondaryAccount ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-semibold">Branch Name</span>
                    <span className="font-semibold text-slate-800">
                      {user?.secondaryBankBranch || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-semibold">Routing / SWIFT</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {user?.secondaryBankRoutingNumber || "Not set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit & Governance Footnote */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <p>
                <span className="font-bold">Payroll Policy:</span> Ensure bank routing and account
                numbers match your cheque book or official bank statement. Changes take effect on the
                upcoming pay cycle and require current password signing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: SECURITY & PASSWORD CREDENTIALS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Change Password Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_32px_-10px_rgba(15,23,42,0.06)] space-y-6">
            <div className="border-b border-slate-200/80 pb-4">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Change Employee Password
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Update your personal employee login password with cryptographic verification.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              {/* Current Password */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    placeholder="Enter current employee password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  New Password <span className="text-rose-500">*</span> (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="Create a strong new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {passwordForm.newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span>Password Strength</span>
                      <span className="font-bold">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          passwordStrength.score >= 1 ? passwordStrength.color : "bg-slate-200"
                        } flex-1`}
                      />
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          passwordStrength.score >= 2 ? passwordStrength.color : "bg-slate-200"
                        } flex-1`}
                      />
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          passwordStrength.score >= 3 ? passwordStrength.color : "bg-slate-200"
                        } flex-1`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    minLength={6}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    placeholder="Re-type new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.confirmPassword &&
                  passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">
                      Passwords do not match.
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-slate-900/15 transition cursor-pointer mt-2"
              >
                {passwordLoading ? "Cryptographically Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Right: Security & Session Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_32px_-10px_rgba(15,23,42,0.06)] space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
                <Lock className="w-4 h-4 text-teal-600" />
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Session &amp; Governance
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Authentication</span>
                  <span className="font-mono font-bold text-teal-800">JWT HTTP-Only</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Session Scope</span>
                  <span className="font-bold text-slate-900">Protected Office LAN</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Active Role</span>
                  <span className="font-bold text-emerald-700 uppercase">{user?.role}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-semibold">Audit Logging</span>
                  <span className="font-bold text-slate-800">Enabled (All Actions)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={logout}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs inline-flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Terminate Active Session (Log Out)</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Info className="w-4 h-4 text-teal-600" />
                <span>Security Recommendations</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                <li>Never share your credentials with colleagues or external individuals.</li>
                <li>Lock your workstation (Windows + L) whenever stepping away.</li>
                <li>Report any unauthorized profile change to the administrator immediately.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: EDIT CONTACT DETAILS PROTOCOL
      ───────────────────────────────────────────────────────────── */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[92dvh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0 mb-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Update Contact Information</h3>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="+880 1XXX-XXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="name@nevolyn.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>

              {/* Security Verification Box */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/90 space-y-2">
                <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-teal-700" />
                  <span>Identity Verification Required</span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  Enter your current employee password to verify and authorize this contact change.
                </p>
                <input
                  type="password"
                  required
                  value={contactForm.currentPassword}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, currentPassword: e.target.value })
                  }
                  placeholder="Current password"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-teal-300 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  {contactLoading ? "Verifying & Saving..." : "Save Contact Info"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: EDIT BANKING DETAILS PROTOCOL
      ───────────────────────────────────────────────────────────── */}
      {isBankModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[92dvh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0 mb-4">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Payroll Banking Direct Deposit Update
                </h3>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBankSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 sm:pr-2 flex-1">
              {/* Primary Account Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-extrabold text-teal-800 uppercase tracking-wider block">
                  Primary Payroll Bank Account
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Bank Name</label>
                    <input
                      type="text"
                      required
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      placeholder="e.g. Dutch-Bangla Bank, City Bank"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.bankAccountName}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, bankAccountName: e.target.value })
                      }
                      placeholder="Name as on bank cheque"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.bankAccountNumber}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, bankAccountNumber: e.target.value })
                      }
                      placeholder="Account number"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Branch Name</label>
                    <input
                      type="text"
                      value={bankForm.bankBranch}
                      onChange={(e) => setBankForm({ ...bankForm, bankBranch: e.target.value })}
                      placeholder="Branch location"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">
                      Routing Number / SWIFT
                    </label>
                    <input
                      type="text"
                      value={bankForm.bankRoutingNumber}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, bankRoutingNumber: e.target.value })
                      }
                      placeholder="9-digit routing or SWIFT code"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Account Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                  Secondary / Alternate Account (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankForm.secondaryBankName}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, secondaryBankName: e.target.value })
                      }
                      placeholder="Secondary Bank Name"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={bankForm.secondaryBankAccountName}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, secondaryBankAccountName: e.target.value })
                      }
                      placeholder="Account holder name"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankForm.secondaryBankAccountNumber}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, secondaryBankAccountNumber: e.target.value })
                      }
                      placeholder="Secondary account number"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Branch Name</label>
                    <input
                      type="text"
                      value={bankForm.secondaryBankBranch}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, secondaryBankBranch: e.target.value })
                      }
                      placeholder="Branch location"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">
                      Routing / SWIFT
                    </label>
                    <input
                      type="text"
                      value={bankForm.secondaryBankRoutingNumber}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, secondaryBankRoutingNumber: e.target.value })
                      }
                      placeholder="Secondary routing / SWIFT"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Security Verification Box */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/90 space-y-2">
                <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-teal-700" />
                  <span>Cryptographic Password Authorization</span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  Enter your current password to authorize this direct deposit banking modification.
                  This action is audited in the security logs.
                </p>
                <input
                  type="password"
                  required
                  value={bankForm.currentPassword}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password to sign"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-teal-300 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bankLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  {bankLoading ? "Verifying & Saving..." : "Authorize & Save Bank Info"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
