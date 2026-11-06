import type { Metadata } from "next";
import { OfficeProviders } from "./providers";

export const metadata: Metadata = {
  title: "NEVOLYN Office Management — R&D Operations & Attendance Portal",
  description:
    "Official NEVOLYN Technology Office Management, HRM, R&D Project Tracking, and Attendance Portal.",
};

export default function OfficeRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
      <OfficeProviders>{children}</OfficeProviders>
    </div>
  );
}

