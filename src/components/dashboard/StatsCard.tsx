"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "primary" | "blue" | "emerald" | "amber" | "purple" | "rose";
  index?: number;
}

const colorConfig = {
  primary: { iconBg: "bg-emerald-50",   icon: "text-emerald-700" },
  blue:    { iconBg: "bg-emerald-50",      icon: "text-emerald-600"  },
  emerald: { iconBg: "bg-emerald-50",   icon: "text-emerald-700" },
  amber:   { iconBg: "bg-amber-50",     icon: "text-amber-600" },
  purple:  { iconBg: "bg-purple-50",    icon: "text-purple-600" },
  rose:    { iconBg: "bg-rose-50",      icon: "text-rose-600"  },
};

export function StatsCard({ title, value, icon: Icon, color = "primary", index = 0 }: StatsCardProps) {
  const { iconBg, icon } = colorConfig[color];
  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 p-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 shadow-sm"
      style={{ animationDelay: `${index * 55}ms`, animationFillMode: "both" }}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", iconBg)}>
        <Icon className={cn("w-5 h-5", icon)} aria-hidden="true" />
      </div>
      <div className="text-[1.875rem] font-bold text-slate-900 leading-none tracking-tight tabular-nums">
        {typeof value === "number" && value >= 1000 ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-slate-500 mt-1.5 font-medium">{title}</div>
    </div>
  );
}
