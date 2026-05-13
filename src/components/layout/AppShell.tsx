"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface AppShellProps { children: ReactNode }

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-[#f0fdf4] dark:bg-background min-h-screen">

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="md:pl-[240px]">

        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14 md:hidden bg-white border-b border-slate-100">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="เปิดเมนู"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors text-slate-500 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <BrandLogo size="sm" variant="light" title="TOR Compliance AI" subtitle={false} />
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
