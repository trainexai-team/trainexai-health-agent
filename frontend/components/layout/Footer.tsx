import { SAFETY_DISCLAIMER } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-brand-500 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <img
              src="/logo-dark.svg"
              alt="TrainexAI"
              className="h-7 w-auto mb-2"
            />
            <p className="text-sm text-gray-400">
              Health Agent — Your Daily Health Decision Engine
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Login</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/checkin" className="hover:text-white transition-colors">Check-In</a></li>
            </ul>
          </div>

          {/* Safety */}
          <div>
            <h4 className="text-white font-semibold mb-3">⚠️ Safety Notice</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{SAFETY_DISCLAIMER}</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-sm text-gray-500">
          <p>Built for HackIndia 2026 — Innovation Module of TrainexAI Ecosystem</p>
        </div>
      </div>
    </footer>
  );
}
