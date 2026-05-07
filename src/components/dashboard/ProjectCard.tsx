"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FolderOpen, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import type { Project } from "@/types";
import { formatDateShort } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-emerald-700";
  if (score >= 40) return "text-amber-600";
  return "text-red-500";
};

const getAccentColor = (score: number, status: string): string => {
  if (status === "pending") return "#94a3b8";
  if (score >= 80) return "#059669";
  if (score >= 60) return "#059669";
  if (score >= 40) return "#d97706";
  return "#ef4444";
};

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const accent = getAccentColor(project.score, project.status);

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
    >
      <Link href={`/projects/${project.id}`} className="flex h-full group">
        <div
          className="flex flex-col h-full w-full bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-5 transition-all duration-200"
          style={{ boxShadow: "0 1px 4px rgba(5,150,105,0.04), 0 4px 16px rgba(5,150,105,0.05)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 4px 24px rgba(5,150,105,0.12), 0 1px 4px rgba(5,150,105,0.06)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(5,150,105,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 1px 4px rgba(5,150,105,0.04), 0 4px 16px rgba(5,150,105,0.05)";
            (e.currentTarget as HTMLElement).style.borderColor = "";
          }}
        >
          {/* Header — fixed height */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}18` }}
                aria-hidden="true"
              >
                <FolderOpen className="w-4 h-4" style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-foreground text-sm leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-muted-foreground mt-0.5 line-clamp-1 min-h-[16px]">
                  {project.description || " "}
                </p>
              </div>
            </div>
            <StatusBadge status={project.status} />
          </div>

          {/* Middle — flex-1 keeps all cards same height */}
          <div className="flex-1 flex flex-col justify-end mb-3">
            {project.status !== "pending" && project.score > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500 dark:text-muted-foreground">ผลลัพธ์</span>
                  <span className={`text-xs font-bold ${getScoreColor(project.score)}`}>
                    {project.score}%
                  </span>
                </div>
                <Progress value={project.score} size="sm" animated />
              </div>
            ) : project.status === "pending" ? (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs text-slate-400 dark:text-muted-foreground">รอการวิเคราะห์เอกสาร</span>
              </div>
            ) : (
              <div className="h-[32px]" aria-hidden="true" />
            )}
          </div>

          {/* Footer — always at the bottom */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-border">
            {project.checklistCount > 0 ? (
              <>
                <span className="flex items-center gap-1 text-xs text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  {project.passedCount} ผ่าน
                </span>
                {(project.failedCount || 0) > 0 && (
                  <span className="flex items-center gap-1 text-xs text-red-500">
                    <XCircle className="w-3 h-3" aria-hidden="true" />
                    {project.failedCount} ไม่ผ่าน
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-slate-300 dark:text-muted-foreground/40">—</span>
            )}
            <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              {formatDateShort(project.createdAt)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
