"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Apple,
  Dumbbell,
  Target,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getScoreColor, SAFETY_DISCLAIMER } from "@/lib/constants";

interface DecisionCardProps {
  decision: {
    main_decision: string;
    nutrition_action: string;
    workout_action: string;
    accountability_message: string;
    consistency_score: number;
    score_breakdown?: Record<string, { score: number; max: number; note: string }>;
    is_fallback?: boolean;
    decision_date?: string;
  };
  loading?: boolean;
}

export default function DecisionCard({ decision, loading }: DecisionCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 shadow-lg p-8 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const scoreColor = getScoreColor(decision.consistency_score);
  const actions = [
    {
      icon: Apple,
      label: "Nutrition Action",
      value: decision.nutrition_action,
      bg: "bg-green-50 border-green-100",
    },
    {
      icon: Dumbbell,
      label: "Workout Action",
      value: decision.workout_action,
      bg: "bg-accent-50 border-accent-100",
    },
    {
      icon: Target,
      label: "Accountability",
      value: decision.accountability_message,
      bg: "bg-blue-50 border-blue-100",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-gray-100 shadow-lg overflow-hidden"
    >
      {/* Header - navy gradient */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-700 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            <h3 className="text-lg font-bold">Today&apos;s Health Decision</h3>
          </div>
          {decision.is_fallback && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent-400/20 text-accent-200 text-xs font-medium">
              <RefreshCw className="w-3 h-3" /> Fallback
            </span>
          )}
          {!decision.is_fallback && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" /> AI Generated
            </span>
          )}
        </div>
        {decision.decision_date && (
          <p className="text-sm text-white/70">{formatDate(decision.decision_date)}</p>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Main Decision */}
        <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
          <p className="text-brand-800 font-medium leading-relaxed">{decision.main_decision}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {actions.map((action, idx) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-xl border ${action.bg}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{action.label}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{action.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Score breakdown */}
        {decision.score_breakdown && (
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Score Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(decision.score_breakdown).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">{key}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-brand-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(val.score / val.max) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-500 font-medium w-16 text-right">
                      {val.score}/{val.max}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-50 border border-accent-100">
          <AlertTriangle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-accent-700 leading-relaxed">{SAFETY_DISCLAIMER}</p>
        </div>
      </div>
    </motion.div>
  );
}
