"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Save,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const settingsTabs = [
  { label: "โปรไฟล์", icon: User, value: "profile" },
  { label: "การแจ้งเตือน", icon: Bell, value: "notifications" },
  { label: "ความปลอดภัย", icon: Shield, value: "security" },
  { label: "มาตรฐาน", icon: Globe, value: "standards" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-6 rounded-full gradient-primary" />
            <h1 className="text-2xl font-bold text-slate-900">ตั้งค่า</h1>
          </div>
          <p className="text-slate-500 text-sm ml-3.5">จัดการบัญชีและการตั้งค่าระบบ</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-card border border-slate-100 p-3 h-fit"
          >
            <nav className="space-y-0.5">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.value
                        ? "gradient-primary text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3 space-y-5"
          >
            {activeTab === "profile" && (
              <>
                <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                  <h2 className="font-semibold text-slate-900 mb-5">ข้อมูลส่วนตัว</h2>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold">
                      กต
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">กรุณา ตรวจสอบ</p>
                      <p className="text-sm text-slate-500">ผู้ดูแลระบบ</p>
                      <Button variant="ghost" size="sm" className="mt-1 -ml-2">
                        เปลี่ยนรูปโปรไฟล์
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "ชื่อ", defaultValue: "กรุณา", type: "text" },
                      { label: "นามสกุล", defaultValue: "ตรวจสอบ", type: "text" },
                      { label: "อีเมล", defaultValue: "admin@mdes.go.th", type: "email" },
                      { label: "เบอร์โทรศัพท์", defaultValue: "02-123-4567", type: "tel" },
                    ].map((field) => (
                      <div key={field.label} className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">{field.label}</label>
                        <input
                          type={field.type}
                          defaultValue={field.defaultValue}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      </div>
                    ))}
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">หน่วยงาน</label>
                      <input
                        type="text"
                        defaultValue="กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                  <h2 className="font-semibold text-slate-900 mb-4">แผน Professional</h2>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary-light/5 rounded-xl border border-primary/10">
                    <div>
                      <p className="font-semibold text-slate-900">Professional Plan</p>
                      <p className="text-sm text-slate-500 mt-0.5">฿2,999/เดือน · ต่ออายุ 1 ก.พ. 2025</p>
                    </div>
                    <Button variant="secondary" size="sm">อัปเกรด</Button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                <h2 className="font-semibold text-slate-900 mb-5">การแจ้งเตือน</h2>
                <div className="space-y-4">
                  {[
                    { label: "เมื่อการวิเคราะห์ TOR เสร็จสิ้น", checked: true },
                    { label: "เมื่อการตรวจสอบ UI เสร็จสิ้น", checked: true },
                    { label: "เมื่อโปรเจคถูกแชร์", checked: false },
                    { label: "รายงานประจำสัปดาห์", checked: true },
                    { label: "อัปเดตมาตรฐานใหม่", checked: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50">
                      <span className="text-sm text-slate-700">{item.label}</span>
                      <div
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                          item.checked ? "gradient-primary" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                            item.checked ? "right-0.5" : "left-0.5"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                <h2 className="font-semibold text-slate-900 mb-5">ความปลอดภัย</h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">รหัสผ่านปัจจุบัน</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">รหัสผ่านใหม่</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">ยืนยันรหัสผ่านใหม่</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "standards" && (
              <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
                <h2 className="font-semibold text-slate-900 mb-5">มาตรฐานที่ตรวจสอบ</h2>
                <div className="space-y-3">
                  {[
                    { name: "WCAG 2.1 Level A", enabled: true, desc: "Web Content Accessibility Guidelines ระดับ A" },
                    { name: "WCAG 2.1 Level AA", enabled: true, desc: "Web Content Accessibility Guidelines ระดับ AA (แนะนำ)" },
                    { name: "WCAG 2.1 Level AAA", enabled: false, desc: "Web Content Accessibility Guidelines ระดับ AAA" },
                    { name: "TWCAG 2010", enabled: true, desc: "มาตรฐาน Accessibility ของไทย" },
                    { name: "Website Policy", enabled: true, desc: "นโยบายเว็บไซต์ภาครัฐไทย" },
                    { name: "PDPA Compliance", enabled: true, desc: "พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล" },
                  ].map((std, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          std.enabled ? "border-primary bg-primary" : "border-slate-300"
                        }`}
                      >
                        {std.enabled && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{std.name}</p>
                        <p className="text-xs text-slate-500">{std.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} size="md">
                {saved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    บันทึกแล้ว
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    บันทึกการตั้งค่า
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
