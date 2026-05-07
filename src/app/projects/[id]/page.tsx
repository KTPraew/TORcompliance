"use client";

import { useState, useEffect, useCallback } from "react";
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
  Save,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { DropZone } from "@/components/tor/DropZone";
import { ChecklistSection } from "@/components/tor/ChecklistSection";
import { UIAnalysisPanel } from "@/components/checker/UIAnalysisPanel";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistItem, ChecklistStatus, ChecklistCategory, ComplianceResult, Project } from "@/types";

const TABS: { label: string; value: ChecklistCategory }[] = [
  { label: "Accessibility", value: "Accessibility" },
  { label: "Policy", value: "Policy" },
  { label: "Technical", value: "Technical" },
  { label: "Content", value: "Content" },
];

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [torFile, setTorFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeStep, setAnalyzeStep] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [activeTab, setActiveTab] = useState<ChecklistCategory>("Accessibility");
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Fetch project + saved checklist items from Supabase
  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase.from("checklist_items").select("*").eq("project_id", id).order("category"),
    ])
      .then(([{ data: projData, error: projError }, { data: itemsData }]) => {
        if (projError || !projData) {
          setNotFound(true);
        } else {
          setProject({
            id: projData.id,
            name: projData.name,
            description: projData.description,
            status: projData.status,
            score: projData.score ?? 0,
            checklistCount: projData.checklist_count ?? 0,
            passedCount: projData.passed_count ?? 0,
            failedCount: projData.failed_count ?? 0,
            reviewCount: projData.review_count ?? 0,
            torFileName: projData.tor_file_name ?? undefined,
            uiFileName: projData.ui_file_name ?? undefined,
            category: projData.category ?? undefined,
            createdAt: (projData.created_at ?? "").split("T")[0],
            updatedAt: projData.updated_at ? projData.updated_at.split("T")[0] : undefined,
          });
          if (itemsData && itemsData.length > 0) {
            setChecklist(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              itemsData.map((row: any) => ({
                id: row.id,
                category: row.category,
                standard: row.standard,
                title: row.title,
                description: row.description,
                required: row.required,
                status: row.status,
                suggestion: row.suggestion ?? undefined,
                severity: row.severity ?? undefined,
                wcagLevel: row.wcag_level ?? undefined,
              }))
            );
          }
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingProject(false));
  }, [id]);

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

    // Show progress steps while API call is in flight
    let stepIdx = 0;
    setAnalyzeStep(analyzeSteps[0]);

    const stepInterval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, analyzeSteps.length - 1);
      setAnalyzeStep(analyzeSteps[stepIdx]);
      setAnalyzeProgress(((stepIdx + 1) / analyzeSteps.length) * 85);
    }, 600);

    try {
      const formData = new FormData();
      formData.append("file", torFile);
      formData.append("projectId", id);

      const res = await fetch("/api/analyze-tor", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      clearInterval(stepInterval);
      setAnalyzeProgress(100);

      if (json.success) {
        const newChecklist: ChecklistItem[] = json.data.checklist;
        setChecklist(newChecklist);

        // Update project in DB: status → in_progress, checklist_count, tor_file_name
        await fetch(`/api/projects?id=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "in_progress",
            checklistCount: newChecklist.length,
            passedCount: 0,
            failedCount: 0,
            reviewCount: 0,
            score: 0,
          }),
        });

        // Update project state locally
        setProject((prev) =>
          prev
            ? {
                ...prev,
                status: "in_progress",
                checklistCount: newChecklist.length,
                passedCount: 0,
                failedCount: 0,
                reviewCount: 0,
                score: 0,
                torFileName: torFile.name,
              }
            : prev
        );
      }
    } catch {
      clearInterval(stepInterval);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStatusChange = (itemId: string, status: ChecklistStatus) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status } : item))
    );
    setSavedAt(null); // mark as unsaved
  };

  // Save checklist results to DB
  const handleSaveResults = useCallback(async () => {
    if (checklist.length === 0) return;
    setSaving(true);

    const passed = checklist.filter((i) => i.status === "pass").length;
    const failed = checklist.filter((i) => i.status === "fail").length;
    const review = checklist.filter((i) => i.status === "review").length;
    const score = Math.round((passed / checklist.length) * 100);
    const isCompleted = passed + failed + review === checklist.length;

    const supabase = createClient();

    // Upsert category scores
    const categories: ChecklistCategory[] = ["Accessibility", "Policy", "Technical", "Content"];
    const upserts = categories.map((cat) => {
      const items = checklist.filter((i) => i.category === cat);
      const catPassed = items.filter((i) => i.status === "pass").length;
      const catFailed = items.filter((i) => i.status === "fail").length;
      const catReview = items.filter((i) => i.status === "review").length;
      const catScore = items.length > 0 ? Math.round((catPassed / items.length) * 100) : 0;
      return {
        project_id: id,
        category: cat,
        score: catScore,
        passed: catPassed,
        failed: catFailed,
        review: catReview,
        total: items.length,
      };
    });

    try {
      // Save individual item statuses
      const itemUpserts = checklist.map((item) => ({
        id: item.id,
        project_id: id,
        category: item.category,
        standard: item.standard,
        title: item.title,
        description: item.description,
        required: item.required,
        status: item.status,
        suggestion: item.suggestion ?? null,
        severity: item.severity ?? null,
        wcag_level: item.wcagLevel ?? null,
      }));
      await supabase.from("checklist_items").upsert(itemUpserts, {
        onConflict: "id,project_id",
      });

      // Save category score aggregates
      await supabase.from("project_category_scores").upsert(upserts, {
        onConflict: "project_id,category",
      });

      await fetch(`/api/projects?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passedCount: passed,
          failedCount: failed,
          reviewCount: review,
          score,
          status: isCompleted ? "completed" : "in_progress",
        }),
      });

      setProject((prev) =>
        prev
          ? {
              ...prev,
              passedCount: passed,
              failedCount: failed,
              reviewCount: review,
              score,
              status: isCompleted ? "completed" : "in_progress",
            }
          : prev
      );
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  }, [checklist, id]);

  const tabItems = checklist.filter((item) => item.category === activeTab);
  const passedCount = checklist.filter((i) => i.status === "pass").length;
  const failedCount = checklist.filter((i) => i.status === "fail").length;
  const reviewCount = checklist.filter((i) => i.status === "review").length;
  const score = checklist.length > 0 ? Math.round((passedCount / checklist.length) * 100) : 0;

  if (loadingProject) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full py-32">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
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

  return (
    <AppShell>
      <div className="px-6 py-7 lg:px-8 max-w-7xl mx-auto">
        {/* Back + header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปโปรเจคทั้งหมด
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-emerald-500/20">
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
              <div className="flex items-center gap-2 flex-shrink-0">
                {savedAt && (
                  <span className="text-xs text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    บันทึกเรียบร้อย
                  </span>
                )}
                <Button
                  variant="default"
                  size="md"
                  onClick={handleSaveResults}
                  loading={saving}
                >
                  <Save className="w-4 h-4" />
                  บันทึกผล
                </Button>
                <Link href={`/projects/${id}/report`}>
                  <Button variant="outline" size="md">
                    <BarChart3 className="w-4 h-4" />
                    ดูรายงาน
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Score bar */}
        {checklist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(5,150,105,0.04),0_4px_16px_rgba(5,150,105,0.05)] border border-slate-100 p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">ความคืบหน้าการตรวจสอบ</span>
              <span className="text-2xl font-bold text-emerald-700">{score}%</span>
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
              className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(5,150,105,0.04),0_4px_16px_rgba(5,150,105,0.05)] border border-slate-100 p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">อัปโหลดเอกสาร TOR</h2>
                  <p className="text-xs text-slate-500">
                    {project.torFileName ? `ไฟล์ปัจจุบัน: ${project.torFileName}` : "อัปโหลด TOR เพื่อสร้าง Checklist อัตโนมัติ"}
                  </p>
                </div>
              </div>

              <DropZone
                onFileAccepted={setTorFile}
                label="อัปโหลดไฟล์ TOR"
                sublabel="รองรับ PDF ขนาดไม่เกิน 30MB"
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
                    className="mt-4 space-y-3 p-4 bg-emerald-50 rounded-xl border border-[#a7f3d0]"
                  >
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
                      <div>
                        <p className="text-sm font-medium text-emerald-700">AI กำลังวิเคราะห์ TOR</p>
                        <p className="text-xs text-emerald-400">{analyzeStep}</p>
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
                className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(5,150,105,0.04),0_4px_16px_rgba(5,150,105,0.05)] border border-slate-100 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-slate-900">Checklist ความสอดคล้อง</h2>
                        <p className="text-xs text-slate-500">
                          {checklist.length} รายการ — อัปเดตสถานะแล้วกด &quot;บันทึกผล&quot;
                        </p>
                      </div>
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
                              ? "bg-white shadow-sm text-emerald-700"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`text-[10px] mt-0.5 font-bold ${
                              activeTab === tab.value ? "text-emerald-700" : "text-slate-400"
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
              className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(5,150,105,0.04),0_4px_16px_rgba(5,150,105,0.05)] border border-slate-100 p-6"
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

            {/* Standards info */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-emerald-50 rounded-2xl border border-[#a7f3d0] p-5"
            >
              <h3 className="font-semibold text-slate-800 text-sm mb-3">มาตรฐานที่ตรวจสอบ</h3>
              <div className="space-y-2">
                {[
                  { name: "WCAG 2.1 Level AA", color: "bg-primary" },
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
