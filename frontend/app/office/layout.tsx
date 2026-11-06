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
    <div className="office-light-portal min-h-screen bg-gradient-to-br from-[#eef4fb] via-[#f5f8fc] to-[#e6f0fa] text-slate-800 antialiased selection:bg-sky-500 selection:text-white relative">
      <OfficeProviders>{children}</OfficeProviders>
    </div>
  );
}
