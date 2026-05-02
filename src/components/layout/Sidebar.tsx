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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { label: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
  { label: "โปรเจค", href: "/projects", icon: FolderOpen },
  { label: "รายงาน", href: "/reports", icon: FileBarChart2 },
  { label: "การแจ้งเตือน", href: "/notifications", icon: Bell },
  { label: "ตั้งค่า", href: "/settings", icon: Settings },
];

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

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [profileMeta, setProfileMeta] = useState<ProfileMeta | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [projectCount, setProjectCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    Promise.all([
      supabase.from("profiles").select("first_name, last_name, avatar_url").eq("id", user.id).single(),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([profileResult, countResult]) => {
      if (profileResult.data) setProfileMeta(profileResult.data);
      if (countResult.count !== null) setProjectCount(countResult.count);
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
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] flex flex-col z-30 bg-white border-r border-slate-100">
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 flex-shrink-0">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm shadow-blue-500/20">
              <Shield className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-[13px] leading-none tracking-tight">TOR Compliance</div>
              <div className="text-[10px] text-slate-400 mt-0.5">AI Platform</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase px-2 mb-2">เมนู</p>
          <nav aria-label="เมนูหลัก" className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const badge = item.href === "/projects" && projectCount !== null && projectCount > 0 ? projectCount : null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group/nav",
                    active
                      ? "bg-[#eef2ff] text-[#4361ee]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <Icon
                    size={17}
                    aria-hidden="true"
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      active ? "text-[#4361ee]" : "text-slate-400 group-hover/nav:text-slate-600"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {badge && (
                    <span className="bg-[#4361ee] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User */}
        <div className="border-t border-slate-100 px-3 py-3 flex-shrink-0">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            disabled={loggingOut}
            aria-label="ออกจากระบบ"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-150 disabled:opacity-50 group/logout"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-slate-100">
              {profileMeta?.avatar_url ? (
                <img src={profileMeta.avatar_url} alt="" aria-hidden="true" decoding="async" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user ? getInitials(user) : "—"}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[13px] font-semibold text-slate-700 truncate">{displayName || "กำลังโหลด..."}</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email ?? ""}</div>
            </div>
            <LogOut size={14} aria-hidden="true" className="text-slate-300 group-hover/logout:text-slate-500 flex-shrink-0 transition-colors" />
          </button>
        </div>
      </aside>

      {/* Logout dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
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
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <h3 id="logout-title" className="text-center font-semibold text-slate-900 text-base mb-1">ออกจากระบบ?</h3>
              <p className="text-center text-sm text-slate-500 mb-6">คุณต้องการออกจากระบบใช่หรือไม่</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >ยกเลิก</button>
                <button
                  onClick={() => { setShowLogoutConfirm(false); handleLogout(); }}
                  disabled={loggingOut}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loggingOut ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />กำลังออก...</> : "ออกจากระบบ"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
