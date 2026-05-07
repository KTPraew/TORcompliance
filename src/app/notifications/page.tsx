"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Zap,
  FileText,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

type IconName = "check" | "zap" | "file";

type ActivityItem = {
  id: string;
  iconName: IconName;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

const ICONS: Record<IconName, React.ElementType> = {
  check: CheckCircle2,
  zap: Zap,
  file: FileText,
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "เมื่อกี้";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days === 1) return "เมื่อวาน";
  return `${days} วันที่แล้ว`;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const supabase = createClient();

    const load = async () => {
      try {
        if (!user) return;

        const { data: projects } = await supabase
          .from("projects")
          .select("id, name, status, tor_file_name, created_at, updated_at, score")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(15);

        const items: ActivityItem[] = [];
        for (const p of (projects ?? [])) {
          if (p.status === "completed" && p.score > 0) {
            items.push({
              id: `analysis-${p.id}`,
              iconName: "check",
              iconColor: "text-emerald-500",
              iconBg: "bg-emerald-50",
              title: "วิเคราะห์เสร็จสมบูรณ์",
              body: `${p.name} — ผลลัพธ์ ${p.score}%`,
              time: relativeTime(p.updated_at),
              unread: Date.now() - new Date(p.updated_at).getTime() < 86400000,
            });
          }
          if (p.status === "in_progress") {
            items.push({
              id: `progress-${p.id}`,
              iconName: "zap",
              iconColor: "text-emerald-500",
              iconBg: "bg-emerald-50",
              title: "กำลังตรวจสอบ",
              body: `${p.name} — กำลังตรวจสอบ checklist`,
              time: relativeTime(p.updated_at),
              unread: false,
            });
          }
          if (p.tor_file_name) {
            items.push({
              id: `tor-${p.id}`,
              iconName: "file",
              iconColor: "text-purple-500",
              iconBg: "bg-purple-50",
              title: "อัปโหลดเอกสาร TOR สำเร็จ",
              body: `${p.name} — ${p.tor_file_name}`,
              time: relativeTime(p.created_at),
              unread: false,
            });
          }
        }
        setNotifications(items.slice(0, 12));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <AppShell>
      <PageHeader title="การแจ้งเตือน" />
      <div className="px-6 py-7 lg:px-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-slate-500 dark:text-muted-foreground text-sm mt-1">
            {loading
              ? "กำลังประมวลผลข้อมูล..."
              : unreadCount > 0
              ? `${unreadCount} การแจ้งเตือนใหม่`
              : "ไม่มีการแจ้งเตือนใหม่"}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">ยังไม่มีข้อมูล</h3>
            <p className="text-sm text-slate-400">เริ่มวิเคราะห์เอกสารเพื่อรับการแจ้งเตือน</p>
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(5,150,105,0.04),0_4px_16px_rgba(5,150,105,0.05)] border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-50">
              {notifications.map((notif, index) => {
                const Icon = ICONS[notif.iconName];
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-4 p-5 hover:bg-slate-50/50 transition-colors cursor-pointer ${
                      notif.unread ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.iconBg}`}>
                      <Icon className={`w-5 h-5 ${notif.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{notif.title}</p>
                        {notif.unread && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{notif.body}</p>
                      <p className="text-[10px] text-slate-400 mt-1.5">{notif.time}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
