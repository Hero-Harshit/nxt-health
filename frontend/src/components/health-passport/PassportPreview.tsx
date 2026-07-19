"use client";

import React from "react";
import { HealthPassportData } from "@/types/passport";
import { ShieldCheck, HeartPulse, User, Activity, AlertCircle, Phone, Heart, Shield } from "lucide-react";

interface PassportPreviewProps {
  data: HealthPassportData;
}

export default function PassportPreview({ data }: PassportPreviewProps) {
  // Format Date Helper
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not Specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white border-2 border-slate-300 shadow-md rounded-2xl p-6 md:p-8 space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none w-full min-h-[700px] flex flex-col justify-between" id="passport-print-area">
      <div className="space-y-6">
        
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-[#0F2744] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-[#0F2744] print:text-[#0F2744]" />
              <span className="text-xs font-black tracking-wider text-slate-500 uppercase">NxtHealth</span>
            </div>
            <h2 className="text-lg font-black text-[#0F2744] tracking-tight uppercase">
              Personal Health Passport
            </h2>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">BLOOD GROUP</span>
            <div className="bg-red-50 text-red-700 border border-red-200 font-extrabold text-lg px-4 py-1 rounded-xl shadow-sm print:bg-red-50 print:text-red-700">
              {data.bloodGroup || "—"}
            </div>
          </div>
        </div>

        {/* Section 1: Identifier Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 print:bg-slate-50 print:border-slate-300">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-sky-600 shrink-0" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Patient Information</span>
            </div>
            <div className="space-y-0.5 pl-6">
              <p className="text-sm font-black text-[#0F2744]">{data.fullName || "Not Specified"}</p>
              <p className="text-xs text-slate-600 font-medium">Gender: {data.gender || "Not Specified"}</p>
              <p className="text-xs text-slate-600 font-medium">DOB: {formatDate(data.dob)}</p>
            </div>
          </div>

          <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200/80 md:pl-4 pt-2 md:pt-0">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">Emergency Contact</span>
            </div>
            <div className="space-y-0.5 pl-6">
              <p className="text-sm font-black text-rose-700">{data.emergencyContactName || "Not Specified"}</p>
              <p className="text-xs text-slate-600 font-medium">Relation: {data.emergencyContactRelation || "Not Specified"}</p>
              <p className="text-xs font-bold text-slate-800">Phone: {data.emergencyContactPhone || "Not Specified"}</p>
              <p className="text-xs font-bold text-slate-800">Email: {data.emergencyContactEmail || "Not Specified"}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Medical Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Allergies Pill Box */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2 print:border-slate-300">
            <h4 className="text-[10px] font-extrabold text-[#0F2744] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
              Severe Allergies
            </h4>
            <div className="flex flex-wrap gap-1 pt-1">
              {data.allergies.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No allergies declared</p>
              ) : (
                data.allergies.map((allergy, index) => (
                  <span 
                    key={index} 
                    className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full print:bg-red-50 print:text-red-700"
                  >
                    {allergy}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Chronic Conditions Box */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2 print:border-slate-300">
            <h4 className="text-[10px] font-extrabold text-[#0F2744] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Activity className="h-3.5 w-3.5 text-amber-600" />
              Chronic Conditions
            </h4>
            <div className="flex flex-wrap gap-1 pt-1">
              {data.chronicConditions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No chronic conditions declared</p>
              ) : (
                data.chronicConditions.map((condition, index) => (
                  <span 
                    key={index} 
                    className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full print:bg-amber-50 print:text-amber-700"
                  >
                    {condition}
                  </span>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Past Surgeries block */}
        {data.pastSurgeries && (
          <div className="border border-slate-200 rounded-xl p-4 space-y-1.5 print:border-slate-300">
            <h4 className="text-[10px] font-extrabold text-[#0F2744] uppercase tracking-wider border-b border-slate-100 pb-1.5">
              Past Surgeries & Significant Medical Records
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {data.pastSurgeries}
            </p>
          </div>
        )}

        {/* Section 3: Medication Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-300">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 print:bg-slate-50">
            <Heart className="h-3.5 w-3.5 text-sky-600" />
            <h4 className="text-[10px] font-extrabold text-[#0F2744] uppercase tracking-wider">
              Active Medications
            </h4>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase">
                <th className="px-4 py-1.5">Medication Name</th>
                <th className="px-4 py-1.5">Dosage</th>
                <th className="px-4 py-1.5">Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {data.activeMedications.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-slate-400 italic font-medium">
                    No medications listed
                  </td>
                </tr>
              ) : (
                data.activeMedications.map((med, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 print:hover:bg-transparent">
                    <td className="px-4 py-2 font-bold text-slate-900">{med.name || "—"}</td>
                    <td className="px-4 py-2 text-slate-600">{med.dosage || "—"}</td>
                    <td className="px-4 py-2 text-slate-600 font-semibold">{med.frequency || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Section 4: Care Team & Policy Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4 print:border-slate-300">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              <span className="text-[9px] font-extrabold text-[#0F2744] uppercase tracking-wider">Primary Physician</span>
            </div>
            <p className="text-xs font-bold text-slate-800 pl-5">
              {data.primaryDoctorName || "Not Specified"}
              {data.primaryDoctorPhone && <span className="font-normal text-slate-600"> ({data.primaryDoctorPhone})</span>}
            </p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-100 md:pl-4 pt-2 md:pt-0">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              <span className="text-[9px] font-extrabold text-[#0F2744] uppercase tracking-wider">Insurance Provider</span>
            </div>
            <p className="text-xs font-bold text-slate-800 pl-5">
              {data.insuranceProvider || "Not Specified"}
              {data.insurancePolicyNum && <span className="font-normal text-slate-600"> — Policy #{data.insurancePolicyNum}</span>}
            </p>
          </div>
        </div>

      </div>

      {/* Disclaimers */}
      <div className="border-t border-slate-200/80 pt-4 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[9px] text-slate-400 font-bold tracking-tight print:border-slate-300">
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>VERIFIED BY PATIENT RECORD</span>
        </div>
        <p className="text-right print:text-center">
          This passport is maintained by the patient for emergency reference and health decision support.
        </p>
      </div>

    </div>
  );
}
