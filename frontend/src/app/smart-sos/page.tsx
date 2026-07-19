"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, ShieldAlert, CheckCircle, Mail, User, Shield, Info, Volume2, HeartPulse, Activity, Phone, ClipboardList } from "lucide-react";

export default function SmartSOSPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Aggregated data states exactly matching Supabase and Passport structures
  const [userName, setUserName] = useState<string>("Patient");
  const [age, setAge] = useState<string>("Not Configured");
  const [gender, setGender] = useState<string>("Not Configured");
  const [weightKg, setWeightKg] = useState<string>("Not Configured");
  const [heightCm, setHeightCm] = useState<string>("Not Configured");
  const [allergies, setAllergies] = useState<string>("None Listed");
  const [chronicConditions, setChronicConditions] = useState<string>("None Listed");
  const [familyHistory, setFamilyHistory] = useState<string>("None Listed");
  const [policyDetails, setPolicyDetails] = useState<string>("Not Available");
  const [doctorName, setDoctorName] = useState<string>("Not Configured");
  const [doctorNumber, setDoctorNumber] = useState<string>("Not Configured");
  
  // Emergency target fields
  const [contactEmail, setContactEmail] = useState<string>("");

  // System states
  const [transcript, setTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [buttonState, setButtonState] = useState<'idle' | 'sending' | 'success'>('idle');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  const latRef = useRef<number | null>(null);
  const lngRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          latRef.current = position.coords.latitude;
          lngRef.current = position.coords.longitude;
        },
        (error) => {
          console.error("Silent background geolocation capture error:", error);
        }
      );
    }
  }, []);

  // Load User Data & Passport Details
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push("/login");
        return;
      }
      loadUserData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const loadUserData = async (userId: string) => {
    try {
      // Session verification check
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || !user) {
        console.error("No active user session found for profile fetch");
      }

      // 1. Fetch User Profiles table details with exact target columns
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("full_name, age, gender, height_cm, weight_kg, pre_existing_conditions, family_history, current_policy_details")
        .eq("id", userId)
        .maybeSingle();

      // 2. Fetch Health Passport local storage + cloud details
      const cached = localStorage.getItem("nxt_health_passport");
      let passportData: any = null;

      if (cached) {
        try {
          passportData = JSON.parse(cached);
        } catch (e) {
          console.error(e);
        }
      }

      const { data: cloudPassport } = await supabase
        .from("health_passports")
        .select("passport_data")
        .eq("user_id", userId)
        .maybeSingle();

      if (cloudPassport && cloudPassport.passport_data) {
        passportData = cloudPassport.passport_data;
      }

      // Map values resiliently with fallbacks
      const resolvedName = profile?.full_name || (profile as any)?.name || (profile as any)?.userName || passportData?.fullName || passportData?.name || passportData?.userName || "Patient";
      const resolvedAge = profile?.age || passportData?.age || "Not Configured";
      const resolvedGender = profile?.gender || passportData?.gender || "Not Configured";
      const rawWeight = profile?.weight_kg || (profile as any)?.weight || passportData?.weight || passportData?.weight_kg || "";
      const resolvedWeight = rawWeight ? (String(rawWeight).includes("kg") ? String(rawWeight) : `${rawWeight} kg`) : "Not Configured";
      const rawHeight = profile?.height_cm || (profile as any)?.height || passportData?.height || passportData?.height_cm || "";
      const resolvedHeight = rawHeight ? (String(rawHeight).includes("cm") ? String(rawHeight) : `${rawHeight} cm`) : "Not Configured";
      const resolvedPolicy = profile?.current_policy_details || (profile as any)?.policy_details || (profile as any)?.policy || passportData?.currentPolicyDetails || passportData?.policyDetails || passportData?.policy_details || passportData?.policy || "Not Available";
      const resolvedFamilyHistory = profile?.family_history || passportData?.familyHistory || passportData?.family_history || "None Listed";

      setUserName(resolvedName);
      setAge(String(resolvedAge));
      setGender(resolvedGender);
      setWeightKg(resolvedWeight);
      setHeightCm(resolvedHeight);
      setPolicyDetails(resolvedPolicy);
      setFamilyHistory(resolvedFamilyHistory);

      // Emergency contact resolution from local storage passport (as Supabase table has no contact name/relation fields)
      const resolvedContactEmail = passportData?.emergencyContactEmail || (profile as any)?.emergency_contact_email || "";
      setContactEmail(resolvedContactEmail);

      // Medical Profile Conditions mapping
      if (profile && Array.isArray(profile.pre_existing_conditions) && profile.pre_existing_conditions.length > 0) {
        setChronicConditions(profile.pre_existing_conditions.join(", "));
      }

      if (passportData) {
        if (Array.isArray(passportData.allergies) && passportData.allergies.length > 0) {
          setAllergies(passportData.allergies.join(", "));
        }
        if (Array.isArray(passportData.chronicConditions) && passportData.chronicConditions.length > 0) {
          setChronicConditions(passportData.chronicConditions.join(", "));
        }
        
        // Extract primary doctor details from passport
        const docName = passportData.primaryDoctorName || passportData.doctor_name || "";
        const docPhone = passportData.primaryDoctorPhone || passportData.doctor_number || passportData.doctor_phone || "";
        if (docName) setDoctorName(docName);
        if (docPhone) setDoctorNumber(docPhone);
      }
    } catch (err) {
      console.error("Error aggregating profile details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-recording Voice capture hook
  useEffect(() => {
    if (isLoading || isSent || isSending) return;

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = false;
          rec.lang = "en-US";

          rec.onstart = () => {
            setIsListening(true);
            console.log("🎤 Hands-free mic capture activated automatically.");
          };

          rec.onresult = (event: any) => {
            let accumulatedText = "";
            for (let i = 0; i < event.results.length; i++) {
              accumulatedText += event.results[i][0].transcript;
            }
            const cleanText = accumulatedText.trim();
            transcriptRef.current = cleanText;
            setTranscript(cleanText);
          };

          rec.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
          };

          rec.onend = () => {
            // Automatically restart if alert is not sent
            if (!isSent && !isSending) {
              try {
                rec.start();
              } catch (e) {
                // Already running
              }
            } else {
              setIsListening(false);
            }
          };

          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          console.warn("Speech recognition initialization safely deferred until interaction:", e);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Already stopped
        }
      }
    };
  }, [isLoading, isSent, isSending]);

  const handleTriggerAlert = async () => {
    if (!contactEmail || !contactEmail.trim()) {
      alert("Designated Emergency Contact Email is missing! Please configure a contact email inside your Health Passport first.");
      return;
    }

    setButtonState('sending');
    setIsSending(true);

    // Stop recording when alert is triggered
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Already stopped
      }
    }

    const startTime = Date.now();

    await new Promise((resolve) => {
      if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            latRef.current = position.coords.latitude;
            lngRef.current = position.coords.longitude;
            resolve(null);
          },
          (error) => {
            console.error("Location error:", error);
            resolve(null); // Proceed gracefully even if blocked
          },
          { enableHighAccuracy: true, timeout: 2000 }
        );
      } else {
        resolve(null);
      }
    });

    const elapsed = Date.now() - startTime;
    const remainingDelay = 2500 - elapsed;
    if (remainingDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingDelay));
    }

    try {
      // 1. Resolve transcription with DOM extraction fallback
      let activeTranscript = transcriptRef.current.trim();
      if (!activeTranscript) {
        const domContainer = document.getElementById("transcript-container");
        if (domContainer) {
          activeTranscript = domContainer.innerText.trim();
        }
      }
      if (!activeTranscript) {
        activeTranscript = "No spoken scenario recorded.";
      }

      // 2. Build aligned dispatch payload
      const payload = {
        toEmail: contactEmail,
        full_name: userName,
        age: age,
        gender: gender,
        height_cm: heightCm,
        weight_kg: weightKg,
        pre_existing_conditions: chronicConditions,
        family_history: familyHistory,
        current_policy_details: policyDetails,
        doctorName: doctorName,
        doctorNumber: doctorNumber,
        transcript: activeTranscript,
        allergies: allergies,
        latitude: latRef.current,
        longitude: lngRef.current
      };

      // 3. Print highly visible frontend diagnostics log
      console.log("🚨 [FRONTEND SENDING PAYLOAD]:", payload);

      const res = await fetch("/api/smart-sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      
      // Pause for an additional 1 second to allow the network request to resolve completely while remaining in yellow state
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (result.success) {
        setButtonState('success');
        setIsSent(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setShowConfirmation(true);
      } else {
        setButtonState('idle');
        alert(`Dispatch failed: ${result.error || "Server error"}`);
      }
    } catch (err: any) {
      setButtonState('idle');
      console.error(err);
      alert(`Network error dispatching alert: ${err.message || err}`);
    } finally {
      setIsSending(false);
    }
  };

  const getButtonConfig = () => {
    switch (buttonState) {
      case 'sending':
        return {
          btnClass: 'from-amber-500 to-yellow-400 bg-yellow-500 hover:bg-yellow-500 text-black animate-pulse',
          text: 'PROCESSING & SENDING...',
          pingClass: 'bg-amber-500/20 animate-ping',
        };
      case 'success':
        return {
          btnClass: 'from-green-600 to-emerald-500 bg-green-600 hover:bg-green-600 text-white',
          text: 'PASSPORT DISPATCHED!',
          pingClass: 'bg-green-500/20',
        };
      case 'idle':
      default:
        return {
          btnClass: 'from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 bg-red-600 hover:bg-red-700 text-white',
          text: 'TRIGGER EMERGENCY SOS',
          pingClass: 'bg-rose-500/20',
        };
    }
  };

  const { btnClass, text: buttonText, pingClass } = getButtonConfig();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <ShieldAlert className="h-8 w-8 animate-pulse text-rose-500 mb-4" />
        <p className="text-sm font-semibold text-slate-500">Connecting to secure emergency network...</p>
      </div>
    );
  }

  // Dynamic layout theme swap: tranquil slate-blue if alert was successfully dispatched
  const wrapperClass = showConfirmation 
    ? "min-h-screen bg-[#F0F4F8] text-slate-900 p-4 md:p-8 font-sans transition-all duration-700" 
    : "min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans transition-all duration-700";

  return (
    <div className={wrapperClass}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className={`h-2 w-2 rounded-full ${showConfirmation ? 'bg-emerald-500' : 'bg-rose-600 animate-pulse'}`} />
            <span className={`text-[10px] uppercase font-bold tracking-wider ${showConfirmation ? 'text-emerald-600' : 'text-rose-600'}`}>
              {showConfirmation ? 'Alert Logged & Broadcasted' : 'Secure Dispatch Active'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0F2744] tracking-tight">Smart SOS Console</h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Instantly notify your designated emergency contact in times of distress. Clicking the panic mechanism below will transmit a secure alert summary.
          </p>
        </div>

        {/* Central Action Area */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[320px] transition-all">
          
          {/* Active Listening Indicators */}
          {isListening && !showConfirmation && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 shadow-sm animate-pulse">
              <Volume2 className="h-3.5 w-3.5" />
              <span>LIVE VOICE MONITOR ACTIVE</span>
            </div>
          )}

          {!showConfirmation && (
            <>
              <div className="relative group shrink-0">
                <div className={`absolute -inset-4 ${pingClass} rounded-full blur-md group-hover:scale-110 transition-transform duration-500`} />
                <button
                  onClick={handleTriggerAlert}
                  disabled={buttonState !== 'idle'}
                  className={`relative h-44 w-44 rounded-full bg-gradient-to-tr ${btnClass} border-4 border-white font-extrabold text-xs flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-rose-900/30 active:scale-95 transition-all duration-150 cursor-pointer select-none`}
                >
                  {buttonState === 'success' ? (
                    <CheckCircle className="h-10 w-10" />
                  ) : (
                    <ShieldAlert className="h-10 w-10" />
                  )}
                  <span className="text-center px-2 uppercase tracking-wide leading-tight">{buttonText}</span>
                </button>
              </div>

              {transcript && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md text-left space-y-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Transcript</h4>
                  <p id="transcript-container" className="text-xs text-slate-700 italic font-medium leading-relaxed">&ldquo;{transcript}&rdquo;</p>
                </div>
              )}
            </>
          )}

          {showConfirmation && (
            <div className="space-y-6 flex flex-col items-center">
              <div className="relative shrink-0">
                {/* Reassuring green button state */}
                <button
                  disabled
                  className="relative h-44 w-44 rounded-full bg-emerald-600 border-4 border-white text-white font-extrabold text-sm flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20 transition-all select-none"
                >
                  <CheckCircle className="h-10 w-10" />
                  <span>Relax, help is arriving.</span>
                </button>
              </div>
              
              <div className="space-y-1.5">
                <p className="text-sm font-extrabold text-emerald-800">Your emergency contact has been notified</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  A copy of the health passport details, profile and your live speech transcript has also been attached to <strong className="text-slate-800">{contactEmail}</strong>.
                </p>
              </div>
            </div>
          )}
        </section>


      </div>
    </div>
  );
}
