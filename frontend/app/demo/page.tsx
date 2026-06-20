"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ChevronRight,
  ArrowLeft,
  User,
  ClipboardCheck,
  Brain,
  Award,
  BarChart3,
  Rocket,
  Sparkles,
  CheckCircle2,
  Loader2,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getDemoUser, generateDecision, getWeeklyReport } from "@/lib/api";
import DecisionCard from "@/components/DecisionCard";
import ConsistencyScore from "@/components/ConsistencyScore";

const DEMO_STEPS = [
  {
    id: "welcome",
    title: "Welcome to the Demo",
    subtitle: "3-minute walkthrough",
    icon: Play,
    color: "from-brand-500 to-brand-600",
  },
  {
    id: "problem",
    title: "The Problem",
    subtitle: "Why most health goals fail",
    icon: Sparkles,
    color: "from-brand-500 to-brand-700",
  },
  {
    id: "profile",
    title: "Step 1: Create Profile",
    subtitle: "Age 24, Fat Loss, Indian Vegetarian",
    icon: User,
    color: "from-brand-500 to-brand-600",
  },
  {
    id: "checkin",
    title: "Step 2: Daily Check-In",
    subtitle: "5h sleep, 3 idlis, skipped workout",
    icon: ClipboardCheck,
    color: "from-accent-500 to-accent-600",
  },
  {
    id: "decision",
    title: "Step 3: AI Decision Card",
    subtitle: "Personalized action plan",
    icon: Brain,
    color: "from-brand-500 to-accent-500",
  },
  {
    id: "score",
    title: "Step 4: Consistency Score",
    subtitle: "65/100 with full breakdown",
    icon: Award,
    color: "from-accent-500 to-accent-700",
  },
  {
    id: "report",
    title: "Step 5: Weekly Report",
    subtitle: "Trends, improvements, next week plan",
    icon: BarChart3,
    color: "from-brand-500 to-brand-700",
  },
  {
    id: "complete",
    title: "Demo Complete!",
    subtitle: "See how it scales",
    icon: Rocket,
    color: "from-brand-600 to-brand-800",
  },
];

