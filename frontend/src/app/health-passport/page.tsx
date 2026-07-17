"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, RefreshCw } from "lucide-react";
import { HealthPassportData } from "@/types/passport";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import PassportForm from "@/components/health-passport/PassportForm";
import PassportPreview from "@/components/health-passport/PassportPreview";

const DEFAULT_PASSPORT_DATA: HealthPassportData = {
  fullName: "Alexander Sterling",
  dob: "1988-11-14",
  bloodGroup: "O+",
  gender: "Male",
  emergencyContactName: "Eleanor Sterling",
  emergencyContactRelation: "Spouse",
  emergencyContactPhone: "+1 (555) 438-9021",
  allergies: ["Penicillin", "Latex", "Tree Nuts"],
  chronicConditions: ["Asthma", "Mild Hypertension"],
  pastSurgeries: "Appendectomy in 2012, Right Knee Meniscus Repair in 2019.",
  activeMedications: [
    { name: "Albuterol Inhaler", dosage: "90 mcg", frequency: "As needed for wheezing" },
    { name: "Lisinopril", dosage: "10 mg", frequency: "1x daily in morning" },
    { name: "Vitamin D3", dosage: "2000 IU", frequency: "1x daily with meal" }
  ],
  primaryDoctorName: "Dr. Clara Mendoza, MD",
  primaryDoctorPhone: "+1 (555) 892-4411",
  insuranceProvider: "Blue Shield Lifecare",
  insurancePolicyNum: "BS-89304-X99"
};

export default function HealthPassportPage() {
  const [data, setData] = useState<HealthPassportData>(DEFAULT_PASSPORT_DATA);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "local">("local");

  // Load user status and data on mount
  useEffect(() => {
    const cached = localStorage.getItem("nxt_health_passport");
    
    const mountTimer = setTimeout(async () => {
      setIsMounted(true);
      
      // Load local cache as first render fallback
      if (cached) {
        try {
          setData(JSON.parse(cached));
        } catch (e) {
          console.error("Error reading local passport cache:", e);
        }
      }

      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        setSyncStatus("saving");
        try {
          const { data: cloudData, error } = await supabase
            .from("health_passports")
            .select("passport_data")
            .eq("user_id", currentUser.id)
            .maybeSingle();

          if (error) throw error;

          if (cloudData && cloudData.passport_data) {
            setData(cloudData.passport_data);
            localStorage.setItem("nxt_health_passport", JSON.stringify(cloudData.passport_data));
            setSyncStatus("synced");
          } else {
            // If no cloud data, sync current data (local or default) up to the cloud
            await supabase
              .from("health_passports")
              .upsert({
                user_id: currentUser.id,
                passport_data: cached ? JSON.parse(cached) : DEFAULT_PASSPORT_DATA,
                updated_at: new Date().toISOString()
              }, { onConflict: "user_id" });
            setSyncStatus("synced");
          }
        } catch (err) {
          console.error("Error syncing with cloud on mount:", err);
          setSyncStatus("local");
        }
      } else {
        setSyncStatus("local");
      }
    }, 0);

    return () => clearTimeout(mountTimer);
  }, []);

  // Save changes to LocalStorage and Cloud
  useEffect(() => {
    if (!isMounted) return;

    const saveTimer = setTimeout(() => {
      setSyncStatus("saving");
    }, 0);

    const handler = setTimeout(async () => {
      // 1. Save to LocalStorage
      localStorage.setItem("nxt_health_passport", JSON.stringify(data));

      // 2. Save to Cloud if logged in
      if (user) {
        try {
          const { error } = await supabase
            .from("health_passports")
            .upsert({
              user_id: user.id,
              passport_data: data,
              updated_at: new Date().toISOString()
            }, { onConflict: "user_id" });

          if (error) throw error;
          setSyncStatus("synced");
        } catch (err) {
          console.error("Cloud upsert failed:", err);
          setSyncStatus("local");
        }
      } else {
        setSyncStatus("local");
      }
    }, 400);

    return () => {
      clearTimeout(saveTimer);
      clearTimeout(handler);
    };
  }, [data, isMounted, user]);

  const handleClearData = async () => {
    if (window.confirm("Are you sure you want to reset your passport? This will erase all local and cloud edits.")) {
      const clearedData: HealthPassportData = {
        fullName: "",
        dob: "",
        bloodGroup: "A+",
        gender: "",
        emergencyContactName: "",
        emergencyContactRelation: "",
        emergencyContactPhone: "",
        allergies: [],
        chronicConditions: [],
        pastSurgeries: "",
        activeMedications: [],
        primaryDoctorName: "",
        primaryDoctorPhone: "",
        insuranceProvider: "",
        insurancePolicyNum: ""
      };

      setData(clearedData);
      localStorage.removeItem("nxt_health_passport");

      if (user) {
        setSyncStatus("saving");
        try {
          await supabase
            .from("health_passports")
            .upsert({
              user_id: user.id,
              passport_data: clearedData,
              updated_at: new Date().toISOString()
            }, { onConflict: "user_id" });
          setSyncStatus("synced");
        } catch (err) {
          console.error("Error clearing cloud database record:", err);
          setSyncStatus("local");
        }
      } else {
        setSyncStatus("local");
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-sky-600 mx-auto" />
          <p className="text-xs text-slate-500 font-bold">Mounting Health Passport Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      
      {/* Print styles override */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body, html, main {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          #passport-print-area {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            min-height: auto !important;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation & Actions Header */}
        <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Link 
              href="/" 
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-black text-[#0F2744]">
              Personal Health Passport
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Your portable 1-page clinical summary for doctor visits and emergency care.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            
            {/* Status indicator */}
            {syncStatus === "synced" && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl shadow-sm">
                ☁️ Saved to Cloud &amp; Browser
              </span>
            )}
            {syncStatus === "saving" && (
              <span className="text-[10px] font-bold text-sky-600 flex items-center gap-1.5 bg-sky-50 border border-sky-200 px-3 py-2 rounded-xl shadow-sm animate-pulse">
                🔄 Syncing...
              </span>
            )}
            {syncStatus === "local" && (
              <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl shadow-sm">
                💾 Saved Locally
              </span>
            )}

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleClearData}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Area */}
          <div className="no-print lg:col-span-6">
            <PassportForm data={data} onChange={setData} />
          </div>

          {/* Live Print-Ready Preview Area */}
          <div className="lg:col-span-6 lg:sticky lg:top-6">
            <PassportPreview data={data} />
          </div>

        </div>

      </div>
    </div>
  );
}
