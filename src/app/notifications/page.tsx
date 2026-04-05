"use client";

import { motion } from "framer-motion";
import { Bell, CheckCircle2, Zap, FileText, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";

const notifications = [
  {
    id: 1,
    type: "success",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50",
    title: "การวิเคราะห์ UI เสร็จสิ้น",
    body: "สำนักงานประกันสังคม - ระบบบริการออนไลน์ ได้รับคะแนน 92%",
    time: "10 นาทีที่แล้ว",
    unread: true,
  },
  {
    id: 2,
    type: "info",
    icon: Zap,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    title: "AI วิเคราะห์ TOR เสร็จสิ้น",
    body: "กรมสาธารณสุข - Health Portal สร้าง Checklist 18 รายการ",
    time: "2 ชั่วโมงที่แล้ว",
    unread: true,
  },
  {
    id: 3,
    type: "warning",
    icon: AlertCircle,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    title: "พบปัญหา Critical 3 รายการ",
    body: "กระทรวงดิจิทัล - Portal Website มีปัญหา WCAG ที่ต้องแก้ไขด่วน",
    time: "เมื่อวาน",
    unread: false,
  },
  {
    id: 4,
    type: "info",
    icon: FileText,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-50",
    title: "ออกรายงานใหม่",
    body: "กรมการปกครอง - ระบบทะเบียนราษฎร์ รายงานพร้อมดาวน์โหลด",
    time: "3 วันที่แล้ว",
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <AppShell>
      <div className="p-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-6 rounded-full gradient-primary" />
            <h1 className="text-2xl font-bold text-slate-900">การแจ้งเตือน</h1>
          </div>
          <p className="text-slate-500 text-sm ml-3.5">
            {notifications.filter((n) => n.unread).length} การแจ้งเตือนที่ยังไม่ได้อ่าน
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {notifications.map((notif, index) => {
              const Icon = notif.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.07 }}
                  className={`flex items-start gap-4 p-5 hover:bg-slate-50/50 transition-colors cursor-pointer ${
                    notif.unread ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.iconBg}`}
                  >
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
      </div>
    </AppShell>
  );
}
