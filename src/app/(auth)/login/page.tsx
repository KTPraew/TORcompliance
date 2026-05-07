"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, ArrowRight, CheckCircle2, Lock, Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const features = [
  "วิเคราะห์ TOR อัตโนมัติด้วย AI",
  "ตรวจสอบความสอดคล้อง WCAG 2.1 / TWCAG",
  "รายงานโดยละเอียดพร้อมคำแนะนำการแก้ไข",
  "รองรับมาตรฐานเว็บไซต์ภาครัฐไทย",
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่");
      setLoading(false);
    } else {
      const rawNext = searchParams.get("next") || "/dashboard";
      const next = rawNext.startsWith("/") && !rawNext.startsWith("/api/") ? rawNext : "/dashboard";
      router.push(next);
      router.refresh();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-[400px]"
    >
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-emerald-500/20">
          <Shield className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <div className="font-bold text-slate-900 text-sm leading-none">TOR Compliance AI</div>
          <div className="text-[11px] text-slate-500 mt-0.5">ระบบตรวจสอบมาตรฐานเว็บไซต์</div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_32px_rgba(5,150,105,0.10),0_1px_4px_rgba(5,150,105,0.06)] p-8">
        <div className="mb-7">
          <h2 className="text-xl font-bold text-slate-900 mb-1">เข้าสู่ระบบ</h2>
          <p className="text-sm text-slate-500">ยินดีต้อนรับสู่ TOR Compliance AI</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              อีเมล
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@agency.go.th"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                รหัสผ่าน
              </label>
              <button
                type="button"
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                  : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5"
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl gradient-primary text-white text-sm font-semibold shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              <>
                เข้าสู่ระบบ
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-400 mt-5">
        ระบบนี้สำหรับผู้มีสิทธิ์เข้าถึงเท่านั้น
        {" · "}
        &copy; {new Date().getFullYear()} TOR Compliance AI
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Left — Brand panel ──────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col"
        style={{ background: "linear-gradient(150deg, #022c22 0%, #064e3b 55%, #065f46 100%)" }}
      >
        {/* decorative circles */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/[0.03]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/[0.03]" />
          <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-emerald-400/[0.06] -translate-y-1/2" />
          {/* subtle grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.12] border border-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="font-bold text-white text-base leading-none">TOR Compliance AI</div>
              <div className="text-white/70 text-xs mt-0.5">ระบบตรวจสอบมาตรฐานเว็บไซต์ภาครัฐ</div>
            </div>
          </div>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 bg-emerald-400/15 border border-emerald-400/25 rounded-full px-3 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                <span className="text-emerald-200 text-xs font-medium">AI-Powered Compliance Platform</span>
              </span>

              <h1 className="text-[2.5rem] font-bold text-white leading-[1.15] tracking-tight mb-5">
                ตรวจสอบความ<wbr />สอดคล้อง
                <br />
                เว็บไซต์ภาครัฐ
                <br />
                <span className="text-emerald-300">ด้วย AI</span>
              </h1>

              <p className="text-white/80 text-[0.9375rem] leading-relaxed mb-8 max-w-[340px]">
                วิเคราะห์ TOR และตรวจสอบกับมาตรฐาน WCAG 2.1, TWCAG
                และนโยบายเว็บไซต์ภาครัฐไทยอย่างแม่นยำ
              </p>

              <div className="space-y-2.5">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.08, duration: 0.35 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" aria-hidden="true" />
                    </div>
                    <span className="text-white/85 text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-3 gap-4 border-t border-white/10 pt-7"
          >
            {[
              { value: "500+", label: "โปรเจคที่วิเคราะห์" },
              { value: "98%",  label: "ความแม่นยำ" },
              { value: "12",   label: "มาตรฐานที่รองรับ" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/65 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right — Login form ───────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#f2f7f5]">
        <Suspense fallback={
          <div className="w-full max-w-[400px] h-80 animate-pulse bg-white/60 rounded-2xl" />
        }>
          <LoginForm />
        </Suspense>
      </div>

    </div>
  );
}
