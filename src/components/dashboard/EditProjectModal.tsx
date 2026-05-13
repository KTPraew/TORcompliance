"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types";

const CATEGORY_OPTIONS = [
  "Government Portal",
  "Social Security",
  "Tax System",
  "Civil Registration",
  "Healthcare",
  "Education",
  "Transportation",
  "Finance",
];

interface EditProjectModalProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Project) => void;
}

export function EditProjectModal({ project, open, onClose, onSave }: EditProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Government Portal");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project && open) {
      setName(project.name);
      setDescription(project.description ?? "");
      setCategory(project.category ?? "Government Portal");
      setImagePreview(project.imageUrl ?? null);
      setImageFile(null);
      setClearImage(false);
      setError("");
    }
  }, [project, open]);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setClearImage(false);
    }
    e.target.value = "";
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    setClearImage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !name.trim()) return;

    setSaving(true);
    setError("");

    try {
      let finalImageUrl: string | null = project.imageUrl ?? null;

      if (clearImage) {
        finalImageUrl = null;
      } else if (imageFile) {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("กรุณาเข้าสู่ระบบ");

        const ext = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${userData.user.id}/${project.id}/cover.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(path, imageFile, { upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage
          .from("project-images")
          .getPublicUrl(path);
        finalImageUrl = urlData.publicUrl;
      }

      const res = await fetch(`/api/projects?id=${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          category,
          imageUrl: finalImageUrl,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "บันทึกไม่สำเร็จ");

      onSave(json.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => { if (!o) onClose(); }}
      title="แก้ไขโปรเจค"
      description="แก้ไขข้อมูลชื่อ รูปภาพ และประเภทของโปรเจค"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image upload */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">รูปภาพโปรเจค</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full h-32 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all cursor-pointer overflow-hidden group"
          >
            {imagePreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="project cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="flex items-center gap-2 text-white text-sm font-medium">
                    <Pencil className="w-4 h-4" />
                    เปลี่ยนรูป
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 group-hover:text-emerald-600 transition-colors">
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs font-medium">คลิกเพื่ออัปโหลดรูปภาพ</span>
                <span className="text-[10px]">PNG, JPG, WebP ไม่เกิน 5MB</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          {imagePreview && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              ลบรูปภาพ
            </button>
          )}
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="edit-project-name" className="text-sm font-medium text-slate-700">
            ชื่อโปรเจค *
          </label>
          <input
            id="edit-project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="edit-project-desc" className="text-sm font-medium text-slate-700">
            คำอธิบาย
          </label>
          <textarea
            id="edit-project-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label htmlFor="edit-project-category" className="text-sm font-medium text-slate-700">
            ประเภทเว็บไซต์
          </label>
          <select
            id="edit-project-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="flex-1"
            onClick={onClose}
            disabled={saving}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            size="md"
            className="flex-1"
            loading={saving}
            disabled={!name.trim() || saving}
          >
            <Pencil className="w-4 h-4" />
            บันทึก
          </Button>
        </div>
      </form>
    </Modal>
  );
}
