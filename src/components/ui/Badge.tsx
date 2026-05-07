import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
  {
    variants: {
      variant: {
        pass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        fail: "bg-red-50 text-red-700 border-red-200",
        review: "bg-amber-50 text-amber-700 border-amber-200",
        pending: "bg-slate-100 text-slate-600 border-slate-200",
        info: "bg-emerald-50 text-emerald-700 border-emerald-200",
        primary: "bg-primary/10 text-emerald-700 border-primary/20",
        completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
        in_progress: "bg-amber-50 text-amber-700 border-amber-200",
        critical: "bg-red-50 text-red-700 border-red-200",
        major: "bg-orange-50 text-orange-700 border-orange-200",
        minor: "bg-yellow-50 text-yellow-700 border-yellow-200",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "pending",
      size: "md",
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              variant === "pass" || variant === "completed" ? "bg-emerald-500" :
              variant === "fail" || variant === "critical" ? "bg-red-500" :
              variant === "review" || variant === "major" ? "bg-amber-500" :
              variant === "in_progress" ? "bg-amber-500" :
              variant === "info" ? "bg-emerald-500" :
              "bg-slate-400"
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };

export function StatusBadge({ status }: { status: string }) {
  type BadgeVariant = "pass" | "fail" | "review" | "pending" | "completed" | "in_progress";
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    pass:        { label: "ผ่าน",           variant: "pass"        },
    fail:        { label: "ไม่ผ่าน",        variant: "fail"        },
    review:      { label: "ควรปรับปรุง",    variant: "review"      },
    pending:     { label: "รอการวิเคราะห์", variant: "pending"     },
    completed:   { label: "วิเคราะห์แล้ว",  variant: "completed"   },
    in_progress: { label: "กำลังตรวจสอบ",  variant: "in_progress" },
  };

  const config = map[status] || { label: status, variant: "pending" };

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
