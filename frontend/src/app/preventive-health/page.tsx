"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { HeartPulse, Sparkles, RefreshCw, AlertCircle, ShieldCheck, ArrowRight, UserCheck, CheckCircle2 } from "lucide-react";

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
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${backendBaseUrl}/api/profile`, {
          headers: {
            "Authorization": `Bearer ${session?.access_token || ""}`,
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
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${backendBaseUrl}/api/preventive-health`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`,
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-20 text-center animate-pulse font-sans">
        <RefreshCw className="h-8 w-8 animate-spin text-sky-600 mb-4" />
        <p className="text-sm font-medium text-slate-500">Checking health profile completion...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="mb-8 border-b border-slate-200 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0F2744] flex items-center justify-center shadow-md">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F2744] flex items-center gap-2">
                NxtHealth <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200/50">Planner</span>
              </h1>
              <p className="text-xs text-slate-500">Explainable healthcare decision platform — non-diagnostic guidance</p>
            </div>
          </div>
        </header>

        {/* Condition A: Profile Incomplete (<100%) */}
        {completionPercentage < 100 ? (
          <div className="rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 p-6 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-rose-700">100% Profile Completion Required</h2>
                <p className="text-sm mt-1.5 leading-relaxed text-rose-600">
                  To provide accurate, personalized preventive advice, Gemini needs your complete demographic, vitals, and lifestyle context.
                </p>
              </div>
            </div>

            {/* Meter Bar */}
            <div className="bg-white/45 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Current Completion Percentage</span>
                <div className="text-xl font-extrabold text-rose-700 mt-0.5">{completionPercentage}%</div>
              </div>
              <div className="w-full sm:w-64 bg-slate-200/50 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rose-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => router.push("/profile")}
                className="bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs py-3.5 px-6 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm border border-rose-800"
              >
                Complete Profile Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Condition B: Profile Complete (=100%) */
          <div className="space-y-6 animate-fadeIn">
            {/* Context Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F2744]">
                <UserCheck className="h-5 w-5 text-sky-600" /> Verified Profile Context
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                  Age: {profile?.age} Yrs
                </span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                  Gender: {profile?.gender}
                </span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                  BMI: {getBmiCategory()}
                </span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                  Activity: {profile?.activity_level}
                </span>
                {profile?.pre_existing_conditions?.length > 0 && (
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    Conditions: {profile.pre_existing_conditions.join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Input Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <form onSubmit={handleGetAdvice} className="space-y-4">
                <label className="block text-sm font-bold text-slate-800">
                  What health advice, lifestyle goal, or guidance do you need today?
                  <textarea
                    rows={4}
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="e.g. I experience afternoon sluggishness and want a diet/screening plan given my family history of heart disease..."
                    className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 py-3.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      Analyzing wellness priorities...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-white" />
                      Get Personalized AI Advice
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Error Message */}
            {status === "error" && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 p-6 shadow-sm flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-rose-700">Guidance Failed</h3>
                  <p className="text-sm text-rose-600 mt-1 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Advice Response - Refactored to native MedTech UI Cards */}
            {status === "success" && plan && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 1. Lifestyle Modifications Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#0F2744] border-b border-slate-100 pb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-sky-600" /> Lifestyle Modifications
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {plan.lifestyle?.map((item: any, index: number) => (
                      <div key={index} className="rounded-xl bg-slate-50 p-4 border border-slate-200/60 flex flex-col justify-between">
                        <div className="font-extrabold text-sm text-[#0F2744] uppercase tracking-wider mb-2">
                          {item.topic}
                        </div>
                        <div className="text-xs text-slate-600 leading-relaxed">
                          {item.advice}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Recommended Screening Tests & Timelines */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#0F2744] border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-sky-600" /> Recommended Screening Tests
                  </h3>
                  <div className="space-y-3">
                    {plan.screenings?.map((item: any, index: number) => (
                      <div key={index} className="rounded-xl border border-slate-200/60 p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-bold text-sm text-slate-900">{item.test}</div>
                          <div className="text-xs text-slate-500 leading-relaxed">{item.reason}</div>
                        </div>
                        <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 shrink-0 self-start sm:self-center border border-sky-200/50">
                          {item.timeline}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Key Health Risks to Monitor */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#0F2744] border-b border-slate-100 pb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-sky-600" /> Key Health Risks to Monitor
                  </h3>
                  <ul className="space-y-2.5 pl-2">
                    {plan.risks?.map((risk: string, index: number) => (
                      <li key={index} className="text-xs text-slate-700 flex items-start gap-2.5 leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-600 shrink-0 mt-1.5" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. Non-Diagnostic Disclaimer Alert */}
                <div className="rounded-2xl bg-sky-50 text-sky-800 p-5 border border-sky-100 flex gap-3 shadow-sm">
                  <ShieldCheck className="h-5.5 w-5.5 shrink-0 mt-0.5 text-sky-700" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Health Information Posture Notice</h4>
                    <p className="text-xs mt-1 leading-relaxed text-sky-700">
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
