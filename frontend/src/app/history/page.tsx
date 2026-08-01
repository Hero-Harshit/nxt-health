"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, History, Activity, FileText, Search, CreditCard, Stethoscope } from 'lucide-react';

// Dummy data to establish the UI layout (Replace with actual DB/localStorage fetch logic later)
const historyLogs = [
  { id: 1, type: 'planner', title: 'Updated Preventive Health Plan', date: 'Today, 10:30 AM', icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
  { id: 2, type: 'search', title: 'Searched for "MRI Scan Cost"', date: 'Yesterday, 4:15 PM', icon: Search, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 3, type: 'payment', title: 'VisionPay Transaction - City Hospital', date: 'Oct 24, 2023', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { id: 4, type: 'ai', title: 'Chatted with Pam about Sleep Routines', date: 'Oct 22, 2023', icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-100' },
  { id: 5, type: 'vault', title: 'Uploaded Blood Test Report', date: 'Oct 20, 2023', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
];

export default function HistoryPage() {
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
              <History className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
          </div>

          {/* History List */}
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-100 before:via-gray-200 before:to-transparent">
            {historyLogs.map((log) => {
              const Icon = log.icon;
              return (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Icon Marker */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white ${log.bg} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 relative left-0 md:left-1/2 -ml-6 md:ml-0`}>
                    <Icon className={`w-5 h-5 ${log.color}`} />
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
