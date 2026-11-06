import React from "react";
import NextLink from "next/link";
import { LucideIcon } from "lucide-react";

/**
 * Props for the {@link StatCard} KPI widget.
 */
interface StatCardProps {
  /** Metric category title. */
  title: string;
  /** Primary metric numeric or string value. */
  value: number | string;
  /** Lucide icon component. */
  icon: LucideIcon;
  /** Tailwind gradient or color specification. */
  color: string;
  /** Navigation destination URL. */
  link: string;
}

/**
 * Metric summary card component — Light Glassmorphism 2.0 Edition.
 */
export function StatCard({ title, value, icon: Icon, color, link }: StatCardProps) {
  let stripeClass = "metric-stripe-blue";
  let textColor = "text-sky-700";
  let iconBg = "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25";

  if (color.includes("emerald") || color.includes("green") || color.includes("teal")) {
    stripeClass = "metric-stripe-green";
    textColor = "text-emerald-700";
    iconBg = "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25";
  } else if (color.includes("amber") || color.includes("yellow") || color.includes("orange")) {
    stripeClass = "metric-stripe-warning";
    textColor = "text-amber-700";
    iconBg = "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25";
  } else if (color.includes("red") || color.includes("rose")) {
    stripeClass = "metric-stripe-red";
    textColor = "text-rose-700";
    iconBg = "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25";
  } else if (color.includes("violet") || color.includes("purple")) {
    stripeClass = "metric-stripe-blue";
    textColor = "text-indigo-700";
    iconBg = "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25";
  }

  return (
    <NextLink
      href={link}
      className={`p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/95 ring-1 ring-slate-200/80 hover:ring-sky-300/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_36px_-10px_rgba(14,165,233,0.16)] transition-all duration-200 hover:-translate-y-1 group flex items-center justify-between ${stripeClass}`}
    >
      <div className="pl-2">
        <div className={`text-3xl font-extrabold tracking-tight ${textColor}`}>
          {value}
        </div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
          {title}
        </div>
      </div>
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg transition-transform duration-200 group-hover:scale-110 ${iconBg}`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </NextLink>
  );
}
