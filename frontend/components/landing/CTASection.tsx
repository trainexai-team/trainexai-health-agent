"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-24 bg-[#F7F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-12 md:p-16 overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-400/10 rounded-full blur-3xl" />

          <div className="relative text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform your health habits?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Takes 2 minutes to check in. Get a personalized decision. Stay consistent every day.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent-500 text-white font-semibold hover:bg-accent-600 hover:-translate-y-0.5 transition-all shadow-xl"
              >
                <Play className="w-4 h-4" /> Get Started Free
              </Link>
              <Link
                href="/checkin"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 hover:-translate-y-0.5 transition-all shadow-xl"
              >
                Start Your Check-In <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
