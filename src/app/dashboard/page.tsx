"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderOpen,
  ClipboardList,
  TrendingUp,
  FileBarChart2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/dashboard/StatsCard";
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
    }).catch(() => {
      // Network error — show empty states
    }).finally(() => setLoading(false));
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
      <div className="sticky top-0 z-20 hidden md:flex items-center justify-between px-8 h-14 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <h1 className="text-[15px] font-semibold text-slate-900">แดชบอร์ด</h1>
        <Link href="/projects">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white gradient-primary px-3.5 py-2 rounded-xl shadow-sm shadow-blue-400/20 hover:opacity-90 transition-opacity">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            สร้างโปรเจคใหม่
          </span>
        </Link>
      </div>

      <div className="px-6 py-6 lg:px-8 max-w-7xl mx-auto">
        {/* Welcome banner */}
        <div
          className="animate-in fade-in-0 duration-300 mb-6 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #2d44c5 0%, #4361ee 60%, #748ffc 100%)",
            boxShadow: "0 4px 24px rgba(67,97,238,0.22)",
            animationFillMode: "both",
          }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/[0.05]" />
            <div className="absolute right-8 bottom-[-40px] w-40 h-40 rounded-full bg-white/[0.05]" />
          </div>
          <div className="relative z-10">
            <p className="font-bold text-white text-base mb-0.5">AI Compliance Engine พร้อมใช้งาน</p>
            <p className="text-white/65 text-sm">วิเคราะห์ TOR อัตโนมัติด้วย AI เพื่อตรวจสอบมาตรฐาน WCAG & TWCAG</p>
          </div>
          <Link href="/projects" className="relative z-10 flex-shrink-0">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#4361ee] bg-white hover:bg-white/90 transition-colors px-4 py-2.5 rounded-xl shadow-sm">
              เริ่มต้น
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </span>
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatsCard
            title="โปรเจคทั้งหมด"
            value={loading ? "-" : totalProjects}
            icon={FolderOpen}
            color="indigo"
            index={0}
          />
          <StatsCard
            title="Checklist ที่วิเคราะห์"
            value={loading ? "-" : checklistsAnalyzed}
            icon={ClipboardList}
            color="purple"
            index={1}
          />
          <StatsCard
            title="คะแนนเฉลี่ย"
            value={loading ? "-" : `${avgComplianceScore}%`}
            icon={TrendingUp}
            color="emerald"
            index={2}
          />
          <StatsCard
            title="รายงานที่ออก"
            value={loading ? "-" : reportsGenerated}
            icon={FileBarChart2}
            color="amber"
            index={3}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-base">โปรเจคล่าสุด</h2>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-xs text-[#4361ee] hover:text-[#2d44c5] font-medium transition-colors"
              >
                ดูทั้งหมด
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-[#4361ee] animate-spin" />
                </div>
              ) : recentProjects.length > 0 ? (
                recentProjects.map((project: Project, index: number) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100/80 p-12 text-center" style={{ boxShadow: "0 1px 4px rgba(67,97,238,0.04)" }}>
                  <FolderOpen className="w-10 h-10 text-[#c7d2fe] mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-medium">ยังไม่มีโปรเจค</p>
                  <p className="text-xs text-slate-300 mt-1">เริ่มสร้างโปรเจคแรกของคุณ</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Compliance overview */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_4px_rgba(67,97,238,0.04),0_4px_16px_rgba(67,97,238,0.05)]">
              <h3 className="font-semibold text-slate-900 mb-4 text-sm">ภาพรวมความสอดคล้อง</h3>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-[#4361ee] animate-spin" aria-label="กำลังโหลด..." />
                </div>
              ) : categoryStats.length === 0 || categoryStats.every((c) => !c.hasData) ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  ยังไม่มีข้อมูล<br />วิเคราะห์โปรเจคเพื่อดูผล
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
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_4px_rgba(67,97,238,0.04),0_4px_16px_rgba(67,97,238,0.05)]">
              <h3 className="font-semibold text-slate-900 mb-4 text-sm">กิจกรรมล่าสุด</h3>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-[#4361ee] animate-spin" aria-label="กำลังโหลด..." />
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">ยังไม่มีกิจกรรม</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const dotColor = activity.type === "analysis" ? "bg-emerald-400"
                      : activity.type === "report" ? "bg-[#4361ee]"
                      : activity.type === "upload" ? "bg-[#748ffc]"
                      : "bg-amber-400";
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${dotColor}`} aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800">{activity.action}</p>
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
