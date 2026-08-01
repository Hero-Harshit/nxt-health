'use client';

import React from 'react';
import { Award, Lock, Trophy, Medal, Star, Shield, Calendar, Zap, Heart, Activity } from 'lucide-react';

const AWARDS_DATA = [
  { id: 1, name: 'NxtHealth Pioneer', description: 'Successfully joined the NxtHealth platform.', unlocked: true, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100' },
  { id: 2, name: 'The 7-Day Sentinel', description: 'Log your daily health metrics for 7 consecutive days.', unlocked: false, icon: Zap },
  { id: 3, name: 'Deep Sleep Scholar', description: 'Log 8+ hours of optimal sleep for 14 consecutive nights.', unlocked: false, icon: Star },
  { id: 4, name: 'Consistency Champion', description: 'Maintain a perfect Heatmap streak for 30 days.', unlocked: false, icon: Activity },
  { id: 5, name: 'Habit Builder', description: 'Maintain a 60-day logging streak without missing a single day.', unlocked: false, icon: Heart },
  { id: 6, name: 'Billing Auditor', description: 'Monitor and verify healthcare expenses consistently over a 90-day period.', unlocked: false, icon: Shield },
  { id: 7, name: 'Vault Archivist', description: 'Securely manage your health records on the platform for 6 months.', unlocked: false, icon: Lock },
  { id: 8, name: 'Quarterly Checkup', description: 'Update your health passport for 4 consecutive quarters (1 year).', unlocked: false, icon: Calendar },
  { id: 9, name: 'The Centenarian Club', description: 'Be an active NxtHealth member for 365 days.', unlocked: false, icon: Award },
  { id: 10, name: 'Iron Vault', description: 'Keep your health records active and secure for 2 continuous years.', unlocked: false, icon: Medal },
];

export default function AwardsPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6 antialiased font-sans">
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-3 text-[#0B1E3D]">
              <div className="p-3 rounded-2xl bg-indigo-50">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <span>Awards & Achievements</span>
            </h1>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">
              1 / 10 Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {AWARDS_DATA.map((award) => {
              const Icon = award.icon;
              return (
                <div 
                  key={award.id} 
                  className={`relative p-5 rounded-2xl border transition-all h-full flex flex-col ${
                    award.unlocked 
                      ? 'border-amber-200 bg-gradient-to-b from-amber-50 to-white shadow-sm' 
                      : 'border-gray-100 bg-gray-50/50 grayscale-[50%] opacity-80'
                  }`}
                >
                  {!award.unlocked && (
                    <div className="absolute top-4 right-4 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${award.unlocked ? award.bg : 'bg-gray-200'}`}>
                    <Icon className={`w-6 h-6 ${award.unlocked ? award.color : 'text-gray-400'}`} />
                  </div>
                  
                  <h3 className={`text-sm font-bold mb-2 ${award.unlocked ? 'text-gray-900' : 'text-gray-600'}`}>
                    {award.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium mt-auto">
                    {award.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
