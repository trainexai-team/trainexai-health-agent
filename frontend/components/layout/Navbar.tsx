"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userId, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!userId;

  const navLinks = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/checkin", label: "Check-In" },
        { href: "/report", label: "Report" },
        { href: "/profile", label: "Profile" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/demo", label: "Demo" },
        { href: "/login", label: "Login" },
      ];

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center group" aria-label="TrainexAI home">
            <img
              src="/logo-mark.svg"
              alt="TrainexAI"
              className="h-9 w-9 sm:hidden"
            />
            <img
              src="/logo.svg"
              alt="TrainexAI"
              className="hidden h-9 w-auto sm:block"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-brand-50 text-brand-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center gap-1.5"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            )}
          </div>

          {/* Mobile button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 inline mr-1" />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
