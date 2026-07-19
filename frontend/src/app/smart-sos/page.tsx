"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, ShieldAlert, CheckCircle, Mail, User, Shield, Info } from "lucide-react";

export default function SmartSOSPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [contactName, setContactName] = useState<string>("Not Configured");
  const [relation, setRelation] = useState<string>("Not Configured");
  const [contactEmail, setContactEmail] = useState<string>("Not Configured");
  const [alertStatus, setAlertStatus] = useState<"idle" | "sending" | "sent">("idle");

  // Get Session and Load Emergency Contact Info
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push("/login");
        return;
      }
      fetchEmergencyContact(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchEmergencyContact = async (userId: string) => {
    try {
      // Try to load from health_passports table first
      const { data: passport } = await supabase
        .from("health_passports")
        .select("passport_data")
        .eq("user_id", userId)
        .maybeSingle();

      if (passport && passport.passport_data) {
        const pd = passport.passport_data;
        if (pd.emergencyContactName || pd.emergencyContactEmail) {
          setContactName(pd.emergencyContactName || "Not Configured");
          setRelation(pd.emergencyContactRelation || "Not Configured");
          setContactEmail(pd.emergencyContactEmail || "Not Configured");
          setIsLoading(false);
          return;
        }
      }

      // Fallback to profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("emergency_contact_name, emergency_contact_relation, emergency_contact_email")
        .eq("id", userId)
        .maybeSingle();

      if (profile) {
        setContactName(profile.emergency_contact_name || "Not Configured");
        setRelation(profile.emergency_contact_relation || "Not Configured");
        setContactEmail(profile.emergency_contact_email || "Not Configured");
      }
    } catch (error) {
      console.error("Error loading emergency contact metadata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerAlert = () => {
    setAlertStatus("sending");
    setTimeout(() => {
      setAlertStatus("sent");
    }, 1200);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <ShieldAlert className="h-8 w-8 animate-pulse text-rose-500 mb-4" />
        <p className="text-sm font-semibold text-slate-500">Connecting to secure emergency network...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
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
            <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600">Secure Dispatch Active</span>
          </div>
          <h1 className="text-3xl font-black text-[#0F2744] tracking-tight">Smart SOS Console</h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Instantly notify your designated emergency contact in times of distress. Clicking the panic mechanism below will transmit a secure alert summary.
          </p>
        </div>

        {/* Central Action Area (Tactile panic trigger mechanism) */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[320px] transition-all">
          {alertStatus === "idle" && (
            <>
              <div className="relative group shrink-0">
                {/* Visual tactile pulse effect */}
                <div className="absolute -inset-4 bg-rose-500/20 rounded-full blur-md group-hover:scale-110 transition-transform duration-500 animate-ping" />
                <button
                  onClick={handleTriggerAlert}
                  className="relative h-44 w-44 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 border-4 border-white text-white font-extrabold text-lg flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-rose-900/30 active:scale-95 transition-all duration-150 cursor-pointer select-none"
                >
                  <ShieldAlert className="h-10 w-10 animate-bounce" />
                  <span>TRIGGER<br />ALERT</span>
                </button>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tactile Panic Mechanism</span>
                <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
                  Pressing this button activates a local simulation of the emergency broadcast.
                </p>
              </div>
            </>
          )}

          {alertStatus === "sending" && (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 w-20 rounded-full bg-amber-50 text-amber-500 border-2 border-amber-200 flex items-center justify-center mx-auto shadow-inner">
                <Shield className="h-10 w-10 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0F2744]">Encrypting Broadcast Payload</h3>
                <p className="text-xs text-slate-500">Contacting secure local networks...</p>
              </div>
            </div>
          )}

          {alertStatus === "sent" && (
            <div className="space-y-5 animate-fade-in">
              <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-emerald-700">Emergency Alert Dispatched</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  A high-priority emergency summary has been successfully routed to <strong className="text-slate-800">{contactEmail}</strong>.
                </p>
              </div>
              <button
                onClick={() => setAlertStatus("idle")}
                className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              >
                Reset Trigger Button
              </button>
            </div>
          )}
        </section>

        {/* Status & Profile Sync Card */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#0F2744] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="h-4.5 w-4.5 text-sky-600" />
            Designated Dispatch Target
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50/70 border border-slate-200/50 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Emergency Contact</span>
              <span className="text-xs font-black text-slate-800">{contactName}</span>
            </div>
            
            <div className="p-3 bg-slate-50/70 border border-slate-200/50 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Relationship</span>
              <span className="text-xs font-black text-slate-800">{relation}</span>
            </div>

            <div className="p-3 bg-slate-50/70 border border-slate-200/50 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Live Dispatch Email</span>
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {contactEmail}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-slate-500">
            <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Note: You can update your emergency contact details at any time inside your <Link href="/health-passport" className="text-sky-600 font-bold hover:underline">Health Passport</Link>.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
