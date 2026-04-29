"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileBarChart2,
  Download,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import type { Project } from "@/types";
import { formatDateShort } from "@/lib/utils";

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const analyzed = (json.data as Project[]).filter(
            (p) => p.status === "completed" || p.status === "in_progress"
          );
          setProjects(analyzed);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const avgScore =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.score, 0) / projects.length)
      : 0;
  const totalPassed = projects.reduce((sum, p) => sum + p.passedCount, 0);

  return (
    <AppShell>
      <div className="px-6 py-7 lg:px-8 max-w-6xl mx-auto">
        <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300 flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">รายงานทั้งหมด</h1>
            <p className="text-slate-500 text-sm mt-1">
              รายงานผลการตรวจสอบความสอดคล้องทั้งหมด
            </p>
          </div>
          <Button variant="outline" size="md">
            <Download className="w-4 h-4" aria-hidden="true" />
            ส่งออกทั้งหมด
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#4361ee] animate-spin" aria-label="กำลังโหลด..." />
          </div>
        ) : projects.length === 0 ? (
          <div className="animate-in fade-in-0 duration-300 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
              <FolderOpen className="w-10 h-10 text-slate-300" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">ยังไม่มีรายงาน</h3>
            <p className="text-sm text-slate-400">วิเคราะห์โปรเจคเพื่อสร้างรายงาน</p>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: "รายงานทั้งหมด",
                  value: projects.length,
                  color: "bg-blue-50 text-blue-700 border-blue-100",
                },
                {
                  label: "คะแนนเฉลี่ย",
                  value: `${avgScore}%`,
                  color: "bg-emerald-50 text-emerald-700 border-emerald-100",
                },
                {
                  label: "รายการผ่านทั้งหมด",
                  value: totalPassed,
                  color: "bg-purple-50 text-purple-700 border-purple-100",
                },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`animate-in fade-in-0 slide-in-from-bottom-3 p-5 rounded-2xl border ${stat.color} bg-white shadow-[0_1px_4px_rgba(67,97,238,0.04),0_4px_16px_rgba(67,97,238,0.05)]`}
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                >
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm font-medium opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Reports list */}
            <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(67,97,238,0.04),0_4px_16px_rgba(67,97,238,0.05)] border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">รายงานล่าสุด</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {projects.map((project, index) => (
                  <div
                    key={project.id}
                    className="animate-in fade-in-0 slide-in-from-left-2 flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors"
                    style={{ animationDelay: `${200 + index * 60}ms`, animationFillMode: "both" }}
                  >
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                      <FileBarChart2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {formatDateShort(project.createdAt)}
                        </div>
                        {project.checklistCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            {project.passedCount}/{project.checklistCount}
                          </div>
                        )}
                      </div>
                    </div>
                    {project.score > 0 && (
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">คะแนน</span>
                          <span
                            className={`text-sm font-bold ${
                              project.score >= 80
                                ? "text-emerald-600"
                                : project.score >= 60
                                ? "text-blue-600"
                                : "text-amber-600"
                            }`}
                          >
                            {project.score}%
                          </span>
                        </div>
                        <Progress value={project.score} size="sm" animated />
                      </div>
                    )}
                    <Badge variant={project.status as "completed" | "in_progress"} dot>
                      {project.status === "completed" ? "เสร็จสิ้น" : "กำลังดำเนินการ"}
                    </Badge>
                    <Link href={`/projects/${project.id}/report`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
