"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  HeartPulse, 
  Sparkles, 
  Activity, 
  Layers, 
  Lock, 
  CheckCircle2, 
  Cpu, 
  Globe, 
  ArrowDown 
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8faff] p-4 sm:p-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header & Back Button */}
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
          <Link href="/" className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">
              About NXT Health
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Making quality healthcare accessible, personalized, and proactive.</p>
          </div>
        </div>

        {/* 1. The Story / Overview Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <HeartPulse className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Our Story</span>
              <h2 className="text-xl font-bold text-gray-800">Unified Healthcare for Everyone</h2>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium">
            Healthcare information is often scattered across different apps, hospitals, and physical records, making it difficult for people to manage their well-being efficiently. <strong className="text-gray-800">NXT Health</strong> solves this challenge by providing a unified platform where users can access emergency services, manage health records, understand insurance policies, verify medical bills, and receive personalized healthcare guidance.
          </p>

          {/* Mission & Vision Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div className="p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-100/50">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Our Vision
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                We envision a future where quality healthcare is accessible, understandable, and affordable for everyone—supporting users before, during, and after every health decision.
              </p>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 rounded-2xl border border-purple-100/50">
              <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" /> Our Mission
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                To improve public health by helping people make smarter decisions through AI-powered guidance, preventive care, emergency preparedness, and digital health services.
              </p>
            </div>
          </div>
        </div>

        {/* 2. By The Numbers Stats Bar (Light Blue Theme) */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-blue-50 rounded-3xl p-6 sm:p-8 border border-blue-100/80 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-6 text-center">
            NXT Health By The Numbers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">9</span>
              <p className="text-xs text-gray-600 font-semibold">Core Modules</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">8+</span>
              <p className="text-xs text-gray-600 font-semibold">Utility Tools</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">24×7</span>
              <p className="text-xs text-gray-600 font-semibold">Health Access</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">100%</span>
              <p className="text-xs text-gray-600 font-semibold">Privacy Focused</p>
            </div>
          </div>
        </div>

        {/* 3. The Core Healthcare Journey (Our Approach) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <Cpu className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Methodology</span>
              <h2 className="text-xl font-bold text-gray-800">Our Smart Approach</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm mb-2">1</span>
              <h4 className="font-bold text-gray-800 text-sm">Health Information</h4>
              <p className="text-xs text-gray-500 mt-1">Input symptoms, reports, or bills.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm mb-2">2</span>
              <h4 className="font-bold text-gray-800 text-sm">AI Analysis</h4>
              <p className="text-xs text-gray-500 mt-1">Deep contextual intelligence.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm mb-2">3</span>
              <h4 className="font-bold text-gray-800 text-sm">Personalized Guidance</h4>
              <p className="text-xs text-gray-500 mt-1">Tailored recommendations.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center text-sm mb-2">4</span>
              <h4 className="font-bold text-gray-800 text-sm">Better Decisions</h4>
              <p className="text-xs text-gray-500 mt-1">Confident, proactive health choices.</p>
            </div>
          </div>
        </div>

        {/* 4. Unique Features Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <Layers className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Differentiation</span>
              <h2 className="text-xl font-bold text-gray-800">What Makes NXT Health Unique?</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Manage your complete health profile in one unified hub.",
              "Receive tailored preventive health guidance and risk mapping.",
              "Access emergency SOS command centers instantly.",
              "Demystify complex medical terminology and lab reports.",
              "Verify hospital bills against standard regional pricing.",
              "Maintain digital health records securely via Google Drive."
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Privacy & Security Trust Banner */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-blue-300">
              <Lock className="w-3.5 h-3.5" /> 100% Secure & Private
            </div>
            <h3 className="text-xl font-bold">Your Health Data Belongs to You</h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
              NXT Health is built with privacy at its core. Your personal information and records are securely managed and used solely to empower your personal healthcare journey with transparency and trust.
            </p>
          </div>
          <Link 
            href="/help"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all shrink-0"
          >
            Visit Help Center
          </Link>
        </div>

      </div>
    </div>
  );
}
