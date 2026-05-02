"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FolderOpen, Calendar, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import type { Project } from "@/types";
import { formatDateShort } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const progressPercent = project.checklistCount > 0
    ? Math.round((project.passedCount / project.checklistCount) * 100)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-[#4361ee]";
    if (score >= 40) return "text-amber-600";
    return "text-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
    >
      <Link href={`/projects/${project.id}`} className="block group">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 transition-all duration-200 hover:border-[#4361ee]/20 hover:shadow-md shadow-sm">

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-blue-500/20">
                <FolderOpen className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-[#4361ee] transition-colors">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{project.description}</p>
                )}
              </div>
            </div>
            <StatusBadge status={project.status} />
          </div>

          {/* Score */}
          {project.status !== "pending" && project.score > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500 font-medium">คะแนนความสอดคล้อง</span>
                <span className={`text-sm font-bold ${getScoreColor(project.score)}`}>
                  {project.score}%
                </span>
              </div>
              <Progress value={project.score} size="sm" animated />
            </div>
          )}

          {project.status === "pending" && (
            <div className="mb-4 flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span className="text-xs text-slate-400">รอการวิเคราะห์ TOR</span>
            </div>
          )}

          {/* Stats */}
          {project.checklistCount > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="font-medium">{project.passedCount} ผ่าน</span>
              </div>
              {(project.failedCount || 0) > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-red-500">
                  <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="font-medium">{project.failedCount} ไม่ผ่าน</span>
                </div>
              )}
              <span className="ml-auto text-xs text-slate-400">{project.checklistCount} รายการ</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{formatDateShort(project.createdAt)}</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-[#4361ee] opacity-0 group-hover:opacity-100 transition-opacity">
              ดูรายละเอียด
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
