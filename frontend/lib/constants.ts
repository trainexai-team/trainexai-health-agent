export const GOALS = [
  { value: "fat_loss", label: "Fat Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "general_fitness", label: "General Fitness" },
  { value: "better_consistency", label: "Better Consistency" },
  { value: "weight_maintenance", label: "Weight Maintenance" },
];

export const DIET_PREFERENCES = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "non_vegetarian", label: "Non-Vegetarian" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "indian_vegetarian", label: "Indian Vegetarian" },
  { value: "no_preference", label: "No Preference" },
];

export const FITNESS_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const SCORE_COLORS = {
  excellent: { color: "text-brand-600", bg: "bg-brand-100", ring: "ring-brand-500" },
  good: { color: "text-brand-500", bg: "bg-brand-50", ring: "ring-brand-400" },
  average: { color: "text-accent-500", bg: "bg-accent-100", ring: "ring-accent-500" },
  low: { color: "text-orange-600", bg: "bg-orange-100", ring: "ring-orange-500" },
  poor: { color: "text-red-600", bg: "bg-red-100", ring: "ring-red-500" },
};

export function getScoreColor(score: number) {
  if (score >= 80) return SCORE_COLORS.excellent;
  if (score >= 65) return SCORE_COLORS.good;
  if (score >= 50) return SCORE_COLORS.average;
  if (score >= 35) return SCORE_COLORS.low;
  return SCORE_COLORS.poor;
}

export const SAFETY_DISCLAIMER =
  "TrainexAI provides fitness and nutrition guidance only. It does not diagnose, treat, or replace medical professionals. Always consult a qualified healthcare provider for medical concerns.";
