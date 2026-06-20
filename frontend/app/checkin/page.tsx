"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
  Brain,
  Loader2,
} from "lucide-react";
import CheckInForm, { CheckInFormData } from "@/components/CheckInForm";
import ConsistencyScore from "@/components/ConsistencyScore";
import { useAuth } from "@/lib/auth";
import { createCheckin, generateDecision } from "@/lib/api";
import Button from "@/components/ui/Button";

export default function CheckInPage() {
  const router = useRouter();
  const { userId, hasProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    consistency_score: number;
    score_breakdown: Record<string, { score: number; max: number; note: string }>;
  } | null>(null);
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

  const handleSubmit = async (data: CheckInFormData) => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const res = await createCheckin({ ...data, user_id: userId });
      setResult({
        consistency_score: res.consistency_score,
        score_breakdown: res.score_breakdown,
      });
    } catch (err: any) {
      setError(err.message || "Check-in failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAndGoToDashboard = async () => {
    if (!userId) return;
    setGenerating(true);
    try {
      await generateDecision(userId);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to generate decision.");
      setGenerating(false);
    }
  };

  if (authLoading || !userId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
          <ClipboardCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Daily Check-In</h1>
        <p className="mt-2 text-gray-500">
          Log your sleep, meals, workout, water, and mood for today.
        </p>
      </motion.div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
        {result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-brand-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Check-In Complete!</h2>

            <ConsistencyScore
              score={result.consistency_score}
              breakdown={result.score_breakdown}
              size="md"
            />

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGenerateAndGoToDashboard}
                loading={generating}
                className="flex-1"
              >
                <Brain className="w-4 h-4" /> Generate Decision & Go to Dashboard
              </Button>
              <button
                onClick={() => setResult(null)}
                className="px-6 py-3 rounded-xl bg-white text-gray-700 border border-gray-200 font-semibold hover:-translate-y-0.5 transition-all"
              >
                Check In Again
              </button>
            </div>
            <div className="mt-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip to dashboard
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-4 p-3 rounded-xl bg-brand-50 border border-brand-100">
              <p className="text-sm text-brand-700">
                Checking in as <span className="font-mono font-medium">{userId}</span>
              </p>
            </div>
            <CheckInForm onSubmit={handleSubmit} loading={loading} defaultUserId={userId} />
          </>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm text-red-500 text-center"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}
