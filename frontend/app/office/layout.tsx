import type { Metadata } from "next";
import { OfficeProviders } from "./providers";

export const metadata: Metadata = {
  title: {
    absolute: "NEVOLYN Office",
  },
  description:
    "Official NEVOLYN Technology Office Management, HRM, R&D Project Tracking, and Attendance Portal.",
};

export default function OfficeRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="office-light-portal min-h-screen bg-[#f5f6f8] text-slate-900 antialiased selection:bg-slate-900 selection:text-white relative">
      <OfficeProviders>{children}</OfficeProviders>
    </div>
  );
}