export default function DemoPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");
  const demoUserIdRef = useRef<string>("");

  const step = DEMO_STEPS[currentStep];

  const runDemo = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Step 0 → 1: Problem (already there)
      setCurrentStep(1);
      await new Promise((r) => setTimeout(r, 800));

      // Step 1 → 2: Create demo user
      const demo = await getDemoUser("1");
      demoUserIdRef.current = demo.user_id;
      login(demo.user_id);
      setCurrentStep(2);
      await new Promise((r) => setTimeout(r, 1000));

      // Step 2 → 3: Show check-in
      setCurrentStep(3);
      await new Promise((r) => setTimeout(r, 1000));

      // Step 3 → 4: Generate decision
      setCurrentStep(4);
      const dec = await generateDecision(demoUserIdRef.current);
      setDecision(dec);
      await new Promise((r) => setTimeout(r, 1200));

      // Step 4 → 5: Show score
      setCurrentStep(5);
      await new Promise((r) => setTimeout(r, 1500));

      // Step 5 → 6: Show report
      setCurrentStep(6);
      try {
        const rep = await getWeeklyReport(demoUserIdRef.current);
        setReport(rep);
      } catch {
        // Report might not have enough data
      }
      await new Promise((r) => setTimeout(r, 1000));

      // Step 6 → 7: Complete
      setCurrentStep(7);
    } catch (err: any) {
      setError(err.message || "Demo failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [login]);

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  const goToStep = (idx: number) => {
    if (idx >= 0 && idx < DEMO_STEPS.length) {
      setCurrentStep(idx);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-[#0F172A]">Live Demo</h1>
          <span className="text-sm text-gray-400">
            Step {currentStep + 1} of {DEMO_STEPS.length}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-brand-500 to-accent-500 h-2 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / DEMO_STEPS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3"
        >
          <span className="text-red-500 text-sm">{error}</span>
          <button
            onClick={() => { setError(""); setCurrentStep(0); }}
            className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Retry
          </button>
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Step navigation sidebar */}
        <div className="space-y-1">
          {DEMO_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goToStep(idx)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                idx === currentStep
                  ? "bg-brand-50 text-brand-700 border border-brand-200 shadow-sm"
                  : idx < currentStep
                  ? "text-brand-600 hover:bg-brand-50"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {idx < currentStep ? (
                  <CheckCircle2 className="w-4 h-4 text-brand-500" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                <span className="truncate">{s.title}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">{step.title}</h2>
                    <p className="text-gray-500">{step.subtitle}</p>
                  </div>
                </div>

                {/* WELCOME */}
                {step.id === "welcome" && (
                  <div className="text-center py-8">
                    <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                      See how TrainexAI Health Agent converts daily health data into personalized decisions in under 3 minutes.
                    </p>
                    <button
                      onClick={runDemo}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-500 text-white font-bold text-lg shadow-lg shadow-brand-500/30 hover:bg-brand-600 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Running Demo...</>
                      ) : (
                        <><Play className="w-5 h-5" /> Start 3-Minute Demo</>
                      )}
                    </button>
                    <p className="mt-4 text-xs text-gray-400">
                      Auto-plays through all steps. Sit back and watch.
                    </p>
                  </div>
                )}

                {/* PROBLEM */}
                {step.id === "problem" && (
                  <div className="space-y-4 py-4">
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                      <p className="text-red-800 font-medium">People fail health goals because:</p>
                    </div>
                    <ul className="space-y-3">
                      {[
                        "Tracking is tedious and boring",
                        "Advice is generic — not personalized",
                        "Motivation fades without accountability",
                      ].map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-600">
                          <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                    <div className="p-4 rounded-xl bg-brand-50 border border-brand-100 mt-4">
                      <p className="text-brand-800 font-medium">
                        Solution: Low-effort check-ins + AI decisions + consistency score + weekly accountability.
                      </p>
                    </div>
                  </div>
                )}

                {/* PROFILE */}
                {step.id === "profile" && (
                  <div className="py-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { label: "Age", value: "24" },
                        { label: "Goal", value: "Fat Loss" },
                        { label: "Diet", value: "Indian Vegetarian" },
                        { label: "Fitness Level", value: "Beginner" },
                      ].map((item) => (
                        <div key={item.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <p className="text-xs text-gray-400">{item.label}</p>
                          <p className="font-semibold text-[#0F172A]">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
                      <p className="text-sm text-brand-800">
                        ✅ Demo profile created automatically. Your AI decisions will be personalized to these metrics.
                      </p>
                    </div>
                  </div>
                )}

                {/* CHECK-IN */}
                {step.id === "checkin" && (
                  <div className="py-4">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-4">
                      <p className="text-sm text-gray-500 mb-1">Raw input:</p>
                      <p className="text-[#0F172A] font-medium italic">
                        &ldquo;I slept 5 hours, ate 3 idlis with sambar and tea, skipped workout, drank 1 litre water.&rdquo;
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Sleep", value: "5 hours", color: "text-brand-600" },
                        { label: "Workout", value: "Missed", color: "text-accent-600" },
                        { label: "Water", value: "1 litre", color: "text-accent-600" },
                        { label: "Mood", value: "5/10", color: "text-gray-600" },
                      ].map((item) => (
                        <div key={item.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <p className="text-xs text-gray-400">{item.label}</p>
                          <p className={`font-semibold ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DECISION */}
                {step.id === "decision" && decision && (
                  <DecisionCard decision={decision} />
                )}
                {step.id === "decision" && !decision && (
                  <div className="py-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                    <p className="text-gray-400 mt-3">Generating AI decision...</p>
                  </div>
                )}

                {/* SCORE */}
                {step.id === "score" && decision && (
                  <div className="py-4 flex flex-col items-center">
                    <ConsistencyScore
                      score={decision.consistency_score}
                      breakdown={decision.score_breakdown}
                      size="lg"
                    />
                    <div className="mt-6 p-4 rounded-xl bg-brand-50 border border-brand-100 w-full">
                      <p className="text-sm text-brand-800 text-center font-medium">
                        Backend calculates scores using 5 metrics — no AI needed for this step.
                      </p>
                    </div>
                  </div>
                )}

                {/* REPORT */}
                {step.id === "report" && (
                  <div className="py-4">
                    {report ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-xl bg-brand-50 border border-brand-100 text-center">
                            <p className="text-2xl font-bold text-brand-600">
                              {Math.round(report.avg_consistency_score)}
                            </p>
                            <p className="text-xs text-gray-500">Avg Consistency</p>
                          </div>
                          <div className="p-4 rounded-xl bg-accent-50 border border-accent-100 text-center">
                            <p className="text-2xl font-bold text-accent-600">
                              {Math.round(report.workout_adherence)}%
                            </p>
                            <p className="text-xs text-gray-500">Workout Adherence</p>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                          <p className="text-sm font-medium text-gray-700 mb-2">Next Week Plan</p>
                          <p className="text-sm text-gray-600">{report.next_week_plan}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                        <p className="text-gray-500">
                          Weekly report data will appear once you have 7 days of check-ins.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* COMPLETE */}
                {step.id === "complete" && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Demo Complete!</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      AI decisions are cached. Backend calculates scores. Fallback protects the demo. Ready for production.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                      {[
                        { label: "AI Cached", value: "1 call/day" },
                        { label: "Scores", value: "Backend calc" },
                        { label: "Fallback", value: "Rule-based" },
                        { label: "Modular", value: "Merge ready" },
                      ].map((item) => (
                        <div key={item.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <p className="text-xs text-gray-400">{item.label}</p>
                          <p className="font-semibold text-[#0F172A] text-sm">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={goToDashboard}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-500 text-white font-bold text-lg shadow-lg shadow-brand-500/30 hover:bg-brand-600 hover:-translate-y-0.5 transition-all"
                    >
                      <Zap className="w-5 h-5" /> Go to Your Dashboard
                    </button>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => goToStep(currentStep - 1)}
                    disabled={currentStep === 0}
                    className="flex items-center gap-1 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>
                  {currentStep < DEMO_STEPS.length - 1 ? (
                    <button
                      onClick={() => goToStep(currentStep + 1)}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => goToStep(0)}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
                    >
                      <Play className="w-4 h-4" /> Replay Demo
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
