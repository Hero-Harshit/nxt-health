"use client";

import React from "react";
import { Info, HeartPulse } from "lucide-react";

export default function AboutPage() {
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
                NxtHealth <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200/50">About Us</span>
              </h1>
              <p className="text-xs text-slate-500">Explainable healthcare decision platform — About us</p>
            </div>
          </div>
        </header>

        {/* Content Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#0F2744] flex items-center gap-2 border-b border-slate-100 pb-3">
            <Info className="h-5 w-5 text-sky-600" /> Our Mission
          </h2>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <p>
              NxtHealth was founded to make healthcare decisions explainable. Insurance policies are notoriously opaque, drug pricing structures are hard to compare, and personalized wellness screenings often feel inaccessible.
            </p>
            <p>
              By leveraging semantic metadata database joins, structured AI parsing, and interactive visual grids, NxtHealth empowers users to understand their options, discover generic alternatives, and log searches securely.
            </p>
            <p>
              Designed as a modern MedTech tool, NxtHealth focuses on transparency, ease-of-use, and providing helpful educational contexts.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
