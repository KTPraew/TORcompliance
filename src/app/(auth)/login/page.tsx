"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

const features = [
  "วิเคราะห์ TOR อัตโนมัติด้วย AI",
  "ตรวจสอบความสอดคล้อง WCAG 2.1 / TWCAG",
  "รายงานโดยละเอียดพร้อมคำแนะนำการแก้ไข",
  "รองรับมาตรฐานเว็บไซต์ภาครัฐไทย",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@mdes.go.th");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1200));

    if (email && password) {
      router.push("/dashboard");
    } else {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-[55%] gradient-primary relative overflow-hidden flex-col">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-white/5 transform -translate-y-1/2" />
          <svg
            className="absolute bottom-0 left-0 right-0 text-white/5"
            viewBox="0 0 400 200"
            fill="currentColor"
          >
            <path d="M0,160 C100,100 300,180 400,120 L400,200 L0,200 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-lg leading-none">TOR Compliance AI</div>
              <div className="text-white/60 text-xs mt-0.5">ระบบตรวจสอบมาตรฐานเว็บไซต์</div>
            </div>
          </div>

          {/* Hero content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3 py-1.5 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/90 text-xs font-medium">AI-Powered Compliance Platform</span>
              </div>

              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                ตรวจสอบความสอดคล้อง
                <br />
                เว็บไซต์ภาครัฐ
                <br />
                <span className="text-white/70">ด้วย AI อัตโนมัติ</span>
              </h1>

              <p className="text-white/70 text-base leading-relaxed mb-8">
                วิเคราะห์ TOR และตรวจสอบเว็บไซต์กับมาตรฐาน WCAG 2.1, TWCAG
                และนโยบายเว็บไซต์ภาครัฐไทย ได้อย่างรวดเร็วและแม่นยำ
              </p>

              <div className="space-y-3">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white/80 text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-4 border-t border-white/15 pt-8"
          >
            {[
              { value: "500+", label: "โปรเจคที่วิเคราะห์" },
              { value: "98%", label: "ความแม่นยำ" },
              { value: "12", label: "มาตรฐานที่รองรับ" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/50 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="font-bold text-slate-900">TOR Compliance AI</div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">ยินดีต้อนรับ</h2>
            <p className="text-slate-500 text-sm">เข้าสู่ระบบเพื่อเริ่มต้นใช้งาน</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">อีเมล</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@agency.go.th"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  defaultChecked
                />
                <span className="text-sm text-slate-600">จดจำฉัน</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {!loading && <ArrowRight className="w-4 h-4" />}
              เข้าสู่ระบบ
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs text-blue-600 font-medium mb-1">บัญชีทดสอบ</p>
            <p className="text-xs text-blue-500">อีเมล: admin@mdes.go.th</p>
            <p className="text-xs text-blue-500">รหัสผ่าน: password</p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            ระบบนี้สำหรับผู้มีสิทธิ์เข้าถึงเท่านั้น
            <br />
            &copy; 2024 TOR Compliance AI. สงวนสิทธิ์ทุกประการ
          </p>
        </motion.div>
      </div>
    </div>
  );
}
