"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { HeartPulse, UserCheck, FileText, Activity, Layers, ArrowRight, ShieldCheck, Sparkles, Pill, AlertTriangle } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);

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
    return `${bmi.toFixed(1)} (${
      bmi < 18.5
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
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-sky-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0F2744]">
                  Welcome back, {profile?.full_name || "NxtHealth User"}
                </h1>
                <p className="text-xs text-slate-500">Your explainable health decision workspace</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                Age: {profile?.age || "N/A"}
              </span>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                Gender: {profile?.gender || "N/A"}
              </span>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                BMI: {getBmiCategory()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 shrink-0 lg:border-l lg:border-slate-200/50 lg:pl-8">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>PROFILE COMPLETENESS</span>
                <span className="text-sky-700">{completionPercentage}%</span>
              </div>
              <div className="w-56 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-sky-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {completionPercentage < 100 ? (
              <button
                onClick={() => router.push("/profile")}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs py-3 px-5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                Complete Profile <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <span className="text-xs font-bold px-3 py-2.5 rounded-xl bg-sky-100 text-sky-700 border border-sky-200/55 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Profile Fully Synced
              </span>
            )}
          </div>
        </section>

        {/* 4 Core Modules Grid (Quick Launch) */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#0F2744]">Health Intelligence Modules</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Module 1: Policy Advisor */}
            <Link
              href="/advisor"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-500/50 transition-all flex flex-col justify-between group h-full"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FileText className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Policy Advisor</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Evaluate health policies and explainable coverage constraints.
                </p>
              </div>
              <div className="text-sky-600 font-semibold text-xs flex items-center gap-1 mt-4">
                Launch Advisor <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Module 2: Preventive Planner */}
            <Link
              href="/preventive-health"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-500/50 transition-all flex flex-col justify-between group h-full"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Preventive Health</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Get personalized screening guidelines and risk factors.
                </p>
              </div>
              <div className="text-sky-600 font-semibold text-xs flex items-center gap-1 mt-4">
                Launch Planner <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Module 3: Generic Medicines */}
            <Link
              href="/medicines"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-500/50 transition-all flex flex-col justify-between group h-full"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Pill className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Generic Alternatives</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Compare medicine ingredients and discover brand cost savings.
                </p>
              </div>
              <div className="text-sky-600 font-semibold text-xs flex items-center gap-1 mt-4">
                Launch Explorer <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Module 4: Prescription Explainer */}
            <Link
              href="/explainer"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-500/50 transition-all flex flex-col justify-between group h-full"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Layers className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Term Explainer</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Translate medical terminologies and drug sheets into plain text.
                </p>
              </div>
              <div className="text-sky-600 font-semibold text-xs flex items-center gap-1 mt-4">
                Launch Explainer <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>
        </section>

        {/* Recent Activity & History Feed */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#0F2744] flex items-center gap-2">
            <Activity className="h-5 w-5 text-sky-600" /> Recent History Feed
          </h2>

          {history.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden divide-y divide-slate-100">
              {history.map((item, index) => (
                <div key={item.id || index} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200/50">
                        {item.module}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">
                      Query: "{item.query_text}"
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      Result Summary: {item.summary_result}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Link
                      href={
                        item.module.includes("Advisor")
                          ? "/advisor"
                          : item.module.includes("Planner")
                          ? "/preventive-health"
                          : item.module.includes("Alternative")
                          ? "/medicines"
                          : "/explainer"
                      }
                      className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1"
                    >
                      Re-run <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-100/30 p-8 text-center flex flex-col items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-sky-600 mb-3" />
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                No activity history recorded yet. Perform a search in any module to populate your feed.
              </p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
