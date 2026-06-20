"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import ProfileForm, { ProfileFormData } from "@/components/ProfileForm";
import { useAuth } from "@/lib/auth";
import { createProfile } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const { userId, login, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to login if no userId
  useEffect(() => {
    if (!userId) {
      router.push("/login");
    }
  }, [userId, router]);

  const handleSubmit = async (data: ProfileFormData) => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      await createProfile({ ...data, user_id: userId });
      await refreshProfile();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save profile. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Welcome! Let&apos;s Set Up Your Profile</h1>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">
          Tell us about yourself so we can personalize your daily health decisions.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-sm text-brand-700">
          Your User ID: <span className="font-mono font-medium">{userId}</span>
        </div>
      </motion.div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
        <ProfileForm
          onSubmit={handleSubmit}
          loading={loading}
          initialData={{ user_id: userId }}
        />

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
