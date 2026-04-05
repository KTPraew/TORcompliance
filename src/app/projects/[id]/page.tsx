"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Cpu,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Upload,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Card } from "@/components/ui/Card";
import { DropZone } from "@/components/tor/DropZone";
import { ChecklistSection } from "@/components/tor/ChecklistSection";
import { UIAnalysisPanel } from "@/components/checker/UIAnalysisPanel";
import { mockProjects, mockChecklist } from "@/lib/mock-data";
import type { ChecklistItem, ChecklistStatus, ChecklistCategory, ComplianceResult } from "@/types";

const TABS: { label: string; value: ChecklistCategory }[] = [
  { label: "Accessibility", value: "Accessibility" },
  { label: "Policy", value: "Policy" },
  { label: "Technical", value: "Technical" },
  { label: "Content", value: "Content" },
];

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const project = mockProjects.find((p) => p.id === id) || mockProjects[0];

  const [torFile, setTorFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeStep, setAnalyzeStep] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    project.checklistCount > 0 ? mockChecklist : []
  );
  const [activeTab, setActiveTab] = useState<ChecklistCategory>("Accessibility");
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);

  const analyzeSteps = [
    "อ่านเอกสาร TOR...",
    "ตรวจสอบมาตรฐาน WCAG 2.1...",
    "ตรวจสอบมาตรฐาน TWCAG...",
    "วิเคราะห์นโยบายเว็บไซต์...",
    "ตรวจสอบข้อกำหนด PDPA...",
    "สร้าง Checklist อัตโนมัติ...",
  ];

  const handleTORAnalyze = async () => {
    if (!torFile) return;
    setAnalyzing(true);
    setAnalyzeProgress(0);

    for (let i = 0; i < analyzeSteps.length; i++) {
      setAnalyzeStep(analyzeSteps[i]);
      setAnalyzeProgress(((i + 1) / analyzeSteps.length) * 100);
      await new Promise((r) => setTimeout(r, 600));
    }

    setChecklist(mockChecklist.map((item) => ({ ...item, status: "pending" as const })));
    setAnalyzing(false);
  };

  const handleStatusChange = (itemId: string, status: ChecklistStatus) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status } : item))
    );
  };

  const tabItems = checklist.filter((item) => item.category === activeTab);
  const passedCount = checklist.filter((i) => i.status === "pass").length;
  const failedCount = checklist.filter((i) => i.status === "fail").length;
  const reviewCount = checklist.filter((i) => i.status === "review").length;

  const score = checklist.length > 0 ? Math.round((passedCount / checklist.length) * 100) : 0;

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Back + header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปโปรเจคทั้งหมด
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={project.status} />
                  {project.category && (
                    <Badge variant="info" size="sm">{project.category}</Badge>
                  )}
                </div>
              </div>
            </div>

            {checklist.length > 0 && (
              <Link href={`/projects/${id}/report`}>
                <Button variant="secondary" size="md">
                  <BarChart3 className="w-4 h-4" />
                  ดูรายงาน
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Score bar */}
        {checklist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">ความคืบหน้าการตรวจสอบ</span>
              <span className="text-2xl font-bold text-primary">{score}%</span>
            </div>
            <Progress value={score} size="lg" animated />
            <div className="flex items-center gap-5 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {passedCount} ผ่าน
              </div>
              <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                <XCircle className="w-3.5 h-3.5" />
                {failedCount} ไม่ผ่าน
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {reviewCount} ตรวจสอบ
              </div>
              <span className="ml-auto text-xs text-slate-400">{checklist.length} รายการทั้งหมด</span>
            </div>
          </motion.div>
        )}

        {/* Content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left — TOR upload + Checklist */}
          <div className="xl:col-span-2 space-y-6">
            {/* TOR Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl shadow-card border border-slate-100 p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">อัปโหลดเอกสาร TOR</h2>
                  <p className="text-xs text-slate-500">อัปโหลด TOR เพื่อสร้าง Checklist อัตโนมัติ</p>
                </div>
              </div>

              <DropZone
                onFileAccepted={setTorFile}
                label="อัปโหลดไฟล์ TOR"
                sublabel="รองรับ PDF ขนาดไม่เกิน 10MB"
                acceptedFile={torFile}
                onClear={() => setTorFile(null)}
                disabled={analyzing}
              />

              <AnimatePresence>
                {analyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-4 space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      <div>
                        <p className="text-sm font-medium text-primary">AI กำลังวิเคราะห์ TOR</p>
                        <p className="text-xs text-blue-500">{analyzeStep}</p>
                      </div>
                    </div>
                    <Progress value={analyzeProgress} color="primary" animated />
                  </motion.div>
                )}
              </AnimatePresence>

              {torFile && !analyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4"
                >
                  <Button
                    onClick={handleTORAnalyze}
                    size="md"
                    className="w-full"
                    disabled={analyzing}
                  >
                    <Zap className="w-4 h-4" />
                    วิเคราะห์ TOR ด้วย AI
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Checklist tabs */}
            {checklist.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900">Checklist ความสอดคล้อง</h2>
                      <p className="text-xs text-slate-500">
                        {checklist.length} รายการจาก TOR — อัปเดตสถานะด้วยตนเองได้
                      </p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {TABS.map((tab) => {
                      const count = checklist.filter((i) => i.category === tab.value).length;
                      const tabPassed = checklist.filter(
                        (i) => i.category === tab.value && i.status === "pass"
                      ).length;
                      const tabScore = count > 0 ? Math.round((tabPassed / count) * 100) : 0;

                      return (
                        <button
                          key={tab.value}
                          onClick={() => setActiveTab(tab.value)}
                          className={`flex-1 flex flex-col items-center py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 ${
                            activeTab === tab.value
                              ? "bg-white shadow-sm text-primary"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`text-[10px] mt-0.5 font-bold ${
                              activeTab === tab.value ? "text-primary" : "text-slate-400"
                            }`}
                          >
                            {count > 0 ? `${tabScore}% (${count})` : "0"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChecklistSection
                        items={tabItems}
                        category={activeTab}
                        onStatusChange={handleStatusChange}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right — UI Analysis */}
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl shadow-card border border-slate-100 p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">ตรวจสอบ UI</h2>
                  <p className="text-xs text-slate-500">อัปโหลด Screenshot เว็บไซต์</p>
                </div>
              </div>

              <UIAnalysisPanel
                checklist={checklist}
                onAnalysisComplete={setComplianceResult}
                projectId={id}
              />
            </motion.div>

            {/* Info cards */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-2xl border border-primary/10 p-5"
            >
              <h3 className="font-semibold text-slate-800 text-sm mb-3">มาตรฐานที่ตรวจสอบ</h3>
              <div className="space-y-2">
                {[
                  { name: "WCAG 2.1 Level AA", color: "bg-blue-500" },
                  { name: "TWCAG 2010", color: "bg-emerald-500" },
                  { name: "Website Policy", color: "bg-purple-500" },
                  { name: "PDPA", color: "bg-amber-500" },
                ].map((std) => (
                  <div key={std.name} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${std.color}`} />
                    <span className="text-xs text-slate-600 font-medium">{std.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {checklist.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link href={`/projects/${id}/report`}>
                  <Button className="w-full" size="md">
                    <BarChart3 className="w-4 h-4" />
                    ดูรายงานเต็ม
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
