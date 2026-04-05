import { NextRequest, NextResponse } from "next/server";
import { mockChecklist } from "@/lib/mock-data";
import type { ChecklistItem } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Simulate AI analysis delay
    await new Promise((r) => setTimeout(r, 2000));

    const formData = await request.formData();
    const projectId = formData.get("projectId") as string;
    const file = formData.get("file") as File;

    if (!file || !projectId) {
      return NextResponse.json(
        { success: false, error: "Missing file or projectId" },
        { status: 400 }
      );
    }

    // Return mock checklist with pending status
    const checklist: ChecklistItem[] = mockChecklist.map((item) => ({
      ...item,
      status: "pending" as const,
    }));

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        checklist,
        detectedStandards: ["WCAG 2.1 Level AA", "TWCAG 2010", "Website Policy", "PDPA"],
        projectType: "Government Website",
        analysisNotes: `วิเคราะห์เอกสาร TOR สำเร็จ พบการอ้างอิงมาตรฐาน WCAG 2.1, TWCAG สำหรับ accessibility และนโยบายเว็บไซต์ภาครัฐ สร้าง ${checklist.length} รายการตรวจสอบใน 4 หมวดหมู่`,
        checklistCount: checklist.length,
        fileName: file.name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Analysis failed" },
      { status: 500 }
    );
  }
}
