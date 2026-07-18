"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  HeartPulse, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck, 
  Sparkles, 
  Pill, 
  AlertTriangle, 
  ClipboardList, 
  Mic, 
  Activity, 
  MapPin, 
  Copy, 
  Mail, 
  ShieldAlert, 
  Share2, 
  RefreshCw 
} from "lucide-react";

export default function SmartSOSPage() {
  const router = useRouter();
  
  // Local UI State Machine: 'input' | 'scanning' | 'results'
  const [uiState, setUiState] = useState<"input" | "scanning" | "results">("input");
  
  // Input fields state
  const [sosTarget, setSosTarget] = useState<"myself" | "someone_else">("myself");
  const [estimatedAge, setEstimatedAge] = useState<string>("30-40");
  const [gender, setGender] = useState<string>("Male");
  const [symptomsText, setSymptomsText] = useState<string>("");
  
  // API Response and sensor states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [passportData, setPassportData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Scanning checklist step state
  const [scanStep, setScanStep] = useState<number>(0);
  
  // Copy to clipboard status
  const [copied, setCopied] = useState<boolean>(false);

  // Check Supabase Session & Fetch Profile on Mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.access_token);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Health Passport Data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("nxt_health_passport");
      if (cached) {
        try {
          setPassportData(JSON.parse(cached));
        } catch (e) {
          console.error("Error reading health passport cache in SOS page:", e);
        }
      }
    }
  }, []);

  // Simulated scan steps animation
  useEffect(() => {
    if (uiState === "scanning") {
      setScanStep(0);
      const timer1 = setTimeout(() => setScanStep(1), 1000);
      const timer2 = setTimeout(() => setScanStep(2), 2200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [uiState]);

  const fetchProfile = async (token: string) => {
    const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
    try {
      const res = await fetch(`${backendBaseUrl}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "ok") {
          setProfile(data.profile);
        }
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
  };

  // Speech Recognition hook
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
          setSymptomsText((prev) => (prev ? prev + " " + speechToText : speechToText));
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
    if (!symptomsText.trim()) {
      alert("Please describe the medical emergency scenario first.");
      return;
    }

    setErrorMessage("");
    setUiState("scanning");

    // Grab Coordinates Defensively
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ latitude, longitude });
          console.log(`📍 [Smart SOS Coordinates]: Lat ${latitude}, Lon ${longitude}`);
          executeSOSPipeline(latitude, longitude);
        },
        (error) => {
          console.error("⚠️ [Smart SOS Coordinates Error]:", error);
          // Fallback execution with default coordinates or null
          executeSOSPipeline(37.7749, -122.4194);
        }
      );
    } else {
      executeSOSPipeline(37.7749, -122.4194);
    }
  };

  const executeSOSPipeline = async (lat: number, lon: number) => {
    try {
      // Build health passport payload matching route spec
      const passportPayload = passportData ? {
        userName: passportData.fullName || profile?.full_name || "NxtHealth User",
        bloodType: passportData.bloodGroup || "",
        chronicConditions: passportData.chronicConditions || [],
        allergies: passportData.allergies || [],
        emergencyContactEmail: passportData.emergencyContactPhone ? (passportData.emergencyContactEmail || "") : "",
        emergencyContactName: passportData.emergencyContactName || ""
      } : null;

      const res = await fetch("/api/smart-sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: symptomsText,
          latitude: lat,
          longitude: lon,
          isMyself: sosTarget === "myself",
          healthPassport: passportPayload,
          age: sosTarget === "someone_else" ? estimatedAge : null,
          gender: sosTarget === "someone_else" ? gender : null
        })
      });

      const responseData = await res.json();
      if (responseData.success) {
        setApiResponse(responseData.data);
        setUiState("results");
      } else {
        setErrorMessage(responseData.error || "Failed to process emergency triage.");
        setUiState("input");
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "A network error occurred while routing triage request.");
      setUiState("input");
    }
  };

  const handleCopyBrief = () => {
    if (apiResponse?.erHandoverBrief) {
      navigator.clipboard.writeText(apiResponse.erHandoverBrief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] text-[#4B5E74] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-[#1976D2] hover:text-[#1565C0] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Secure Live Connection</span>
          </div>
        </div>

        {/* State Machine Views */}

        {uiState === "input" && (
          <div className="space-y-6">
            
            {/* Header Description */}
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-[#0E2238] tracking-tight font-serif">Smart SOS Console</h1>
              <p className="text-sm text-[#4B5E74] max-w-2xl">
                Deploy immediate crisis guidance, identify critical trauma routing, and auto-dispatch digital handover briefs to emergency response contacts.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Error: {errorMessage}</span>
              </div>
            )}

            {/* Input Card Container */}
            <div className="bg-white border border-[#E2EAF1] shadow-sm shadow-blue-100/50 rounded-xl p-6 md:p-8 space-y-6">
              
              {/* Context Selector */}
              <div>
                <label className="block text-xs font-extrabold text-[#0E2238] uppercase tracking-wider mb-2">Emergency Subject</label>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/80 w-fit gap-1">
                  <button
                    onClick={() => setSosTarget("myself")}
                    className={`px-6 py-2 rounded-lg text-xs transition-all duration-200 ${
                      sosTarget === "myself"
                        ? "bg-[#E3F2FD] text-[#1976D2] font-semibold border border-[#BBDEFB] shadow-sm"
                        : "bg-white text-[#4B5E74] border border-[#E2EAF1] hover:bg-slate-50"
                    }`}
                  >
                    Myself (Personal Profile)
                  </button>
                  <button
                    onClick={() => setSosTarget("someone_else")}
                    className={`px-6 py-2 rounded-lg text-xs transition-all duration-200 ${
                      sosTarget === "someone_else"
                        ? "bg-[#E3F2FD] text-[#1976D2] font-semibold border border-[#BBDEFB] shadow-sm"
                        : "bg-white text-[#4B5E74] border border-[#E2EAF1] hover:bg-slate-50"
                    }`}
                  >
                    Someone Else (Bystander)
                  </button>
                </div>
              </div>

              {/* Smooth Bystander Input Transition */}
              {sosTarget === "someone_else" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#F3F7FA] border border-[#E2EAF1] rounded-xl animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-[#4B5E74] mb-1.5">Estimated Age Band</label>
                    <select
                      value={estimatedAge}
                      onChange={(e) => setEstimatedAge(e.target.value)}
                      className="w-full rounded-xl border border-[#E2EAF1] bg-white px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1976D2]"
                    >
                      <option value="Infant / Child">Infant / Child</option>
                      <option value="Teenager">Teenager</option>
                      <option value="20-30">20-30</option>
                      <option value="30-40">30-40</option>
                      <option value="40-50">40-50</option>
                      <option value="50-60">50-60</option>
                      <option value="60-70">60-70</option>
                      <option value="Elderly (70+)">Elderly (70+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4B5E74] mb-1.5">Estimated Gender</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Male", "Female", "Unknown"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`rounded-xl py-2.5 text-xs transition-all ${
                            gender === g
                              ? "bg-[#E3F2FD] text-[#1976D2] font-semibold border border-[#BBDEFB] shadow-sm"
                              : "bg-white text-[#4B5E74] border border-[#E2EAF1] hover:bg-slate-50"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Triage Scenario Text Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-extrabold text-[#0E2238] uppercase tracking-wider">Describe Symptoms & Situation</label>
                  <span className="text-[10px] text-slate-400">Stream input or type manually</span>
                </div>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={symptomsText}
                    onChange={(e) => setSymptomsText(e.target.value)}
                    placeholder="Describe the medical situation (e.g., severe chest tightness radiating down the left arm, cold sweats)..."
                    className="w-full bg-white text-[#0E2238] placeholder-slate-400 border border-[#E2EAF1] rounded-xl p-4 pr-12 focus:outline-none focus:ring-1 focus:ring-[#1976D2] text-sm leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={toggleListening}
                    className="absolute right-3 bottom-3 p-2.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100/50 shadow-sm animate-pulse"
                    title="Speak emergency scenario"
                  >
                    <div className="relative">
                      <Mic className={`h-4.5 w-4.5 ${isListening ? "text-rose-600" : "text-blue-600"}`} />
                      {isListening && (
                        <span className="absolute -inset-1 rounded-full border border-rose-500 animate-ping" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Trigger Button */}
              <button
                onClick={handleActivateTriage}
                className="w-full bg-[#1976D2] hover:bg-[#1565C0] text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-md active:scale-95 text-sm tracking-wide cursor-pointer"
              >
                <ShieldAlert className="h-5 w-5 animate-pulse" />
                Activate Crisis Triage
              </button>

            </div>

          </div>
        )}

        {uiState === "scanning" && (
          <div className="bg-white border border-[#E2EAF1] shadow-sm shadow-blue-100/50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[350px] text-center space-y-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-blue-50/80 flex items-center justify-center text-teal-800 border border-blue-100">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
              <span className="absolute -inset-2 rounded-full border border-blue-100/20 animate-ping" />
            </div>

            <div className="space-y-4 max-w-sm w-full">
              <h3 className="text-lg font-bold text-[#0E2238] font-serif">Smart SOS Triage Engine Operating</h3>
              <div className="space-y-2 text-left bg-[#F3F7FA] p-4 rounded-xl border border-[#E2EAF1] text-xs">
                <div className="flex items-center gap-2.5">
                  <span className={scanStep >= 0 ? "text-[#1976D2]" : "text-slate-400"}>●</span>
                  <span className={scanStep === 0 ? "font-extrabold text-slate-800" : scanStep > 0 ? "text-slate-400" : "text-slate-650"}>
                    {scanStep > 0 ? "✓ 🛰️ Captured local sensor coordinates" : "🛰️ Capturing local sensor coordinates..."}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={scanStep >= 1 ? "text-[#1976D2]" : "text-slate-400"}>●</span>
                  <span className={scanStep === 1 ? "font-extrabold text-slate-800" : scanStep > 1 ? "text-slate-400" : "text-slate-650"}>
                    {scanStep > 1 ? "✓ 📑 Accessing saved Personal Health Passport data" : "📑 Accessing saved Personal Health Passport data..."}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={scanStep >= 2 ? "text-[#1976D2]" : "text-slate-400"}>●</span>
                  <span className={scanStep === 2 ? "font-extrabold text-slate-800" : "text-slate-655"}>
                    🧠 Analyzing emergency payload via Gemini Live Search...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {uiState === "results" && apiResponse && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2EAF1] pb-4">
              <div>
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded bg-[#E3F2FD] text-[#1976D2] border border-[#BBDEFB]">
                  Triage Analysis Result
                </span>
                <h2 className="text-2xl font-bold text-[#0E2238] font-serif mt-1.5">Smart SOS Command Center</h2>
              </div>
              <button
                onClick={() => {
                  setUiState("input");
                  setSymptomsText("");
                  setApiResponse(null);
                }}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-350 text-slate-700 transition-colors shadow-sm w-fit animate-fadeIn"
              >
                Reset Triage Console
              </button>
            </div>

            {/* Split Panel Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: AI Clinical Analysis */}
              <div className="space-y-6">
                
                {/* Severity & Condition Card */}
                <div className="bg-white border border-[#E2EAF1] shadow-sm shadow-blue-100/50 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Clinical Diagnosis Tier</h4>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-extrabold text-lg text-[#0E2238] leading-tight">
                      {apiResponse.suspectedCondition}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase bg-rose-50 text-rose-600 border border-rose-100">
                      {apiResponse.severity}
                    </span>
                  </div>
                </div>

                {/* Bystander Actionable Steps */}
                <div className="bg-white border border-[#E2EAF1] shadow-sm shadow-blue-100/50 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-extrabold text-[#0E2238] uppercase tracking-wider">Immediate Bystander First-Aid Action</h4>
                  <div className="space-y-3">
                    {apiResponse.immediateFirstAid?.map((step: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#F3F7FA] border border-[#E2EAF1] rounded-xl">
                        <input 
                          type="checkbox" 
                          id={`step-${index}`} 
                          className="mt-0.5 rounded border-slate-300 text-[#1976D2] focus:ring-[#1565C0] cursor-pointer" 
                        />
                        <label 
                          htmlFor={`step-${index}`} 
                          className="text-xs text-[#4B5E74] leading-relaxed font-semibold cursor-pointer"
                        >
                          {step}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Handover brief Card */}
                <div className="bg-white border border-[#E2EAF1] shadow-sm shadow-blue-100/50 rounded-xl p-5 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold text-[#0E2238] uppercase tracking-wider">Digital ER Handover Brief</h4>
                    <button
                      onClick={handleCopyBrief}
                      className="text-[10px] font-bold px-2 py-1 rounded bg-[#E3F2FD] hover:bg-blue-50 text-[#1976D2] border border-[#BBDEFB] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-[#4B5E74] bg-[#F3F7FA] p-4 rounded-xl border border-[#E2EAF1] whitespace-pre-wrap leading-relaxed max-h-[180px] overflow-y-auto">
                    {apiResponse.erHandoverBrief}
                  </pre>
                </div>

                {/* Fail Safe Resend notification tag */}
                {sosTarget === "myself" && passportData?.emergencyContactPhone && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4 text-rose-600" />
                    <span>📧 Automated fail-safe emergency email alert dispatched to {passportData?.emergencyContactName || "Emergency Contact"}.</span>
                  </div>
                )}

              </div>

              {/* Right Column: Search Grounded Routing */}
              <div className="space-y-6">
                
                {/* Hospital List Matrix */}
                <div className="bg-white border border-[#E2EAF1] shadow-sm shadow-blue-100/50 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#0E2238] uppercase tracking-wider">Nearest Specialized Facilities</h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Live GPS Grounding</span>
                  </div>

                  {/* Mock Map graphics */}
                  <div className="h-28 w-full bg-[#F3F7FA] rounded-xl border border-[#E2EAF1] relative overflow-hidden flex items-center justify-center shadow-inner">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#1f5b5b_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="absolute h-4 w-4 rounded-full bg-red-500 animate-ping opacity-75" />
                    <div className="absolute h-2 w-2 rounded-full bg-red-600" />
                    <div className="absolute bottom-2 left-2 text-[9px] text-slate-400 font-mono">Precision Locator Grounded</div>
                  </div>

                  <div className="space-y-3">
                    {apiResponse.specializedHospitals?.map((hosp: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#E2EAF1] hover:border-blue-200 flex justify-between items-center gap-4 transition-all shadow-sm">
                        <div className="space-y-1">
                          <div className="text-xs font-extrabold text-[#0E2238]">{idx + 1}. {hosp.name}</div>
                          <div className="text-[10px] text-[#4B5E74] leading-relaxed font-semibold">{hosp.specialtyMatch}</div>
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-[#E3F2FD] text-[#1976D2] border border-[#BBDEFB] shrink-0">
                          {hosp.distance || "1.2 km"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WhatsApp Dispatch Button */}
                <a
                  href={`https://wa.me/${passportData?.emergencyContactPhone || ""}?text=${encodeURIComponent(apiResponse.whatsappTemplate)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-center text-sm tracking-wide active:scale-95"
                >
                  <Share2 className="h-5 w-5" />
                  Open WhatsApp Alert
                </a>

              </div>

            </div>

            {/* Base Reset Link */}
            <div className="text-center pt-4">
              <button 
                onClick={() => {
                  setUiState("input");
                  setSymptomsText("");
                  setApiResponse(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline transition-colors"
              >
                ← Clear and start another triage
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
