'use client';
import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PamNudgeProps {
  text: string;
  suggestedPrompt: string;
}

export default function PamNudge({ text, suggestedPrompt }: PamNudgeProps) {
  const handleAskPam = () => {
    window.dispatchEvent(
      new CustomEvent('open-pam', {
        detail: { message: suggestedPrompt },
      })
    );
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-indigo-100/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100/50 rounded-xl">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 leading-snug">{text}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Quick follow-up with NxtHealth AI</p>
        </div>
      </div>
      <button
        onClick={handleAskPam}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
      >
        Ask PAM <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
