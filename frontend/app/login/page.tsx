"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogIn,
  User,
  Sparkles,
  ArrowRight,
  Loader2,
  Brain,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getDemoUser, getProfile } from "@/lib/api";
import Button from "@/components/ui/Button";

const DEMO_USERS = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 24,
    goal: "Fat Loss",
    diet: "Indian Vegetarian",
    emoji: "🌿",
  },
  {
    id: "2",
    name: "Arjun Mehta",
    age: 31,
    goal: "Muscle Gain",
    diet: "Non-Vegetarian",
    emoji: "💪",
  },
  {
    id: "3",
    name: "Suresh Patel",
    age: 45,
    goal: "Better Health",
    diet: "Vegetarian",
    emoji: "🏃",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [manualUserId, setManualUserId] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleDemoLogin = async (userType: string) => {
    setLoading(`demo-${userType}`);
    setError("");
    try {
      const demo = await getDemoUser(userType);
      login(demo.user_id);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Demo login failed. Is the backend running?");
    } finally {
      setLoading(null);
    }
  };

  const handleManualLogin = async () => {
    if (!manualUserId.trim()) return;
    setLoading("manual");
    setError("");
    try {
      await getProfile(manualUserId.trim());
      login(manualUserId.trim());
      router.push("/dashboard");
    } catch {
      // Profile doesn't exist — go to onboarding
      login(manualUserId.trim());
      router.push("/onboarding");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Welcome Back</h1>
          <p className="mt-2 text-gray-500">
            Sign in to get your daily health decision
          </p>
        </div>

        {/* Demo Login */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-accent-500" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Quick Demo Login
            </h2>
          </div>
          <div className="space-y-3">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.id}
                onClick={() => handleDemoLogin(demo.id)}
                disabled={loading !== null}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-brand-50 hover:border-brand-200 hover:shadow-sm transition-all group disabled:opacity-50"
              >
                <span className="text-2xl">{demo.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[#0F172A] group-hover:text-brand-700 transition-colors">
                    {demo.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {demo.age} yrs · {demo.goal} · {demo.diet}
                  </p>
                </div>
                {loading === `demo-${demo.id}` ? (
                  <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-sm text-gray-400 bg-[#F7F5F0]">
              or continue with your User ID
            </span>
          </div>
        </div>

        {/* Manual User ID */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Enter Your User ID
            </h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualUserId}
              onChange={(e) => setManualUserId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualLogin()}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              placeholder="e.g. my-user-id"
            />
            <Button
              onClick={handleManualLogin}
              disabled={!manualUserId.trim() || loading === "manual"}
              loading={loading === "manual"}
              className="px-5"
            >
              <LogIn className="w-4 h-4" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            If you already have a profile, you&apos;ll go to your dashboard. Otherwise, we&apos;ll set one up.
          </p>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm text-red-500 text-center bg-red-50 border border-red-100 rounded-xl p-3"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
