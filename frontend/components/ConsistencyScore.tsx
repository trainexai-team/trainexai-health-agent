"use client";

import { motion } from "framer-motion";
import { getScoreColor } from "@/lib/constants";

interface ConsistencyScoreProps {
  score: number;
  breakdown?: Record<string, { score: number; max: number; note: string }>;
  size?: "sm" | "md" | "lg";
}

export default function ConsistencyScore({
  score,
  breakdown,
  size = "md",
}: ConsistencyScoreProps) {
  const scoreColor = getScoreColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    sm: { ring: "w-24 h-24", text: "text-xl", label: "text-[10px]" },
    md: { ring: "w-32 h-32", text: "text-3xl", label: "text-xs" },
    lg: { ring: "w-40 h-40", text: "text-4xl", label: "text-sm" },
  };

  const s = sizeClasses[size];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${s.ring}`}>
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="8"
          />
          {/* Score ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={scoreColor.color}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`font-bold ${s.text} text-gray-900`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className={`${s.label} text-gray-400 font-medium`}>/100</span>
        </div>
      </div>

      {/* Breakdown */}
      {breakdown && (
        <div className="w-full space-y-2">
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 capitalize font-medium">{key}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(val.score / val.max) * 100}%` }}
                  />
                </div>
                <span className="text-gray-400 text-xs w-16 text-right">
                  {val.score}/{val.max}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
