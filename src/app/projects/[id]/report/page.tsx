"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  FileBarChart2,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { ComplianceScore } from "@/components/report/ComplianceScore";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types";

type CategoryScore = {
  category: string;
  score: number;
  passed: number;
  failed: number;
  review: number;
  total: number;
};

const categoryColorMap: Record<string, string> = {
  Accessibility: "bg-blue-50 border-blue-200 text-blue-700",
  Policy: "bg-purple-50 border-purple-200 text-purple-700",
  Technical: "bg-emerald-50 border-emerald-200 text-emerald-700",
  Content: "bg-amber-50 border-amber-200 text-amber-700",
};

export default function ReportPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase
        .from("project_category_scores")
        .select("*")
        .eq("project_id", id)
        .order("category"),
    ]).then(([projectRes, scoresRes]) => {
      if (projectRes.error || !projectRes.data) {
        setNotFound(true);
      } else {
        const d = projectRes.data;
        setProject({
          id: d.id,
          name: d.name,
          description: d.description,
          status: d.status,
          score: d.score ?? 0,
          checklistCount: d.checklist_count ?? 0,
          passedCount: d.passed_count ?? 0,
          failedCount: d.failed_count ?? 0,
          reviewCount: d.review_count ?? 0,
          torFileName: d.tor_file_name,
          uiFileName: d.ui_file_name,
          category: d.category,
          createdAt: d.created_at.split("T")[0],
          updatedAt: d.updated_at ? d.updated_at.split("T")[0] : undefined,
        });
        setCategoryScores(scoresRes.data ?? []);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full py-32">
          <Loader2 className="w-8 h-8 text-[#4361ee] animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (notFound || !project) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h2 className="text-xl font-semibold text-slate-700 mb-2">ไม่พบโปรเจค</h2>
          <p className="text-slate-400 text-sm mb-6">โปรเจคนี้ไม่มีอยู่หรือคุณไม่มีสิทธิ์เข้าถึง</p>
          <Link href="/projects">
            <Button variant="outline" size="md">
              <ArrowLeft className="w-4 h-4" />
              กลับไปโปรเจคทั้งหมด
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const analyzedDate = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date(project.createdAt).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <AppShell>
      <div className="px-6 py-7 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปโปรเจค
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileBarChart2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  รายงานผลการตรวจสอบ
                </h1>
                <p className="text-sm text-slate-500">{project.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400">อัปเดตเมื่อ {analyzedDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="md">
                <Share2 className="w-4 h-4" />
                แชร์
              </Button>
              <Button variant="outline" size="md">
                <Printer className="w-4 h-4" />
                พิมพ์
              </Button>
              <Button size="md">
                <Download className="w-4 h-4" />
                ดาวน์โหลด PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Score + summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Score circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 flex flex-col items-center justify-center"
          >
            <ComplianceScore
              score={project.score}
              size={180}
              sublabel={
                project.checklistCount > 0
                  ? `${project.passedCount}/${project.checklistCount} รายการผ่านเกณฑ์`
                  : undefined
              }
            />
          </motion.div>

          {/* Summary stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-slate-100 p-6"
          >
            <h2 className="font-semibold text-slate-900 mb-5">สรุปผลการตรวจสอบ</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <div>
                  <div className="text-2xl font-bold text-emerald-700">{project.passedCount}</div>
                  <div className="text-xs text-emerald-600 font-medium">ผ่านเกณฑ์</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-700">{project.failedCount ?? 0}</div>
                  <div className="text-xs text-red-600 font-medium">ไม่ผ่านเกณฑ์</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <AlertCircle className="w-8 h-8 text-amber-500" />
                <div>
                  <div className="text-2xl font-bold text-amber-700">{project.reviewCount ?? 0}</div>
                  <div className="text-xs text-amber-600 font-medium">ต้องตรวจสอบ</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <ShieldCheck className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-700">{project.checklistCount}</div>
                  <div className="text-xs text-blue-600 font-medium">รายการทั้งหมด</div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium mb-2">มาตรฐานที่ตรวจสอบ</p>
              <div className="flex flex-wrap gap-2">
                {["WCAG 2.1 Level AA", "TWCAG 2010", "Website Policy", "PDPA"].map((std) => (
                  <Badge key={std} variant="primary">{std}</Badge>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category breakdown */}
        {categoryScores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 mb-8"
          >
            <h2 className="font-semibold text-slate-900 mb-6">คะแนนแยกตามหมวดหมู่</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryScores.map((cat, index) => (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  className={`p-5 rounded-xl border ${
                    categoryColorMap[cat.category] || "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{cat.category}</span>
                      <Badge variant="info" size="sm">{cat.total} รายการ</Badge>
                    </div>
                    <span className="text-2xl font-bold">{cat.score}%</span>
                  </div>
                  <Progress value={cat.score} size="md" animated color="auto" />
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {cat.passed} ผ่าน
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                      <XCircle className="w-3.5 h-3.5" />
                      {cat.failed} ไม่ผ่าน
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {cat.review} ตรวจสอบ
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No data placeholder when project not yet analyzed */}
        {project.checklistCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-card border border-slate-100 p-12 text-center"
          >
            <FileBarChart2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">ยังไม่มีผลการวิเคราะห์</p>
            <p className="text-slate-400 text-sm mt-1">
              อัปโหลด TOR และวิเคราะห์เพื่อดูรายงาน
            </p>
            <Link href={`/projects/${id}`} className="mt-4 inline-block">
              <Button size="md">ไปวิเคราะห์ TOR</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
