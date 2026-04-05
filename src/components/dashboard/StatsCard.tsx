"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: "blue" | "emerald" | "amber" | "purple" | "rose";
  index?: number;
}

const colorConfig = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    iconBg: "bg-blue-100",
    border: "border-blue-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    iconBg: "bg-emerald-100",
    border: "border-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    iconBg: "bg-amber-100",
    border: "border-amber-100",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    iconBg: "bg-purple-100",
    border: "border-purple-100",
  },
  rose: {
    bg: "bg-rose-50",
    icon: "text-rose-600",
    iconBg: "bg-rose-100",
    border: "border-rose-100",
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = "blue",
  index = 0,
}: StatsCardProps) {
  const colors = colorConfig[color];
  const isPositive = trend !== undefined && trend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-30", colors.bg)} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", colors.iconBg)}>
            <Icon className={cn("w-5 h-5", colors.icon)} />
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg",
                isPositive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-bold text-slate-900 tracking-tight">
            {typeof value === "number" && value >= 1000
              ? value.toLocaleString()
              : value}
          </div>
          <div className="text-sm font-medium text-slate-500">{title}</div>
          {trendLabel && (
            <div className="text-xs text-slate-400">{trendLabel}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
