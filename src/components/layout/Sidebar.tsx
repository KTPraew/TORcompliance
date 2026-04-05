"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  FileBarChart2,
  Settings,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
  { label: "โปรเจค", href: "/projects", icon: FolderOpen, badge: 3 },
  { label: "รายงาน", href: "/reports", icon: FileBarChart2 },
  { label: "ตั้งค่า", href: "/settings", icon: Settings },
];

const bottomItems = [
  { label: "การแจ้งเตือน", href: "/notifications", icon: Bell },
  { label: "ช่วยเหลือ", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0f172a] flex flex-col z-30 overflow-hidden">
      {/* Logo area */}
      <div className="px-6 py-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-sm leading-none">TOR Compliance</div>
            <div className="text-[11px] text-slate-400 mt-0.5">AI Platform</div>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        <div className="px-3 pb-2 pt-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            เมนูหลัก
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-primary-light/20 border border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon
                  className={cn(
                    "w-4.5 h-4.5 flex-shrink-0 relative z-10",
                    active ? "text-primary-light" : "text-slate-500 group-hover:text-slate-300"
                  )}
                  size={18}
                />
                <span className="relative z-10 flex-1">{item.label}</span>
                {item.badge && !active && (
                  <span className="relative z-10 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight className="w-3.5 h-3.5 text-primary-light relative z-10" />}
              </motion.div>
            </Link>
          );
        })}

        <div className="px-3 pb-2 pt-4">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            ทั่วไป
          </span>
        </div>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <Icon size={18} className="flex-shrink-0 text-slate-500" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Plan badge */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary-light/10 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-md gradient-primary flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-semibold text-white">Professional Plan</span>
        </div>
        <p className="text-[10px] text-slate-400 mb-2">8/10 โปรเจคที่ใช้งานได้</p>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-4/5 gradient-primary rounded-full" />
        </div>
      </div>

      {/* User profile */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">กต</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">กรุณา ตรวจสอบ</div>
            <div className="text-[10px] text-slate-400 truncate">admin@mdes.go.th</div>
          </div>
          <LogOut
            size={14}
            className="text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0"
          />
        </div>
      </div>
    </aside>
  );
}
