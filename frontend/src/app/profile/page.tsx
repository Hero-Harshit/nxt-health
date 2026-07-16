"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { HeartPulse, ShieldCheck, RefreshCw, AlertCircle, Award, ArrowRight } from "lucide-react";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const preExistingOptions = ["Diabetes", "Hypertension", "Thyroid", "Asthma", "Cholesterol"];
const familyHistoryOptions = ["Heart Disease", "Diabetes", "Cancer", "Hypertension", "Stroke"];

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Form Fields State
  const [fullName, setFullName] = useState<string>("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<string>("");
  const [heightCm, setHeightCm] = useState<number | "">("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [preExisting, setPreExisting] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [smokingStatus, setSmokingStatus] = useState<string>("");
  const [activityLevel, setActivityLevel] = useState<string>("");
  const [dietaryPreference, setDietaryPreference] = useState<string>("");

  const [completionPercentage, setCompletionPercentage] = useState<number>(0);

  // Get Session Token
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

  // Fetch initial profile
  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
      try {
        const response = await fetch(`${backendBaseUrl}/api/profile`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to retrieve profile information.");
        }

        const data = await response.json();
        if (data.status === "ok" && data.profile) {
          const p = data.profile;
          setFullName(p.full_name || "");
          setAge(p.age || "");
          setGender(p.gender || "");
          setHeightCm(p.height_cm || "");
          setWeightKg(p.weight_kg || "");
          setPreExisting(p.pre_existing_conditions || []);
          setFamilyHistory(p.family_history || []);
          setSmokingStatus(p.smoking_status || "");
          setActivityLevel(p.activity_level || "");
          setDietaryPreference(p.dietary_preference || "");
          setCompletionPercentage(data.completion_percentage || 0);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Could not retrieve profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  // Live BMI Calculation
  const calculateBMI = () => {
    if (!heightCm || !weightKg) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return {
      value: bmi.toFixed(1),
      category:
        bmi < 18.5
          ? "Underweight"
          : bmi < 25
          ? "Normal weight"
          : bmi < 30
          ? "Overweight"
          : "Obese",
    };
  };

  const bmiInfo = calculateBMI();

  // Multi-select Checkbox pill handlers
  const handlePreExistingToggle = (option: string) => {
    if (option === "None") {
      setPreExisting(["None"]);
      return;
    }
    setPreExisting((prev) => {
      const filtered = prev.filter((o) => o !== "None");
      if (filtered.includes(option)) {
        return filtered.filter((o) => o !== option);
      } else {
        return [...filtered, option];
      }
    });
  };

  const handleFamilyHistoryToggle = (option: string) => {
    if (option === "None") {
      setFamilyHistory(["None"]);
      return;
    }
    setFamilyHistory((prev) => {
      const filtered = prev.filter((o) => o !== "None");
      if (filtered.includes(option)) {
        return filtered.filter((o) => o !== option);
      } else {
        return [...filtered, option];
      }
    });
  };

  // Submit Handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

    try {
      const response = await fetch(`${backendBaseUrl}/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          age: age === "" ? null : Number(age),
          gender,
          height_cm: heightCm === "" ? null : Number(heightCm),
          weight_kg: weightKg === "" ? null : Number(weightKg),
          pre_existing_conditions: preExisting,
          family_history: familyHistory,
          smoking_status: smokingStatus,
          activity_level: activityLevel,
          dietary_preference: dietaryPreference,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile details.");
      }

      const data = await response.json();
      if (data.status === "ok") {
        setCompletionPercentage(data.completion_percentage);
        setSuccessMsg("Health profile updated successfully!");
      } else {
        throw new Error(data.message || "Unknown profile save error.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred while updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-20 text-center animate-pulse font-sans">
        <RefreshCw className="h-8 w-8 animate-spin text-sky-600 mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading your health profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Bar */}
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0F2744] flex items-center justify-center shadow-md">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#0F2744]">Health Profile Editor</h1>
              <p className="text-xs text-slate-500">Fill in demographic, stats, and lifestyle to unlock planning</p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completion Status</span>
              <div className="text-lg font-extrabold text-sky-700 mt-0.5">{completionPercentage}%</div>
            </div>
            <div className="w-24 bg-slate-100 rounded-full h-3.5 overflow-hidden">
              <div
                className="bg-sky-600 h-3.5 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </header>

        {/* Completion Action Banner */}
        {completionPercentage === 100 && (
          <div className="rounded-2xl bg-sky-100 text-sky-700 p-6 border border-sky-200/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <Award className="h-8 w-8 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold">Your profile is 100% complete!</h3>
                <p className="text-xs text-sky-700/90 mt-1 leading-relaxed">
                  You have unlocked the personalized Preventive Health AI Advisor. Click to query the planner.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/preventive-health")}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs py-3 px-5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              Go to Planner <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          {/* Section 1: Demographics */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F2744] border-b border-slate-100 pb-2 mb-4">
              Demographics
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Age</label>
                <input
                  type="number"
                  required
                  min={18}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 30"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                <select
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Vitals & BMI */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F2744] border-b border-slate-100 pb-2 mb-4">
              Vitals
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  required
                  min={50}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 175"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={300}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 70"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all"
                />
              </div>

              <div className="flex flex-col justify-end">
                {bmiInfo ? (
                  <div className="rounded-xl bg-slate-100 border border-slate-200/50 p-3 flex justify-between items-center h-10.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">BMI: {bmiInfo.value}</span>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200/30">
                      {bmiInfo.category}
                    </span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 h-10.5 flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                    Awaiting vitals...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Pre-existing & Family History */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F2744] border-b border-slate-100 pb-2 mb-4">
              Medical Conditions & Family History
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Pre-existing Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {preExistingOptions.map((opt) => {
                    const isSelected = preExisting.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handlePreExistingToggle(opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-sky-600 border-sky-600 text-white"
                            : "bg-white border-slate-200 text-slate-500 hover:border-sky-600/40"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handlePreExistingToggle("None")}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      preExisting.includes("None")
                        ? "bg-slate-800 border-slate-800 text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-800/40"
                    }`}
                  >
                    None
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Family Medical History</label>
                <div className="flex flex-wrap gap-2">
                  {familyHistoryOptions.map((opt) => {
                    const isSelected = familyHistory.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleFamilyHistoryToggle(opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-sky-600 border-sky-600 text-white"
                            : "bg-white border-slate-200 text-slate-500 hover:border-sky-600/40"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handleFamilyHistoryToggle("None")}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      familyHistory.includes("None")
                        ? "bg-slate-800 border-slate-800 text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-800/40"
                    }`}
                  >
                    None
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Lifestyle Factors */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F2744] border-b border-slate-100 pb-2 mb-4">
              Lifestyle Factors
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Smoking Status</label>
                <select
                  required
                  value={smokingStatus}
                  onChange={(e) => setSmokingStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
                >
                  <option value="">Select status</option>
                  <option value="Non-Smoker">Non-Smoker</option>
                  <option value="Former Smoker">Former Smoker</option>
                  <option value="Occasional Smoker">Occasional Smoker</option>
                  <option value="Active Smoker">Active Smoker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Activity Level</label>
                <select
                  required
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
                >
                  <option value="">Select activity</option>
                  <option value="Sedentary">Sedentary (desk job, low movement)</option>
                  <option value="Lightly Active">Lightly Active (light exercise/sports)</option>
                  <option value="Moderately Active">Moderately Active (regular sport/walks)</option>
                  <option value="Very Active">Very Active (heavy physical activity)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dietary Preference</label>
                <select
                  required
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
                >
                  <option value="">Select diet</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Eggetarian">Eggetarian</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-4 text-xs flex gap-2.5 items-start">
              <AlertCircle className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-sky-100 text-sky-700 p-4 text-xs flex gap-2.5 items-start border border-sky-200">
              <ShieldCheck className="h-5 w-5 text-sky-700 shrink-0 mt-0.5" />
              <div className="font-semibold leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Action Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-sky-600"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                Saving profile data...
              </>
            ) : (
              "Save & Update Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
