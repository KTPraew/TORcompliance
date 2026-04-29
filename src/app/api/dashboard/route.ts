import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ActivityType = "create" | "upload" | "analysis" | "report";

interface ActivityItem {
  id: string;
  action: string;
  project: string;
  time: string;
  type: ActivityType;
  timestamp: string;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "เมื่อกี้";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days === 1) return "เมื่อวาน";
  if (days < 30) return `${days} วันที่แล้ว`;
  const months = Math.floor(days / 30);
  return `${months} เดือนที่แล้ว`;
}

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Fetch projects for activity and category scores in parallel
  // RLS on project_category_scores already ensures we only see the current user's data
  const [projectsResult, scoresResult] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status, tor_file_name, ui_file_name, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("project_category_scores")
      .select("category, score, passed, failed, review, total, project_id"),
  ]);

  // --- Build activity feed from project events ---
  const activities: ActivityItem[] = [];

  for (const p of projectsResult.data ?? []) {
    // UI analysis completed
    if (p.ui_file_name && p.status === "completed") {
      activities.push({
        id: `analysis-${p.id}`,
        action: "วิเคราะห์ UI สำเร็จ",
        project: p.name,
        time: relativeTime(p.updated_at),
        type: "analysis",
        timestamp: p.updated_at,
      });
    }

    // TOR uploaded
    if (p.tor_file_name) {
      activities.push({
        id: `upload-${p.id}`,
        action: "อัปโหลด TOR",
        project: p.name,
        time: relativeTime(p.created_at),
        type: "upload",
        timestamp: p.created_at,
      });
    }

    // Project created
    activities.push({
      id: `create-${p.id}`,
      action: "สร้างโปรเจคใหม่",
      project: p.name,
      time: relativeTime(p.created_at),
      type: "create",
      timestamp: p.created_at,
    });
  }

  // Sort by most recent and take top 8
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recentActivity = activities.slice(0, 8).map(({ timestamp: _t, ...rest }) => rest);

  // --- Aggregate category scores ---
  const categories = ["Accessibility", "Policy", "Technical", "Content"] as const;
  const scoresData = scoresResult.data ?? [];

  const categoryStats = categories.map((cat) => {
    const rows = scoresData.filter((r) => r.category === cat);
    if (rows.length === 0) return { category: cat, score: 0, hasData: false };

    const totalPassed = rows.reduce((s, r) => s + r.passed, 0);
    const totalItems = rows.reduce((s, r) => s + r.total, 0);
    const score = totalItems > 0 ? Math.round((totalPassed / totalItems) * 100) : 0;
    return { category: cat, score, hasData: true };
  });

  return NextResponse.json({
    success: true,
    data: { categoryStats, recentActivity },
  });
}
