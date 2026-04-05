"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  FolderOpen,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { mockProjects } from "@/lib/mock-data";
import type { Project } from "@/types";

const statusFilters = [
  { label: "ทั้งหมด", value: "all" },
  { label: "กำลังดำเนินการ", value: "in_progress" },
  { label: "เสร็จสิ้น", value: "completed" },
  { label: "รอดำเนินการ", value: "pending" },
];

const categoryOptions = [
  "Government Portal",
  "Social Security",
  "Tax System",
  "Civil Registration",
  "Healthcare",
  "Education",
  "Transportation",
  "Finance",
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    category: "Government Portal",
  });

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    setCreating(true);

    await new Promise((r) => setTimeout(r, 800));

    const created: Project = {
      id: `${Date.now()}`,
      name: newProject.name,
      description: newProject.description,
      status: "pending",
      score: 0,
      checklistCount: 0,
      passedCount: 0,
      failedCount: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      category: newProject.category,
    };

    setProjects([created, ...projects]);
    setCreating(false);
    setShowCreate(false);
    setNewProject({ name: "", description: "", category: "Government Portal" });
  };

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 rounded-full gradient-primary" />
              <h1 className="text-2xl font-bold text-slate-900">โปรเจคทั้งหมด</h1>
            </div>
            <p className="text-slate-500 text-sm ml-3.5">
              จัดการและตรวจสอบความสอดคล้องของเว็บไซต์ภาครัฐ
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="md">
            <Plus className="w-4 h-4" />
            สร้างโปรเจคใหม่
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 mb-6"
        >
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาโปรเจค..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status filters */}
            <div className="flex items-center gap-1.5">
              {statusFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === f.value
                      ? "gradient-primary text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
              <Filter className="w-3.5 h-3.5" />
              <span>{filtered.length} โปรเจค</span>
            </div>
          </div>
        </motion.div>

        {/* Projects grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {filtered.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}

              {/* Create new card */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: filtered.length * 0.06, duration: 0.35 }}
                onClick={() => setShowCreate(true)}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center hover:border-primary/40 hover:bg-primary/2 transition-all duration-200 group min-h-[200px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 group-hover:text-primary transition-colors">
                    สร้างโปรเจคใหม่
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">เพิ่มเว็บไซต์ใหม่เพื่อตรวจสอบ</p>
                </div>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
                <FolderOpen className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">ไม่พบโปรเจค</h3>
              <p className="text-sm text-slate-400 mb-6">
                {search ? `ไม่พบโปรเจคที่ตรงกับ "${search}"` : "ยังไม่มีโปรเจคในสถานะนี้"}
              </p>
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4" />
                สร้างโปรเจคแรก
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create project modal */}
      <Modal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="สร้างโปรเจคใหม่"
        description="เพิ่มเว็บไซต์ภาครัฐใหม่เพื่อเริ่มการตรวจสอบความสอดคล้อง"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">ชื่อโปรเจค *</label>
            <input
              type="text"
              placeholder="เช่น กระทรวงดิจิทัล - Portal Website"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">คำอธิบาย</label>
            <textarea
              placeholder="อธิบายเกี่ยวกับเว็บไซต์หรือระบบที่จะตรวจสอบ"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">ประเภทเว็บไซต์</label>
            <select
              value={newProject.category}
              onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => setShowCreate(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              size="md"
              className="flex-1"
              loading={creating}
              disabled={!newProject.name.trim()}
            >
              <Plus className="w-4 h-4" />
              สร้างโปรเจค
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
