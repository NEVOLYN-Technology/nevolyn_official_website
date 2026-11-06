"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard, EmployeeDashboard } from "@/components/dashboard";

/**
 * Central dashboard route dispatcher.
 *
 * <p>Switches between {@link AdminDashboard} (for system administrators) and
 * {@link EmployeeDashboard} (for staff members) based on the user's role.</p>
 */
export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard username={user?.username || ""} />;
}
