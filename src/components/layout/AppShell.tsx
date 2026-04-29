"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Shield } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-[#f0f5ff] min-h-screen">
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
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
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
      <div className="md:pl-60">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14 bg-[#f0f5ff] border-b border-slate-200/50 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="เปิดเมนู"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200/70 transition-colors"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">TOR Compliance AI</span>
          </div>
        </header>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
