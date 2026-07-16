"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { HeartPulse, Sparkles, RefreshCw, AlertCircle, ShieldCheck, ArrowRight, UserCheck, CheckCircle2 } from "lucide-react";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PreventiveHealthPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  const [profile, setProfile] = useState<any>(null);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  
  const [userQuery, setUserQuery] = useState<string>("");
  const [plan, setPlan] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // Auth check
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

  // Fetch profile status
  useEffect(() => {
    if (!session) return;

    const getProfileStatus = async () => {
      const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
      try {
        const response = await fetch(`${backendBaseUrl}/api/profile`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to retrieve profile details.");
        }

        const data = await response.json();
        if (data.status === "ok") {
          setProfile(data.profile);
          setCompletionPercentage(data.completion_percentage || 0);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Could not retrieve profile info.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    getProfileStatus();
  }, [session]);

  const handleGetAdvice = async (e: FormEvent) => {
    e.preventDefault();
    if (!session || completionPercentage < 100) return;

    setIsAnalyzing(true);
    setErrorMsg("");
    setPlan(null);
    setStatus("idle");

    const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

    try {
      const response = await fetch(`${backendBaseUrl}/api/preventive-health`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userQuery }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate preventive health guidance.");
      }

      const data = await response.json();
      if (data.status === "ok") {
        setPlan(data.plan);
        setStatus("success");
      } else {
        throw new Error(data.message || "Unknown error generating health advice.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to calculate live BMI
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

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#FBF6EE] flex flex-col items-center justify-center py-20 text-center animate-pulse font-sans">
        <RefreshCw className="h-8 w-8 animate-spin text-[#1F5B5B] mb-4" />
        <p className="text-sm font-medium text-[#6E8B8B]">Checking health profile completion...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EE] text-[#24322F] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="mb-8 border-b border-[#D8CDBB] pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#1F5B5B] flex items-center justify-center shadow-md">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1F5B5B] flex items-center gap-2">
                NxtHealth <span className="text-xs bg-[#DCEEE6] text-[#1F5B5B] px-2 py-0.5 rounded-full border border-[#1F5B5B]/20">Planner</span>
              </h1>
              <p className="text-xs text-[#6E8B8B]">Explainable healthcare decision platform — non-diagnostic guidance</p>
            </div>
          </div>
        </header>

        {/* Condition A: Profile Incomplete (<100%) */}
        {completionPercentage < 100 ? (
          <div className="rounded-2xl bg-[#F3DCB0] text-[#6E4A0B] border border-[#E0A458]/40 p-6 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 text-[#6E4A0B] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold">100% Profile Completion Required</h2>
                <p className="text-sm mt-1.5 leading-relaxed">
                  To provide accurate, personalized preventive advice, Gemini needs your complete demographic, vitals, and lifestyle context.
                </p>
              </div>
            </div>

            {/* Meter Bar */}
            <div className="bg-white/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider">Current Completion Percentage</span>
                <div className="text-xl font-extrabold text-[#6E4A0B] mt-0.5">{completionPercentage}%</div>
              </div>
              <div className="w-full sm:w-64 bg-white/30 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#6E4A0B] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => router.push("/profile")}
                className="bg-[#1F5B5B] hover:bg-[#174646] text-white font-semibold text-xs py-3.5 px-6 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                Complete Profile Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Condition B: Profile Complete (=100%) */
          <div className="space-y-6 animate-fadeIn">
            {/* Context Bar */}
            <div className="rounded-2xl border border-[#D8CDBB] bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1F5B5B]">
                <UserCheck className="h-5 w-5" /> Verified Profile Context
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#E5E9E7] text-[#3A4B47]">
                  Age: {profile?.age} Yrs
                </span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#E5E9E7] text-[#3A4B47]">
                  Gender: {profile?.gender}
                </span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#E5E9E7] text-[#3A4B47]">
                  BMI: {getBmiCategory()}
                </span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#E5E9E7] text-[#3A4B47]">
                  Activity: {profile?.activity_level}
                </span>
                {profile?.pre_existing_conditions?.length > 0 && (
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#F3DCB0] text-[#6E4A0B]">
                    Conditions: {profile.pre_existing_conditions.join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Input Form */}
            <div className="rounded-2xl border border-[#D8CDBB] bg-white p-6 shadow-sm">
              <form onSubmit={handleGetAdvice} className="space-y-4">
                <label className="block text-sm font-bold text-[#24322F]">
                  What health advice, lifestyle goal, or guidance do you need today?
                  <textarea
                    rows={4}
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="e.g. I experience afternoon sluggishness and want a diet/screening plan given my family history of heart disease..."
                    className="mt-2.5 w-full rounded-xl border border-[#D8CDBB] bg-[#FBF6EE]/40 px-4 py-3 text-sm text-[#24322F] focus:border-[#1F5B5B] focus:outline-none focus:ring-1 focus:ring-[#1F5B5B] transition-all"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full rounded-xl bg-[#1F5B5B] hover:bg-[#174646] py-3.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-[#FBF6EE]" />
                      Analyzing wellness priorities...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-[#E0A458]" />
                      Get Personalized AI Advice
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Error Message */}
            {status === "error" && (
              <div className="rounded-2xl bg-[#3A4B47] text-[#FBF6EE] p-6 shadow-sm flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-[#E0A458] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-white">Guidance Failed</h3>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Advice Response - Refactored to native Warm Harbor UI Cards */}
            {status === "success" && plan && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 1. Lifestyle Modifications Card */}
                <div className="rounded-2xl border border-[#D8CDBB] bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#1F5B5B] border-b border-[#D8CDBB]/40 pb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#E0A458]" /> Lifestyle Modifications
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {plan.lifestyle?.map((item: any, index: number) => (
                      <div key={index} className="rounded-xl bg-[#FBF6EE]/60 p-4 border border-[#D8CDBB]/35 flex flex-col justify-between">
                        <div className="font-extrabold text-sm text-[#1F5B5B] uppercase tracking-wider mb-2">
                          {item.topic}
                        </div>
                        <div className="text-xs text-[#24322F] leading-relaxed">
                          {item.advice}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Recommended Screening Tests & Timelines */}
                <div className="rounded-2xl border border-[#D8CDBB] bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#1F5B5B] border-b border-[#D8CDBB]/40 pb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#E0A458]" /> Recommended Screening Tests
                  </h3>
                  <div className="space-y-3">
                    {plan.screenings?.map((item: any, index: number) => (
                      <div key={index} className="rounded-xl border border-[#D8CDBB]/40 p-4 bg-[#FBF6EE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-bold text-sm text-[#24322F]">{item.test}</div>
                          <div className="text-xs text-[#6E8B8B] leading-relaxed">{item.reason}</div>
                        </div>
                        <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#DCEEE6] text-[#1F5B5B] shrink-0 self-start sm:self-center border border-[#1F5B5B]/10">
                          {item.timeline}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Key Health Risks to Monitor */}
                <div className="rounded-2xl border border-[#D8CDBB] bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#1F5B5B] border-b border-[#D8CDBB]/40 pb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-[#E0A458]" /> Key Health Risks to Monitor
                  </h3>
                  <ul className="space-y-2.5 pl-2">
                    {plan.risks?.map((risk: string, index: number) => (
                      <li key={index} className="text-xs text-[#24322F] flex items-start gap-2.5 leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#E0A458] shrink-0 mt-1.5" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. Non-Diagnostic Disclaimer Alert */}
                <div className="rounded-2xl bg-[#F3DCB0] text-[#6E4A0B] p-5 border border-[#E0A458]/20 flex gap-3 shadow-sm">
                  <ShieldCheck className="h-5.5 w-5.5 shrink-0 mt-0.5 text-[#6E4A0B]" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Health Information Posture Notice</h4>
                    <p className="text-xs mt-1 leading-relaxed">
                      This plan represents personalized preventive advice and is strictly non-diagnostic. You must consult with a qualified medical physician to establish diagnostic screenings, clinical treatments, or drug switch paths.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


