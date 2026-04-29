"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  FolderOpen,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    category: "Government Portal",
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/projects?${params}`);
      const json = await res.json();
      if (json.success) setProjects(json.data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(fetchProjects, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchProjects, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      const json = await res.json();
      if (json.success) {
        setProjects([json.data, ...projects]);
        setShowCreate(false);
        setNewProject({ name: "", description: "", category: "Government Portal" });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (project: Project) => {
    setDeletingId(project.id);
    try {
      const res = await fetch(`/api/projects?id=${project.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        setShowDeleteConfirm(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <div className="px-6 py-7 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900">โปรเจคทั้งหมด</h1>
            <p className="text-slate-500 text-sm mt-1">
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
          className="bg-white rounded-2xl border border-slate-100/80 p-4 mb-6"
          style={{ boxShadow: "0 1px 4px rgba(67,97,238,0.04), 0 4px 16px rgba(67,97,238,0.05)" }}
        >
          <div className="flex items-center gap-4 flex-wrap">
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
              <span>{projects.length} โปรเจค</span>
            </div>
          </div>
        </motion.div>

        {/* Projects grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-24"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </motion.div>
          ) : projects.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {projects.map((project, index) => (
                <div key={project.id} className="relative group">
                  <ProjectCard project={project} index={index} />
                  {/* Delete button overlay */}
                  <button
                    onClick={() => setShowDeleteConfirm(project)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-white/80 border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    aria-label={`ลบโปรเจค ${project.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}

              {/* Create new card */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: projects.length * 0.06, duration: 0.35 }}
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
            <label htmlFor="project-name" className="text-sm font-medium text-slate-700">ชื่อโปรเจค *</label>
            <input
              id="project-name"
              type="text"
              placeholder="เช่น กระทรวงดิจิทัล - Portal Website"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="project-description" className="text-sm font-medium text-slate-700">คำอธิบาย</label>
            <textarea
              id="project-description"
              placeholder="อธิบายเกี่ยวกับเว็บไซต์หรือระบบที่จะตรวจสอบ"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="project-category" className="text-sm font-medium text-slate-700">ประเภทเว็บไซต์</label>
            <select
              id="project-category"
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

      {/* Delete confirm modal */}
      <Modal
        open={!!showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
        title="ลบโปรเจค"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบ "${showDeleteConfirm?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        size="sm"
      >
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="flex-1"
            onClick={() => setShowDeleteConfirm(null)}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            size="md"
            className="flex-1 bg-red-500 hover:bg-red-600 focus:ring-red-300"
            loading={deletingId === showDeleteConfirm?.id}
            onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
          >
            <Trash2 className="w-4 h-4" />
            ลบโปรเจค
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
