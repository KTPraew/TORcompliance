import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/types";

function toProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    status: row.status as Project["status"],
    score: row.score as number,
    checklistCount: row.checklist_count as number,
    passedCount: row.passed_count as number,
    failedCount: row.failed_count as number,
    reviewCount: row.review_count as number,
    torFileName: row.tor_file_name as string | undefined,
    uiFileName: row.ui_file_name as string | undefined,
    category: row.category as string | undefined,
    createdAt: (row.created_at as string).split("T")[0],
    updatedAt: row.updated_at ? (row.updated_at as string).split("T")[0] : undefined,
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: toProject(data) }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
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
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
  }

  const body = await request.json();

  const updatePayload: Record<string, unknown> = {};
  if (body.name !== undefined) updatePayload.name = body.name;
  if (body.description !== undefined) updatePayload.description = body.description;
  if (body.category !== undefined) updatePayload.category = body.category;
  if (body.status !== undefined) updatePayload.status = body.status;
  if (body.score !== undefined) updatePayload.score = body.score;
  if (body.checklistCount !== undefined) updatePayload.checklist_count = body.checklistCount;
  if (body.passedCount !== undefined) updatePayload.passed_count = body.passedCount;
  if (body.failedCount !== undefined) updatePayload.failed_count = body.failedCount;
  if (body.reviewCount !== undefined) updatePayload.review_count = body.reviewCount;

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
}
