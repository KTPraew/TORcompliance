"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ComplianceScoreProps {
  score: number;
  size?: number;
  label?: string;
  sublabel?: string;
}

export function ComplianceScore({
  score,
  size = 160,
  label,
  sublabel,
}: ComplianceScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const radius = size / 2 - 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const stepValue = score / steps;
    let current = 0;

    const timer = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        current += stepValue;
        if (current >= score) {
          setAnimatedScore(score);
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, duration / steps);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 90) return { stroke: "#10b981", text: "text-emerald-600", bg: "#ecfdf5" };
    if (s >= 70) return { stroke: "#3b82f6", text: "text-emerald-600", bg: "#eff6ff" };
    if (s >= 50) return { stroke: "#f59e0b", text: "text-amber-600", bg: "#fffbeb" };
    return { stroke: "#ef4444", text: "text-red-600", bg: "#fef2f2" };
  };

  const colors = getColor(score);

  const getLabel = (s: number) => {
    if (s >= 90) return "ผ่านเกณฑ์ดีเยี่ยม";
    if (s >= 70) return "ผ่านเกณฑ์";
    if (s >= 50) return "ต้องปรับปรุง";
    return "ไม่ผ่านเกณฑ์";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={12}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-4xl font-bold ${colors.text}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {animatedScore}
          </motion.span>
          <span className="text-sm text-slate-400 font-medium">/ 100</span>
        </div>
      </div>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${colors.text}`}
          style={{ backgroundColor: colors.bg }}
        >
          {label || getLabel(score)}
        </div>
        {sublabel && (
          <p className="text-xs text-slate-500 mt-1.5">{sublabel}</p>
        )}
      </motion.div>
    </div>
  );
}
