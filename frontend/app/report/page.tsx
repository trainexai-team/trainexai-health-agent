"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Moon,
  Dumbbell,
  Apple,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import WeeklyReportChart from "@/components/WeeklyReportChart";
import { getWeeklyReport } from "@/lib/api";

export default function ReportPage() {
  const [userId, setUserId] = useState("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetReport = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const result = await getWeeklyReport(userId);
      setReport(result);
    } catch (err: any) {
      setError(err.message || "Failed to get report. Make sure you have check-in data.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = report
    ? {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        scores: [55, 60, 75, 50, 80, 65, report.avg_consistency_score],
        sleepData: [5.5, 6, 7.5, 5, 8, 7, 6.5],
      }
    : { labels: [], scores: [], sleepData: [] };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-500/20">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Weekly Health Report</h1>
        <p className="mt-2 text-gray-500">
          Your weekly trends, improvements, and next week plan.
        </p>
      </motion.div>

      {/* User ID Input */}
      {!report && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 mb-8 max-w-md mx-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              placeholder="e.g. demo-user-001"
            />
          </div>
          <Button onClick={handleGetReport} disabled={!userId} loading={loading} className="w-full">
            <BarChart3 className="w-4 h-4" /> Get My Report
          </Button>
          {error && (
            <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
          )}
        </div>
      )}

      {/* Report content */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Avg Consistency",
                value: `${Math.round(report.avg_consistency_score)}`,
                suffix: "/100",
                icon: Activity,
                gradient: "from-brand-500 to-brand-600",
              },
              {
                label: "Workout Adherence",
                value: `${Math.round(report.workout_adherence)}`,
                suffix: "%",
                icon: Dumbbell,
                gradient: "from-accent-500 to-accent-600",
              },
              {
                label: "Best Improvement",
                value: "Fitness",
                suffix: "",
                icon: TrendingUp,
                gradient: "from-brand-400 to-brand-600",
              },
              {
                label: "Focus Area",
                value: "Sleep",
                suffix: "",
                icon: Moon,
                gradient: "from-brand-600 to-brand-700",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-[#0F172A]">
                  {stat.value}
                  <span className="text-sm font-normal text-gray-400">{stat.suffix}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Weekly Trends</h3>
            <WeeklyReportChart data={chartData} />
          </div>

          {/* Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Moon className="w-5 h-5 text-brand-500" />
                <h3 className="font-semibold text-[#0F172A]">Sleep Trend</h3>
              </div>
              <p className="text-sm text-gray-600">{report.sleep_trend}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Apple className="w-5 h-5 text-brand-500" />
                <h3 className="font-semibold text-[#0F172A]">Nutrition Trend</h3>
              </div>
              <p className="text-sm text-gray-600">{report.nutrition_trend}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-brand-500" />
                <h3 className="font-semibold text-[#0F172A]">Biggest Improvement</h3>
              </div>
              <p className="text-sm text-gray-600">{report.biggest_improvement}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-accent-500" />
                <h3 className="font-semibold text-[#0F172A]">Biggest Problem</h3>
              </div>
              <p className="text-sm text-gray-600">{report.biggest_problem}</p>
            </div>
          </div>

          {/* Next week plan */}
          <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6" />
              <h3 className="text-xl font-bold">Next Week Plan</h3>
            </div>
            <p className="text-white/90 leading-relaxed">{report.next_week_plan}</p>
          </div>

          {/* Back button */}
          <div className="text-center">
            <button
              onClick={() => setReport(null)}
              className="px-6 py-3 rounded-xl bg-white text-gray-700 border border-gray-200 font-semibold hover:-translate-y-0.5 transition-all"
            >
              Check Another User
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
