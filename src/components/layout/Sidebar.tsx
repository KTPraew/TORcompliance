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
  HelpCircle,
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
  { label: "ช่วยเหลือ", href: "/help", icon: HelpCircle },
  { label: "ตั้งค่า", href: "/settings", icon: Settings },
];

function getInitials(user: User): string {
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getDisplayName(user: User): string {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "ผู้ใช้งาน"
  );
}

type ProfileMeta = {
  first_name: string;
  last_name: string;
  avatar_url: string;
};

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
    });
  }, [user?.id]);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const confirmLogout = () => setShowLogoutConfirm(true);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const displayName = profileMeta?.first_name || profileMeta?.last_name
    ? `${profileMeta.first_name} ${profileMeta.last_name}`.trim()
    : user ? getDisplayName(user) : "";

  return (
    <>
      <aside
        className="fixed left-0 top-0 bottom-0 w-60 flex flex-col z-30 overflow-hidden bg-[#1e3161]"
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/40">
              <Shield className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm leading-none tracking-wide">TOR Compliance</div>
              <div className="text-[11px] mt-0.5 text-white/40">AI Platform</div>
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-5 mb-2 h-px bg-white/[0.06]" />

        {/* Nav */}
        <nav aria-label="เมนูหลัก" className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const badge = item.href === "/projects" && projectCount !== null && projectCount > 0
              ? projectCount
              : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group/nav",
                  active
                    ? "bg-white/[0.12] text-white"
                    : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#748ffc]" aria-hidden="true" />
                )}
                <Icon
                  size={17}
                  aria-hidden="true"
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    active ? "text-[#748ffc]" : "text-white/50 group-hover/nav:text-white/80"
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

        {/* Bottom divider */}
        <div className="mx-5 mb-3 h-px bg-white/[0.06]" />

        {/* User / logout */}
        <div className="px-3 pb-4">
          <button
            onClick={confirmLogout}
            disabled={loggingOut}
            aria-label="ออกจากระบบ"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/[0.07] hover:text-white transition-all duration-150 disabled:opacity-50 group/logout"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10">
              {profileMeta?.avatar_url ? (
                <img
                  src={profileMeta.avatar_url}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full gradient-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user ? getInitials(user) : "—"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium text-white/80 truncate leading-tight">
                {displayName || "กำลังโหลด..."}
              </div>
              <div className="text-[10px] text-white/35 truncate mt-0.5">
                {user?.email ?? ""}
              </div>
            </div>
            <LogOut
              size={13}
              aria-hidden="true"
              className={cn(
                "flex-shrink-0 text-white/40 group-hover/logout:text-white/70 transition-colors",
                loggingOut && "animate-pulse"
              )}
            />
          </button>
        </div>
      </aside>

      {/* Logout confirm dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-dialog-title"
              initial={{ opacity: 0, scale: 0.96, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ type: "tween", duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(30,49,97,0.18)] p-6 w-80 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 mx-auto mb-4" aria-hidden="true">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <h3 id="logout-dialog-title" className="text-center font-semibold text-slate-900 text-base mb-1">
                ออกจากระบบ?
              </h3>
              <p className="text-center text-sm text-slate-500 mb-6">
                คุณต้องการออกจากระบบใช่หรือไม่
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => { setShowLogoutConfirm(false); handleLogout(); }}
                  disabled={loggingOut}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-400 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loggingOut ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      กำลังออก...
                    </>
                  ) : "ออกจากระบบ"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
