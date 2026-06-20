"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  ClipboardCheck,
  BarChart3,
  User,
  ArrowRight,
  CalendarClock,
  Trophy,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getTodayCheckin, getTodayDecision } from "@/lib/api";
import DecisionCard from "@/components/DecisionCard";
import ConsistencyScore from "@/components/ConsistencyScore";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface CheckInData {
  checkin_date: string;
  sleep_hours?: number;
  meals_description?: string;
  workout_done?: boolean;
  water_litres?: number;
  mood_energy?: number;
  notes?: string;
  consistency_score?: number;
  score_breakdown?: Record<string, { score: number; max: number; note: string }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { userId, profile, hasProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkin, setCheckin] = useState<CheckInData | null>(null);
  const [decision, setDecision] = useState<any>(null);
  const [error, setError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userId) {
      router.push("/login");
    }
  }, [userId, authLoading, router]);

  // Redirect to onboarding if no profile
  useEffect(() => {
    if (!authLoading && userId && !hasProfile) {
      router.push("/onboarding");
    }
  }, [userId, hasProfile, authLoading, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!userId || !hasProfile) return;

    setLoading(true);
    setError("");

    Promise.all([
      getTodayCheckin(userId).catch(() => null),
      getTodayDecision(userId).catch(() => null),
    ])
      .then(([checkinData, decisionData]) => {
        setCheckin(checkinData);
        setDecision(decisionData);
      })
      .catch(() => {
        setError("Could not load dashboard data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, hasProfile]);

  if (authLoading || !userId || !hasProfile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
          👋 Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s your health snapshot for today
        </p>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
      >
        <Link
          href="/checkin"
          className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-sm">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A] group-hover:text-brand-600 transition-colors">
              Check-In
            </p>
            <p className="text-xs text-gray-400">Log today</p>
          </div>
        </Link>

        <Link
          href="/report"
          className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A] group-hover:text-accent-600 transition-colors">
              Report
            </p>
            <p className="text-xs text-gray-400">Weekly trends</p>
          </div>
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A] group-hover:text-brand-600 transition-colors">
              Profile
            </p>
            <p className="text-xs text-gray-400">Your details</p>
          </div>
        </Link>

        <Link
          href="/login"
          className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-sm">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A] group-hover:text-gray-600 transition-colors">
              Switch User
            </p>
            <p className="text-xs text-gray-400">or demo</p>
          </div>
        </Link>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left column — Decision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {decision ? (
              <DecisionCard decision={decision} />
            ) : checkin ? (
              /* Has check-in but no decision yet */
              <div className="rounded-2xl bg-white border border-gray-100 shadow-lg p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                  Decision Ready to Generate
                </h3>
                <p className="text-gray-500 mb-6">
                  Your check-in is saved. Generate your AI-powered decision now.
                </p>
                <Link
                  href="/checkin"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold shadow-lg hover:bg-brand-600 hover:-translate-y-0.5 transition-all"
                >
                  <Zap className="w-4 h-4" /> Generate Decision
                </Link>
              </div>
            ) : (
              /* No check-in today */
              <div className="rounded-2xl bg-white border border-gray-100 shadow-lg p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CalendarClock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                  No Check-In Today
                </h3>
                <p className="text-gray-500 mb-6">
                  Start your day by logging your health data. Takes just a minute.
                </p>
                <Link
                  href="/checkin"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold shadow-lg hover:bg-brand-600 hover:-translate-y-0.5 transition-all"
                >
                  <ClipboardCheck className="w-4 h-4" /> Check In Now
                </Link>
              </div>
            )}
          </motion.div>

          {/* Right column — Score + latest check-in summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Consistency Score */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-accent-500" />
                <h3 className="font-semibold text-[#0F172A]">Consistency Score</h3>
              </div>
              {checkin?.consistency_score !== undefined ? (
                <ConsistencyScore
                  score={checkin.consistency_score}
                  breakdown={checkin.score_breakdown}
                  size="sm"
                />
              ) : (
                <div className="py-8">
                  <p className="text-gray-400 text-sm">
                    Complete a check-in to see your score
                  </p>
                  <Link
                    href="/checkin"
                    className="inline-flex items-center gap-1 mt-3 text-sm text-brand-500 hover:text-brand-600 font-medium"
                  >
                    <ClipboardCheck className="w-3 h-3" /> Check in now
                  </Link>
                </div>
              )}
            </div>

            {/* Latest check-in summary */}
            {checkin && (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-brand-500" />
                    <h3 className="font-semibold text-[#0F172A]">Today&apos;s Check-In</h3>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(checkin.checkin_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Sleep", value: checkin.sleep_hours ? `${checkin.sleep_hours}h` : "—" },
                    { label: "Workout", value: checkin.workout_done === true ? "Done ✅" : checkin.workout_done === false ? "Missed ❌" : "—" },
                    { label: "Water", value: checkin.water_litres ? `${checkin.water_litres}L` : "—" },
                    { label: "Mood", value: checkin.mood_energy ? `${checkin.mood_energy}/10` : "—" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 rounded-xl bg-accent-50 border border-accent-100 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-accent-500 flex-shrink-0" />
          <p className="text-sm text-accent-700">
            {error}
          </p>
        </motion.div>
      )}
    </div>
  );
}
