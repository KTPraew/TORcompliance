"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderOpen,
  ClipboardList,
  TrendingUp,
  FileBarChart2,
  Plus,
  ArrowRight,
  Sparkles,
  Bell,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { mockProjects, mockDashboardStats } from "@/lib/mock-data";

const recentActivity = [
  {
    id: 1,
    action: "อัปโหลด TOR",
    project: "กรมสาธารณสุข - Health Portal",
    time: "10 นาทีที่แล้ว",
    type: "upload",
  },
  {
    id: 2,
    action: "วิเคราะห์ UI สำเร็จ",
    project: "สำนักงานประกันสังคม",
    time: "2 ชั่วโมงที่แล้ว",
    type: "analysis",
  },
  {
    id: 3,
    action: "ออกรายงาน",
    project: "กรมการปกครอง",
    time: "เมื่อวาน",
    type: "report",
  },
  {
    id: 4,
    action: "สร้างโปรเจคใหม่",
    project: "กรมสรรพากร - E-Filing",
    time: "3 วันที่แล้ว",
    type: "create",
  },
];

export default function DashboardPage() {
  const stats = mockDashboardStats;
  const recentProjects = mockProjects.slice(0, 4);

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 rounded-full gradient-primary" />
              <h1 className="text-2xl font-bold text-slate-900">แดชบอร์ด</h1>
            </div>
            <p className="text-slate-500 text-sm ml-3.5">
              ภาพรวมการตรวจสอบความสอดคล้องของเว็บไซต์ภาครัฐ
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                2
              </span>
            </button>
            <Link href="/projects">
              <Button size="md">
                <Plus className="w-4 h-4" />
                สร้างโปรเจคใหม่
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* AI Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 gradient-primary rounded-2xl p-5 flex items-center justify-between overflow-hidden relative"
        >
          <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white" />
            <div className="absolute -right-4 bottom-0 w-28 h-28 rounded-full bg-white" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-base">
                AI Compliance Engine พร้อมใช้งาน
              </p>
              <p className="text-white/70 text-sm">
                อัปโหลด TOR ใหม่เพื่อเริ่มการวิเคราะห์อัตโนมัติด้วย AI
              </p>
            </div>
          </div>
          <Link href="/projects" className="relative z-10">
            <Button variant="ghost" size="md" className="text-white hover:bg-white/10">
              เริ่มต้น
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="โปรเจคทั้งหมด"
            value={stats.totalProjects}
            icon={FolderOpen}
            trend={12}
            trendLabel="เพิ่มขึ้นจากเดือนที่แล้ว"
            color="blue"
            index={0}
          />
          <StatsCard
            title="Checklist ที่วิเคราะห์"
            value={stats.checklistsAnalyzed}
            icon={ClipboardList}
            trend={8}
            trendLabel="รายการ"
            color="purple"
            index={1}
          />
          <StatsCard
            title="คะแนนเฉลี่ย"
            value={`${stats.avgComplianceScore}%`}
            icon={TrendingUp}
            trend={5}
            trendLabel="เพิ่มขึ้นจากเดือนก่อน"
            color="emerald"
            index={2}
          />
          <StatsCard
            title="รายงานที่ออก"
            value={stats.reportsGenerated}
            icon={FileBarChart2}
            trend={-2}
            trendLabel="ลดลง"
            color="amber"
            index={3}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">โปรเจคล่าสุด</h2>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium transition-colors"
              >
                ดูทั้งหมด
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {recentProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </div>

          {/* Sidebar content */}
          <div className="space-y-5">
            {/* Compliance overview */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-card border border-slate-100 p-5"
            >
              <h3 className="font-semibold text-slate-900 mb-4">
                ภาพรวมความสอดคล้อง
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Accessibility", score: 74, color: "primary" as const },
                  { label: "Policy", score: 88, color: "success" as const },
                  { label: "Technical", score: 71, color: "primary" as const },
                  { label: "Content", score: 82, color: "success" as const },
                ].map((item) => (
                  <div key={item.label}>
                    <Progress
                      value={item.score}
                      label={item.label}
                      showLabel
                      size="sm"
                      color={item.color}
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent activity */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-card border border-slate-100 p-5"
            >
              <h3 className="font-semibold text-slate-900 mb-4">
                กิจกรรมล่าสุด
              </h3>
              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                        activity.type === "analysis"
                          ? "bg-emerald-400"
                          : activity.type === "report"
                          ? "bg-blue-400"
                          : activity.type === "upload"
                          ? "bg-purple-400"
                          : "bg-amber-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800">
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{activity.project}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white"
            >
              <h3 className="font-semibold mb-1">เริ่มต้นใหม่</h3>
              <p className="text-slate-400 text-xs mb-4">
                สร้างโปรเจคใหม่เพื่อเริ่มตรวจสอบ
              </p>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="w-full text-white hover:bg-white/10 border border-white/20">
                  <Plus className="w-4 h-4" />
                  สร้างโปรเจคใหม่
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
