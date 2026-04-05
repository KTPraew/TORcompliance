"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="min-h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
