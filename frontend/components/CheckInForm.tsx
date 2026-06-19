"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareText, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/ui/Button";

interface CheckInFormProps {
  onSubmit: (data: CheckInFormData) => void;
  loading?: boolean;
}

export interface CheckInFormData {
  user_id: string;
  sleep_hours?: number;
  meals_description?: string;
  workout_done?: boolean;
  water_litres?: number;
  mood_energy?: number;
  notes?: string;
  raw_text?: string;
}

export default function CheckInForm({ onSubmit, loading }: CheckInFormProps) {
  const [userId, setUserId] = useState("");
  const [rawText, setRawText] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [fields, setFields] = useState({
    sleep_hours: undefined as number | undefined,
    meals_description: "",
    workout_done: undefined as boolean | undefined,
    water_litres: undefined as number | undefined,
    mood_energy: undefined as number | undefined,
    notes: "",
  });

  const handleQuickSubmit = () => {
    if (!userId || !rawText) return;
    onSubmit({
      user_id: userId,
      raw_text: rawText,
      ...fields,
    });
  };

  const handleFormSubmit = () => {
    if (!userId) return;
    onSubmit({
      user_id: userId,
      ...fields,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* User ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
          placeholder="e.g. demo-user-001"
        />
      </div>

      {/* Quick text check-in */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquareText className="w-4 h-4 text-brand-500" />
          <label className="text-sm font-medium text-gray-700">Quick Text Check-In</label>
        </div>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all resize-none"
          rows={3}
          placeholder='e.g. "I slept 5 hours, ate 3 idlis with sambar and tea, skipped workout, drank 1 litre water."'
        />
        <Button
          onClick={handleQuickSubmit}
          disabled={!userId || !rawText}
          loading={loading}
          className="w-full mt-2"
        >
          Quick Check-In
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-sm text-gray-400 bg-white">or fill detailed form</span>
        </div>
      </div>

      {/* Toggle advanced fields */}
      <button
        type="button"
        onClick={() => setAdvancedOpen(!advancedOpen)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        {advancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {advancedOpen ? "Hide Fields" : "Show All Fields"}
      </button>

      {advancedOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4"
        >
          {/* Sleep */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sleep (hours)</label>
            <input
              type="number"
              value={fields.sleep_hours || ""}
              onChange={(e) => setFields({ ...fields, sleep_hours: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              placeholder="e.g. 7"
              step={0.5}
              min={0}
              max={24}
            />
          </div>

          {/* Meals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meals Description</label>
            <input
              type="text"
              value={fields.meals_description}
              onChange={(e) => setFields({ ...fields, meals_description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              placeholder="What did you eat?"
            />
          </div>

          {/* Workout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workout</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="workout"
                  checked={fields.workout_done === true}
                  onChange={() => setFields({ ...fields, workout_done: true })}
                  className="w-4 h-4 text-brand-500"
                />
                <span className="text-sm text-gray-700">Done</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="workout"
                  checked={fields.workout_done === false}
                  onChange={() => setFields({ ...fields, workout_done: false })}
                  className="w-4 h-4 text-brand-500"
                />
                <span className="text-sm text-gray-700">Missed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="workout"
                  checked={fields.workout_done === undefined}
                  onChange={() => setFields({ ...fields, workout_done: undefined })}
                  className="w-4 h-4 text-gray-400"
                />
                <span className="text-sm text-gray-400">Skip</span>
              </label>
            </div>
          </div>

          {/* Water */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Water (litres)</label>
            <input
              type="number"
              value={fields.water_litres || ""}
              onChange={(e) => setFields({ ...fields, water_litres: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              placeholder="e.g. 2"
              step={0.5}
              min={0}
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mood / Energy (1-10)</label>
            <input
              type="number"
              value={fields.mood_energy || ""}
              onChange={(e) => setFields({ ...fields, mood_energy: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              min={1}
              max={10}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={fields.notes}
              onChange={(e) => setFields({ ...fields, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all resize-none"
              rows={2}
              placeholder="Any additional notes..."
            />
          </div>

          <Button onClick={handleFormSubmit} disabled={!userId} loading={loading} className="w-full">
            Submit Check-In
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
