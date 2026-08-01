"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ChevronDown, User, LogOut, Settings, Menu, X, LayoutGrid, Activity, Award, History, HeartPulse } from "lucide-react";
import EmergencyHelplines from "./EmergencyHelplines";
import LocalHospitals from "./LocalHospitals";

const TAGLINES = [
  "A Complete Healthcare Ecosystem",
  "AI-Powered Unified Healthcare",
  "Your AI Health & Emergency Companion",
  "Smarter Healthcare for Everyone",
  "Accessible. Proactive. Intelligent."
];

export default function Navbar() {
  const [tagline, setTagline] = useState<string>("");

  useEffect(() => {
    // Pick a random tagline on client mount
    const randomIndex = Math.floor(Math.random() * TAGLINES.length);
    setTagline(TAGLINES[randomIndex]);
  }, []);
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  const utilitiesRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Exclude navbar on login page
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (utilitiesRef.current && !utilitiesRef.current.contains(event.target as Node)) {
        setIsUtilitiesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoginPage) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Side: Brand Logo */}
          <div className="flex items-center">
            {/* Logo & Dynamic Brand Tagline Section */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-90">
                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold text-gray-900 tracking-tight font-sans">
                  Nxt<span className="text-blue-600">Health</span>
                </span>
              </Link>

              {/* Dynamic Desktop Tagline (Hidden on Mobile/Tablet) */}
              {tagline && (
                <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-200 animate-in fade-in duration-500">
                  <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                    {tagline}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            <EmergencyHelplines />
            <LocalHospitals />

            {/* Right Side: Horizontal Navigation Items (Desktop) */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Utilities Dropdown */}
              <div className="relative" ref={utilitiesRef}>
                <button
                  onClick={() => setIsUtilitiesOpen(!isUtilitiesOpen)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-sky-600 focus:outline-none transition-colors cursor-pointer"
                >
                  <LayoutGrid className="h-4.5 w-4.5 text-slate-400" />
                  Utilities <ChevronDown className={`h-4 w-4 transition-transform ${isUtilitiesOpen ? "rotate-180" : ""}`} />
                </button>

                {isUtilitiesOpen && (
                  <div className="absolute right-0 mt-2.5 w-60 rounded-xl bg-white border border-slate-200 shadow-lg py-2 ring-1 ring-black/5 animate-fadeIn">
                    <Link
                      href="/utilities/calorie-calculator"
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                      onClick={() => setIsUtilitiesOpen(false)}
                    >
                      🔥 Calorie Calculator
                    </Link>
                    <Link
                      href="/utilities/hydration-tracker"
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                      onClick={() => setIsUtilitiesOpen(false)}
                    >
                      💧 Hydration Tracker
                    </Link>
                    <Link
                      href="/utilities/breathing-exercise"
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                      onClick={() => setIsUtilitiesOpen(false)}
                    >
                      🧘 Breathing Exercise
                    </Link>
                    <Link
                      href="/utilities/medicine-wheel"
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                      onClick={() => setIsUtilitiesOpen(false)}
                    >
                      💊 Medicine Time Wheel
                    </Link>
                    <Link
                      href="/utilities/family-risk-map"
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                      onClick={() => setIsUtilitiesOpen(false)}
                    >
                      🧬 Family Health Risk Map
                    </Link>
                    <Link
                      href="/utilities/sleep-tracker"
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                      onClick={() => setIsUtilitiesOpen(false)}
                    >
                      🌙 Sleep Tracker
                    </Link>
                    <Link
                      href="/utilities/longevity-calculator"
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                      onClick={() => setIsUtilitiesOpen(false)}
                    >
                      ❤️ Longevity Estimator
                    </Link>
                    <Link
                      href="/utilities/first-aid-box"
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                      onClick={() => setIsUtilitiesOpen(false)}
                    >
                      🩹 Virtual First Aid Box
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/help"
                className="text-sm font-semibold text-slate-700 hover:text-sky-600 transition-colors"
              >
                Help
              </Link>

              <Link
                href="/privacy"
                className="text-sm font-semibold text-slate-700 hover:text-sky-600 transition-colors"
              >
                Privacy Policy
              </Link>

              <Link
                href="/about"
                className="text-sm font-semibold text-slate-700 hover:text-sky-600 transition-colors"
              >
                About Us
              </Link>

              {/* Profile Dropdown */}
              {session ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-sky-600 focus:outline-none transition-colors cursor-pointer"
                  >
                    <User className="h-4.5 w-4.5 text-slate-400" />
                    Profile <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2.5 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-2 ring-1 ring-black/5 animate-fadeIn">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4 text-slate-400" /> View Profile
                      </Link>
                      <Link
                        href="/health-heatmap"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Activity className="h-4 w-4 text-slate-400" /> Healthy Heatmap
                      </Link>
                      <Link
                        href="/awards"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Award className="h-4 w-4 text-slate-400" /> Awards
                      </Link>
                      <Link
                        href="/history"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <History className="h-4 w-4 text-slate-400" /> My History
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600 text-left cursor-pointer border-t border-slate-100 mt-1"
                      >
                        <LogOut className="h-4 w-4 text-slate-400" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-700 hover:text-sky-600 focus:outline-none p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-2">
          <div className="font-bold text-xs uppercase tracking-wider text-slate-400 px-3 pt-2">
            Utilities
          </div>
          <Link
            href="/utilities/calorie-calculator"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            🔥 Calorie Calculator
          </Link>
          <Link
            href="/utilities/hydration-tracker"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            💧 Hydration Tracker
          </Link>
          <Link
            href="/utilities/breathing-exercise"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            🧘 Breathing Exercise
          </Link>
          <Link
            href="/utilities/medicine-wheel"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            💊 Medicine Time Wheel
          </Link>
          <Link
            href="/utilities/family-risk-map"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            🧬 Family Health Risk Map
          </Link>
          <Link
            href="/utilities/sleep-tracker"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            🌙 Sleep Tracker
          </Link>
          <Link
            href="/utilities/longevity-calculator"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ❤️ Longevity Estimator
          </Link>
          <Link
            href="/utilities/first-aid-box"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            🩹 Virtual First Aid Box
          </Link>

          <div className="border-t border-slate-200 my-2" />

          <Link
            href="/help"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Help
          </Link>
          <Link
            href="/privacy"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Privacy Policy
          </Link>
          <Link
            href="/about"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About Us
          </Link>

          {session ? (
            <>
              <div className="border-t border-slate-200 my-2" />
              {/* Mobile "My Profile" Collapsible Menu Section */}
              <div className="border-t border-slate-200 pt-3 mt-3">
                {/* Dropdown Header Trigger */}
                <button
                  onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
                  className="w-full flex items-center justify-between py-2.5 px-3 text-slate-700 font-semibold text-sm rounded-xl hover:bg-white hover:text-sky-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
                      👤
                    </div>
                    <span>My Profile</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      isMobileProfileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {/* Sub-menu items (Appears when open) */}
                {isMobileProfileOpen && (
                  <div className="pl-6 space-y-1 mt-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <span>👤</span> View Profile
                    </Link>
                    
                    <Link
                      href="/health-heatmap"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <span>📊</span> Healthy Heatmap
                    </Link>
                    
                    <Link
                      href="/awards"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <span>🏆</span> Awards & Achievements
                    </Link>
                    
                    <Link
                      href="/history"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <span>📜</span> My History
                    </Link>
                    
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-3 py-2 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="block text-center bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm py-2.5 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
