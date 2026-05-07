import type { TORAnalysisResult, UIAnalysisResult, ChecklistItem, ComplianceResult } from "@/types";
import { mockChecklist } from "./mock-data";

export async function analyzeTOR(file: File, projectId: string): Promise<TORAnalysisResult> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 2500));

  const checklist: ChecklistItem[] = mockChecklist.map((item) => ({
    ...item,
    status: "pending" as const,
  }));

  return {
    projectId,
    checklist,
    detectedStandards: ["WCAG 2.1 Level AA", "TWCAG 2010", "Website Policy", "PDPA"],
    projectType: "Government Website",
    analysisNotes:
      "TOR document analyzed successfully. Found references to WCAG 2.1, TWCAG accessibility standards, and Thai government website policies. Generated 19 compliance checklist items across 4 categories.",
  };
}

export async function analyzeUI(
  imageFile: File,
  checklist: ChecklistItem[],
  projectId: string
): Promise<UIAnalysisResult> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 3500));

  const analyzedChecklist: ChecklistItem[] = checklist.map((item) => ({
    ...item,
    status: Math.random() > 0.3 ? "pass" : Math.random() > 0.5 ? "fail" : "review",
  }));

  const passed = analyzedChecklist.filter((i) => i.status === "pass").length;
  const failed = analyzedChecklist.filter((i) => i.status === "fail").length;
  const review = analyzedChecklist.filter((i) => i.status === "review").length;
  const total = analyzedChecklist.length;
  const score = Math.round((passed / total) * 100);

  const categoryMap = new Map<string, { passed: number; failed: number; review: number; total: number }>();

  analyzedChecklist.forEach((item) => {
    const cat = item.category;
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { passed: 0, failed: 0, review: 0, total: 0 });
    }
    const entry = categoryMap.get(cat)!;
    entry.total++;
    if (item.status === "pass") entry.passed++;
    else if (item.status === "fail") entry.failed++;
    else if (item.status === "review") entry.review++;
  });

  const categoryScores = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category: category as any,
    score: Math.round((data.passed / data.total) * 100),
    ...data,
  }));

  const issues = analyzedChecklist
    .filter((item) => item.status === "fail" || item.status === "review")
    .map((item) => ({
      id: `issue-${item.id}`,
      checklistItemId: item.id,
      title: `ไม่ผ่านเกณฑ์: ${item.title}`,
      description: item.description,
      severity: item.severity || "minor",
      suggestion: item.suggestion || "กรุณาตรวจสอบและแก้ไขตามมาตรฐานที่กำหนด",
      category: item.category,
      standard: item.standard,
    }));

  const complianceResult: ComplianceResult = {
    projectId,
    overallScore: score,
    analyzedAt: new Date().toISOString(),
    summary: { total, passed, failed, review },
    categoryScores,
    issues: issues as any,
    checklist: analyzedChecklist,
  };

  return {
    projectId,
    complianceResult,
  };
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-emerald-600";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "ผ่านเกณฑ์ดีเยี่ยม";
  if (score >= 70) return "ผ่านเกณฑ์";
  if (score >= 50) return "ต้องปรับปรุง";
  return "ไม่ผ่านเกณฑ์";
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-emerald-50 border-emerald-200";
  if (score >= 70) return "bg-emerald-50 border-emerald-200";
  if (score >= 50) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}
