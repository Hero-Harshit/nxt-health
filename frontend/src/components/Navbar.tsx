"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { HeartPulse, ChevronDown, User, LogOut, Settings, HelpCircle, Info, Menu, X } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const featuresRef = useRef<HTMLDivElement>(null);
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
      if (featuresRef.current && !featuresRef.current.contains(event.target as Node)) {
        setIsFeaturesOpen(false);
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
    <nav className="sticky top-0 z-50 bg-white border-b border-[#D8CDBB] shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Side: Brand Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-lg bg-[#1F5B5B] flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#1F5B5B] font-serif">
                NxtHealth
              </span>
            </Link>
          </div>

          {/* Right Side: Horizontal Navigation Items (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Features Dropdown */}
            <div className="relative" ref={featuresRef}>
              <button
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                className="flex items-center gap-1 text-sm font-semibold text-[#24322F] hover:text-[#1F5B5B] focus:outline-none transition-colors cursor-pointer"
              >
                Features <ChevronDown className={`h-4 w-4 transition-transform ${isFeaturesOpen ? "rotate-180" : ""}`} />
              </button>

              {isFeaturesOpen && (
                <div className="absolute right-0 mt-2.5 w-60 rounded-xl bg-white border border-[#D8CDBB] shadow-lg py-2 ring-1 ring-black/5 animate-fadeIn">
                  <Link
                    href="/advisor"
                    className="block px-4 py-2 text-xs font-semibold text-[#24322F] hover:bg-[#FBF6EE] hover:text-[#1F5B5B]"
                    onClick={() => setIsFeaturesOpen(false)}
                  >
                    📜 Policy Advisor
                  </Link>
                  <Link
                    href="/preventive-health"
                    className="block px-4 py-2 text-xs font-semibold text-[#24322F] hover:bg-[#FBF6EE] hover:text-[#1F5B5B]"
                    onClick={() => setIsFeaturesOpen(false)}
                  >
                    🩺 Preventive Health Planner
                  </Link>
                  <Link
                    href="/medicines"
                    className="block px-4 py-2 text-xs font-semibold text-[#24322F] hover:bg-[#FBF6EE] hover:text-[#1F5B5B]"
                    onClick={() => setIsFeaturesOpen(false)}
                  >
                    💊 Generic Medicine Alternative
                  </Link>
                  <Link
                    href="/explainer"
                    className="block px-4 py-2 text-xs font-semibold text-[#24322F] hover:bg-[#FBF6EE] hover:text-[#1F5B5B]"
                    onClick={() => setIsFeaturesOpen(false)}
                  >
                    📝 Prescription & Term Explainer
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/help"
              className="text-sm font-semibold text-[#24322F] hover:text-[#1F5B5B] transition-colors"
            >
              Help
            </Link>

            <Link
              href="/about"
              className="text-sm font-semibold text-[#24322F] hover:text-[#1F5B5B] transition-colors"
            >
              About Us
            </Link>

            {/* Profile Dropdown */}
            {session ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#24322F] hover:text-[#1F5B5B] focus:outline-none transition-colors cursor-pointer"
                >
                  <User className="h-4.5 w-4.5 text-[#6E8B8B]" />
                  Profile <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2.5 w-48 rounded-xl bg-white border border-[#D8CDBB] shadow-lg py-2 ring-1 ring-black/5 animate-fadeIn">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#24322F] hover:bg-[#FBF6EE] hover:text-[#1F5B5B]"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-[#6E8B8B]" /> View Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#24322F] hover:bg-[#FBF6EE] hover:text-[#1F5B5B] text-left cursor-pointer border-t border-[#D8CDBB]/20 mt-1"
                    >
                      <LogOut className="h-4 w-4 text-[#6E8B8B]" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#1F5B5B] hover:bg-[#174646] text-white font-semibold text-xs py-2 px-4 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#24322F] hover:text-[#1F5B5B] focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#D8CDBB] bg-[#FBF6EE]/40 px-4 py-3 space-y-2">
          <div className="font-bold text-xs uppercase tracking-wider text-[#6E8B8B] px-3 pt-2">
            Features
          </div>
          <Link
            href="/advisor"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#24322F] hover:bg-white hover:text-[#1F5B5B]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            📜 Policy Advisor
          </Link>
          <Link
            href="/preventive-health"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#24322F] hover:bg-white hover:text-[#1F5B5B]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            🩺 Preventive Health Planner
          </Link>
          <Link
            href="/medicines"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#24322F] hover:bg-white hover:text-[#1F5B5B]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            💊 Generic Medicine Alternative
          </Link>
          <Link
            href="/explainer"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#24322F] hover:bg-white hover:text-[#1F5B5B]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            📝 Prescription & Term Explainer
          </Link>

          <div className="border-t border-[#D8CDBB]/40 my-2" />

          <Link
            href="/help"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#24322F] hover:bg-white hover:text-[#1F5B5B]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Help
          </Link>
          <Link
            href="/about"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#24322F] hover:bg-white hover:text-[#1F5B5B]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About Us
          </Link>

          {session ? (
            <>
              <div className="border-t border-[#D8CDBB]/40 my-2" />
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#24322F] hover:bg-white hover:text-[#1F5B5B]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                👤 View Profile
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left block px-3 py-2 rounded-lg text-sm font-semibold text-[#24322F] hover:bg-white hover:text-[#1F5B5B]"
              >
                🚪 Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block text-center bg-[#1F5B5B] hover:bg-[#174646] text-white font-semibold text-sm py-2.5 rounded-lg"
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
