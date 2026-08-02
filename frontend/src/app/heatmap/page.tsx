'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  Activity,
  Droplets,
  Moon,
  Heart,
  Footprints
} from 'lucide-react';

interface HealthTask {
  id: string;
  title: string;
  category: string;
  icon: any;
  completed: boolean;
}

export default function HealthyHeatmapPage() {
  const [streakCount, setStreakCount] = useState(0);
  const [tasks, setTasks] = useState<HealthTask[]>([
    { id: '1', title: 'Logged 8 Hours Sleep', category: 'Recovery', icon: Moon, completed: false },
    { id: '2', title: 'Drank 2.5L Water', category: 'Hydration', icon: Droplets, completed: false },
    { id: '3', title: 'Completed 8,000 Steps', category: 'Fitness', icon: Footprints, completed: false },
    { id: '4', title: 'Recorded Heart Rate', category: 'Vitals', icon: Heart, completed: false },
    { id: '5', title: '2-Min Breathing Exercise', category: 'Mindfulness', icon: Activity, completed: false },
  ]);

  // Sync initial streak count from localStorage
  useEffect(() => {
    const savedStreak = localStorage.getItem('nxthealth_streak_count');
    if (savedStreak !== null) {
      setStreakCount(parseInt(savedStreak, 10) || 0);
    }

    // Load completed tasks state if previously saved
    const savedTasks = localStorage.getItem('nxthealth_heatmap_tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed);
      } catch (e) {
        console.error('Failed to parse saved heatmap tasks', e);
      }
    }
  }, []);

  // Toggle task completion and update streak counter
  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    setTasks(updatedTasks);
    localStorage.setItem('nxthealth_heatmap_tasks', JSON.stringify(updatedTasks));
    
    // Calculate new streak count
    const anyCompleted = updatedTasks.some(t => t.completed);
    const newStreak = anyCompleted ? Math.max(1, streakCount === 0 ? 1 : streakCount) : 0;

    setStreakCount(newStreak);
    localStorage.setItem('nxthealth_streak_count', newStreak.toString());
    
    // Dispatch custom window event so Home Dashboard streak pill updates immediately
    window.dispatchEvent(new Event('streak-updated'));
  };

  // Simulated 7-day visual activity heatmap matrix
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header & Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
                <Flame className="w-8 h-8 fill-orange-500 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Healthy Heatmap
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  Track daily wellness consistency and build long-term health habits.
                </p>
              </div>
            </div>
            {/* Active Streak Score Card */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/80 rounded-2xl p-4 flex items-center gap-4 shrink-0">
              <div className="text-center">
                <span className="text-xs font-bold text-orange-800 uppercase tracking-wider block">
                  Current Streak
                </span>
                <span className="text-3xl font-black text-orange-600">
                  {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <Flame className={`w-8 h-8 ${streakCount > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
            </div>
          </div>
        </div>

        {/* 30-Day Activity Heatmap Grid */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Consistency Heatmap</h2>
            </div>
            <span className="text-xs text-gray-500 font-medium">August 2026</span>
          </div>
          {/* Heatmap Visual Grid */}
          <div className="pt-2">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-400 mb-2">
              {days.map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }).map((_, idx) => {
                const isActive = streakCount > 0 && idx >= 28 - streakCount;
                return (
                  <div
                    key={idx}
                    className={`h-10 rounded-xl border transition-all flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-500/20'
                        : idx % 3 === 0
                        ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 text-xs text-gray-500 pt-2">
            <span>Less active</span>
            <div className="flex gap-1">
              <div className="w-3.5 h-3.5 rounded bg-slate-100"></div>
              <div className="w-3.5 h-3.5 rounded bg-emerald-100"></div>
              <div className="w-3.5 h-3.5 rounded bg-orange-500"></div>
            </div>
            <span>Active streak</span>
          </div>
        </div>

        {/* Daily Interactive Health Tasks */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Today's Health Tasks</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Complete at least one wellness task daily to maintain and grow your streak score!
          </p>
          <div className="space-y-3 pt-2">
            {tasks.map(task => {
              const IconComponent = task.icon;
              return (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 font-bold'
                      : 'bg-white border-gray-100 hover:border-blue-200 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${task.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{task.title}</h3>
                      <span className="text-[11px] text-gray-500 font-medium">{task.category}</span>
                    </div>
                  </div>
                  <div>
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
