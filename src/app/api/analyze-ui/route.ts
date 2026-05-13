import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import type { ChecklistItem, ComplianceResult, CategoryScore, ComplianceIssue } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ---------- Gemini response schema ----------

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    screen_type: {
      type: Type.STRING,
      enum: ["Login", "Dashboard", "Form", "Settings", "Report", "Other"],
      description: "ประเภทหน้าจอ",
    },
    ocr_text: {
      type: Type.STRING,
      description: "ข้อความทั้งหมดที่อ่านได้จากภาพ",
    },
    compliance_signals: {
      type: Type.ARRAY,
      description: "หลักฐานเชิงฟีเจอร์ที่ตรวจสอบได้จากภาพ",
      items: {
        type: Type.OBJECT,
        properties: {
          signal: { type: Type.STRING, description: "ชื่อฟีเจอร์หรือข้อกำหนดที่ตรวจพบ" },
          evidence_text: { type: Type.STRING, description: "ข้อความหรือองค์ประกอบที่พบในภาพซึ่งเป็นหลักฐาน" },
          confidence: { type: Type.NUMBER, description: "ความเชื่อมั่น 0.0–1.0" },
        },
        required: ["signal", "evidence_text", "confidence"],
      },
    },
    unknown_or_missing_signals: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "สัญญาณหรือฟีเจอร์ที่ไม่สามารถยืนยันได้จากภาพ",
    },
    warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "ปัญหาหรือข้อควรระวังที่พบในภาพ",
    },
    confidence: {
      type: Type.NUMBER,
      description: "ความเชื่อมั่นโดยรวม 0.0–1.0",
    },
  },
  required: ["screen_type", "ocr_text", "compliance_signals", "unknown_or_missing_signals", "warnings", "confidence"],
};

// ---------- Prompt ----------

const COMPLIANCE_PROMPT = `บทบาท:
คุณคือ AI ผู้ช่วยวิเคราะห์หน้าจอระบบ (UI Screenshot) เพื่อสกัดข้อมูลเชิงตรวจสอบความสอดคล้องกับ TOR checklist

งานที่ต้องทำ:
1) อ่านข้อความทั้งหมดจากภาพหน้าจอ (OCR) และเก็บไว้ใน ocr_text
2) ระบุว่าเป็นหน้าจอประเภทใด (Login, Dashboard, Form, Settings, Report, Other) ใน screen_type
3) สกัด "หลักฐานเชิงฟีเจอร์" ที่ตรวจสอบได้จากหน้าจอนี้ และเก็บใน compliance_signals โดยแต่ละรายการประกอบด้วย:
   - signal: ชื่อฟีเจอร์หรือมาตรฐานที่ตรวจพบ เช่น "Privacy Policy Link", "Alt Text บนภาพ", "Color Contrast ผ่านเกณฑ์"
   - evidence_text: ข้อความหรือองค์ประกอบที่พบในภาพจริง
   - confidence: ค่าความเชื่อมั่น 0.0–1.0
4) ระบุสิ่งที่ "ยังไม่เห็นหลักฐาน" หรือตรวจสอบไม่ได้จากภาพนี้ใน unknown_or_missing_signals
5) ระบุ "คำเตือน" หรือปัญหาที่พบชัดเจนใน warnings
6) ให้คะแนนความเชื่อมั่นโดยรวมใน confidence (0.0–1.0)

ข้อกำหนด:
- ตอบ JSON เท่านั้น
- ห้ามเดาข้อมูลที่ไม่เห็นในภาพ — ใช้ unknown_or_missing_signals แทน
- ระบุ evidence_text เป็นข้อความที่อ่านได้จริงจากภาพเท่านั้น
- สัญญาณที่ตรวจสอบได้ ได้แก่: Privacy Policy, Contact Info, Agency Logo, Thai Language, Form Labels, Error Messages, Color Contrast, Font Readability, Navigation Menu, Footer Content, Cookie/PDPA Notice, Sitemap Link, Search Function, Accessibility Features

ตรวจสอบมาตรฐานเหล่านี้:
- WCAG 2.1 Level AA: Contrast (4.5:1), Focus Visible, Resize Text, Keyboard Navigation
- TWCAG 2010: Alt Text, ภาษาไทยชัดเจน
- นโยบายเว็บไซต์ภาครัฐ: Privacy Policy, ข้อมูลติดต่อ, โลโก้หน่วยงาน, วันที่อัปเดต
- PDPA: แจ้งการเก็บข้อมูลส่วนบุคคล, Cookie Notice`;

// ---------- Signal → ComplianceResult mapping ----------

type GeminiSignalResponse = {
  screen_type: string;
  ocr_text: string;
  compliance_signals: { signal: string; evidence_text: string; confidence: number }[];
  unknown_or_missing_signals: string[];
  warnings: string[];
  confidence: number;
};

