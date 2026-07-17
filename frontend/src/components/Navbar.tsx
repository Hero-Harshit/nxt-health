"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ChevronDown, User, LogOut, Settings, Menu, X, LayoutGrid } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <Link className="flex items-center gap-2.5 transition-opacity hover:opacity-90" href="/">
              {/* Gradient Heart with EKG Line */}
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="nxtLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  stroke="url(#nxtLogoGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M6 12h2.5l1.5-3 2.5 6 1.5-3h4"
                  stroke="url(#nxtLogoGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>

              {/* Two-Tone Title: Nxt (Navy) + Health (Blue) */}
              <span className="text-2xl font-extrabold tracking-tight font-sans">
                <span className="text-[#0F2744]">Nxt</span>
                <span className="text-[#2563EB]">Health</span>
              </span>
            </Link>
          </div>

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
                    🔥 Calorie & Macro Calculator
                  </Link>
                  <Link
                    href="/utilities/hydration-tracker"
                    className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                    onClick={() => setIsUtilitiesOpen(false)}
                  >
                    💧 Hydration Tracker
                  </Link>
                  <Link
                    href="/utilities/box-breathing"
                    className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                    onClick={() => setIsUtilitiesOpen(false)}
                  >
                    🧘 Box Breathing Exercise
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
            🔥 Calorie & Macro Calculator
          </Link>
          <Link
            href="/utilities/hydration-tracker"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            💧 Hydration Tracker
          </Link>
          <Link
            href="/utilities/box-breathing"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            🧘 Box Breathing Exercise
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
            href="/about"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About Us
          </Link>

          {session ? (
            <>
              <div className="border-t border-slate-200 my-2" />
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                👤 View Profile
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-white hover:text-sky-600"
              >
                🚪 Sign Out
              </button>
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
