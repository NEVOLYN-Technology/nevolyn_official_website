"use client";

import React, { useState } from "react";
import { leaders } from "@/lib/data/leaders";

export interface EmployeeIdentity {
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
  employeeId?: string | null;
  photoUrl?: string | null;
}

export function resolveEmployeePhoto(identity?: EmployeeIdentity | null): string | null {
  if (!identity) return null;

  // 1. Direct photoUrl property from user entity/profile
  if (identity.photoUrl && typeof identity.photoUrl === "string" && identity.photoUrl.trim()) {
    return identity.photoUrl.trim();
  }

  // 2. Client-side localStorage cache for immediately uploaded photo
  if (typeof window !== "undefined" && identity.username) {
    const cached = localStorage.getItem(`nev_photo_${identity.username.toLowerCase().trim()}`);
    if (cached) return cached;
  }

  const fullName = (identity.fullName || "").trim().toLowerCase();
  const username = (identity.username || "").trim().toLowerCase();
  const email = (identity.email || "").trim().toLowerCase();
  const employeeId = (identity.employeeId || "").trim().toLowerCase();

  for (const leader of leaders) {
    if (!leader.image) continue;

    const leaderName = leader.name.trim().toLowerCase();
    const leaderId = leader.id.trim().toLowerCase();
    const leaderEmail = (leader.email || "").trim().toLowerCase();
    const emailPrefix = leaderEmail ? leaderEmail.split("@")[0] : "";

    if (fullName && fullName === leaderName) {
      return leader.image;
    }
    if (email && leaderEmail && email === leaderEmail) {
      return leader.image;
    }
    if (emailPrefix && (username === emailPrefix || employeeId.includes(emailPrefix))) {
      return leader.image;
    }
    if (
      leaderId &&
      leaderId.length >= 3 &&
      (username.includes(leaderId) ||
        employeeId.includes(leaderId) ||
        fullName.includes(leaderId))
    ) {
      return leader.image;
    }
  }

  return null;
}

interface EmployeeAvatarProps {
  user?: EmployeeIdentity | null;
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<EmployeeAvatarProps["size"]>, string> = {
  xs: "w-7 h-7 text-[11px]",
  sm: "w-9 h-9 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
};

export function EmployeeAvatar({
  user,
  size = "sm",
  shape = "circle",
  className = "",
}: EmployeeAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = resolveEmployeePhoto(user);
  const initial = (user?.fullName || user?.username || "U").trim().charAt(0).toUpperCase();
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";
  const sizeClass = SIZE_CLASSES[size];

  if (photoUrl && !imgError) {
    return (
      <div
        className={`${sizeClass} ${shapeClass} overflow-hidden shrink-0 ring-2 ring-sky-500/25 bg-slate-100 shadow-xs ${className}`}
      >
        <img
          src={photoUrl}
          alt={user?.fullName || user?.username || "Employee"}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} ${shapeClass} shrink-0 bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center font-extrabold text-white shadow-md shadow-sky-500/25 ${className}`}
    >
      {initial}
    </div>
  );
}

