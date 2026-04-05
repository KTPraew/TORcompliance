"use client";

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
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { ComplianceScore } from "@/components/report/ComplianceScore";
import { IssueList } from "@/components/report/IssueList";
import { mockProjects, mockComplianceResult } from "@/lib/mock-data";

export default function ReportPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const project = mockProjects.find((p) => p.id === id) || mockProjects[0];
  const result = mockComplianceResult;

  const analyzedDate = new Date(result.analyzedAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const categoryColorMap: Record<string, string> = {
    Accessibility: "bg-blue-50 border-blue-200 text-blue-700",
    Policy: "bg-purple-50 border-purple-200 text-purple-700",
    Technical: "bg-emerald-50 border-emerald-200 text-emerald-700",
    Content: "bg-amber-50 border-amber-200 text-amber-700",
  };

  const categoryIconColor: Record<string, string> = {
    Accessibility: "text-blue-500",
    Policy: "text-purple-500",
    Technical: "text-emerald-500",
    Content: "text-amber-500",
  };

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
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
                  <span className="text-xs text-slate-400">วิเคราะห์เมื่อ {analyzedDate}</span>
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
              score={result.overallScore}
              size={180}
              sublabel={`${result.summary.passed}/${result.summary.total} รายการผ่านเกณฑ์`}
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
                  <div className="text-2xl font-bold text-emerald-700">{result.summary.passed}</div>
                  <div className="text-xs text-emerald-600 font-medium">ผ่านเกณฑ์</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-700">{result.summary.failed}</div>
                  <div className="text-xs text-red-600 font-medium">ไม่ผ่านเกณฑ์</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <AlertCircle className="w-8 h-8 text-amber-500" />
                <div>
                  <div className="text-2xl font-bold text-amber-700">{result.summary.review}</div>
                  <div className="text-xs text-amber-600 font-medium">ต้องตรวจสอบ</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <ShieldCheck className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-700">{result.summary.total}</div>
                  <div className="text-xs text-blue-600 font-medium">รายการทั้งหมด</div>
                </div>
              </div>
            </div>

            {/* Standard badges */}
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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 mb-8"
        >
          <h2 className="font-semibold text-slate-900 mb-6">คะแนนแยกตามหมวดหมู่</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.categoryScores.map((cat, index) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
                className={`p-5 rounded-xl border ${categoryColorMap[cat.category] || "bg-slate-50 border-slate-200 text-slate-700"}`}
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

        {/* Issues */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-slate-900">ปัญหาและข้อเสนอแนะ</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                พบ {result.issues.length} ปัญหาที่ต้องแก้ไข
              </p>
            </div>
            <Badge variant="fail" size="lg">
              {result.issues.filter((i) => i.severity === "critical").length} Critical
            </Badge>
          </div>
          <IssueList issues={result.issues} showFilter />
        </motion.div>

        {/* Checklist full table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl shadow-card border border-slate-100 p-6"
        >
          <h2 className="font-semibold text-slate-900 mb-5">รายการตรวจสอบทั้งหมด</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    รหัส
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    หัวข้อ
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    หมวดหมู่
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    มาตรฐาน
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    ผล
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {result.checklist.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.03 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
                        {item.id}
                      </code>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="info" size="sm">{item.category}</Badge>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs text-slate-500">{item.standard}</span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={item.status as any}
                        dot
                        size="sm"
                      >
                        {item.status === "pass"
                          ? "ผ่าน"
                          : item.status === "fail"
                          ? "ไม่ผ่าน"
                          : item.status === "review"
                          ? "ตรวจสอบ"
                          : "รอ"}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
