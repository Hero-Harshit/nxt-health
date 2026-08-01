'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, X, Mic, ArrowRight, FileText, HeartPulse, Activity, ShieldCheck } from 'lucide-react';

const HEALTH_QUOTES = [
  { text: "The greatest wealth is health.", author: "Virgil" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Good health is not something we can buy. However, it can be an extremely valuable savings account.", author: "Anne Wilson Schaef" },
  { text: "Let food be thy medicine and medicine be thy food.", author: "Hippocrates" },
  { text: "Physical fitness is the first requisite of happiness.", author: "Joseph Pilates" }
];

export default function PamInterface() {
  const router = useRouter();
  const [userName, setUserName] = useState("Hero");
  const [quote, setQuote] = useState(HEALTH_QUOTES[0]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Randomize quote on load
    const randomQuote = HEALTH_QUOTES[Math.floor(Math.random() * HEALTH_QUOTES.length)];
    setQuote(randomQuote);

    // Fetch user name from local storage if available
    try {
      const possibleKeys = ['user_profile', 'health_passport', 'profile_data', 'nxthealth_profile'];
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.name || parsed.firstName) {
            setUserName(parsed.name || parsed.firstName);
            break;
          }
        }
      }
    } catch (e) {
      console.error("Could not parse profile for name");
    }
    
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-[#f8faff] flex flex-col font-sans selection:bg-blue-100">
      {/* TOP NAVIGATION BAR */}
      <header className="flex items-center justify-between p-4 sm:p-6">
        <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-gray-700">
          <Sidebar className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-gray-900 tracking-wide">Pam</h1>
        <button 
          onClick={() => router.back()} 
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* MAIN HERO CONTENT */}
      <main className="flex-1 flex flex-col items-center px-4 pt-4 pb-32 max-w-4xl mx-auto w-full">
        
        {/* Large Pam Orb */}
        <div 
          className="flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full mb-6 border-[1px] border-black/20 shadow-[0_12px_24px_-6px_rgba(37,99,235,0.4),inset_0_-6px_12px_rgba(0,0,0,0.3),inset_0_3px_6px_rgba(255,255,255,0.5)]"
          style={{ background: 'radial-gradient(circle at 30% 30%, #93c5fd 0%, #3b82f6 50%, #1e40af 100%)' }}
        >
          <span className="text-white text-xl sm:text-2xl font-black tracking-[0.15em] select-none pointer-events-none mt-[2px] ml-[3px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            PAM
          </span>
        </div>

        <h2 className="text-indigo-700 font-semibold text-sm sm:text-base mb-4">
          Hello, {userName}
        </h2>
        
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
          How can I assist with your well-being today?
        </h3>

        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
            "{quote.text}"
          </p>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
            — {quote.author}
          </p>
        </div>

        {/* ACTION CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1.5">Clinical Analysis</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">Ask me to review and summarize the latest medical reports securely stored in your Health Vault.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <HeartPulse className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1.5">Improve My Healthspan</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">Get personalized daily habits to increase your active lifespan based on your current metrics.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1.5">Log Daily Metrics</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">Quickly update your sleep, stress levels, and activity for today's Healthy Heatmap streak.</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1.5">Verify Medical Bills</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">Let me analyze your recent hospital invoices to check for overcharges or billing errors.</p>
          </div>
        </div>
      </main>

      {/* BOTTOM CHAT INPUT BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#f8faff] via-[#f8faff] to-transparent pointer-events-none flex justify-center">
        <div className="w-full max-w-3xl relative pointer-events-auto">
          <input 
            type="text" 
            placeholder="Ask Pam anything about your health..." 
            className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-full pl-6 pr-24 py-4 sm:py-5 shadow-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 font-medium"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50">
              <Mic className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
