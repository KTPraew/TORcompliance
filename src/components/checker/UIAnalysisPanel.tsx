"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    icon: Info,
    iconColor: "text-emerald-500",
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
              {issue.description && (
                <div className="flex gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">{issue.description}</p>
                </div>
              )}
              {issue.suggestion && (
                <div className="flex gap-2 bg-white/70 rounded-lg p-2.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-semibold text-amber-600 mb-0.5">แนวทางแก้ไข</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{issue.suggestion}</p>
                  </div>
                </div>
              )}
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

  const sorted = [...issues].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity as keyof typeof SEVERITY_CONFIG) -
      SEVERITY_ORDER.indexOf(b.severity as keyof typeof SEVERITY_CONFIG)
  );

  const visible = showAll ? sorted : sorted.slice(0, INITIAL_SHOW);

  const counts = SEVERITY_ORDER.reduce((acc, s) => {
    acc[s] = issues.filter((i) => i.severity === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-2">
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

      <div className="space-y-2">
        {visible.map((issue, i) => (
          <IssueCard key={issue.id} issue={issue} index={i} />
        ))}
      </div>

      {issues.length > INITIAL_SHOW && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="w-full py-2 text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1 transition-colors"
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
  screenshotFile: File | null;
}

export function UIAnalysisPanel({
  checklist,
  onAnalysisComplete,
  projectId,
  screenshotFile,
}: UIAnalysisPanelProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [result, setResult] = useState<ComplianceResult | null>(null);

  // Reset result when screenshot changes
  useEffect(() => {
    setResult(null);
    setProgress(0);
  }, [screenshotFile]);

  const steps = [
    "กำลังโหลดภาพ UI...",
    "ตรวจสอบ Accessibility ด้วย AI...",
    "วิเคราะห์ Color Contrast...",
    "ตรวจสอบ Focus Indicators...",
    "เชื่อมโยงกับ Checklist...",
    "สร้างรายงานผลการตรวจสอบ...",
  ];

  const handleAnalyze = async () => {
    if (!screenshotFile || checklist.length === 0) return;
    setAnalyzing(true);
    setProgress(0);

    // Animate progress steps while API call runs in parallel
    const stepInterval = setInterval(() => {
      setProgress((p) => {
        const next = p + 100 / steps.length;
        if (next >= 90) {
          clearInterval(stepInterval);
          return 90;
        }
        setStep(steps[Math.floor((next / 100) * steps.length)] ?? steps[steps.length - 1]);
        return next;
      });
    }, 700);

    try {
      const fd = new FormData();
      fd.append("file", screenshotFile);
      fd.append("projectId", projectId);

      const res = await fetch("/api/analyze-ui", { method: "POST", body: fd });
      const json = await res.json();

      clearInterval(stepInterval);
      setProgress(100);

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Analysis failed");
      }

      setResult(json.data as ComplianceResult);
      onAnalysisComplete(json.data as ComplianceResult);
    } catch (err) {
      clearInterval(stepInterval);
      console.error("UI analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!screenshotFile) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-sm text-slate-400">อัปโหลด Screenshot ในขั้นตอนที่ 1 ก่อน</p>
      </div>
    );
  }

  if (checklist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-amber-400" />
        </div>
        <p className="text-sm text-amber-700">สร้าง Checklist จาก TOR ในขั้นตอนที่ 2 ก่อน</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!result ? (
        <>
          <AnimatePresence>
            {analyzing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">AI กำลังเชื่อมโยง Screenshot กับ Checklist</p>
                    <p className="text-xs text-emerald-600">{step}</p>
                  </div>
                </div>
                <Progress value={progress} color="primary" size="md" animated />
                <p className="text-xs text-emerald-500 text-center">{Math.round(progress)}% เสร็จสิ้น</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!analyzing && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-xs text-emerald-700">
                พร้อมวิเคราะห์ — Screenshot + {checklist.length} รายการ Checklist
              </p>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            loading={analyzing}
            size="lg"
            className="w-full"
          >
            <Zap className="w-4 h-4" />
            {analyzing ? "กำลังวิเคราะห์..." : "เชื่อมโยงและวิเคราะห์ด้วย AI"}
          </Button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div
            className={`p-4 rounded-2xl border flex items-center gap-4 ${
              result.overallScore >= 80
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${
                result.overallScore >= 80 ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
              }`}
            >
              {result.overallScore}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-base">คะแนนความสอดคล้อง</p>
              <p className="text-sm text-slate-600">
                ผ่าน {result.summary.passed}/{result.summary.total} รายการ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-emerald-700">{result.summary.passed}</div>
              <div className="text-[10px] text-emerald-600">ผ่าน</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <XCircle className="w-4 h-4 text-red-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-red-700">{result.summary.failed}</div>
              <div className="text-[10px] text-red-600">ไม่ผ่าน</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
              <AlertCircle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-amber-700">{result.summary.review}</div>
              <div className="text-[10px] text-amber-600">ตรวจสอบ</div>
            </div>
          </div>

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
            onClick={() => { setResult(null); setProgress(0); }}
          >
            <ImageIcon className="w-4 h-4" />
            วิเคราะห์ใหม่อีกครั้ง
          </Button>
        </motion.div>
      )}
    </div>
  );
}
