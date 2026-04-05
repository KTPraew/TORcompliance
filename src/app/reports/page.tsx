"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileBarChart2,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { mockProjects } from "@/lib/mock-data";
import { formatDateShort } from "@/lib/utils";

export default function ReportsPage() {
  const completedProjects = mockProjects.filter(
    (p) => p.status === "completed" || p.status === "in_progress"
  );

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 rounded-full gradient-primary" />
              <h1 className="text-2xl font-bold text-slate-900">รายงานทั้งหมด</h1>
            </div>
            <p className="text-slate-500 text-sm ml-3.5">
              รายงานผลการตรวจสอบความสอดคล้องทั้งหมด
            </p>
          </div>
          <Button variant="outline" size="md">
            <Download className="w-4 h-4" />
            ส่งออกทั้งหมด
          </Button>
        </motion.div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "รายงานทั้งหมด", value: completedProjects.length, color: "bg-blue-50 text-blue-700 border-blue-100" },
            {
              label: "คะแนนเฉลี่ย",
              value: `${Math.round(
                completedProjects.reduce((sum, p) => sum + p.score, 0) / completedProjects.length
              )}%`,
              color: "bg-emerald-50 text-emerald-700 border-emerald-100",
            },
            {
              label: "รายการผ่านทั้งหมด",
              value: completedProjects.reduce((sum, p) => sum + p.passedCount, 0),
              color: "bg-purple-50 text-purple-700 border-purple-100",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-5 rounded-2xl border ${stat.color} bg-white shadow-card`}
            >
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm font-medium opacity-80">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Reports list */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">รายงานล่าสุด</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {completedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.06 }}
                className="flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <FileBarChart2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{project.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {formatDateShort(project.createdAt)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      {project.passedCount}/{project.checklistCount}
                    </div>
                  </div>
                </div>
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
                <Badge variant={project.status as any} dot>
                  {project.status === "completed" ? "เสร็จสิ้น" : "กำลังดำเนินการ"}
                </Badge>
                <Link href={`/projects/${project.id}/report`}>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
