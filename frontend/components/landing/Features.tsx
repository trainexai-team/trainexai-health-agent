"use client";

import { motion } from "framer-motion";
import {
  User,
  ClipboardCheck,
  Brain,
  Award,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: User,
    title: "Health Profile",
    description: "Set your age, goal, diet preference, and fitness level for personalized guidance.",
    color: "from-brand-500 to-brand-700",
  },
  {
    icon: ClipboardCheck,
    title: "Daily Check-In",
    description: "Log sleep, meals, workout, water, and mood in seconds — text or form.",
    color: "from-accent-500 to-accent-600",
  },
  {
    icon: Award,
    title: "Consistency Score",
    description: "Get a science-backed score out of 100 with breakdown across 5 health metrics.",
    color: "from-brand-400 to-brand-600",
  },
  {
    icon: Brain,
    title: "AI Decision Card",
    description: "One clear decision with nutrition, workout, and accountability actions daily.",
    color: "from-brand-500 to-accent-500",
  },
  {
    icon: BarChart3,
    title: "Weekly Report",
    description: "See trends, improvements, problem areas, and a next-week plan with charts.",
    color: "from-accent-500 to-accent-700",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Private",
    description: "AI safety guardrails, rule-based fallback, and no medical advice — ever.",
    color: "from-brand-600 to-brand-800",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">
            Everything you need to{" "}
            <span className="text-gradient">stay consistent</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            No complex dashboards. Just check in, get your decision, and stay on track.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
