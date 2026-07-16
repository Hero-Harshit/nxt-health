"use client";

import React from "react";
import { HelpCircle, FileText, Pill, ShieldCheck, HeartPulse } from "lucide-react";

export default function HelpPage() {
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
                NxtHealth <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200/50">Help & Support</span>
              </h1>
              <p className="text-xs text-slate-500">Explainable healthcare decision platform — Help center</p>
            </div>
          </div>
        </header>

        {/* Content Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#0F2744] flex items-center gap-2 border-b border-slate-100 pb-3">
            <HelpCircle className="h-5 w-5 text-sky-600" /> Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-[#0F2744]">What is NxtHealth?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                NxtHealth is an explainable healthcare decision workspace designed to translate policy wording, suggest generic drug alternatives, and provide personalized preventive health advice. All suggestions are powered by advanced AI and formatted with clear explanations.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-[#0F2744]">How do I use the Policy Advisor?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter details like age, budget, dependents, and specific coverage preferences. The advisor queries policy structures and highlights plans matching your preferences, along with reasons why they fit and any associated trade-offs.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-[#0F2744]">Is my health information secure?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes. All credentials, logins, and profile details are securely managed and authenticated via Supabase backend vaults.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-[#0F2744]">Are the suggestions binding medical recommendations?</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold text-rose-700">
                No. All results are strictly educational and non-diagnostic. You must consult with a qualified medical physician to establish diagnostic screenings, clinical treatments, or drug switches.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
