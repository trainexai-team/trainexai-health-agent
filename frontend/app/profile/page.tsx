"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, CheckCircle2 } from "lucide-react";
import ProfileForm, { ProfileFormData } from "@/components/ProfileForm";
import { createProfile } from "@/lib/api";
import { generateUserId } from "@/lib/utils";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userId] = useState(generateUserId());

  const handleSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setError("");
    try {
      await createProfile({ ...data, user_id: userId });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to create profile. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Your Health Profile</h1>
        <p className="mt-2 text-gray-500">
          Tell us about yourself so we can personalize your decisions.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-sm text-brand-700">
          Your User ID: <span className="font-mono font-medium">{userId}</span>
        </div>
      </motion.div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle2 className="w-16 h-16 text-brand-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Profile Saved!</h2>
            <p className="text-gray-500 mb-6">
              Your profile is ready. Now do a daily check-in to get your health decision.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/checkin"
                className="px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold shadow-lg hover:bg-brand-600 hover:-translate-y-0.5 transition-all"
              >
                Go to Check-In
              </a>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-3 rounded-xl bg-white text-gray-700 border border-gray-200 font-semibold hover:-translate-y-0.5 transition-all"
              >
                Edit Profile
              </button>
            </div>
          </motion.div>
        ) : (
          <ProfileForm onSubmit={handleSubmit} loading={loading} />
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
