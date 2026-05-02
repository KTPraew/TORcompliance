import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mockChecklist } from "@/lib/mock-data";
import type { ChecklistItem } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

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

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // Generate checklist (mock AI — replace with real AI when ready)
    const checklist: ChecklistItem[] = mockChecklist.map((item) => ({
      ...item,
      status: "pending" as const,
    }));

    // Delete old checklist items for this project (re-analysis)
    await supabase.from("checklist_items").delete().eq("project_id", projectId);

    // Insert all new checklist items
    const itemsToInsert = checklist.map((item) => ({
      id: item.id,
      project_id: projectId,
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

    const { error: insertError } = await supabase.from("checklist_items").insert(itemsToInsert);
    if (insertError) {
      console.error("Failed to save checklist items:", insertError.message);
    }

    // Save tor_file_name directly in project
    await supabase
      .from("projects")
      .update({ tor_file_name: file.name })
      .eq("id", projectId)
      .eq("user_id", user.id);

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
    console.error("analyze-tor error:", error);
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}
