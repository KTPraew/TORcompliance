"use client";

import { HTMLAttributes, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import * as RadixProgress from "@radix-ui/react-progress";

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "danger" | "auto";
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
}

export function Progress({
  value,
  max = 100,
  size = "md",
  color = "auto",
  animated = true,
  showLabel = false,
  label,
  className,
}: ProgressProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, animated]);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const getColor = () => {
    if (color === "auto") {
      if (percentage >= 80) return "bg-emerald-500";
      if (percentage >= 60) return "bg-blue-500";
      if (percentage >= 40) return "bg-amber-500";
      return "bg-red-500";
    }
    const colorMap = {
      primary: "gradient-primary",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      danger: "bg-red-500",
    };
    return colorMap[color] || "gradient-primary";
  };

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
          {showLabel && (
            <span className="text-xs font-semibold text-slate-700">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <RadixProgress.Root
        className={cn(
          "relative overflow-hidden rounded-full bg-slate-100",
          sizeClasses[size]
        )}
        value={displayValue}
      >
        <RadixProgress.Indicator
          className={cn(
            "h-full rounded-full transition-all ease-out",
            animated && "duration-700",
            getColor()
          )}
          style={{ width: `${displayValue}%` }}
        />
      </RadixProgress.Root>
    </div>
  );
}
