import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/types";

function toProject(row: Record<string, unknown>): Project {
  const createdAt = row.created_at as string | null;
  const updatedAt = row.updated_at as string | null;
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? undefined,
    status: row.status as Project["status"],
    score: (row.score as number) ?? 0,
    checklistCount: (row.checklist_count as number) ?? 0,
    passedCount: (row.passed_count as number) ?? 0,
    failedCount: (row.failed_count as number) ?? 0,
    reviewCount: (row.review_count as number) ?? 0,
    torFileName: (row.tor_file_name as string | null) ?? undefined,
    uiFileName: (row.ui_file_name as string | null) ?? undefined,
    imageUrl: (row.image_url as string | null) ?? undefined,
    category: (row.category as string | null) ?? undefined,
    createdAt: createdAt ? createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
    updatedAt: updatedAt ? updatedAt.split("T")[0] : undefined,
  };
}

async function getAuthenticatedUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) {
      return NextResponse.json({ success: false, error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const projects = (data ?? []).map(toProject);
    return NextResponse.json({ success: true, data: projects, total: projects.length });
  } catch {
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) {
      return NextResponse.json({ success: false, error: "กรุณาเข้าสู่ระบบก่อนสร้างโปรเจค" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: "กรุณาระบุชื่อโปรเจค" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        category: body.category || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: toProject(data) }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการสร้างโปรเจค กรุณาลองใหม่" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) {
      return NextResponse.json({ success: false, error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ไม่พบ ID โปรเจค" }, { status: 400 });
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการลบโปรเจค กรุณาลองใหม่" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) {
      return NextResponse.json({ success: false, error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ไม่พบ ID โปรเจค" }, { status: 400 });
    }

    const body = await request.json();

    const updatePayload: Record<string, unknown> = {};
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.score !== undefined) updatePayload.score = body.score;
    if (body.imageUrl !== undefined) updatePayload.image_url = body.imageUrl;
    if (body.checklistCount !== undefined) updatePayload.checklist_count = body.checklistCount;
    if (body.passedCount !== undefined) updatePayload.passed_count = body.passedCount;
    if (body.failedCount !== undefined) updatePayload.failed_count = body.failedCount;
    if (body.reviewCount !== undefined) updatePayload.review_count = body.reviewCount;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: false, error: "ไม่มีข้อมูลที่ต้องอัปเดต" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: toProject(data) });
  } catch {
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการอัปเดตโปรเจค กรุณาลองใหม่" }, { status: 500 });
  }
}
