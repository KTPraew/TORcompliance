"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, XCircle, AlertCircle, Info, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { ComplianceIssue } from "@/types";
import { cn } from "@/lib/utils";

interface IssueListProps {
  issues: ComplianceIssue[];
  showFilter?: boolean;
}

const severityConfig = {
  critical: {
    label: "Critical",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    badgeVariant: "critical" as const,
    dot: "bg-red-500",
  },
  major: {
    label: "Major",
    icon: AlertCircle,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    badgeVariant: "major" as const,
    dot: "bg-orange-500",
  },
  minor: {
    label: "Minor",
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    badgeVariant: "minor" as const,
    dot: "bg-amber-500",
  },
  info: {
    label: "Info",
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    badgeVariant: "info" as const,
    dot: "bg-blue-500",
  },
};

function IssueCard({ issue, index }: { issue: ComplianceIssue; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[issue.severity] || severityConfig.minor;
  const SeverityIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={cn("rounded-xl border overflow-hidden", config.bg)}
    >
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.color)}>
          <SeverityIcon className="w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-slate-900 truncate">{issue.title}</span>
            <Badge variant={config.badgeVariant} size="sm">{config.label}</Badge>
            <Badge variant="info" size="sm">{issue.standard}</Badge>
          </div>
          <p className="text-xs text-slate-600 line-clamp-1">{issue.description}</p>
        </div>
        <div className="flex-shrink-0 text-slate-400 mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-12 space-y-3">
              <div className="text-xs text-slate-700 bg-white/60 rounded-lg p-3 border border-white/80">
                <span className="font-semibold text-slate-800">รายละเอียด: </span>
                {issue.description}
              </div>

              {issue.suggestion && (
                <div className="flex gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
                  <div>
                    <span className="font-semibold">คำแนะนำในการแก้ไข: </span>
                    {issue.suggestion}
                  </div>
                </div>
              )}

              {issue.element && (
                <div className="flex gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Element:</span>
                  <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                    {issue.element}
                  </code>
                </div>
              )}

              <div className="flex gap-2">
                <Badge variant="info" size="sm">{issue.category}</Badge>
                <Badge variant="primary" size="sm">ID: {issue.checklistItemId}</Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function IssueList({ issues, showFilter = true }: IssueListProps) {
  const [filter, setFilter] = useState<string>("all");

  const filters = [
    { label: "ทั้งหมด", value: "all", count: issues.length },
    {
      label: "Critical",
      value: "critical",
      count: issues.filter((i) => i.severity === "critical").length,
    },
    {
      label: "Major",
      value: "major",
      count: issues.filter((i) => i.severity === "major").length,
    },
    {
      label: "Minor",
      value: "minor",
      count: issues.filter((i) => i.severity === "minor").length,
    },
  ];

  const filtered =
    filter === "all" ? issues : issues.filter((i) => i.severity === filter);

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
          <XCircle className="w-7 h-7 text-emerald-400" />
        </div>
        <p className="font-semibold text-slate-700">ไม่พบปัญหา</p>
        <p className="text-sm text-slate-400 mt-1">เว็บไซต์ผ่านการตรวจสอบทุกรายการ</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilter && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filter === f.value
                  ? "gradient-primary text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  filter === f.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((issue, index) => (
          <IssueCard key={issue.id} issue={issue} index={index} />
        ))}
      </div>
    </div>
  );
}
