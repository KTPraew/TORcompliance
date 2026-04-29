import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mockChecklist } from "@/lib/mock-data";
import type { ChecklistItem, ComplianceResult, CategoryScore } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Simulate AI processing
    await new Promise((r) => setTimeout(r, 3000));

    const formData = await request.formData();
    const projectId = formData.get("projectId") as string;
    const file = formData.get("file") as File;

    if (!file || !projectId) {
      return NextResponse.json(
        { success: false, error: "Missing file or projectId" },
        { status: 400 }
      );
    }

    // Generate mock compliance results
    const analyzedChecklist: ChecklistItem[] = mockChecklist.map((item) => {
      const rand = Math.random();
      let status: "pass" | "fail" | "review" | "pending" = "pass";
      if (rand < 0.15) status = "fail";
      else if (rand < 0.25) status = "review";
      return { ...item, status };
    });

    const passed = analyzedChecklist.filter((i) => i.status === "pass").length;
    const failed = analyzedChecklist.filter((i) => i.status === "fail").length;
    const review = analyzedChecklist.filter((i) => i.status === "review").length;
    const total = analyzedChecklist.length;
    const score = Math.round((passed / total) * 100);

    const categoryMap = new Map<
      string,
      { passed: number; failed: number; review: number; total: number }
    >();

    analyzedChecklist.forEach((item) => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, { passed: 0, failed: 0, review: 0, total: 0 });
      }
      const entry = categoryMap.get(item.category)!;
      entry.total++;
      if (item.status === "pass") entry.passed++;
      else if (item.status === "fail") entry.failed++;
      else if (item.status === "review") entry.review++;
    });

    const categoryScores: CategoryScore[] = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category: category as CategoryScore["category"],
        score: Math.round((data.passed / data.total) * 100),
        ...data,
      })
    );

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
        element: null,
      }));

    const result: ComplianceResult = {
      projectId,
      overallScore: score,
      analyzedAt: new Date().toISOString(),
      summary: { total, passed, failed, review },
      categoryScores,
      issues: issues as any,
      checklist: analyzedChecklist,
    };

    // Save category scores and update project in Supabase
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Upsert category scores
        const categoryRows = categoryScores.map((cs) => ({
          project_id: projectId,
          category: cs.category,
          score: cs.score,
          passed: cs.passed,
          failed: cs.failed,
          review: cs.review,
          total: cs.total,
          updated_at: new Date().toISOString(),
        }));

        await supabase
          .from("project_category_scores")
          .upsert(categoryRows, { onConflict: "project_id,category" });

        // Update project overall stats
        await supabase
          .from("projects")
          .update({
            score,
            checklist_count: total,
            passed_count: passed,
            failed_count: failed,
            review_count: review,
            status: "completed",
          })
          .eq("id", projectId)
          .eq("user_id", user.id);
      }
    } catch {
      // Non-fatal: return result even if DB save fails
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "UI analysis failed" },
      { status: 500 }
    );
  }
}
