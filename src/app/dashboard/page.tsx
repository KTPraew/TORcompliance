"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderOpen,
  ClipboardList,
  TrendingUp,
  FileBarChart2,
  ArrowRight,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Progress } from "@/components/ui/Progress";
import type { Project } from "@/types";


type CategoryStat = { category: string; score: number; hasData: boolean };
type ActivityItem = { id: string; action: string; project: string; time: string; type: string };


export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()).catch(() => ({ success: false, data: [] })),
      fetch("/api/dashboard").then((r) => r.json()).catch(() => ({ success: false, data: null })),
    ]).then(([projectsJson, dashboardJson]) => {
      if (projectsJson.success && Array.isArray(projectsJson.data)) {
        setProjects(projectsJson.data);
      }
      if (dashboardJson.success && dashboardJson.data) {
        setCategoryStats(dashboardJson.data.categoryStats ?? []);
        setRecentActivity(dashboardJson.data.recentActivity ?? []);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalProjects = projects.length;
  const checklistsAnalyzed = projects.reduce((sum, p) => sum + (p.checklistCount ?? 0), 0);
  const scoredProjects = projects.filter((p) => p.score > 0);
  const avgComplianceScore =
    scoredProjects.length > 0
      ? Math.round(scoredProjects.reduce((sum, p) => sum + p.score, 0) / scoredProjects.length)
      : 0;
  const reportsGenerated = projects.filter((p) => p.status === "completed").length;
  const recentProjects = projects.slice(0, 4);

  return (
    <AppShell>
      {/* Page top bar */}
      <div className="sticky top-0 z-20 hidden md:flex items-center px-8 h-14 bg-[#f0fdf4]/95 dark:bg-card/90 backdrop-blur-md border-b border-emerald-100/70 dark:border-border">
        <h1 className="text-[15px] font-semibold text-slate-900 dark:text-foreground">แดชบอร์ด</h1>
      </div>

      <div className="px-6 py-6 lg:px-8 max-w-7xl mx-auto">
        {/* Welcome banner */}
        <div
          className="animate-in fade-in-0 duration-300 mb-6 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #047857 0%, #059669 60%, #34d399 100%)",
            boxShadow: "0 4px 24px rgba(5,150,105,0.22)",
            animationFillMode: "both",
          }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/[0.05]" />
            <div className="absolute right-8 bottom-[-40px] w-40 h-40 rounded-full bg-white/[0.05]" />
          </div>
          <div className="relative z-10">
            <p className="font-bold text-white text-base mb-0.5">เริ่มวิเคราะห์เอกสาร TOR</p>
            <p className="text-white/65 text-sm">ประมวลผลอัตโนมัติด้วย AI — ตรวจสอบมาตรฐาน WCAG 2.1, TWCAG และนโยบายเว็บไซต์ภาครัฐ</p>
          </div>
          <Link href="/projects" className="relative z-10 flex-shrink-0">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-white hover:bg-white/90 transition-colors px-4 py-2.5 rounded-xl shadow-sm">
              เริ่มต้น
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </span>
          </Link>
        </div>

        {/* Stats band */}
        <div className="flex flex-wrap items-center gap-0 bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm mb-6 overflow-hidden">
          {[
            { label: "โปรเจค", value: loading ? "—" : totalProjects, icon: FolderOpen },
            { label: "Checklist", value: loading ? "—" : checklistsAnalyzed, icon: ClipboardList },
            { label: "คะแนนเฉลี่ย", value: loading ? "—" : `${avgComplianceScore}%`, icon: TrendingUp },
            { label: "รายงาน", value: loading ? "—" : reportsGenerated, icon: FileBarChart2 },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-3 px-6 py-4 flex-1 min-w-[140px] border-r border-slate-100 dark:border-border last:border-r-0">
                <Icon className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-foreground tabular-nums leading-none">{stat.value}</div>
                  <div className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
                {i === 2 && avgComplianceScore > 0 && !loading && (
                  <div className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md ${avgComplianceScore >= 80 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50" : avgComplianceScore >= 60 ? "bg-accent text-emerald-700" : "bg-amber-50 text-amber-600 dark:bg-amber-950/50"}`}>
                    {avgComplianceScore >= 80 ? "ดี" : avgComplianceScore >= 60 ? "ผ่าน" : "ต้องปรับ"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-foreground text-base">โปรเจคล่าสุด</h2>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
              >
                ดูทั้งหมด
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" aria-label="กำลังประมวลผลข้อมูล..." />
                </div>
              ) : recentProjects.length > 0 ? (
                recentProjects.map((project: Project, index: number) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))
              ) : (
                <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-12 text-center">
                  <FolderOpen className="w-10 h-10 text-accent-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 dark:text-muted-foreground font-medium">ยังไม่มีเอกสาร</p>
                  <p className="text-xs text-slate-300 dark:text-muted-foreground/60 mt-1">เริ่มต้นด้วยการอัปโหลดเอกสาร</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Compliance overview */}
            <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-5 shadow-[0_1px_4px_rgba(5,150,105,0.04),0_4px_16px_rgba(5,150,105,0.05)]">
              <h2 className="font-semibold text-slate-900 dark:text-foreground mb-4 text-sm">ภาพรวมความสอดคล้อง</h2>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" aria-label="กำลังประมวลผลข้อมูล..." />
                </div>
              ) : categoryStats.length === 0 || categoryStats.every((c) => !c.hasData) ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  ยังไม่มีข้อมูล<br />วิเคราะห์เอกสารเพื่อดูผลลัพธ์
                </p>
              ) : (
                <div className="space-y-3.5">
                  {categoryStats.map((item) => (
                    <Progress
                      key={item.category}
                      value={item.score}
                      label={item.category}
                      showLabel
                      size="sm"
                      color={item.score >= 80 ? "success" : "primary"}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Recent activity */}
            <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border p-5 shadow-[0_1px_4px_rgba(5,150,105,0.04),0_4px_16px_rgba(5,150,105,0.05)]">
              <h2 className="font-semibold text-slate-900 dark:text-foreground mb-4 text-sm">กิจกรรมล่าสุด</h2>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" aria-label="กำลังประมวลผลข้อมูล..." />
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">ไม่พบข้อมูลการวิเคราะห์</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const dotColor = activity.type === "analysis" ? "bg-emerald-400"
                      : activity.type === "report" ? "bg-primary"
                      : activity.type === "upload" ? "bg-primary-light"
                      : "bg-amber-400";
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${dotColor}`} aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 dark:text-foreground">{activity.action}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{activity.project}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">{activity.time}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
