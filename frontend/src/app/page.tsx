"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { HeartPulse, UserCheck, FileText, Activity, Layers, ArrowRight, ShieldCheck, Sparkles, Pill, AlertTriangle, ClipboardList, ShieldAlert, Fingerprint, ReceiptText, HardDrive, Trophy, ChevronRight, Flame, Scan } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [hasEmergencyEmail, setHasEmergencyEmail] = useState<boolean>(true);
  const [streakCount, setStreakCount] = useState<number>(0);

  useEffect(() => {
    const syncStreak = () => {
      const savedStreak = localStorage.getItem('nxthealth_streak_count');
      if (savedStreak !== null) {
        setStreakCount(parseInt(savedStreak, 10) || 0);
      } else {
        setStreakCount(0); // Default to 0
      }
    };

    syncStreak();

    window.addEventListener('storage', syncStreak);
    window.addEventListener('streak-updated', syncStreak);

    return () => {
      window.removeEventListener('storage', syncStreak);
      window.removeEventListener('streak-updated', syncStreak);
    };
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("nxt_health_passport");
    if (cached) {
      try {
        const passportData = JSON.parse(cached);
        if (passportData?.emergencyContactEmail) {
          setHasEmergencyEmail(true);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const savedEmail = 
      localStorage.getItem('nxthealth_emergency_email') || 
      localStorage.getItem('emergency_email') || 
      localStorage.getItem('sos_email');
    if (savedEmail !== null) {
      setHasEmergencyEmail(savedEmail.trim().length > 0);
    } else {
      setHasEmergencyEmail(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push("/login");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchHistory = async (token: string) => {
    const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
    try {
      console.log("🌐 [FRONTEND FETCHING HISTORY]: Calling GET /api/history");
      const res = await fetch(`${backendBaseUrl}/api/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("📦 [FRONTEND RECEIVED HISTORY DATA]:", data);
      if (data.status === "ok") {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("❌ [FRONTEND HISTORY FETCH ERROR]:", err);
    }
  };

  useEffect(() => {
    if (!session) return;

    const fetchDashboardData = async () => {
      const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
      try {
        // Fetch Profile
        const profileRes = await fetch(`${backendBaseUrl}/api/profile`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.status === "ok") {
            setProfile(profileData.profile);
            setCompletionPercentage(profileData.completion_percentage || 0);
          }
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    fetchHistory(session.access_token);
  }, [session]);

  // BMI Category Helper
  const getBmiCategory = () => {
    if (!profile?.height_cm || !profile?.weight_kg) return "N/A";
    const heightM = profile.height_cm / 100;
    const bmi = profile.weight_kg / (heightM * heightM);
    return `${bmi.toFixed(1)} (${bmi < 18.5
        ? "Underweight"
        : bmi < 25
          ? "Normal"
          : bmi < 30
            ? "Overweight"
            : "Obese"
      })`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-20 text-center animate-pulse font-sans">
        <HeartPulse className="h-8 w-8 animate-spin text-sky-600 mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading dashboard details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* User Profile Snapshot Header */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            
            {/* Header Greeting & Subtitle */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <UserCheck className="w-6 h-6 text-sky-700" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Welcome back, Harshit
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Your explainable health decision workspace
                </p>
              </div>
            </div>

            {/* Status Pills Container */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              
              {/* Profile Badge */}
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span>Profile 100%</span>
              </Link>

              {/* Awards Badge */}
              <Link
                href="/achievements"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-full text-xs font-bold transition-all"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>1 Award Won</span>
              </Link>

              {/* Dynamic Streak Pill -> Links to /heatmap */}
              <Link
                href="/heatmap"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200/80 rounded-full text-xs font-bold transition-all active:scale-95"
              >
                <Flame className={`w-3.5 h-3.5 ${streakCount > 0 ? 'text-orange-500 fill-orange-550 animate-bounce' : 'text-gray-400'}`} />
                <span>{streakCount}-Day Streak</span>
              </Link>

              {/* Emergency Contact Status -> Links to /passport */}
              <Link
                href="/passport"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-bold transition-all active:scale-95"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contact: Linked & Active</span>
              </Link>
            </div>

          </div>
        </section>

        {/* 6 Core Modules Grid (Quick Launch) */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#0F2744]">Health Intelligence Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-start md:items-stretch">

            {/* Premium Smart SOS Hero Module - Spanning all columns */}
            <Link
              href="/smart-sos"
              className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-50/70 via-sky-50/60 to-slate-50/40 rounded-2xl p-6 md:p-8 border border-blue-400 shadow-lg shadow-blue-900/10 hover:shadow-xl hover:border-blue-500 hover:shadow-blue-900/15 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-sky-100/80 text-sky-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                  <ShieldAlert className="h-7 w-7 text-sky-700" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="font-extrabold text-2xl text-[#0F2744]">Smart SOS Command Center</h3>
                  </div>
                  <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                    Real-time clinical AI triage, localized specialized hospital routing, and dual-channel emergency network broadcast.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end justify-between h-full gap-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  🚨 EMERGENCY ONLY
                </span>
                
                <div className="text-sky-600 font-bold text-sm flex items-center gap-1.5 group-hover:text-sky-700 transition-colors">
                  Launch Emergency Console <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Module 1: Policy Advisor */}
            <Link
              href="/policy-advisor"
              className="group relative flex flex-col justify-start md:justify-between h-auto min-h-0 md:h-full p-4 sm:p-5 md:p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 bg-blue-50/80 rounded-xl text-blue-600 group-hover:scale-105 transition-transform shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border transition-colors bg-sky-50/80 text-sky-700 border-sky-100">
                    COVERAGE CHECK
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mb-1">
                    Health Policy Advisor
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Evaluate health policies and explainable coverage constraints.
                  </p>
                </div>
              </div>
              <div className="mt-3 md:mt-6 pt-0 md:pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                  <span>Launch Advisor</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Module: VisionPay */}
            <Link
              href="/vision-pay"
              className="group relative flex flex-col justify-start md:justify-between h-auto min-h-0 md:h-full p-4 sm:p-5 md:p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 bg-blue-50/80 rounded-xl text-blue-600 group-hover:scale-105 transition-transform shrink-0">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border transition-colors bg-sky-50/80 text-sky-700 border-sky-100">
                    BIOMETRIC SECURED
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mb-1">
                    VisionPay
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Scan hospital bills, auto-deduct insurance, and pay securely using device biometrics.
                  </p>
                </div>
              </div>
              <div className="mt-3 md:mt-6 pt-0 md:pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                  <span>Pay Securely</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Module 2: Preventive Planner */}
            <Link
              href="/preventive-health"
              className="group relative flex flex-col justify-start md:justify-between h-auto min-h-0 md:h-full p-4 sm:p-5 md:p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 bg-blue-50/80 rounded-xl text-blue-600 group-hover:scale-105 transition-transform shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border transition-colors bg-sky-50/80 text-sky-700 border-sky-100">
                    PROACTIVE
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mb-1">
                    Preventive Health Planner
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Get personalized screening guidelines and risk factors.
                  </p>
                </div>
              </div>
              <div className="mt-3 md:mt-6 pt-0 md:pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                  <span>Launch Planner</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Module 3: Generic Medicines */}
            <Link
              href="/medicines"
              className="group relative flex flex-col justify-start md:justify-between h-auto min-h-0 md:h-full p-4 sm:p-5 md:p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 bg-blue-50/80 rounded-xl text-blue-600 group-hover:scale-105 transition-transform shrink-0">
                    <Pill className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border transition-colors bg-sky-50/80 text-sky-700 border-sky-100">
                    AFFORDABLE
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mb-1">
                    Generic Medicine Finder
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Compare medicine ingredients and discover brand cost savings.
                  </p>
                </div>
              </div>
              <div className="mt-3 md:mt-6 pt-0 md:pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                  <span>Launch Explorer</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Module 4: Prescription Explainer */}
            <Link
              href="/term-explainer"
              className="group relative flex flex-col justify-start md:justify-between h-auto min-h-0 md:h-full p-4 sm:p-5 md:p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 bg-blue-50/80 rounded-xl text-blue-600 group-hover:scale-105 transition-transform shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border transition-colors bg-sky-50/80 text-sky-700 border-sky-100">
                    SIMPLIFIED
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mb-1">
                    Medical Term Explainer
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Translate medical terminologies and drug sheets into plain text.
                  </p>
                </div>
              </div>
              <div className="mt-3 md:mt-6 pt-0 md:pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                  <span>Launch Explainer</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Module 5: Personal Health Passport */}
            <Link
              href="/health-passport"
              className="group relative flex flex-col justify-start md:justify-between h-auto min-h-0 md:h-full p-4 sm:p-5 md:p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 bg-blue-50/80 rounded-xl text-blue-600 group-hover:scale-105 transition-transform shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border transition-colors bg-sky-50/80 text-sky-700 border-sky-100">
                    PORTABLE
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mb-1">
                    Personal Health Passport
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    A portable health summary to share with doctors or first responders during visits or emergencies.
                  </p>
                </div>
              </div>
              <div className="mt-3 md:mt-6 pt-0 md:pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                  <span>Manage Passport</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Module: Hospital Bill Checker */}
            <Link
              href="/utilities/bill-checker"
              className="group relative flex flex-col justify-start md:justify-between h-auto min-h-0 md:h-full p-4 sm:p-5 md:p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 bg-blue-50/80 rounded-xl text-blue-600 group-hover:scale-105 transition-transform shrink-0">
                    <ReceiptText className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border transition-colors bg-sky-50/80 text-sky-700 border-sky-100">
                    AUDIT TOOL
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mb-1">
                    Hospital Bill Checker
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Analyze medical procedures against city-tier benchmarks using AI to instantly detect overcharging.
                  </p>
                </div>
              </div>
              <div className="mt-3 md:mt-6 pt-0 md:pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                  <span>Launch Checker</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Module: Health Vault */}
            <Link
              href="/utilities/health-vault"
              className="group relative flex flex-col justify-start md:justify-between h-auto min-h-0 md:h-full p-4 sm:p-5 md:p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 bg-blue-50/80 rounded-xl text-blue-600 group-hover:scale-105 transition-transform shrink-0">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border transition-colors bg-sky-50/80 text-sky-700 border-sky-100">
                    CLOUD STORAGE
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mb-1">
                    Health Vault
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Securely store and manage medical records directly inside your private Google Drive.
                  </p>
                </div>
              </div>
              <div className="mt-3 md:mt-6 pt-0 md:pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                  <span>Open Vault</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Module 6: Scan Anything */}
            <Link
              href="/scan-anything"
              className="group relative flex flex-col justify-start md:justify-between h-auto min-h-0 md:h-full p-4 sm:p-5 md:p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 bg-blue-50/80 rounded-xl text-blue-600 group-hover:scale-105 transition-transform shrink-0">
                    <Scan className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border transition-colors bg-blue-100 text-blue-800 border-blue-200">
                    OCR
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mb-1">
                    Scan Anything
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Upload prescriptions or lab reports for OCR extraction and AI plain-English summaries.
                  </p>
                </div>
              </div>
              <div className="mt-3 md:mt-6 pt-0 md:pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                  <span>Launch Scanner</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

          </div>
        </section>



      </div>
    </div>
  );
}
