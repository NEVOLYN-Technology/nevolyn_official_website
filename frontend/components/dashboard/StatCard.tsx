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
  let textColor = "text-slate-900";
  let iconBg = "bg-slate-900 text-white shadow-md shadow-slate-900/15";

  if (color.includes("emerald") || color.includes("green") || color.includes("teal")) {
    stripeClass = "metric-stripe-green";
    textColor = "text-emerald-700";
    iconBg = "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20";
  } else if (color.includes("amber") || color.includes("yellow") || color.includes("orange")) {
    stripeClass = "metric-stripe-warning";
    textColor = "text-amber-700";
    iconBg = "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20";
  } else if (color.includes("red") || color.includes("rose")) {
    stripeClass = "metric-stripe-red";
    textColor = "text-rose-700";
    iconBg = "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/20";
  } else if (color.includes("violet") || color.includes("purple")) {
    stripeClass = "metric-stripe-blue";
    textColor = "text-slate-900";
    iconBg = "bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md shadow-slate-900/20";
  }

  return (
    <NextLink
      href={link}
      className={`p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.05)] hover:shadow-[0_14px_32px_-8px_rgba(15,23,42,0.1)] transition-all duration-200 hover:-translate-y-1 group flex items-center justify-between ${stripeClass}`}
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
