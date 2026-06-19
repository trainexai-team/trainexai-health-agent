"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background - clean navy tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-50" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Health Decision Engine
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F172A] leading-tight">
              Your Daily{" "}
              <span className="text-gradient">Health Decision</span>{" "}
              Engine
            </h1>

            <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
              Convert your daily fitness, food, sleep, water, and mood check-ins 
              into one safe, personalized action plan. No more generic advice.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/30 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all"
              >
                Try Live Demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/checkin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-700 font-semibold border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all"
              >
                Start Check-In
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex gap-8">
              <div>
                <div className="flex items-center gap-1">
                  <img src="/logo-mark.svg" alt="" className="w-5 h-5" />
                  <span className="text-2xl font-bold text-[#0F172A]">AI</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Powered Decisions</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0F172A]">100%</div>
                <p className="text-sm text-gray-500 mt-1">Safe & Private</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0F172A]">Daily</div>
                <p className="text-sm text-gray-500 mt-1">Action Plans</p>
              </div>
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex justify-center"
          >
            <div className="relative">
              <div className="w-80 h-80 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-1 shadow-2xl shadow-brand-500/20">
                <div className="w-full h-full rounded-3xl bg-white p-8 flex flex-col items-center justify-center">
                  <img src="/logo-mark.svg" alt="" className="w-16 h-16 mb-4" />
                  <h3 className="text-xl font-bold text-[#0F172A] text-center">Today&apos;s Decision</h3>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Do a light 15-min workout and add protein to dinner
                  </p>
                  <div className="mt-6 w-full">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Consistency</span>
                      <span className="font-semibold text-accent-500">65/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-gradient-to-r from-brand-500 to-accent-500 h-2 rounded-full" style={{ width: "65%" }} />
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-accent-500 shadow-lg flex items-center justify-center text-white font-bold text-sm animate-float">
                Demo
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
