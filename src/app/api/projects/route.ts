import { NextRequest, NextResponse } from "next/server";
import { mockProjects } from "@/lib/mock-data";
import type { Project } from "@/types";

let projects = [...mockProjects];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let filtered = [...projects];

  if (status && status !== "all") {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
  }

  // Simulate latency
  await new Promise((r) => setTimeout(r, 150));

  return NextResponse.json({
    success: true,
    data: filtered,
    total: filtered.length,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newProject: Project = {
    id: `${Date.now()}`,
    name: body.name,
    description: body.description || "",
    status: "pending",
    score: 0,
    checklistCount: 0,
    passedCount: 0,
    failedCount: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString().split("T")[0],
    category: body.category || "General",
  };

  projects.unshift(newProject);

  return NextResponse.json({ success: true, data: newProject }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
  }

  projects = projects.filter((p) => p.id !== id);

  return NextResponse.json({ success: true });
}