function mapSignalsToComplianceResult(
  projectId: string,
  raw: GeminiSignalResponse
): ComplianceResult {
  const checklist: ChecklistItem[] = [];

  // Passed items — from compliance_signals
  raw.compliance_signals.forEach((s, i) => {
    const severity = s.confidence >= 0.85 ? "info" : s.confidence >= 0.6 ? "minor" : "major";
    checklist.push({
      id: `signal-${i}`,
      category: inferCategory(s.signal),
      standard: inferStandard(s.signal),
      title: s.signal,
      description: s.evidence_text,
      required: true,
      status: s.confidence >= 0.5 ? "pass" : "review",
      severity,
    });
  });

  // Failed / warning items
  raw.warnings.forEach((w, i) => {
    checklist.push({
      id: `warn-${i}`,
      category: inferCategory(w),
      standard: inferStandard(w),
      title: w,
      description: `พบปัญหา: ${w}`,
      required: true,
      status: "fail",
      severity: "major",
      suggestion: "กรุณาตรวจสอบและแก้ไขตามมาตรฐานที่กำหนด",
    });
  });

  // Pending / unknown items
  raw.unknown_or_missing_signals.forEach((u, i) => {
    checklist.push({
      id: `unknown-${i}`,
      category: inferCategory(u),
      standard: inferStandard(u),
      title: u,
      description: `ไม่สามารถตรวจสอบได้จากภาพ: ${u}`,
      required: false,
      status: "pending",
      severity: "info",
    });
  });

  const passed = checklist.filter((i) => i.status === "pass").length;
  const failed = checklist.filter((i) => i.status === "fail").length;
  const review = checklist.filter((i) => i.status === "review").length;
  const total = checklist.length;
  const overallScore = Math.round(raw.confidence * 100);

  // Category scores
  const catMap = new Map<string, { passed: number; failed: number; review: number; total: number }>();
  for (const item of checklist) {
    if (!catMap.has(item.category)) catMap.set(item.category, { passed: 0, failed: 0, review: 0, total: 0 });
    const e = catMap.get(item.category)!;
    e.total++;
    if (item.status === "pass") e.passed++;
    else if (item.status === "fail") e.failed++;
    else if (item.status === "review") e.review++;
  }

  const categoryScores: CategoryScore[] = Array.from(catMap.entries()).map(([category, d]) => ({
    category: category as CategoryScore["category"],
    score: d.total > 0 ? Math.round((d.passed / d.total) * 100) : 0,
    ...d,
  }));

  const issues: ComplianceIssue[] = checklist
    .filter((i) => i.status === "fail" || i.status === "review")
    .map((item) => ({
      id: `issue-${item.id}`,
      checklistItemId: item.id,
      title: `ไม่ผ่านเกณฑ์: ${item.title}`,
      description: item.description,
      severity: item.severity ?? "minor",
      suggestion: item.suggestion ?? "กรุณาตรวจสอบและแก้ไขตามมาตรฐานที่กำหนด",
      category: item.category,
      standard: item.standard,
      element: null as any,
    }));

  return {
    projectId,
    overallScore,
    analyzedAt: new Date().toISOString(),
    summary: { total, passed, failed, review },
    categoryScores,
    issues,
    checklist,
  };
}

function inferCategory(text: string): ChecklistItem["category"] {
  const t = text.toLowerCase();
  if (/(wcag|contrast|focus|keyboard|alt|resize|screen reader|อ่าน|ตาบอด|twcag)/i.test(t)) return "Accessibility";
  if (/(privacy|pdpa|policy|cookie|contact|นโยบาย|ติดต่อ|โลโก้|sitemap)/i.test(t)) return "Policy";
  if (/(ssl|https|responsive|load|broken|form|label|validation)/i.test(t)) return "Technical";
  return "Content";
}

function inferStandard(text: string): string {
  if (/(wcag)/i.test(text)) return "WCAG 2.1";
  if (/(twcag)/i.test(text)) return "TWCAG 2010";
  if (/(pdpa)/i.test(text)) return "PDPA";
  if (/(ssl|https|responsive|form)/i.test(text)) return "Technical Standard";
  return "Website Policy";
}

// ---------- Route handler ----------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const projectId = formData.get("projectId") as string;
    const file = formData.get("file") as File | null;

    if (!file || !projectId) {
      return NextResponse.json(
        { success: false, error: "Missing file or projectId" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const mimeType = (file.type || "image/png") as
      | "image/png"
      | "image/jpeg"
      | "image/webp"
      | "image/gif";
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const geminiRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: COMPLIANCE_PROMPT },
            { inlineData: { mimeType, data: base64 } },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const text = geminiRes.text ?? "";
    let raw: GeminiSignalResponse;
    try {
      raw = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { success: false, error: "Model did not return valid JSON", raw: text },
        { status: 422 }
      );
    }

    const result = mapSignalsToComplianceResult(projectId, raw);

    // Persist to Supabase (non-fatal)
    try {
      const categoryRows = result.categoryScores.map((cs) => ({
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

      await supabase
        .from("projects")
        .update({
          score: result.overallScore,
          checklist_count: result.summary.total,
          passed_count: result.summary.passed,
          failed_count: result.summary.failed,
          review_count: result.summary.review,
          status: "completed",
          ui_file_name: file.name,
        })
        .eq("id", projectId)
        .eq("user_id", user.id);
    } catch {
      // Non-fatal
    }

    // Return result + raw signals for client transparency
    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        screen_type: raw.screen_type,
        ocr_text: raw.ocr_text,
        confidence: raw.confidence,
        signal_count: raw.compliance_signals.length,
        warning_count: raw.warnings.length,
        unknown_count: raw.unknown_or_missing_signals.length,
      },
    });
  } catch (error) {
    console.error("analyze-ui error:", error);
    return NextResponse.json(
      { success: false, error: "UI analysis failed" },
      { status: 500 }
    );
  }
}
