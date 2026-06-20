"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Pencil,
  UserCircle,
} from "lucide-react";
import ProfileForm, { ProfileFormData } from "@/components/ProfileForm";
import { useAuth } from "@/lib/auth";
import { createProfile } from "@/lib/api";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
  const router = useRouter();
  const { userId, profile, hasProfile, loading: authLoading, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userId) {
      router.push("/login");
    }
  }, [userId, authLoading, router]);

  const handleSubmit = async (data: ProfileFormData) => {
    if (!userId) return;
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await createProfile({ ...data, user_id: userId });
      await refreshProfile();
      setEditing(false);
      setSuccessMessage("Profile updated!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setLoading(false);
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
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Your Profile</h1>
        <p className="mt-2 text-gray-500">
          {hasProfile
            ? "Your health profile and preferences"
            : "Set up your profile to get personalized decisions"}
        </p>
      </motion.div>

      {/* Success message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <p className="text-sm text-green-700 font-medium">{successMessage}</p>
        </motion.div>
      )}

      {/* Profile card (view mode) */}
      {hasProfile && !editing ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">{profile?.name}</h2>
                <p className="text-sm text-gray-400">
                  User ID: <span className="font-mono">{userId}</span>
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              <Pencil className="w-3 h-3" /> Edit
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Age", value: profile?.age },
              { label: "Gender", value: profile?.gender || "Not specified" },
              {
                label: "Height",
                value: profile?.height_cm ? `${profile.height_cm} cm` : "Not set",
              },
              {
                label: "Weight",
                value: profile?.weight_kg ? `${profile.weight_kg} kg` : "Not set",
              },
              {
                label: "Goal",
                value: profile?.goal
                  ? profile.goal.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                  : "Not set",
                highlight: true,
              },
              {
                label: "Diet Preference",
                value: profile?.diet_preference
                  ? profile.diet_preference.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                  : "No preference",
              },
              {
                label: "Fitness Level",
                value: profile?.fitness_level
                  ? profile.fitness_level.charAt(0).toUpperCase() + profile.fitness_level.slice(1)
                  : "Not set",
                highlight: true,
              },
              {
                label: "Injury Notes",
                value: profile?.injury_note || "None",
              },
            ].map((field) => (
              <div
                key={field.label}
                className={`p-4 rounded-xl border ${
                  field.highlight
                    ? "bg-brand-50 border-brand-100"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {field.label}
                </p>
                <p
                  className={`mt-1 font-semibold ${
                    field.highlight ? "text-brand-700" : "text-[#0F172A]"
                  }`}
                >
                  {field.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button onClick={() => router.push("/dashboard")} className="flex-1">
              <ArrowRight className="w-4 h-4" /> Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/checkin")}
              className="flex-1"
            >
              Go to Check-In
            </Button>
          </div>
        </motion.div>
      ) : (
        /* Edit / Create mode */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
          {hasProfile && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">Editing your profile</p>
              <button
                onClick={() => setEditing(false)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
          <ProfileForm
            onSubmit={handleSubmit}
            loading={loading}
            initialData={
              profile
                ? {
                    user_id: userId,
                    name: profile.name,
                    age: profile.age,
                    gender: profile.gender,
                    height_cm: profile.height_cm,
                    weight_kg: profile.weight_kg,
                    goal: profile.goal,
                    diet_preference: profile.diet_preference,
                    fitness_level: profile.fitness_level,
                    injury_note: profile.injury_note,
                  }
                : { user_id: userId }
            }
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
      )}
    </div>
  );
}
