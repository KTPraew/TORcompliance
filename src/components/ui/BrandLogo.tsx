"use client";

import { useId } from "react";

/* ─── mark ───────────────────────────────────────────────────────────────── */

interface BrandLogoMarkProps {
  size?: number;
  className?: string;
}

export function BrandLogoMark({ size = 32, className = "" }: BrandLogoMarkProps) {
  const uid = useId().replace(/:/g, "");
  const gId = `blg${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
      </defs>
      {/* Background */}
      <rect width="32" height="32" rx="8" fill={`url(#${gId})`} />
      {/* Top-left highlight */}
      <ellipse cx="10" cy="3" rx="15" ry="7" fill="white" fillOpacity="0.07" />
      {/* Shield */}
      <path
        d="M16 5L7 9V17C7 22.2 11 26.5 16 28C21 26.5 25 22.2 25 17V9L16 5Z"
        fill="rgba(255,255,255,0.10)"
        stroke="rgba(255,255,255,0.80)"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* Check */}
      <polyline
        points="11,16.5 14.5,20.5 21,11.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── lockup ─────────────────────────────────────────────────────────────── */

type LogoSize    = "sm" | "md" | "lg";
type LogoVariant = "dark" | "light";

interface BrandLogoProps {
  size?:          LogoSize;
  variant?:       LogoVariant;
  title?:         string;
  subtitle?:      string | false;
  markClassName?: string;
}

const SIZES: Record<LogoSize, { mark: number; titleCls: string; subtitleCls: string; gap: string }> = {
  sm: { mark: 28, titleCls: "text-sm",   subtitleCls: "text-[10px]", gap: "gap-2"   },
  md: { mark: 32, titleCls: "text-base", subtitleCls: "text-[10px]", gap: "gap-2.5" },
  lg: { mark: 36, titleCls: "text-lg",   subtitleCls: "text-[11px]", gap: "gap-3"   },
};

export function BrandLogo({
  size          = "md",
  variant       = "dark",
  title         = "TOR Compliance",
  subtitle      = "AI Platform",
  markClassName = "",
}: BrandLogoProps) {
  const { mark, titleCls, subtitleCls, gap } = SIZES[size];
  const dark = variant === "dark";

  return (
    <div className={`flex items-center ${gap} min-w-0`}>
      <BrandLogoMark size={mark} className={`flex-shrink-0 ${markClassName}`} />
      <div className="leading-none min-w-0">
        <span
          className={`block font-bold tracking-tight truncate ${titleCls}`}
          style={{ color: dark ? "#ffffff" : "#0f172a" }}
        >
          {title}
        </span>
        {subtitle !== false && (
          <span
            className={`block font-semibold tracking-widest uppercase mt-0.5 ${subtitleCls}`}
            style={{ color: dark ? "#34d399" : "#059669" }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
