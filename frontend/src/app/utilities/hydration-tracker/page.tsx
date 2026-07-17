"use client";

import React from "react";
import Link from "next/link";
import HydrationTracker from "@/components/utilities/HydrationTracker";

export default function HydrationTrackerPage() {
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
          <span className="text-slate-900">Hydration Tracker</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0F2744]">
            Hydration Tracker
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl text-sm">
            Monitor and track your daily water intake. Log hydration logs, configure daily targets, and optimize your overall water metrics dynamically.
          </p>
        </div>

        {/* Component */}
        <HydrationTracker />
      </main>
    </div>
  );
}
