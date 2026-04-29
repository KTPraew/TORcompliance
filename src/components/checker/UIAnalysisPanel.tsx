"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DropZone } from "@/components/tor/DropZone";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import {
  XCircle, AlertCircle, CheckCircle2, Zap, Image as ImageIcon,
  ChevronDown, ChevronUp, Code2, BookOpen, Lightbulb, Info,
} from "lucide-react";
import type { ComplianceResult, ChecklistItem, ComplianceIssue } from "@/types";

const SEVERITY_CONFIG = {
  critical: {
    label: "วิกฤต",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
    icon: XCircle,
    iconColor: "text-red-500",
  },
  major: {
    label: "สำคัญ",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-700",
    icon: AlertCircle,
    iconColor: "text-orange-500",
  },
  minor: {
    label: "เล็กน้อย",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700",
    icon: AlertCircle,
    iconColor: "text-yellow-500",
  },
  info: {
    label: "ข้อมูล",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
    icon: Info,
    iconColor: "text-blue-500",
  },
} as const;

function IssueCard({ issue, index }: { issue: ComplianceIssue; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[issue.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 p-3 text-left"
      >
        <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${cfg.text} leading-snug`}>{issue.title}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cfg.badge}`}>
              {cfg.label}
            </span>
            <span className="text-[10px] text-slate-400">{issue.category}</span>
            {issue.standard && (
              <>
                <span className="text-[10px] text-slate-300">·</span>
                <span className="text-[10px] text-slate-400">{issue.standard}</span>
              </>
            )}
          </div>
        </div>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        }
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2.5 border-t border-white/60 pt-2.5">
              {/* Description */}
              {issue.description && (
                <div className="flex gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">{issue.description}</p>
                </div>
              )}

              {/* Suggestion */}
              {issue.suggestion && (
                <div className="flex gap-2 bg-white/70 rounded-lg p-2.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-semibold text-amber-600 mb-0.5">แนวทางแก้ไข</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{issue.suggestion}</p>
                  </div>
                </div>
              )}

              {/* Element selector */}
              {issue.element && (
                <div className="flex gap-2 items-start">
                  <Code2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <code className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono break-all">
                    {issue.element}
                  </code>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const SEVERITY_ORDER: Array<keyof typeof SEVERITY_CONFIG> = ["critical", "major", "minor", "info"];

function IssuesList({ issues }: { issues: ComplianceIssue[] }) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_SHOW = 3;

  // Sort by severity priority
  const sorted = [...issues].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity as keyof typeof SEVERITY_CONFIG) -
      SEVERITY_ORDER.indexOf(b.severity as keyof typeof SEVERITY_CONFIG)
  );

  const visible = showAll ? sorted : sorted.slice(0, INITIAL_SHOW);

  // Count by severity
  const counts = SEVERITY_ORDER.reduce((acc, s) => {
    acc[s] = issues.filter((i) => i.severity === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-2">
      {/* Header + severity summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          ปัญหาที่พบ ({issues.length} รายการ)
        </p>
        <div className="flex items-center gap-1.5">
          {SEVERITY_ORDER.map((s) =>
            counts[s] > 0 ? (
              <span
                key={s}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${SEVERITY_CONFIG[s].badge}`}
              >
                {counts[s]} {SEVERITY_CONFIG[s].label}
              </span>
            ) : null
          )}
        </div>
      </div>

      {/* Issue cards */}
      <div className="space-y-2">
        {visible.map((issue, i) => (
          <IssueCard key={issue.id} issue={issue} index={i} />
        ))}
      </div>

      {/* Show more / less */}
      {issues.length > INITIAL_SHOW && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="w-full py-2 text-xs font-medium text-primary hover:text-primary-dark flex items-center justify-center gap-1 transition-colors"
        >
          {showAll ? (
            <><ChevronUp className="w-3.5 h-3.5" /> ซ่อนรายการ</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> ดูทั้งหมด {issues.length} รายการ</>
          )}
        </button>
      )}
    </div>
  );
}

interface UIAnalysisPanelProps {
  checklist: ChecklistItem[];
  onAnalysisComplete: (result: ComplianceResult) => void;
  projectId: string;
}

export function UIAnalysisPanel({
  checklist,
  onAnalysisComplete,
  projectId,
}: UIAnalysisPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [result, setResult] = useState<ComplianceResult | null>(null);

  const steps = [
    "กำลังโหลดภาพ UI...",
    "ตรวจสอบ Accessibility ด้วย AI...",
    "วิเคราะห์ Color Contrast...",
    "ตรวจสอบ Focus Indicators...",
    "ประมวลผลนโยบาย...",
    "สร้างรายงานผลการตรวจสอบ...",
  ];

  const handleAnalyze = async () => {
    if (!file || checklist.length === 0) return;
    setAnalyzing(true);
    setProgress(0);

    for (let i = 0; i < steps.length; i++) {
      setStep(steps[i]);
      setProgress(((i + 1) / steps.length) * 100);
      await new Promise((r) => setTimeout(r, 600));
    }

    // Mock result
    const analyzedChecklist = checklist.map((item) => ({
      ...item,
      status: (Math.random() > 0.3
        ? "pass"
        : Math.random() > 0.5
        ? "fail"
        : "review") as any,
    }));

    const passed = analyzedChecklist.filter((i) => i.status === "pass").length;
    const failed = analyzedChecklist.filter((i) => i.status === "fail").length;
    const review = analyzedChecklist.filter((i) => i.status === "review").length;
    const total = analyzedChecklist.length;
    const score = Math.round((passed / total) * 100);

    const mockResult: ComplianceResult = {
      projectId,
      overallScore: score,
      analyzedAt: new Date().toISOString(),
      summary: { total, passed, failed, review },
      categoryScores: [
        { category: "Accessibility", score: Math.round(score * 0.9), passed: 5, failed: 2, review: 1, total: 8 },
        { category: "Policy", score: Math.round(score * 1.1), passed: 4, failed: 0, review: 1, total: 5 },
        { category: "Technical", score: Math.round(score * 0.95), passed: 3, failed: 1, review: 1, total: 5 },
        { category: "Content", score: Math.round(score * 1.05), passed: 2, failed: 1, review: 0, total: 3 },
      ],
      issues: analyzedChecklist
        .filter((i) => i.status === "fail" || i.status === "review")
        .map((item) => ({
          id: `issue-${item.id}`,
          checklistItemId: item.id,
          title: `ไม่ผ่านเกณฑ์: ${item.title}`,
          description: item.description,
          severity: item.severity || "minor",
          suggestion: item.suggestion || "กรุณาตรวจสอบและแก้ไข",
          category: item.category,
          standard: item.standard,
        })) as any,
      checklist: analyzedChecklist,
    };

    setResult(mockResult);
    setAnalyzing(false);
    onAnalysisComplete(mockResult);
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <>
          <DropZone
            onFileAccepted={setFile}
            accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"], "image/webp": [".webp"] }}
            label="อัปโหลด Screenshot UI"
            sublabel="รองรับ PNG, JPG, WebP ขนาดไม่เกิน 10MB"
            icon="image"
            maxSize={10 * 1024 * 1024}
            acceptedFile={file}
            onClear={() => setFile(null)}
            disabled={analyzing}
          />

          {checklist.length === 0 && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                กรุณาอัปโหลดและวิเคราะห์ TOR ก่อน เพื่อสร้าง Checklist สำหรับตรวจสอบ
              </p>
            </div>
          )}

          <AnimatePresence>
            {analyzing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4 p-5 bg-blue-50 rounded-2xl border border-blue-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">AI กำลังวิเคราะห์ UI</p>
                    <p className="text-xs text-blue-600">{step}</p>
                  </div>
                </div>
                <Progress value={progress} color="primary" size="md" animated />
                <p className="text-xs text-blue-500 text-center">{Math.round(progress)}% เสร็จสิ้น</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleAnalyze}
            disabled={!file || checklist.length === 0}
            loading={analyzing}
            size="lg"
            className="w-full"
          >
            <Zap className="w-4 h-4" />
            {analyzing ? "กำลังวิเคราะห์..." : "วิเคราะห์ UI ด้วย AI"}
          </Button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Score banner */}
          <div
            className={`p-5 rounded-2xl border flex items-center gap-4 ${
              result.overallScore >= 80
                ? "bg-emerald-50 border-emerald-200"
                : result.overallScore >= 60
                ? "bg-blue-50 border-blue-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${
                result.overallScore >= 80
                  ? "bg-emerald-500 text-white"
                  : result.overallScore >= 60
                  ? "bg-blue-500 text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              {result.overallScore}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">คะแนนความสอดคล้อง</p>
              <p className="text-sm text-slate-600">
                ผ่าน {result.summary.passed}/{result.summary.total} รายการ
              </p>
            </div>
          </div>

          {/* Summary grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-emerald-700">{result.summary.passed}</div>
              <div className="text-xs text-emerald-600">ผ่าน</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-red-700">{result.summary.failed}</div>
              <div className="text-xs text-red-600">ไม่ผ่าน</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
              <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-amber-700">{result.summary.review}</div>
              <div className="text-xs text-amber-600">ตรวจสอบ</div>
            </div>
          </div>

          {/* Issues */}
          {result.issues.length > 0 ? (
            <IssuesList issues={result.issues} />
          ) : (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">ไม่พบปัญหา — ผ่านทุกรายการ</p>
            </div>
          )}

          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => {
              setResult(null);
              setFile(null);
              setProgress(0);
            }}
          >
            <ImageIcon className="w-4 h-4" />
            วิเคราะห์ใหม่อีกครั้ง
          </Button>
        </motion.div>
      )}
    </div>
  );
}
