"use client";

import React from "react";
import Link from "next/link";
import BreathingExercise from "@/components/utilities/BreathingExercise";

export default function BreathingExercisePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-6 text-xs font-semibold text-slate-500 gap-1.5 items-center">
          <Link href="/" className="hover:text-sky-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-400">Utilities</span>
          <span>/</span>
          <span className="text-slate-900">Breathing Exercise</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0F2744]">
            Breathing Exercise
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl text-sm">
            Engage in guided deep-breathing patterns to down-regulate your autonomic nervous system, reduce cortisol levels, and reset your mental focus.
          </p>
        </div>

        {/* Component */}
        <BreathingExercise />
      </main>
    </div>
  );
}
