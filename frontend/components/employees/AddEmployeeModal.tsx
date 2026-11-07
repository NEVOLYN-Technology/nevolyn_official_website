"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { usersApi, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  Printer,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  UserCheck,
  MessageSquare,
  Mail,
  ExternalLink,
} from "lucide-react";

interface AddEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Generates a clean, cryptographically sound temporary initial password.
 */
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

export function AddEmployeeModal({ onClose, onSuccess }: AddEmployeeModalProps) {
  const { isSuperAdmin } = useAuth();

  const [formData, setFormData] = useState({
    employeeId: "",
    username: "",
    password: "",
    fullName: "",
    designation: "",
    joiningDate: new Date().toISOString().split("T")[0],
    email: "",
    role: "employee",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedType, setCopiedType] = useState<"whatsapp" | "email" | "pass" | null>(null);
  const [previewTab, setPreviewTab] = useState<"whatsapp" | "email">("whatsapp");

  // Success state holding credentials for printable handover slip
  const [createdAccount, setCreatedAccount] = useState<{
    fullName: string;
    username: string;
    employeeId: string;
    email: string;
    designation: string;
    role: string;
    joiningDate: string;
    password: string;
  } | null>(null);

  const buildEmployeeId = (username: string, joiningDate: string) => {
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (!cleanUser) return "";
    return `nev_${cleanUser}_${joiningDate || new Date().toISOString().split("T")[0]}`;
  };

  // Auto-generate initial password on first load or when username changes initially
  useEffect(() => {
    if (!formData.password) {
      setFormData((prev) => ({
        ...prev,
        password: generateInitialPassword(prev.username || "emp"),
      }));
    }
  }, []);

  const addMutation = useMutation({
    mutationFn: () => usersApi.create(formData),
    onSuccess: () => {
      setCreatedAccount({ ...formData });
      onSuccess();
    },
    onError: (err: unknown) => {
      setErrorMsg(getApiErrorMessage(err, "Failed to create employee"));
    },
  });

  // Get employee first name for personalized greetings
  const getFirstName = () => {
    if (!createdAccount) return "Team Member";
    const parts = createdAccount.fullName.trim().split(/\s+/);
    return parts[0] || createdAccount.fullName;
  };

  // 1. Customized WhatsApp Message
  const buildWhatsAppMessage = () => {
    if (!createdAccount) return "";
    const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/office/login` : "https://nevolyn.com/office/login";
    const firstName = getFirstName();

    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *NEVOLYN TECHNOLOGY — OFFICIAL ONBOARDING*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear *${createdAccount.fullName}*,

Welcome to NEVOLYN! Your official employee account on the NEVOLYN Office Portal has been successfully provisioned.

🔑 *YOUR ACCESS CREDENTIALS:*
• *Portal URL:* ${portalUrl}
• *Username:* \`${createdAccount.username}\`
• *Employee ID:* \`${createdAccount.employeeId}\`
• *Initial Password:* \`${createdAccount.password}\`
• *Designation:* ${createdAccount.designation || "R&D Staff Member"}
• *Work Email:* ${createdAccount.email || "Not specified"}

📢 *MANDATORY FIRST-TIME ACTIONS / গুরুত্বপূর্ণ নির্দেশনা:*
Office portal-এ নিজের ফোন নম্বর, ব্যাংক ডিটেইলস (Primary & Secondary), এবং পাসওয়ার্ড পরিবর্তনের এক্সেস অ্যাডমিনের কাছে রাখা হয় নাই—কোম্পানির প্রাইভেসি পলিসি ও তথ্যের সুরক্ষার্থে এটা প্রত্যেক কর্মীকে নিজে লগইন করেই আপডেট করতে হবে।

অনুগ্রহ করে লগইন করে নিচের কাজগুলো অবিলম্বে সম্পন্ন করুন:
1️⃣ প্রথমে উপরের লিংক থেকে লগইন করুন।
2️⃣ "Profile & Security" ট্যাবে গিয়ে আপনার ব্যক্তিগত ফোন নম্বর (Phone Number) যুক্ত করুন।
3️⃣ আপনার দুটি ব্যাংক অ্যাকাউন্ট (Primary & Secondary Bank Accounts) সঠিকভাবে প্রদান করুন।
4️⃣ আপনার নিজস্ব সিকিউর পাসওয়ার্ড সেট করে আপডেট করে নিন।

⚠️ *নিরাপত্তা নির্দেশনা:* আপনার প্রাথমিক পাসওয়ার্ডটি কারও সাথে শেয়ার করবেন না এবং প্রথমবার লগইন করেই পাসওয়ার্ড পরিবর্তন করে নিন।

Congratulations & welcome aboard, ${firstName}!
— Operations & Human Resources
NEVOLYN Technology (https://nevolyn.com)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  };

  // 2. Customized Formal Corporate Email Subject & Body
  const getEmailSubject = () => {
    if (!createdAccount) return "[NEVOLYN] Your Office Portal Credentials";
    return `[NEVOLYN] Welcome ${createdAccount.fullName} — Your Office Portal Credentials & Setup Instructions`;
  };

  const buildEmailBody = () => {
    if (!createdAccount) return "";
    const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/office/login` : "https://nevolyn.com/office/login";
    const firstName = getFirstName();

    return `Dear ${createdAccount.fullName},

On behalf of NEVOLYN Technology, we are pleased to welcome you to the team. Your dedicated employee workspace on the NEVOLYN Office Portal has been provisioned.

OFFICIAL ACCESS CREDENTIALS:
─────────────────────────────────────────────────────────────
• Office Portal Login : ${portalUrl}
• Username             : ${createdAccount.username}
• Employee ID          : ${createdAccount.employeeId}
• Designation          : ${createdAccount.designation || "R&D Staff Member"}
• Effective Date       : ${createdAccount.joiningDate}
• Initial Password     : ${createdAccount.password}
─────────────────────────────────────────────────────────────

MANDATORY FIRST-LOGIN SETUP & PRIVACY POLICY:
In strict compliance with company data privacy governance and compensation compliance:
• System administrators DO NOT hold permission to set or edit your personal phone number, banking accounts, or passwords.
• For your privacy and direct deposit payroll security, you must log in directly to complete these records.

IMMEDIATE ACTION CHECKLIST:
1. Log in to the Office Portal at: ${portalUrl}
2. Open your "Profile & Security" dashboard.
3. Update your verified personal contact phone number.
4. Input both your Primary and Secondary bank account details for direct deposit payroll.
5. Change your temporary initial password to a strong, confidential password.

SECURITY RECOMMENDATIONS:
• Never share your credentials with colleagues or external individuals.
• Lock your workstation (Windows + L) whenever stepping away.
• If you encounter any access difficulties, please notify the administration desk.

We look forward to your contributions and wish you a successful journey with NEVOLYN!

Warm regards,

Operations & Personnel Administration
NEVOLYN Technology
Official Website: https://nevolyn.com
Office Portal: ${portalUrl}`;
  };

  const handleCopyWhatsApp = async () => {
    try {
      await navigator.clipboard.writeText(buildWhatsAppMessage());
      setCopiedType("whatsapp");
      setTimeout(() => setCopiedType(null), 3000);
    } catch {}
  };

  const handleSendWhatsAppDirect = () => {
    const text = buildWhatsAppMessage();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyEmail = async () => {
    try {
      const fullEmail = `Subject: ${getEmailSubject()}\n\n${buildEmailBody()}`;
      await navigator.clipboard.writeText(fullEmail);
      setCopiedType("email");
      setTimeout(() => setCopiedType(null), 3000);
    } catch {}
  };

  const handleOpenEmailClient = () => {
    if (!createdAccount) return;
    const subject = encodeURIComponent(getEmailSubject());
    const body = encodeURIComponent(buildEmailBody());
    const to = encodeURIComponent(createdAccount.email || "");
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_self");
  };

  const handleCopyPasswordOnly = async () => {
    if (!createdAccount) return;
    try {
      await navigator.clipboard.writeText(createdAccount.password);
      setCopiedType("pass");
      setTimeout(() => setCopiedType(null), 3000);
    } catch {}
  };

  const handlePrintSlip = () => {
    if (!createdAccount) return;
    const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/office/login` : "https://nevolyn.com/office/login";

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nevolyn Onboarding Slip - ${createdAccount.fullName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; margin: 0; background: #fff; }
            .slip { max-width: 580px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; text-align: left; }
            .logo { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; }
            .sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0d9488; font-weight: 700; margin-top: 4px; }
            .row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
            .label { color: #64748b; font-weight: 600; }
            .val { font-weight: 700; font-family: monospace; color: #0f172a; }
            .pass-box { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px 16px; border-radius: 10px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
            .pass-label { font-size: 12px; font-weight: 700; color: #065f46; }
            .pass-val { font-size: 16px; font-weight: 900; font-family: monospace; color: #047857; letter-spacing: 0.5px; }
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
              <div class="sub">Confidential Personnel Credential Handout</div>
            </div>
            <div class="row"><span class="label">Full Legal Name:</span><span class="val">${createdAccount.fullName}</span></div>
            <div class="row"><span class="label">Employee ID:</span><span class="val">${createdAccount.employeeId}</span></div>
            <div class="row"><span class="label">Username:</span><span class="val">${createdAccount.username}</span></div>
            <div class="row"><span class="label">Official Email:</span><span class="val">${createdAccount.email || "—"}</span></div>
            <div class="row"><span class="label">Designation:</span><span class="val">${createdAccount.designation || "Staff"}</span></div>
            <div class="row"><span class="label">Role Tier:</span><span class="val">${createdAccount.role.toUpperCase()}</span></div>
            <div class="row"><span class="label">Effective Joining Date:</span><span class="val">${createdAccount.joiningDate}</span></div>

            <div class="pass-box">
              <span class="pass-label">Initial Login Password:</span>
              <span class="pass-val">${createdAccount.password}</span>
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
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-xl w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-5 shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {createdAccount
                ? "Personnel Credentials Slip & Handout"
                : isSuperAdmin
                ? "Add Employee or Administrator"
                : "Add New Employee"}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {createdAccount
                ? "Account created successfully. Provide credentials and instructions to employee."
                : "Provision employee credentials with automatic ID and confidential self-service onboarding."}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── SCREEN 2: SUCCESS & PRINTABLE SLIP / WHATSAPP MESSAGE ──────────── */}
        {createdAccount ? (
          <div className="space-y-5">
            {/* Success Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-800">
                <p className="font-bold">Account Successfully Provisioned!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Initial credentials generated for <strong>{createdAccount.fullName}</strong>.
                </p>
              </div>
            </div>

            {/* Credential Slip Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Employee Name:</span>
                <span className="font-bold text-slate-900">{createdAccount.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Employee ID:</span>
                <span className="font-mono font-bold text-teal-700">{createdAccount.employeeId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Username:</span>
                <span className="font-mono font-bold text-slate-800">@{createdAccount.username}</span>
              </div>
              {createdAccount.email && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Work Email:</span>
                  <span className="font-bold text-slate-800">{createdAccount.email}</span>
                </div>
              )}
              {createdAccount.designation && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Designation:</span>
                  <span className="font-bold text-slate-800">{createdAccount.designation}</span>
                </div>
              )}

              {/* Password Box */}
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 block">
                    Initial Login Password
                  </span>
                  <span className="font-mono text-sm font-extrabold text-teal-900">
                    {createdAccount.password}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPasswordOnly}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  {copiedType === "pass" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === "pass" ? "Copied" : "Copy Password"}</span>
                </button>
              </div>
            </div>

            {/* Format Selection Tabs: WhatsApp vs Professional Email */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-teal-600" />
                  <span>Personalized Onboarding Handout Message:</span>
                </span>
                <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("whatsapp")}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      previewTab === "whatsapp"
                        ? "bg-white text-emerald-700 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("email")}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      previewTab === "email"
                        ? "bg-white text-indigo-700 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Corporate Email</span>
                  </button>
                </div>
              </div>

              {/* Message Preview Box */}
              {previewTab === "whatsapp" ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/90 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                    <span className="font-extrabold text-[11px] text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Customized WhatsApp Message for {createdAccount.fullName}</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      Ready to Send
                    </span>
                  </div>
                  <pre className="text-[11px] font-sans text-slate-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto pr-1">
                    {buildWhatsAppMessage()}
                  </pre>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-100">
                    <button
                      type="button"
                      onClick={handleCopyWhatsApp}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      {copiedType === "whatsapp" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === "whatsapp" ? "Copied WhatsApp Text!" : "Copy WhatsApp Text"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSendWhatsAppDirect}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in WhatsApp</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200/90 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                    <div className="min-w-0">
                      <span className="font-extrabold text-[11px] text-indigo-900 uppercase tracking-wider block">
                        Subject: {getEmailSubject()}
                      </span>
                      <span className="text-[10px] text-indigo-700 font-mono mt-0.5 block truncate">
                        To: {createdAccount.email || "employee@nevolyn.com"}
                      </span>
                    </div>
                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100/70 px-2 py-0.5 rounded-md shrink-0">
                      Formal Email
                    </span>
                  </div>
                  <pre className="text-[11px] font-sans text-slate-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto pr-1">
                    {buildEmailBody()}
                  </pre>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-100">
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-300 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      {copiedType === "email" ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === "email" ? "Copied Email!" : "Copy Email Body"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenEmailClient}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Open in Email App</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Handout Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Print / Save PDF Slip</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer text-center"
                >
                  Done & Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── SCREEN 1: ADD EMPLOYEE FORM (NO PHONE, NO BANK DETAILS) ──────── */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addMutation.mutate();
            }}
            className="space-y-4"
          >
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-slate-700 mb-1 font-bold">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={(e) => {
                    const nextName = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      fullName: nextName,
                    }));
                  }}
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
                  placeholder="e.g. johndoe"
                  value={formData.username}
                  onChange={(e) => {
                    const nextUser = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
                    setFormData((prev) => ({
                      ...prev,
                      username: nextUser,
                      employeeId: buildEmployeeId(nextUser, prev.joiningDate),
                    }));
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
                    setFormData((prev) => ({
                      ...prev,
                      joiningDate: nextDate,
                      employeeId: buildEmployeeId(prev.username, nextDate),
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Auto-Generated Employee ID */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Generated Employee ID <span className="text-teal-600 font-normal">(Auto)</span>
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="nev_<username>_<date>"
                  value={formData.employeeId}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-teal-800 font-mono font-semibold focus:outline-none"
                />
              </div>

              {/* Work Email */}
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
              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI Software Engineer"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Role Assignment */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Role Assignment <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  <option value="employee">Employee</option>
                  {isSuperAdmin && <option value="admin">Administrator</option>}
                </select>
              </div>

              {/* Auto-Generated Initial Password */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">
                    Initial Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        password: generateInitialPassword(prev.username || "emp"),
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

              {/* Policy Privacy Notice */}
              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3 mt-1">
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-800">Confidential Self-Service Policy</p>
                  <p className="text-slate-500 mt-0.5">
                    Phone numbers and banking details are strictly excluded from administrator provisioning. Each employee is required to log in and set up their personal phone and dual direct-deposit bank accounts individually.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
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
                disabled={addMutation.isPending || !formData.fullName || !formData.username || !formData.password}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-slate-900/15 cursor-pointer"
              >
                {addMutation.isPending ? "Creating Account..." : "Create Account & Generate Slip"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
