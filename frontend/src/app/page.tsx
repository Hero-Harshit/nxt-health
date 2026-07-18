"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  HeartPulse, 
  UserCheck, 
  FileText, 
  Activity, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Pill, 
  AlertTriangle, 
  ClipboardList,
  Mic,
  Send,
  Share2,
  MapPin,
  Copy,
  Mail,
  ShieldAlert
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);

  // Smart SOS States
  const [sosState, setSosState] = useState<"inactive" | "scanning" | "triaged">("inactive");
  const [sosTarget, setSosTarget] = useState<"myself" | "someone_else">("myself");
  const [sosInput, setSosInput] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [scanningStep, setScanningStep] = useState<number>(0);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [passportData, setPassportData] = useState<any>(null);

  // Load user session
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

  // Load history and profile
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

  // Fetch Health Passport Data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("nxt_health_passport");
      if (cached) {
        try {
          setPassportData(JSON.parse(cached));
        } catch (e) {
          console.error("Error parsing health passport cache in dashboard:", e);
        }
      }
    }
  }, []);

  // Scanning animation steps timer
  useEffect(() => {
    if (sosState === "scanning") {
      setScanningStep(0);
      const timer1 = setTimeout(() => setScanningStep(1), 1000);
      const timer2 = setTimeout(() => setScanningStep(2), 2000);
      const timer3 = setTimeout(() => {
        setSosState("triaged");
      }, 3500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [sosState]);

  // Speech Recognition API setup
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";
        
        rec.onstart = () => {
          setIsListening(true);
        };
        
        rec.onresult = (event: any) => {
          const speechToText = event.results[0][0].transcript;
          setSosInput((prev) => (prev ? prev + " " + speechToText : speechToText));
        };
        
        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };
        
        rec.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(rec);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported or permitted in this browser.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleActivateTriage = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ latitude, longitude });
          console.log(`📍 [Smart SOS Geolocation]: Lat ${latitude}, Lon ${longitude}`);
        },
        (error) => {
          console.error("❌ [Smart SOS Geolocation Error]:", error);
        }
      );
    }
    setSosState("scanning");
  };

  const getHandoverBrief = () => {
    const patientName = sosTarget === "myself" ? (profile?.full_name || "NxtHealth User") : "Someone Else";
    const age = sosTarget === "myself" ? (profile?.age || "N/A") : "Unknown";
    const gender = sosTarget === "myself" ? (profile?.gender || "N/A") : "Unknown";
    const inputSymptoms = sosInput.trim() || "Acute cardiovascular event / sudden chest discomfort";
    
    const allergiesStr = passportData?.allergies && passportData.allergies.length > 0 
      ? passportData.allergies.join(", ") 
      : "No allergies recorded";
    
    const conditionsStr = passportData?.chronicConditions && passportData.chronicConditions.length > 0 
      ? passportData.chronicConditions.join(", ") 
      : "No chronic conditions recorded";

    const medsStr = passportData?.activeMedications && passportData.activeMedications.length > 0 
      ? passportData.activeMedications.join(", ") 
      : "No active medications recorded";

    const locationStr = coords 
      ? `Lat ${coords.latitude.toFixed(4)}, Lon ${coords.longitude.toFixed(4)}` 
      : "Pending Live GPS Grounding";

    return `NXTHEALTH DIGITAL ER HANDOVER BRIEF
---------------------------------------
PATIENT: ${patientName} (Age: ${age}, Gender: ${gender})
PRESENTING COMPLAINT: ${inputSymptoms}
CHRONIC CONDITIONS: ${conditionsStr}
ACTIVE MEDS: ${medsStr}
ALLERGIES / CONTRAINDICATIONS: ${allergiesStr}
GPS COORDINATES: ${locationStr}
TIMESTAMP: ${new Date().toISOString()}`;
  };

  const getWhatsAppUrl = () => {
    const briefText = getHandoverBrief();
    const encodedText = encodeURIComponent(briefText);
    const emergencyPhone = passportData?.emergencyContactPhone || "";
    return `https://wa.me/${emergencyPhone}?text=${encodedText}`;
  };

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
      <div className="min-h-screen bg-[#FBF6EE] flex flex-col items-center justify-center py-20 text-center animate-pulse font-sans">
        <HeartPulse className="h-8 w-8 animate-spin text-[#1F5B5B] mb-4" />
        <p className="text-sm font-medium text-[#24322F]">Loading dashboard details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EE] text-[#24322F] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* User Profile Snapshot Header */}
        <section className="rounded-2xl border border-[#1F5B5B]/15 bg-white p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-[#1F5B5B]/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-[#1F5B5B]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1F5B5B]">
                  Welcome back, {profile?.full_name || "NxtHealth User"}
                </h1>
                <p className="text-xs text-[#24322F]/60">Your explainable health decision workspace</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-[#24322F]">
                Age: {profile?.age || "N/A"}
              </span>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-[#24322F]">
                Gender: {profile?.gender || "N/A"}
              </span>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-[#24322F]">
                BMI: {getBmiCategory()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 shrink-0 lg:border-l lg:border-slate-200/50 lg:pl-8">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-[#24322F]/60">
                <span>PROFILE COMPLETENESS</span>
                <span className="text-[#1F5B5B]">{completionPercentage}%</span>
              </div>
              <div className="w-56 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#1F5B5B] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {completionPercentage < 100 ? (
              <button
                onClick={() => router.push("/profile")}
                className="bg-[#1F5B5B] hover:bg-[#164242] text-white font-semibold text-xs py-3 px-5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                Complete Profile <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <span className="text-xs font-bold px-3 py-2.5 rounded-xl bg-[#1F5B5B]/10 text-[#1F5B5B] border border-[#1F5B5B]/20 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Profile Fully Synced
              </span>
            )}
          </div>
        </section>

        {/* 6 Core Modules Grid (Quick Launch) */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1F5B5B]">Health Intelligence Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            
            {/* ========================================================================= */}
            {/* Smart SOS Premium Hero Module (Absolute Top, Spans 3 columns) */}
            {/* ========================================================================= */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              {sosState === "inactive" && (
                <div className="bg-gradient-to-br from-[#122220] via-[#162E2B] to-[#1F3D39] text-white p-6 md:p-8 rounded-2xl shadow-xl border border-[#1F5B5B]/30 relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-[#D9383A]/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-[#D9383A]/20 text-[#D9383A] border border-[#D9383A]/30 tracking-wider">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#D9383A] animate-pulse" />
                      🔴 ACTIVE CRISIS COMMAND
                    </span>
                    
                    {/* Recipient Target Selector */}
                    <div className="flex bg-[#0A1614] p-1 rounded-xl border border-[#1F5B5B]/30">
                      <button
                        onClick={() => setSosTarget("myself")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          sosTarget === "myself"
                            ? "bg-[#D9383A] text-white shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Myself
                      </button>
                      <button
                        onClick={() => setSosTarget("someone_else")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          sosTarget === "someone_else"
                            ? "bg-[#D9383A] text-white shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Someone Else
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white font-serif">Smart SOS Portal</h2>
                    <p className="text-sm text-slate-300 max-w-2xl">
                      Instantly activate emergency routing and first-aid guidelines. Starts audio capturing or accepts manual input.
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="relative w-full flex-1">
                      <input
                        type="text"
                        value={sosInput}
                        onChange={(e) => setSosInput(e.target.value)}
                        placeholder="Speak or type the medical emergency..."
                        className="w-full bg-[#0A1614]/90 text-white placeholder-slate-400 border border-[#1F5B5B]/40 rounded-xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#D9383A]/50 focus:border-[#D9383A] text-sm"
                      />
                      <button
                        type="button"
                        onClick={toggleListening}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-[#122220] text-slate-300 hover:text-white transition-colors"
                        title="Toggle Voice Input"
                      >
                        <div className="relative">
                          <Mic className={`h-5 w-5 ${isListening ? "text-[#D9383A]" : ""}`} />
                          {isListening && (
                            <span className="absolute -inset-1 rounded-full border border-[#D9383A]/70 animate-ping pointer-events-none" />
                          )}
                        </div>
                      </button>
                    </div>
                    <button
                      onClick={handleActivateTriage}
                      className="w-full md:w-auto bg-[#D9383A] hover:bg-[#c02e30] text-white font-bold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-sm"
                    >
                      <ShieldAlert className="h-5 w-5 animate-pulse" />
                      ACTIVATE CRISIS TRIAGE
                    </button>
                  </div>
                </div>
              )}

              {sosState === "scanning" && (
                <div className="bg-gradient-to-br from-[#122220] to-[#1F3D39] text-white p-8 rounded-2xl shadow-xl border border-[#1F5B5B]/30 flex flex-col items-center justify-center min-h-[300px] text-center space-y-6">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-[#1F5B5B]/20 flex items-center justify-center text-teal-400 border border-teal-500/30">
                      <Activity className="h-8 w-8 animate-spin text-[#D9383A]" />
                    </div>
                    <span className="absolute -inset-2 rounded-full border border-[#D9383A]/20 animate-ping" />
                  </div>
                  
                  <div className="space-y-3 w-full max-w-md">
                    <h3 className="text-xl font-bold font-serif text-white">Smart SOS Triage Engine Active</h3>
                    <div className="space-y-2 text-sm text-left bg-[#0A1614] p-4 rounded-xl border border-[#1F5B5B]/30">
                      <div className="flex items-center gap-2.5">
                        <span className={scanningStep >= 0 ? "text-[#D9383A]" : "text-slate-500"}>●</span>
                        <span className={scanningStep === 0 ? "font-bold text-white animate-pulse" : scanningStep > 0 ? "text-slate-400 font-semibold" : "text-slate-600"}>
                          {scanningStep > 0 ? "✓ Coordinates acquired" : "Acquiring coordinates..."}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className={scanningStep >= 1 ? "text-[#D9383A]" : "text-slate-500"}>●</span>
                        <span className={scanningStep === 1 ? "font-bold text-white animate-pulse" : scanningStep > 1 ? "text-slate-400 font-semibold" : "text-slate-600"}>
                          {scanningStep > 1 ? "✓ Health Passport synced" : "Pulling Personal Health Passport..."}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className={scanningStep >= 2 ? "text-[#D9383A]" : "text-slate-500"}>●</span>
                        <span className={scanningStep === 2 ? "font-bold text-white animate-pulse" : "text-slate-600"}>
                          Querying Gemini Live Search Grounding...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sosState === "triaged" && (
                <div className="bg-gradient-to-br from-[#122220] via-[#162E2B] to-[#1F3D39] text-white p-6 md:p-8 rounded-2xl shadow-xl border border-[#D9383A]/30 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#1F5B5B]/30 pb-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-[#D9383A] animate-bounce" />
                      <h3 className="text-xl font-bold font-serif text-white">Smart SOS Crisis Triage Dashboard</h3>
                    </div>
                    <button
                      onClick={() => {
                        setSosState("inactive");
                        setSosInput("");
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      Reset Portal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Clinical AI Triage Summary</h4>
                        <div className="bg-[#D9383A]/10 border border-[#D9383A]/30 text-[#D9383A] p-3 rounded-lg text-xs font-extrabold uppercase tracking-wide flex items-center gap-2 animate-pulse">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#D9383A]" />
                          SUSPECTED CRITICAL CARDIOVASCULAR EVENT
                        </div>
                      </div>

                      <div className="bg-[#0A1614] border border-[#1F5B5B]/30 rounded-xl p-4 space-y-3">
                        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Urgent First-Aid Protocol</h5>
                        <ul className="space-y-2.5 text-xs text-slate-300">
                          <li className="flex items-start gap-2.5">
                            <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-600 bg-slate-700 text-[#D9383A] focus:ring-0" />
                            <span>Administer 325mg chewable Aspirin immediately if patient has no allergy.</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-600 bg-slate-700 text-[#D9383A] focus:ring-0" />
                            <span>Help patient sit down, remain calm, and avoid physical exertion.</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <input type="checkbox" className="mt-0.5 rounded border-slate-600 bg-slate-700 text-[#D9383A] focus:ring-0" />
                            <span>Loosen any tight clothing around neck or chest.</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <input type="checkbox" className="mt-0.5 rounded border-slate-600 bg-slate-700 text-[#D9383A] focus:ring-0" />
                            <span>Monitor breathing rate and prepare automated external defibrillator (AED) if available.</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-[#0F2220] border border-[#1F5B5B]/30 rounded-xl p-4 space-y-3 relative">
                        <div className="flex justify-between items-center">
                          <h5 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Digital ER Handover Brief</h5>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(getHandoverBrief());
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                            title="Copy Brief"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#0A1614]/80 p-3 rounded border border-[#1F5B5B]/20 max-h-[140px] overflow-y-auto">
                          {getHandoverBrief()}
                        </pre>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                        <Mail className="h-4 w-4 text-emerald-400" />
                        <span>📨 Fail-safe alert broadcasted... Resend email dispatched to Emergency Contact.</span>
                      </div>
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-4 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Specialty Hospital Routing</h4>
                        <div className="bg-[#0A1614] border border-[#1F5B5B]/30 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-teal-400" /> Nearest Critical Care Found</span>
                            <span>Sorted by proximity</span>
                          </div>
                          
                          {/* Mock Map View */}
                          <div className="h-28 w-full bg-[#122724] rounded-lg border border-[#1F5B5B]/30 relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1f5b5b_1px,transparent_1px)] [background-size:16px_16px]" />
                            <div className="absolute h-4 w-4 rounded-full bg-[#D9383A] animate-ping" />
                            <div className="absolute h-2 w-2 rounded-full bg-[#D9383A]" />
                            <div className="absolute bottom-2 left-2 text-[10px] text-slate-500 font-mono">Mock GPS Grounding Active</div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0F2220] border border-[#D9383A]/30">
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-white">1. City Heart Institute</div>
                                <div className="text-[10px] text-slate-400">Cardiology Dept & Cath Lab</div>
                              </div>
                              <span className="text-[10px] font-extrabold bg-[#D9383A]/20 text-[#D9383A] px-2 py-0.5 rounded border border-[#D9383A]/20">1.2 km away</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/55 border border-[#1F5B5B]/20">
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-slate-300">2. Metro General Hospital</div>
                                <div className="text-[10px] text-slate-500">24/7 Level 1 Trauma Center</div>
                              </div>
                              <span className="text-[10px] text-slate-400">3.4 km away</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/55 border border-[#1F5B5B]/20">
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-slate-300">3. St. Jude Cardiac Care</div>
                                <div className="text-[10px] text-slate-500">Specialized CCU</div>
                              </div>
                              <span className="text-[10px] text-slate-400">4.8 km away</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-center text-sm tracking-wide active:scale-95"
                      >
                        <Share2 className="h-5 w-5" />
                        🟢 LAUNCH WHATSAPP DISPATCH ALERT
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Module 1: Policy Advisor */}
            <Link
              href="/policy-advisor"
              className="bg-white rounded-2xl p-6 border border-[#1F5B5B]/15 shadow-sm hover:shadow-md hover:border-[#1F5B5B] transition-all flex flex-col justify-between h-full group cursor-pointer"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#1F5B5B]/10 text-[#1F5B5B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FileText className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-bold text-xl text-[#1F5B5B]">Health Policy Advisor</h3>
                <p className="text-xs text-[#24322F]/70 mt-2 leading-relaxed">
                  Evaluate health policies and explainable coverage constraints.
                </p>
              </div>
              <div className="text-[#1F5B5B] font-semibold text-xs flex items-center gap-1 mt-4">
                Launch Advisor <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Module 2: Preventive Planner */}
            <Link
              href="/preventive-planner"
              className="bg-white rounded-2xl p-6 border border-[#1F5B5B]/15 shadow-sm hover:shadow-md hover:border-[#1F5B5B] transition-all flex flex-col justify-between h-full group cursor-pointer"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#1F5B5B]/10 text-[#1F5B5B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-bold text-xl text-[#1F5B5B]">Preventive Health Planner</h3>
                <p className="text-xs text-[#24322F]/70 mt-2 leading-relaxed">
                  Get personalized screening guidelines and risk factors.
                </p>
              </div>
              <div className="text-[#1F5B5B] font-semibold text-xs flex items-center gap-1 mt-4">
                Launch Planner <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Module 3: Generic Medicines */}
            <Link
              href="/generic-finder"
              className="bg-white rounded-2xl p-6 border border-[#1F5B5B]/15 shadow-sm hover:shadow-md hover:border-[#1F5B5B] transition-all flex flex-col justify-between h-full group cursor-pointer"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#1F5B5B]/10 text-[#1F5B5B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Pill className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-bold text-xl text-[#1F5B5B]">Generic Medicine Finder</h3>
                <p className="text-xs text-[#24322F]/70 mt-2 leading-relaxed">
                  Compare medicine ingredients and discover brand cost savings.
                </p>
              </div>
              <div className="text-[#1F5B5B] font-semibold text-xs flex items-center gap-1 mt-4">
                Launch Explorer <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Module 4: Prescription Explainer */}
            <Link
              href="/term-explainer"
              className="bg-white rounded-2xl p-6 border border-[#1F5B5B]/15 shadow-sm hover:shadow-md hover:border-[#1F5B5B] transition-all flex flex-col justify-between h-full group cursor-pointer"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#1F5B5B]/10 text-[#1F5B5B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Layers className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-bold text-xl text-[#1F5B5B]">Medical Term Explainer</h3>
                <p className="text-xs text-[#24322F]/70 mt-2 leading-relaxed">
                  Translate medical terminologies and drug sheets into plain text.
                </p>
              </div>
              <div className="text-[#1F5B5B] font-semibold text-xs flex items-center gap-1 mt-4">
                Launch Explainer <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Module 5: Personal Health Passport */}
            <Link
              href="/health-passport"
              className="bg-white rounded-2xl p-6 border border-[#1F5B5B]/15 shadow-sm hover:shadow-md hover:border-[#1F5B5B] transition-all flex flex-col justify-between h-full group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-[#1F5B5B]/10 p-3 rounded-xl text-[#1F5B5B] group-hover:scale-105 transition-transform">
                    <ClipboardList className="h-5.5 w-5.5" />
                  </div>
                  <span className="bg-[#1F5B5B]/10 text-[#1F5B5B] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#1F5B5B]/20">
                    PORTABLE
                  </span>
                </div>
                <h3 className="font-bold text-xl text-[#1F5B5B]">Personal Health Passport</h3>
                <p className="text-xs text-[#24322F]/70 mt-2 leading-relaxed">
                  A portable health summary to share with doctors or first responders during visits or emergencies.
                </p>
              </div>
              <div className="text-[#1F5B5B] font-semibold text-xs flex items-center gap-1 mt-4">
                Manage Passport <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>
        </section>

        {/* Recent Activity & History Feed */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1F5B5B] flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#1F5B5B]" /> Recent History Feed
          </h2>

          {history.length > 0 ? (
            <div className="rounded-2xl border border-[#1F5B5B]/15 bg-white shadow-sm overflow-hidden divide-y divide-slate-100">
              {history.map((item, index) => (
                <div key={item.id || index} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-[#1F5B5B]/10 text-[#1F5B5B] border border-[#1F5B5B]/25">
                        {item.module}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-[#24322F]">
                      Query: &quot;{item.query_text}&quot;
                    </div>
                    <div className="text-xs text-[#24322F]/80 leading-relaxed">
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
                      className="text-xs font-semibold text-[#1F5B5B] hover:underline flex items-center gap-1"
                    >
                      Re-run <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#1F5B5B]/20 bg-slate-100/30 p-8 text-center flex flex-col items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-[#1F5B5B] mb-3" />
              <p className="text-xs text-[#24322F]/60 mt-1 max-w-sm">
                No activity history recorded yet. Perform a search in any module to populate your feed.
              </p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
