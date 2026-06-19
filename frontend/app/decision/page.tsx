"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, RefreshCw, ArrowRight } from "lucide-react";
import DecisionCard from "@/components/DecisionCard";
import Button from "@/components/ui/Button";
import { generateDecision, getTodayDecision } from "@/lib/api";

export default function DecisionPage() {
  const [userId, setUserId] = useState("");
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      // Try to get existing decision first (cached)
      try {
        const existing = await getTodayDecision(userId);
        setDecision(existing);
        setLoading(false);
        return;
      } catch {
        // No existing decision, generate new one
        const result = await generateDecision(userId);
        setDecision(result);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate decision. Make sure you have a profile and check-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Your Health Decision</h1>
        <p className="mt-2 text-gray-500">
          AI-powered personalized decision based on your daily check-in.
        </p>
      </motion.div>

      {/* User ID Input */}
      {!decision && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 mb-8">
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
          <Button onClick={handleGenerate} disabled={!userId} loading={loading} className="w-full">
            <Brain className="w-4 h-4" /> Generate My Decision
          </Button>
        </div>
      )}

      {/* Decision Card */}
      {decision && (
        <>
          <DecisionCard decision={decision} />
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/report"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold shadow-lg hover:bg-brand-600 hover:-translate-y-0.5 transition-all"
            >
              View Weekly Report <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setDecision(null)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-700 border border-gray-200 font-semibold hover:-translate-y-0.5 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Generate Again
            </button>
          </div>
        </>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-sm text-red-500 text-center bg-red-50 border border-red-100 rounded-xl p-4"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
