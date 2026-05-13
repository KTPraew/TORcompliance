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
  Image as ImageIcon,
  Link2,
  Pencil,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { DropZone } from "@/components/tor/DropZone";
import { ChecklistSection } from "@/components/tor/ChecklistSection";
import { UIAnalysisPanel } from "@/components/checker/UIAnalysisPanel";
import { createClient } from "@/lib/supabase/client";
import { EditProjectModal } from "@/components/dashboard/EditProjectModal";
import type { ChecklistItem, ChecklistStatus, ChecklistCategory, ComplianceResult, Project } from "@/types";

const TABS: { label: string; value: ChecklistCategory }[] = [
  { label: "Accessibility", value: "Accessibility" },
  { label: "Policy", value: "Policy" },
  { label: "Technical", value: "Technical" },
  { label: "Content", value: "Content" },
];

/* ─── Step indicator ─────────────────────────────────────────────────────── */

function StepBadge({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  return (
    <span
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
        done
          ? "bg-emerald-500 text-white"
          : active
          ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {done ? <CheckCircle2 className="w-4 h-4" /> : n}
    </span>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Step 1 — Screenshot
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // Step 2 — TOR + Checklist
  const [torFile, setTorFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeStep, setAnalyzeStep] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [activeTab, setActiveTab] = useState<ChecklistCategory>("Accessibility");

  // Step 3 — Relate
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);

  // Edit state
  const [showEdit, setShowEdit] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Generate preview URL when screenshot is chosen
  useEffect(() => {
    if (!screenshotFile) { setScreenshotPreview(null); return; }
    const url = URL.createObjectURL(screenshotFile);
    setScreenshotPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshotFile]);

  // Fetch project + saved checklist items
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
    setSavedAt(null);
  };

  const handleSaveResults = useCallback(async () => {
    if (checklist.length === 0) return;
    setSaving(true);

    const passed = checklist.filter((i) => i.status === "pass").length;
    const failed = checklist.filter((i) => i.status === "fail").length;
    const review = checklist.filter((i) => i.status === "review").length;
    const score = Math.round((passed / checklist.length) * 100);
    const isCompleted = passed + failed + review === checklist.length;

    const supabase = createClient();

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

  const step1Done = screenshotFile !== null;
  const step2Done = checklist.length > 0;
  const step3Active = step1Done && step2Done;

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

            <div className="flex items-center gap-2 flex-shrink-0">
              {savedAt && (
                <span className="text-xs text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  บันทึกเรียบร้อย
                </span>
              )}
              <Button variant="outline" size="md" onClick={() => setShowEdit(true)}>
                <Pencil className="w-4 h-4" />
                แก้ไข
              </Button>
              {checklist.length > 0 && (
                <>
                  <Button variant="default" size="md" onClick={handleSaveResults} loading={saving}>
                    <Save className="w-4 h-4" />
                    บันทึกผล
                  </Button>
                  <Link href={`/projects/${id}/report`}>
                    <Button variant="outline" size="md">
                      <BarChart3 className="w-4 h-4" />
                      ดูรายงาน
                    </Button>
                  </Link>
                </>
              )}
            </div>
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

        {/* ── 3-Step workflow ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-0 mb-6 bg-white rounded-2xl border border-slate-100 shadow-[0_1px_4px_rgba(5,150,105,0.04),0_4px_16px_rgba(5,150,105,0.05)] overflow-hidden"
        >
          {/* ── Step 1: Screenshot ── */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
            {/* Step header */}
            <div className="flex items-center gap-2.5 mb-5">
              <StepBadge n={1} done={step1Done} active={!step1Done} />
              <div>
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">ขั้นตอนที่ 1</p>
                </div>
                <h2 className="text-sm font-bold text-slate-800 mt-0.5">อัปโหลด Screenshot</h2>
              </div>
            </div>

            {/* Screenshot drop zone or preview */}
            {screenshotFile && screenshotPreview ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-xl overflow-hidden border-2 border-emerald-200 bg-emerald-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="w-full h-36 object-cover object-top"
                />
                <div className="p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <p className="text-xs font-medium text-emerald-800 truncate flex-1">{screenshotFile.name}</p>
                  <button
                    onClick={() => setScreenshotFile(null)}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium flex-shrink-0"
                  >
                    เปลี่ยน
                  </button>
                </div>
              </motion.div>
            ) : (
              <DropZone
                onFileAccepted={setScreenshotFile}
                accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"], "image/webp": [".webp"] }}
                label="อัปโหลด Screenshot เว็บไซต์"
                sublabel="PNG, JPG, WebP ไม่เกิน 10MB"
                icon="image"
                maxSize={10 * 1024 * 1024}
                acceptedFile={null}
              />
            )}
          </div>

          {/* ── Step 2: TOR + Checklist ── */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="flex items-center gap-2.5 mb-5">
              <StepBadge n={2} done={step2Done} active={step1Done && !step2Done} />
              <div>
                <div className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">ขั้นตอนที่ 2</p>
                </div>
                <h2 className="text-sm font-bold text-slate-800 mt-0.5">อัปโหลด TOR → Checklist</h2>
              </div>
            </div>

            {step2Done ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-4 gap-3 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700">สร้าง Checklist แล้ว</p>
                  <p className="text-xs text-slate-400 mt-0.5">{checklist.length} รายการ</p>
                </div>
                <button
                  onClick={() => { setChecklist([]); setTorFile(null); }}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
                >
                  วิเคราะห์ใหม่
                </button>
              </motion.div>
            ) : (
              <>
                <DropZone
                  onFileAccepted={setTorFile}
                  accept={{ "application/pdf": [".pdf"] }}
                  label="อัปโหลดไฟล์ TOR"
                  sublabel="PDF ไม่เกิน 30MB"
                  icon="document"
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
                        <Loader2 className="w-4 h-4 text-emerald-700 animate-spin" />
                        <div>
                          <p className="text-xs font-medium text-emerald-700">AI กำลังวิเคราะห์ TOR</p>
                          <p className="text-[10px] text-emerald-500">{analyzeStep}</p>
                        </div>
                      </div>
                      <Progress value={analyzeProgress} color="primary" animated />
                    </motion.div>
                  )}
                </AnimatePresence>

                {torFile && !analyzing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                    <Button onClick={handleTORAnalyze} size="md" className="w-full" disabled={analyzing}>
                      <Zap className="w-4 h-4" />
                      วิเคราะห์ TOR ด้วย AI
                    </Button>
                  </motion.div>
                )}

                {project.torFileName && !torFile && (
                  <p className="text-xs text-slate-400 mt-3 text-center">
                    ไฟล์ก่อนหน้า: {project.torFileName}
                  </p>
                )}
              </>
            )}
          </div>

          {/* ── Step 3: Relate ── */}
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <StepBadge n={3} done={!!complianceResult} active={step3Active && !complianceResult} />
              <div>
                <div className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">ขั้นตอนที่ 3</p>
                </div>
                <h2 className="text-sm font-bold text-slate-800 mt-0.5">วิเคราะห์ &amp; เชื่อมโยง</h2>
              </div>
            </div>

            <UIAnalysisPanel
              checklist={checklist}
              onAnalysisComplete={setComplianceResult}
              projectId={id}
              screenshotFile={screenshotFile}
            />
          </div>
        </motion.div>

        {/* ── Checklist ── */}
        {checklist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(5,150,105,0.04),0_4px_16px_rgba(5,150,105,0.05)] border border-slate-100 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-4">
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

        {/* Standards info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-emerald-50 rounded-2xl border border-[#a7f3d0] p-5 flex items-center gap-6 flex-wrap"
        >
          <h3 className="font-semibold text-slate-800 text-sm flex-shrink-0">มาตรฐานที่ตรวจสอบ</h3>
          <div className="flex items-center gap-5 flex-wrap">
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
          {checklist.length > 0 && (
            <Link href={`/projects/${id}/report`} className="ml-auto">
              <Button size="md">
                <BarChart3 className="w-4 h-4" />
                ดูรายงานเต็ม
              </Button>
            </Link>
          )}
        </motion.div>

      </div>

      <EditProjectModal
        project={project}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={(updated) => setProject(updated)}
      />
    </AppShell>
  );
}
