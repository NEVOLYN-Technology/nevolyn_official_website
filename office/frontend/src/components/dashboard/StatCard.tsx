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
 * Metric summary card component displaying an interactive KPI counter with hover transitions and link navigation.
 */
export function StatCard({ title, value, icon: Icon, color, link }: StatCardProps) {
  // Map gradient/color to signature left accent stripe
  let stripeClass = "metric-stripe-blue";
  let textColor = "text-sky-400";
  let iconBg = "bg-sky-500/10 text-sky-400 border-sky-500/20";

  if (color.includes("emerald") || color.includes("green") || color.includes("teal")) {
    stripeClass = "metric-stripe-green";
    textColor = "text-emerald-400";
    iconBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  } else if (color.includes("amber") || color.includes("yellow") || color.includes("orange")) {
    stripeClass = "metric-stripe-warning";
    textColor = "text-amber-400";
    iconBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  } else if (color.includes("red") || color.includes("rose")) {
    stripeClass = "metric-stripe-red";
    textColor = "text-red-400";
    iconBg = "bg-red-500/10 text-red-400 border-red-500/20";
  }

  return (
    <NextLink
      href={link}
      className={`p-5 rounded-2xl bg-[#111827] border border-[#374151] hover:border-slate-500 shadow-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 group flex items-center justify-between ${stripeClass}`}
    >
      <div className="pl-2">
        <div className={`text-3xl font-extrabold tracking-tight ${textColor}`}>{value}</div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">{title}</div>
      </div>
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-lg transition-transform group-hover:scale-110 shadow-inner ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
    </NextLink>
  );
}
