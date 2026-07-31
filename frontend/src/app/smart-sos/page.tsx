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
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [buttonState, setButtonState] = useState<'idle' | 'sending' | 'success'>('idle');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [showEmailAlert, setShowEmailAlert] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hardCapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Clean up Media Stream and timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (hardCapTimeoutRef.current) clearTimeout(hardCapTimeoutRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    if (!contactEmail || !contactEmail.trim()) {
      setShowEmailAlert(true);
      return;
    }
    setMicError(null);
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Clean up the media stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendAudioAlert(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start live timer counting up to 15 seconds
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 15) {
            clearInterval(timerRef.current!);
            return 15;
          }
          return prev + 1;
        });
      }, 1000);

      // 15-Second Hard Cap: Automatically stop and send
      hardCapTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 15000);

    } catch (err: any) {
      console.error("Microphone access error:", err);
      setMicError(err.message || "Microphone permission denied or not supported.");
      alert(`Microphone error: ${err.message || "Permission denied. Please allow microphone access in your browser settings."}`);
    }
  };

  const stopRecording = () => {
    // Clear timeouts and intervals
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (hardCapTimeoutRef.current) {
      clearTimeout(hardCapTimeoutRef.current);
      hardCapTimeoutRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const sendAudioAlert = async (audioBlob: Blob) => {
    setButtonState('sending');
    setIsSending(true);

    try {
      // Convert Blob to Base64 using FileReader
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Extract base64 part only
          const base64String = base64data.split(",")[1];
          resolve(base64String);
        };
        reader.onerror = reject;
      });

      const audioBase64 = await base64Promise;

      const healthPassport = {
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
        allergies: allergies
      };

      const payload = {
        audioBase64,
        healthPassport
      };

      console.log("🚨 [FRONTEND SENDING PAYLOAD]:", payload);

      const res = await fetch("/api/sos-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      // Pause to allow visual processing state
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
    if (isRecording) {
      return {
        btnClass: 'from-red-650 to-rose-500 bg-red-650 hover:bg-red-750 text-white animate-pulse',
        text: 'STOP & SEND',
        pingClass: 'bg-red-500/30 animate-ping',
      };
    }
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
          text: 'TAP TO RECORD',
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
            Instantly notify your designated emergency contact in times of distress. Recording an emergency audio note will automatically dispatch a secure alert summary.
          </p>
        </div>

        {/* Central Action Area */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[320px] transition-all">
          
          {/* Active Recording Indicators */}
          {isRecording && !showConfirmation && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 shadow-sm animate-pulse">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
              <span>RECORDING EMERGENCY AUDIO ({recordingTime}s / 15s)</span>
            </div>
          )}

          {!showConfirmation && (
            <>
              <div className="relative group shrink-0">
                <div className={`absolute -inset-4 ${pingClass} rounded-full blur-md group-hover:scale-110 transition-transform duration-500`} />
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={buttonState !== 'idle' && !isRecording}
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

              {micError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md text-left space-y-1">
                  <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Microphone Error</h4>
                  <p className="text-xs text-red-700 font-medium leading-relaxed">{micError}</p>
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
                  A copy of the health passport details, profile and your 15-second emergency audio recording has also been attached to <strong className="text-slate-800">{contactEmail}</strong>.
                </p>
              </div>
            </div>
          )}
        </section>

      </div>
      
      {showEmailAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-950/50 rounded-full text-red-650">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Missing Configuration</h3>
            </div>
            <p className="mt-3 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
              Designated Emergency Contact Email is missing! Please configure a contact email inside your Health Passport first.
            </p>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowEmailAlert(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:scale-98 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
