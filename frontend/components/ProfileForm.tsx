"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, ChevronRight } from "lucide-react";
import { GOALS, DIET_PREFERENCES, FITNESS_LEVELS } from "@/lib/constants";
import Button from "@/components/ui/Button";

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => void;
  loading?: boolean;
  initialData?: Partial<ProfileFormData>;
}

export interface ProfileFormData {
  user_id: string;
  name: string;
  age: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  goal: string;
  diet_preference?: string;
  fitness_level: string;
  injury_note?: string;
}

export default function ProfileForm({ onSubmit, loading, initialData }: ProfileFormProps) {
  const [form, setForm] = useState<ProfileFormData>({
    user_id: initialData?.user_id || "",
    name: initialData?.name || "",
    age: initialData?.age || 25,
    gender: initialData?.gender || "",
    height_cm: initialData?.height_cm || undefined,
    weight_kg: initialData?.weight_kg || undefined,
    goal: initialData?.goal || "",
    diet_preference: initialData?.diet_preference || "",
    fitness_level: initialData?.fitness_level || "",
    injury_note: initialData?.injury_note || "",
  });

  const isValid = form.name && form.age > 0 && form.goal && form.fitness_level;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(form);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
          placeholder="Your name"
        />
      </div>

      {/* Age & Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
          <input
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            min={1}
            max={120}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender (optional)</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all bg-white"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Height & Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm, optional)</label>
          <input
            type="number"
            value={form.height_cm || ""}
            onChange={(e) => setForm({ ...form, height_cm: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            placeholder="e.g. 170"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg, optional)</label>
          <input
            type="number"
            value={form.weight_kg || ""}
            onChange={(e) => setForm({ ...form, weight_kg: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            placeholder="e.g. 70"
          />
        </div>
      </div>

      {/* Goal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Goal *</label>
        <select
          value={form.goal}
          onChange={(e) => setForm({ ...form, goal: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all bg-white"
        >
          <option value="">Select a goal</option>
          {GOALS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      {/* Diet Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Diet Preference</label>
        <select
          value={form.diet_preference}
          onChange={(e) => setForm({ ...form, diet_preference: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all bg-white"
        >
          <option value="">No preference</option>
          {DIET_PREFERENCES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Fitness Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Level *</label>
        <select
          value={form.fitness_level}
          onChange={(e) => setForm({ ...form, fitness_level: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all bg-white"
        >
          <option value="">Select level</option>
          {FITNESS_LEVELS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Injury Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Injury Note (optional)</label>
        <textarea
          value={form.injury_note || ""}
          onChange={(e) => setForm({ ...form, injury_note: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all resize-none"
          rows={2}
          placeholder="Any injuries or limitations?"
        />
      </div>

      <Button type="submit" disabled={!isValid} loading={loading} className="w-full">
        Save Profile <ChevronRight className="w-4 h-4" />
      </Button>
    </motion.form>
  );
}
