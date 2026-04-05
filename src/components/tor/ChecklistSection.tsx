"use client";

import { motion } from "framer-motion";
import { ChecklistItemRow } from "./ChecklistItem";
import type { ChecklistItem, ChecklistCategory, ChecklistStatus } from "@/types";
import { CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";

interface ChecklistSectionProps {
  items: ChecklistItem[];
  category?: ChecklistCategory;
  onStatusChange?: (id: string, status: ChecklistStatus) => void;
}

export function ChecklistSection({ items, onStatusChange }: ChecklistSectionProps) {
  const passed = items.filter((i) => i.status === "pass").length;
  const failed = items.filter((i) => i.status === "fail").length;
  const review = items.filter((i) => i.status === "review").length;
  const pending = items.filter((i) => i.status === "pending").length;
  const total = items.length;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">ยังไม่มีรายการตรวจสอบ</p>
        <p className="text-sm text-slate-400 mt-1">อัปโหลด TOR เพื่อสร้างรายการตรวจสอบอัตโนมัติ</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100"
      >
        <span className="text-xs text-slate-500 font-medium">สรุป {total} รายการ</span>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{passed} ผ่าน</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
            <XCircle className="w-3.5 h-3.5" />
            <span>{failed} ไม่ผ่าน</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{review} ตรวจสอบ</span>
          </div>
          {pending > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{pending} รอ</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            onStatusChange={onStatusChange}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
