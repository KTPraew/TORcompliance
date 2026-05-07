"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CloudUpload, FileText, Image, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
  accept?: Record<string, string[]>;
  label?: string;
  sublabel?: string;
  icon?: "document" | "image";
  maxSize?: number;
  acceptedFile?: File | null;
  onClear?: () => void;
  disabled?: boolean;
}

export function DropZone({
  onFileAccepted,
  accept = {
    "application/pdf": [".pdf"],
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
  },
  label = "อัปโหลดไฟล์ TOR",
  sublabel = "รองรับ PDF, PNG, JPG ขนาดไม่เกิน 30MB",
  icon = "document",
  maxSize = 30 * 1024 * 1024,
  acceptedFile,
  onClear,
  disabled = false,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);
      setIsDragOver(false);

      if (rejectedFiles.length > 0) {
        const err = rejectedFiles[0].errors[0];
        if (err.code === "file-too-large") {
          setError("ไฟล์มีขนาดใหญ่เกินไป กรุณาเลือกไฟล์ขนาดไม่เกิน 30MB");
        } else if (err.code === "file-invalid-type") {
          setError("ไฟล์ประเภทนี้ไม่รองรับ กรุณาเลือกไฟล์ PDF หรือรูปภาพ");
        } else {
          setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (acceptedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative border-2 border-emerald-200 bg-emerald-50 rounded-2xl p-6 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          {acceptedFile.type.includes("image") ? (
            <Image className="w-6 h-6 text-emerald-600" />
          ) : (
            <FileText className="w-6 h-6 text-emerald-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-800 truncate">{acceptedFile.name}</p>
          </div>
          <p className="text-xs text-emerald-600 ml-6">
            {formatFileSize(acceptedFile.size)} · พร้อมวิเคราะห์
          </p>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            aria-label="ลบไฟล์ที่เลือก"
            className="w-9 h-9 rounded-lg hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer",
          isDragActive || isDragOver
            ? "border-primary bg-primary/5 shadow-lg"
            : "border-slate-200 bg-white hover:border-primary/40 hover:bg-primary/2",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-300 bg-red-50"
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {isDragActive ? (
            <motion.div
              key="drag"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <p className="text-sm font-semibold text-emerald-700">วางไฟล์ที่นี่</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CloudUpload className="w-7 h-7 text-emerald-700" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">+</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
                <p className="text-xs text-slate-400">{sublabel}</p>
                <p className="text-xs text-emerald-700 mt-1.5 font-medium">
                  คลิกเพื่อเลือกไฟล์ หรือลากและวางที่นี่
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500 mt-2 flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
