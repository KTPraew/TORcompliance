import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafb]">
      <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" aria-label="กำลังโหลด..." />
    </div>
  );
}
