"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  FileBarChart2,
  Settings,
  Shield,
  Bell,
  LogOut,
  HelpCircle,
  Sun,
  Moon,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { User } from "@supabase/supabase-js";

/* ─── nav structure ──────────────────────────────────────────────────────── */

const primaryNav = [
  { label: "แดชบอร์ด",    href: "/dashboard",     icon: LayoutDashboard },
  { label: "โปรเจค",      href: "/projects",      icon: FolderOpen      },
  { label: "รายงาน",      href: "/reports",       icon: FileBarChart2   },
  { label: "การแจ้งเตือน", href: "/notifications", icon: Bell            },
];

const supportNav = [
  { label: "ช่วยเหลือ", href: "/help",     icon: HelpCircle },
  { label: "ตั้งค่า",   href: "/settings", icon: Settings   },
];

/* ─── helpers ────────────────────────────────────────────────────────────── */

function getInitials(user: User): string {
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getDisplayName(user: User): string {
  return user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "ผู้ใช้งาน";
}

type ProfileMeta = { first_name: string; last_name: string; avatar_url: string };

interface SidebarProps { onClose?: () => void }

/* ─── nav item ───────────────────────────────────────────────────────────── */

function NavItem({
  href, label, icon: Icon, active, badge, onClose,
}: {
  href: string; label: string; icon: React.ElementType;
  active: boolean; badge?: number | null; onClose?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group/nav",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      )}
    >
      {/* Active left accent bar */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-emerald-500"
          aria-hidden="true"
        />
      )}
      <Icon
        size={17}
        aria-hidden="true"
        className={cn(
          "flex-shrink-0 transition-colors",
          active ? "text-emerald-500" : "text-slate-400 group-hover/nav:text-slate-600"
        )}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge != null && (
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center leading-none",
            active
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-600"
          )}
          aria-label={`${badge} รายการ`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

/* ─── sidebar ────────────────────────────────────────────────────────────── */

export function Sidebar({ onClose }: SidebarProps = {}) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user } = useAuth();

  const [profileMeta, setProfileMeta]      = useState<ProfileMeta | null>(null);
  const [loggingOut, setLoggingOut]        = useState(false);
  const [showLogoutConfirm, setShowLogout] = useState(false);
  const [projectCount, setProjectCount]   = useState<number | null>(null);
  const [theme, setTheme]                 = useState<"light" | "dark">("light");

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    Promise.all([
      supabase.from("profiles").select("first_name, last_name, avatar_url").eq("id", user.id).single(),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([p, c]) => {
      if (p.data) setProfileMeta(p.data);
      if (c.count !== null) setProjectCount(c.count);
    }).catch(() => {});
  }, [user?.id]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const displayName = profileMeta?.first_name || profileMeta?.last_name
    ? `${profileMeta.first_name} ${profileMeta.last_name}`.trim()
    : user ? getDisplayName(user) : "";

  return (
    <>
      <aside
        className="fixed left-0 top-0 bottom-0 w-[240px] flex flex-col z-30 bg-white border-r border-slate-100"
      >
        {/* ── Logo + collapse ── */}
        <div className="flex items-center justify-between px-5 h-16 flex-shrink-0 border-b border-slate-100">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 group min-w-0"
            aria-label="TOR Compliance AI — แดชบอร์ด"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity group-hover:opacity-90"
              style={{ background: "#059669", boxShadow: "0 4px 12px rgba(5,150,105,0.25)" }}
            >
              <Shield className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-800 text-[13px] leading-none tracking-tight truncate">
                TOR Compliance
              </div>
              <div className="text-[10px] mt-0.5 tracking-widest uppercase text-slate-400">
                AI Platform
              </div>
            </div>
          </Link>

          <button
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
        </div>

        {/* ── Nav ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
          {/* GENERAL section */}
          <p className="text-[10px] font-semibold tracking-widest uppercase px-3 mb-2 text-slate-400">
            หลัก
          </p>
          {primaryNav.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={isActive(item.href)}
              badge={item.href === "/projects" && projectCount != null && projectCount > 0 ? projectCount : null}
              onClose={onClose}
            />
          ))}

          {/* SUPPORT section */}
          <div className="pt-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase px-3 mb-2 text-slate-400">
              สนับสนุน
            </p>
            {supportNav.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={isActive(item.href)}
                onClose={onClose}
              />
            ))}
          </div>
        </div>

        {/* ── User / logout ── */}
        <div className="px-3 pb-2 flex-shrink-0 border-t border-slate-100 pt-3">
          <button
            onClick={() => setShowLogout(true)}
            disabled={loggingOut}
            aria-label="ออกจากระบบ"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 disabled:opacity-50 group/logout hover:bg-slate-50"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-slate-100">
              {profileMeta?.avatar_url ? (
                <img
                  src={profileMeta.avatar_url}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-500">
                  <span className="text-white text-xs font-bold">{user ? getInitials(user) : "—"}</span>
                </div>
              )}
            </div>

            {/* Name + email */}
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[13px] font-semibold truncate text-slate-700">
                {displayName || "กำลังโหลด..."}
              </div>
              <div className="text-[11px] truncate mt-0.5 text-slate-400">
                {user?.email ?? ""}
              </div>
            </div>

            <LogOut
              size={14}
              aria-hidden="true"
              className="flex-shrink-0 text-slate-300 group-hover/logout:text-slate-500 transition-colors"
            />
          </button>

          {/* ── Light / Dark toggle ── */}
          <div className="flex gap-2 mt-2 px-1">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-all",
                theme === "light"
                  ? "bg-slate-100 text-slate-700"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <Sun size={13} aria-hidden="true" />
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-all",
                theme === "dark"
                  ? "bg-slate-100 text-slate-700"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <Moon size={13} aria-hidden="true" />
              Dark
            </button>
          </div>
        </div>
      </aside>

      {/* ── Logout confirm dialog ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogout(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-title"
              initial={{ opacity: 0, scale: 0.96, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ type: "tween", duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4 border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <h2 id="logout-title" className="text-center font-semibold text-slate-900 text-base mb-1">
                ออกจากระบบ?
              </h2>
              <p className="text-center text-sm text-slate-500 mb-6">คุณต้องการออกจากระบบใช่หรือไม่</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogout(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => { setShowLogout(false); handleLogout(); }}
                  disabled={loggingOut}
                  className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loggingOut
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />กำลังออก...</>
                    : "ออกจากระบบ"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
