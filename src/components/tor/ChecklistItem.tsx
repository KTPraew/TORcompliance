"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertCircle, Circle, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { ChecklistItem as ChecklistItemType, ChecklistStatus } from "@/types";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onStatusChange?: (id: string, status: ChecklistStatus) => void;
  index?: number;
}

const statusConfig = {
  pass: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 border-emerald-200",
    label: "ผ่าน",
  },
  fail: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 border-red-200",
    label: "ไม่ผ่าน",
  },
  review: {
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-200",
    label: "ควรปรับปรุง",
  },
  pending: {
    icon: Circle,
    color: "text-slate-400",
    bg: "bg-slate-50 border-slate-200",
    label: "ยังไม่ตรวจสอบ",
  },
};

const severityConfig = {
  critical: { label: "Critical", variant: "critical" as const },
  major: { label: "Major", variant: "major" as const },
  minor: { label: "Minor", variant: "minor" as const },
  info: { label: "Info", variant: "info" as const },
};

export function ChecklistItemRow({ item, onStatusChange, index = 0 }: ChecklistItemProps) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[item.status];
  const StatusIcon = config.icon;

  const statuses: ChecklistStatus[] = ["pass", "fail", "review", "pending"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={cn(
        "rounded-xl border transition-all duration-200",
        config.bg,
        "hover:shadow-sm"
      )}
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status toggle */}
        <div className="flex-shrink-0 mt-0.5">
          {onStatusChange ? (
            <div className="flex items-center gap-1">
              {statuses.map((s) => {
                const sc = statusConfig[s];
                const SIcon = sc.icon;
                return (
                  <button
                    key={s}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(item.id, s);
                    }}
                    title={sc.label}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      item.status === s
                        ? cn("scale-110", sc.color)
                        : "text-slate-300 hover:text-slate-400"
                    )}
                  >
                    <SIcon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          ) : (
            <StatusIcon className={cn("w-5 h-5", config.color)} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800">{item.title}</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="info" size="sm">{item.standard}</Badge>
              {item.id && (
                <Badge variant="primary" size="sm">{item.id.toUpperCase()}</Badge>
              )}
              {item.severity && (
                <Badge variant={severityConfig[item.severity].variant} size="sm">
                  {severityConfig[item.severity].label}
                </Badge>
              )}
              {item.required && (
                <span className="text-[10px] text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100">
                  บังคับ
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
        </div>

        {/* Expand button */}
        <button className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded content */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 pt-0 ml-14 space-y-2">
          {item.description && (
            <div className="text-xs text-slate-600 bg-white/60 rounded-lg p-3">
              {item.description}
            </div>
          )}
          {item.suggestion && (
            <div className="flex gap-2 text-xs text-emerald-700 bg-emerald-50/80 rounded-lg p-3 border border-emerald-100">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <span className="font-semibold">คำแนะนำ: </span>
                {item.suggestion}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
