"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, History as HistoryIcon, Activity, FileText, Search, CreditCard, Stethoscope, AlertCircle, Receipt } from 'lucide-react';
import { getHistoryLogs, HistoryLog } from '@/utils/history'; // Adjust import path if needed

// Map categories to specific UI styles
const categoryStyles: Record<string, { icon: any; color: string; bg: string }> = {
  planner: { icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
  search: { icon: Search, color: 'text-blue-600', bg: 'bg-blue-100' },
  payment: { icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ai: { icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-100' },
  vault: { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
  explainer: { icon: FileText, color: 'text-teal-600', bg: 'bg-teal-100' },
  'bill-checker': { icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-100' },
  general: { icon: HistoryIcon, color: 'text-gray-600', bg: 'bg-gray-100' },
};

export default function HistoryPage() {
  const [logs, setLogs] = useState<HistoryLog[]>([]);

  useEffect(() => {
    // Load logs on mount
    setLogs(getHistoryLogs());

    // Listen for updates across the app
    const handleUpdate = () => setLogs(getHistoryLogs());
    window.addEventListener('history_updated', handleUpdate);
    return () => window.removeEventListener('history_updated', handleUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8faff] p-4 sm:p-8 font-sans pb-24">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <Link href="/" className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">
              My History
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">A chronological record of your healthcare activities.</p>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <HistoryIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
          </div>

          {/* History List or Empty State */}
          {logs.length > 0 ? (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-100 before:via-gray-200 before:to-transparent">
              {logs.map((log) => {
                const style = categoryStyles[log.type] || categoryStyles.general;
                const Icon = style.icon;
                
                return (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    
                    {/* Icon Marker */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white ${style.bg} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 relative left-0 md:left-1/2 -ml-6 md:ml-0`}>
                      <Icon className={`w-5 h-5 ${style.color}`} />
                    </div>
                    
                    {/* Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 mb-1">{log.date}</span>
                        <span className="text-sm font-bold text-gray-800 leading-snug">{log.title}</span>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center">
               <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
               <p className="text-gray-500 font-bold">No history recorded yet.</p>
               <p className="text-sm text-gray-400 mt-1">Interact with modules to see them here.</p>
            </div>
          )}

          {/* Privacy Note */}
          <div className="mt-10 pt-6 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400 font-medium">
              Your history is completely private and linked only to your account to improve AI personalization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
