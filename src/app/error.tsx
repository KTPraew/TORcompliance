"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafb] p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-sm text-slate-500 mb-6">
          {error.message || "ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง"}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          ลองใหม่
        </button>
      </div>
    </div>
  );
}
