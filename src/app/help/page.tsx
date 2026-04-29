"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MessageCircle,
  Mail,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";

const faqs = [
  {
    q: "TOR Compliance AI คืออะไร?",
    a: "ระบบ AI สำหรับวิเคราะห์เอกสาร TOR (Terms of Reference) และตรวจสอบความสอดคล้องของเว็บไซต์กับมาตรฐาน WCAG 2.1, TWCAG และนโยบายเว็บไซต์ภาครัฐไทย",
  },
  {
    q: "ระบบรองรับมาตรฐานอะไรบ้าง?",
    a: "ระบบรองรับ WCAG 2.1 (Level A, AA, AAA), TWCAG 2010, Website Policy ภาครัฐไทย, และ PDPA",
  },
  {
    q: "ขั้นตอนการใช้งานเป็นอย่างไร?",
    a: "1. สร้างโปรเจคใหม่ 2. อัปโหลดเอกสาร TOR 3. รอ AI สร้าง Checklist 4. อัปโหลด Screenshot UI 5. รอ AI วิเคราะห์ 6. ดาวน์โหลดรายงาน",
  },
  {
    q: "ไฟล์ประเภทใดที่รองรับ?",
    a: "รองรับ PDF สำหรับ TOR และ PNG, JPG, WebP สำหรับ Screenshot UI ขนาดไม่เกิน 10MB",
  },
  {
    q: "ผลการวิเคราะห์มีความแม่นยำแค่ไหน?",
    a: "ระบบมีความแม่นยำสูงถึง 98% สำหรับการตรวจสอบมาตรฐาน Accessibility โดย AI ที่ผ่านการ train จากข้อมูลจริง",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <AppShell>
      <div className="px-6 py-7 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-900">ช่วยเหลือ</h1>
          <p className="text-slate-500 text-sm mt-1">คำถามที่พบบ่อยและวิธีใช้งาน</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: BookOpen, label: "คู่มือการใช้งาน", color: "bg-blue-50 text-blue-600" },
            { icon: MessageCircle, label: "แชทกับทีมงาน", color: "bg-emerald-50 text-emerald-600" },
            { icon: Mail, label: "ส่งอีเมลหาเรา", color: "bg-purple-50 text-purple-600" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(67,97,238,0.04),0_4px_16px_rgba(67,97,238,0.05)] border border-slate-100 p-5 flex flex-col items-center gap-3 text-center cursor-pointer hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </motion.div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(67,97,238,0.04),0_4px_16px_rgba(67,97,238,0.05)] border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-5">คำถามที่พบบ่อย</h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.06 }}
                className="border border-slate-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-800 pr-4">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 text-sm text-slate-600 leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
