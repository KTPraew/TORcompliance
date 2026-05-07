"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ─── hooks ──────────────────────────────────────────────────────────────── */

function useAuthRedirect() {
  const router = useRouter();
  useEffect(() => {
    void (async () => {
      const { data } = await createClient().auth.getSession();
      if (data.session) router.replace("/dashboard");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

/* ─── inline SVG icons ───────────────────────────────────────────────────── */

type IconProps = { className?: string; style?: CSSProperties };

function IconShield({ className = "", style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconZap({ className = "", style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconLayers({ className = "", style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
function IconBarChart({ className = "", style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function IconArrowRight({ className = "", style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function IconCheck({ className = "", style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconUpload({ className = "", style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
function IconStar({ className = "", style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ─── score ring ─────────────────────────────────────────────────────────── */

function ScoreRing({ score, size = 84 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const cx = size / 2;
  const uid = "sg1";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.1} />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke={`url(#${uid})`}
        strokeWidth={size * 0.1}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
      />
    </svg>
  );
}

/* ─── compliance dashboard mockup ────────────────────────────────────────── */

function ComplianceMockup() {
  return (
    <div className="relative w-full max-w-[390px] mx-auto lg:ml-auto">
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(5,150,105,0.22) 0%, transparent 70%)" }}
      />
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(150deg, #0d2118 0%, #091a10 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)",
          animation: "tor-float 5s ease-in-out infinite",
        }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#059669" }}>
              <IconShield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">ผลการวิเคราะห์ TOR</span>
          </div>
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}
          >
            วิเคราะห์เสร็จสมบูรณ์
          </span>
        </div>

        {/* score + bars */}
        <div className="px-5 py-5 flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <ScoreRing score={87} size={84} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-white leading-none">87</span>
              <span className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>/ 100</span>
            </div>
          </div>
          <div className="flex-1 pt-1 space-y-3">
            {[
              { name: "WCAG 2.1 AA", pct: 88, color: "#059669" },
              { name: "TWCAG 2.0",   pct: 85, color: "#34d399" },
              { name: "NWPO",         pct: 78, color: "#93c5fd" },
            ].map(({ name, pct, color }) => (
              <div key={name}>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{name}</span>
                  <span className="text-[11px] font-bold" style={{ color }}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* item grid */}
        <div className="px-5 pb-5 grid grid-cols-2 gap-2">
          {[
            { label: "การนำทาง",           pass: true },
            { label: "เนื้อหา",             pass: true },
            { label: "สีและความตัดกัน",    pass: false },
            { label: "ฟอร์มและปุ่ม",       pass: true },
          ].map(({ label, pass }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span
                className="text-sm font-bold flex-shrink-0"
                aria-hidden="true"
                style={{ color: pass ? "#34d399" : "#fbbf24" }}
              >
                {pass ? "✓" : "⚠"}
              </span>
              <span className="text-[11px] leading-tight" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* view report */}
        <div className="px-5 pb-5">
          <div
            className="w-full text-center text-xs font-semibold rounded-xl py-2.5 cursor-pointer transition-all"
            style={{
              background: "rgba(5,150,105,0.1)",
              border: "1px solid rgba(5,150,105,0.2)",
              color: "#34d399",
            }}
          >
            ดูผลลัพธ์ฉบับเต็ม →
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── navbar ─────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "คุณสมบัติ",   href: "#features"      },
  { label: "วิธีใช้งาน", href: "#how-it-works"   },
  { label: "ราคา",        href: "#pricing"        },
  { label: "ความคิดเห็น",href: "#testimonials"   },
] as const;

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive("#" + e.target.id);
        });
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

function Navbar() {
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = useActiveSection(["features", "how-it-works", "pricing", "testimonials"]);

  return (
    <>
      <header
        role="banner"
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={
          scrolled || mobileOpen
            ? {
                background: "rgba(7,12,24,0.96)",
                backdropFilter: "blur(20px) saturate(200%)",
                WebkitBackdropFilter: "blur(20px) saturate(200%)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)",
              }
            : {}
        }
      >
        <div className="max-w-6xl mx-auto px-5 h-[68px] flex items-center justify-between gap-6">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-3 flex-shrink-0 group"
            aria-label="TOR Compliance AI — หน้าหลัก"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
              style={{ background: "#059669", boxShadow: "0 4px 14px rgba(5,150,105,0.5)" }}
            >
              <IconShield className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="leading-none">
              <span className="block font-bold text-white text-[15px] tracking-tight">
                TOR Compliance
              </span>
              <span className="block text-[11px] font-semibold tracking-widest uppercase mt-0.5"
                style={{ color: "#34d399" }}>
                AI Platform
              </span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav
            className="hidden md:flex items-center rounded-full px-1 py-1 gap-0.5 flex-1 justify-center max-w-xs mx-auto"
            aria-label="เมนูหลัก"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = activeSection === href;
              return (
                <a
                  key={href}
                  href={href}
                  className="relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.72)",
                    background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#ffffff";
                    if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.72)";
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {label}
                  {isActive && (
                    <span
                      className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      aria-hidden="true"
                      style={{ background: "#34d399" }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* ── Auth + mobile toggle ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium h-9 px-3.5 rounded-lg transition-all duration-150 hover:bg-white/[0.07] flex items-center"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-semibold text-white h-9 px-4 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
              style={{ background: "#059669", boxShadow: "0 2px 12px rgba(5,150,105,0.5)" }}
            >
              เริ่มต้นฟรี
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg gap-[5px] transition-colors duration-150 hover:bg-white/[0.08] cursor-pointer ml-1"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
              aria-expanded={mobileOpen}
            >
              <span
                className="block w-5 h-[1.5px] rounded-full bg-white transition-all duration-200 origin-center"
                style={{ transform: mobileOpen ? "translateY(3.25px) rotate(45deg)" : "none" }}
                aria-hidden="true"
              />
              <span
                className="block w-5 h-[1.5px] rounded-full bg-white transition-all duration-200"
                style={{ opacity: mobileOpen ? 0 : 1 }}
                aria-hidden="true"
              />
              <span
                className="block w-5 h-[1.5px] rounded-full bg-white transition-all duration-200 origin-center"
                style={{ transform: mobileOpen ? "translateY(-3.25px) rotate(-45deg)" : "none" }}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{
            maxHeight: mobileOpen ? "320px" : "0",
            borderTop: mobileOpen ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          }}
        >
          <nav aria-label="เมนูมือถือ" className="px-5 py-4 space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150 hover:bg-white/[0.07]"
                style={{ color: activeSection === href ? "#ffffff" : "rgba(255,255,255,0.7)" }}
              >
                {label}
                {activeSection === href && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399" }} aria-hidden="true" />
                )}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center text-sm font-medium py-2.5 rounded-xl transition-colors hover:bg-white/[0.07]"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center text-sm font-semibold py-2.5 rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: "#059669", boxShadow: "0 2px 12px rgba(5,150,105,0.4)" }}
              >
                เริ่มต้นฟรี →
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

/* ─── hero ───────────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex items-center overflow-hidden pt-[68px]"
      style={{
        background: "linear-gradient(160deg, #061a0e 0%, #081a10 55%, #030d07 100%)",
        minHeight: "100vh",
      }}
    >
      {/* grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(5,150,105,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(5,150,105,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* radial glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 65% 50%, rgba(5,150,105,0.11) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* text */}
          <div>
            <div
              className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full text-sm font-medium"
              style={{
                border: "1px solid rgba(5,150,105,0.35)",
                background: "rgba(5,150,105,0.1)",
                color: "#34d399",
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                aria-hidden="true"
                style={{ background: "#34d399", boxShadow: "0 0 8px rgba(116,143,252,0.8)", animation: "tor-pulse 2s ease-in-out infinite" }}
              />
              AI-Powered Compliance Checker
            </div>

            <h1
              id="hero-heading"
              className="font-bold text-white mb-5"
              style={{
                fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)",
                lineHeight: 1.14,
                letterSpacing: "-0.022em",
              }}
            >
              ตรวจสอบมาตรฐาน{" "}
              <span style={{ color: "#34d399" }}>WCAG</span>
              <br />
              อัตโนมัติ ด้วย AI
            </h1>

            <p
              className="mb-8"
              style={{
                fontSize: "1.0625rem",
                color: "rgba(255,255,255,0.52)",
                lineHeight: 1.75,
                maxWidth: "44ch",
              }}
            >
              อัปโหลดเอกสาร TOR ให้ AI ประมวลผลและตรวจสอบความสอดคล้องกับ
              WCAG 2.1, TWCAG และนโยบายเว็บไซต์ภาครัฐ — ก่อนส่งมอบงานทุกครั้ง
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{ background: "#059669", boxShadow: "0 4px 20px rgba(5,150,105,0.45)" }}
              >
                เริ่มวิเคราะห์ฟรี
                <IconArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-white/10 active:scale-[0.98]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                ดูการทำงาน
              </a>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {["WCAG 2.1 AA", "TWCAG 2.0", "NWPO"].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  <IconCheck className="w-3 h-3 flex-shrink-0" style={{ color: "#34d399" } as React.CSSProperties} />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* mockup */}
          <ComplianceMockup />
        </div>
      </div>
    </section>
  );
}

/* ─── stats bar ──────────────────────────────────────────────────────────── */

function StatsBar() {
  const stats = [
    { value: "50+", label: "เกณฑ์ตรวจสอบ" },
    { value: "3",   label: "มาตรฐานรองรับ" },
    { value: "<2s", label: "เวลาวิเคราะห์" },
    { value: "100%", label: "แม่นยำ AI" },
  ];
  return (
    <section aria-label="ตัวเลขสำคัญ">
      <div className="max-w-6xl mx-auto px-5">
        <div
          className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl overflow-hidden"
          style={{
            background: "#ffffff",
            border: "1px solid #e8edf8",
            boxShadow: "0 1px 4px rgba(5,150,105,0.04), 0 4px 20px rgba(5,150,105,0.06)",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="px-8 py-6 flex flex-col items-center text-center"
              style={{
                borderRight: i < stats.length - 1 ? "1px solid #e8edf8" : undefined,
              }}
            >
              <span
                className="font-bold tabular-nums"
                style={{ fontSize: "1.75rem", color: "#059669", lineHeight: 1 }}
              >
                {s.value}
              </span>
              <span className="text-xs mt-1.5" style={{ color: "#64748b" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── features ───────────────────────────────────────────────────────────── */

function FeaturesSection() {
  const features = [
    {
      icon: IconZap,
      title: "ประมวลผล TOR อัตโนมัติ",
      desc: "อัปโหลดเอกสาร TOR ให้ AI ประมวลผล requirement ทุกข้อโดยอัตโนมัติ ไม่ต้องตรวจสอบทีละบรรทัด",
      accent: "#059669",
      bg: "#ecfdf5",
    },
    {
      icon: IconLayers,
      title: "ครอบคลุมทุกมาตรฐาน",
      desc: "วิเคราะห์ตาม WCAG 2.1, TWCAG 2.0 และนโยบายเว็บไซต์ภาครัฐ (NWPO) ในที่เดียว — ครบทุกมาตรฐานที่ภาครัฐกำหนด",
      accent: "#0891b2",
      bg: "#ecfeff",
    },
    {
      icon: IconBarChart,
      title: "ดูผลลัพธ์และดาวน์โหลดรายงาน",
      desc: "รับผลลัพธ์โดยละเอียดพร้อมคะแนนรายหมวด สถานะ ผ่าน/ควรปรับปรุง และคำแนะนำที่ชัดเจน ส่งออก PDF ได้ทันที",
      accent: "#7c3aed",
      bg: "#f5f3ff",
    },
  ];

  return (
    <section id="features" aria-labelledby="features-heading" className="py-24" style={{ background: "#f8faff" }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <div
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
            style={{ background: "#ecfdf5", color: "#059669" }}
          >
            คุณสมบัติ
          </div>
          <h2
            id="features-heading"
            className="font-bold"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", color: "#0f172a", letterSpacing: "-0.02em" }}
          >
            ทุกสิ่งที่ทีม IT ภาครัฐต้องการ
          </h2>
          <p className="mt-3 max-w-xl mx-auto" style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.7 }}>
            ออกแบบมาสำหรับทีมพัฒนาที่ต้องส่งมอบโปรเจคให้ผ่านมาตรฐาน — ไม่ใช่แค่ tool ธรรมดา
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, accent, bg }) => (
            <div
              key={title}
              className="rounded-2xl p-7 transition-all duration-200 cursor-default group"
              style={{
                background: "#ffffff",
                border: "1px solid #e8edf8",
                boxShadow: "0 1px 4px rgba(5,150,105,0.04), 0 4px 16px rgba(5,150,105,0.05)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(5,150,105,0.12), 0 1px 4px rgba(5,150,105,0.06)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(5,150,105,0.04), 0 4px 16px rgba(5,150,105,0.05)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: bg }}
              >
                <Icon className="w-5 h-5" style={{ color: accent } as React.CSSProperties} />
              </div>
              <h3 className="font-semibold mb-2.5" style={{ fontSize: "1rem", color: "#0f172a" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── how it works ───────────────────────────────────────────────────────── */

function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      icon: IconUpload,
      title: "อัปโหลดเอกสาร",
      desc: "นำเข้าไฟล์ TOR (PDF หรือ Word) ระบบจะแยกและประมวลผล requirement อัตโนมัติ",
    },
    {
      n: "02",
      icon: IconZap,
      title: "ประมวลผล",
      desc: "AI ตรวจสอบทุก requirement เทียบกับ WCAG 2.1, TWCAG 2.0 และนโยบายเว็บไซต์ภาครัฐ",
    },
    {
      n: "03",
      icon: IconBarChart,
      title: "แสดงผลลัพธ์",
      desc: "รับผลลัพธ์รายหมวด สถานะ ผ่าน/ควรปรับปรุง พร้อมคำแนะนำ ดาวน์โหลดรายงาน PDF ได้ทันที",
    },
  ];

  return (
    <section id="how-it-works" aria-labelledby="hiw-heading" className="py-24" style={{ background: "#ffffff" }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <div
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
            style={{ background: "#ecfdf5", color: "#059669" }}
          >
            วิธีใช้งาน
          </div>
          <h2
            id="hiw-heading"
            className="font-bold"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", color: "#0f172a", letterSpacing: "-0.02em" }}
          >
            เริ่มต้นใน 3 ขั้นตอน
          </h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8">
          {/* connecting line (desktop) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px"
            style={{ background: "linear-gradient(90deg, #059669 0%, #34d399 50%, #059669 100%)", opacity: 0.2 }}
          />

          {steps.map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: "#ecfdf5", border: "2px solid #a7f3d0" }}
                >
                  <Icon className="w-8 h-8" style={{ color: "#059669" } as React.CSSProperties} />
                </div>
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "#059669" }}
                  aria-hidden="true"
                >
                  {n.slice(1)}
                </div>
              </div>
              <h3 className="font-semibold mb-2" style={{ fontSize: "1rem", color: "#0f172a" }}>{title}</h3>
              <p className="text-sm leading-relaxed max-w-[26ch] mx-auto" style={{ color: "#64748b" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── pricing ────────────────────────────────────────────────────────────── */

function PricingSection() {
  const tiers = [
    {
      name: "ฟรี",
      price: "0",
      unit: "บาท/เดือน",
      desc: "เริ่มต้นตรวจสอบโปรเจคแรกของคุณ",
      cta: "เริ่มฟรี",
      featured: false,
      features: [
        "3 โปรเจคต่อเดือน",
        "WCAG 2.1 Level A",
        "รายงานพื้นฐาน",
        "ส่งออก PDF",
      ],
    },
    {
      name: "Pro",
      price: "990",
      unit: "บาท/เดือน",
      desc: "สำหรับทีม IT ที่ต้องการความครบถ้วน",
      cta: "ทดลองฟรี 14 วัน",
      featured: true,
      features: [
        "ไม่จำกัดโปรเจค",
        "WCAG 2.1 AA + TWCAG + NWPO",
        "รายงานโดยละเอียด",
        "ส่งออก PDF, Excel",
        "ประวัติการวิเคราะห์",
        "Priority support",
      ],
    },
    {
      name: "องค์กร",
      price: "ติดต่อ",
      unit: "ราคาพิเศษ",
      desc: "สำหรับองค์กรขนาดใหญ่และ MSI",
      cta: "ติดต่อเรา",
      featured: false,
      features: [
        "ทุกอย่างใน Pro",
        "API Access",
        "White-label report",
        "SSO / SAML",
        "SLA 99.9%",
        "Dedicated support",
      ],
    },
  ];

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="py-24" style={{ background: "#f8faff" }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <div
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
            style={{ background: "#ecfdf5", color: "#059669" }}
          >
            ราคา
          </div>
          <h2
            id="pricing-heading"
            className="font-bold"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", color: "#0f172a", letterSpacing: "-0.02em" }}
          >
            ราคาที่โปร่งใส ไม่มีค่าใช้จ่ายซ่อน
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {tiers.map(({ name, price, unit, desc, cta, featured, features }) => (
            <div
              key={name}
              className="rounded-2xl p-7 relative transition-all duration-200"
              style={
                featured
                  ? {
                      background: "#059669",
                      boxShadow: "0 8px 40px rgba(5,150,105,0.38), 0 0 0 1px rgba(255,255,255,0.08)",
                      transform: "scale(1.02)",
                    }
                  : {
                      background: "#ffffff",
                      border: "1px solid #e8edf8",
                      boxShadow: "0 1px 4px rgba(5,150,105,0.04), 0 4px 16px rgba(5,150,105,0.05)",
                    }
              }
            >
              {featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full"
                  style={{ background: "#fbbf24", color: "#78350f" }}
                >
                  ยอดนิยม
                </div>
              )}

              <div className="mb-5">
                <p className="font-semibold mb-1" style={{ color: featured ? "rgba(255,255,255,0.7)" : "#64748b", fontSize: "0.8125rem" }}>{name}</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span
                    className="font-bold"
                    style={{ fontSize: "2rem", color: featured ? "#ffffff" : "#0f172a", lineHeight: 1 }}
                  >
                    {price}
                  </span>
                  <span className="text-sm" style={{ color: featured ? "rgba(255,255,255,0.6)" : "#94a3b8" }}>{unit}</span>
                </div>
                <p className="text-sm" style={{ color: featured ? "rgba(255,255,255,0.65)" : "#64748b" }}>{desc}</p>
              </div>

              <Link
                href="/login"
                className="block w-full text-center text-sm font-semibold py-2.5 rounded-xl mb-6 transition-all duration-200 cursor-pointer"
                style={
                  featured
                    ? { background: "#ffffff", color: "#059669" }
                    : { background: "#ecfdf5", color: "#059669" }
                }
              >
                {cta}
              </Link>

              <ul className="space-y-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={featured ? { background: "rgba(255,255,255,0.2)" } : { background: "#ecfdf5" }}
                    >
                      <IconCheck className="w-2.5 h-2.5" style={{ color: featured ? "#ffffff" : "#059669" } as React.CSSProperties} />
                    </div>
                    <span style={{ color: featured ? "rgba(255,255,255,0.85)" : "#475569" }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── testimonials ───────────────────────────────────────────────────────── */

function TestimonialsSection() {
  const reviews = [
    {
      name: "วัฒนชัย สมบูรณ์",
      role: "IT Manager",
      company: "Digital Systems Co., Ltd.",
      text: "ลดเวลาตรวจสอบ WCAG จาก 2 วันเหลือ 2 ชั่วโมง ทีมสามารถ submit งานได้อย่างมั่นใจมากขึ้น ไม่มีงานถูก reject เพราะ accessibility แล้ว",
    },
    {
      name: "นภารัตน์ ลิ้มสุวรรณ",
      role: "Senior Frontend Developer",
      company: "ThaiSoft Technology",
      text: "รายงานที่ได้ชัดเจนมาก บอกทั้ง issue และวิธีแก้ไข Developer ในทีมสามารถ fix ได้เลยโดยไม่ต้องคาดเดา ประหยัดเวลาอย่างมาก",
    },
    {
      name: "ปรีดา กิตติวงศ์",
      role: "Project Manager",
      company: "GovTech Solutions",
      text: "จากที่เคยกังวลว่าจะผ่าน TOR ตรวจสอบไหม ตอนนี้มั่นใจ 100% ก่อนส่งมอบงานทุกครั้ง ช่วยให้งานผ่านรอบแรกโดยไม่ต้องแก้ซ้ำ",
    },
  ];

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="py-24" style={{ background: "#ffffff" }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <div
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
            style={{ background: "#ecfdf5", color: "#059669" }}
          >
            ความคิดเห็น
          </div>
          <h2
            id="testimonials-heading"
            className="font-bold"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", color: "#0f172a", letterSpacing: "-0.02em" }}
          >
            ทีม IT ไว้ใจเรา
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map(({ name, role, company, text }) => (
            <div
              key={name}
              className="rounded-2xl p-7 transition-all duration-200"
              style={{
                background: "#f8faff",
                border: "1px solid #e8edf8",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(5,150,105,0.1)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div className="flex gap-0.5 mb-4" aria-label="5 ดาว">
                {[...Array(5)].map((_, i) => (
                  <IconStar key={i} className="w-4 h-4" style={{ color: "#fbbf24" } as React.CSSProperties} />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#334155" }}>{text}</p>
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid #e8edf8" }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "#059669" }}
                  aria-hidden="true"
                >
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>{name}</p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>{role} · {company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── cta ────────────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <section aria-labelledby="cta-heading" className="py-24" style={{ background: "#f8faff" }}>
      <div className="max-w-6xl mx-auto px-5">
        <div
          className="rounded-3xl px-10 py-16 text-center overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)" }}
        >
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />
          <div
            aria-hidden="true"
            className="absolute right-12 bottom-[-60px] w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />

          <div className="relative z-10">
            <h2
              id="cta-heading"
              className="font-bold text-white mb-4"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.02em" }}
            >
              พร้อมเริ่มต้นตรวจสอบมาตรฐาน?
            </h2>
            <p className="mb-8 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", lineHeight: 1.7 }}>
              เริ่มฟรีวันนี้ ไม่ต้องใช้บัตรเครดิต ทดลองวิเคราะห์โปรเจคแรกได้เลย
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{ background: "#ffffff", color: "#059669", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
              >
                สร้างบัญชีฟรี
                <IconArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:hello@torcompliance.ai"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-white/10"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                ติดต่อทีมงาน
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── footer ─────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{ background: "#071210", borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "#059669" }}
              >
                <IconShield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm">
                TOR Compliance <span style={{ color: "#34d399" }}>AI</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.4)", maxWidth: "22ch" }}>
              ระบบ AI ตรวจสอบมาตรฐาน WCAG สำหรับเว็บไซต์ภาครัฐ
            </p>
            <div className="flex gap-3">
              {/* Twitter/X */}
              <a
                href="#"
                aria-label="Twitter"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* product links */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>ผลิตภัณฑ์</p>
            <ul className="space-y-2.5">
              {[
                ["คุณสมบัติ", "#features"],
                ["วิธีใช้งาน", "#how-it-works"],
                ["ราคา", "#pricing"],
                ["เปรียบเทียบแผน", "#pricing"],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* standards links */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>มาตรฐาน</p>
            <ul className="space-y-2.5">
              {[
                ["WCAG 2.1 คืออะไร", "#"],
                ["TWCAG 2.0", "#"],
                ["นโยบายเว็บไซต์ภาครัฐ", "#"],
                ["คู่มือ Accessibility", "#"],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* legal links */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>บริษัท</p>
            <ul className="space-y-2.5">
              {[
                ["เกี่ยวกับเรา", "#"],
                ["ติดต่อเรา", "mailto:hello@torcompliance.ai"],
                ["นโยบายความเป็นส่วนตัว", "#"],
                ["เงื่อนไขการใช้งาน", "#"],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            © 2026 TOR Compliance AI. สงวนลิขสิทธิ์.
          </p>
          <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
            ข้อมูลของคุณได้รับการคุ้มครองภายใต้{" "}
            <a href="#" className="hover:text-white/50 underline underline-offset-2 transition-colors">
              พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) พ.ศ. 2562
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── keyframes ──────────────────────────────────────────────────────────── */

const landingStyles = `
  @keyframes tor-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes tor-pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(116,143,252,0.8); }
    50% { opacity: 0.6; box-shadow: 0 0 4px rgba(116,143,252,0.3); }
  }
`;

/* ─── page ───────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  useAuthRedirect();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: landingStyles }} />
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <div style={{ background: "#ffffff", paddingTop: "3.5rem", paddingBottom: "3.5rem" }}>
          <StatsBar />
        </div>
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
