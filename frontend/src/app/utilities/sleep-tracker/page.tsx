'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================
// Types
// ============================================================
interface SleepLog {
  date: string; // YYYY-MM-DD
  hours: number;
  bedTime: string; // "23:30" or "03:00"
  wakeTime: string; // "07:30"
}

const STORAGE_KEY = 'nxthealth_sleep_tracker_data';

// ============================================================
// Design Tokens — Matched to NxtHealth Design System
// ============================================================
const NAVY = '#0B1E3D';
const BLUE = '#2F6FED';
const BLUE_LIGHT = '#EAF2FE';
const BLUE_DEFICIT = '#93C5FD'; // Light sky blue for deficit days
const BLUE_OPTIMAL = '#2563EB'; // Vibrant blue for optimal days
const BLUE_OVER = '#1E3A8A';    // Deep dark blue for high hours
const GREEN = '#1FAA59';
const GREEN_LIGHT = '#E5F7EC';
const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#F3E8FF';

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper to compute duration between two HH:MM strings
function calculateHoursFromTimes(bed: string, wake: string): number {
  if (!bed || !wake) return 8;
  const [bHours, bMins] = bed.split(':').map(Number);
  const [wHours, wMins] = wake.split(':').map(Number);

  let bedMinutes = bHours * 60 + bMins;
  let wakeMinutes = wHours * 60 + wMins;

  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60; // Crosses midnight
  }

  const diffMinutes = wakeMinutes - bedMinutes;
  return Number((diffMinutes / 60).toFixed(1));
}

// Format minutes into clean human-readable strings ("45 mins", "1 hr 30 mins", "2 hrs")
function formatDurationFromMinutes(totalMins: number): string {
  const rounded = Math.round(totalMins / 5) * 5; // round to nearest 5 mins
  const hrs = Math.floor(rounded / 60);
  const mins = rounded % 60;

  if (hrs === 0) return `${mins} mins`;
  if (mins === 0) return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`;
  return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'} ${mins} mins`;
}

function createInitialLogs(): SleepLog[] {
  return [];
}

export default function SleepTrackerPage() {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [inputHours, setInputHours] = useState<number>(7.5);
  const [bedTime, setBedTime] = useState<string>('23:00');
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [selectedDate, setSelectedDate] = useState<string>(todayString());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLogs(JSON.parse(saved));
      } else {
        setLogs(createInitialLogs());
      }
    } catch {
      setLogs(createInitialLogs());
    }
  }, []);

  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }
  }, [logs]);

  // Recalculate hours dynamically when Bedtime or Wake Time changes
  const handleBedTimeChange = (time: string) => {
    setBedTime(time);
    const hrs = calculateHoursFromTimes(time, wakeTime);
    setInputHours(hrs);
  };

  const handleWakeTimeChange = (time: string) => {
    setWakeTime(time);
    const hrs = calculateHoursFromTimes(bedTime, time);
    setInputHours(hrs);
  };

  const handleSaveEntry = useCallback(() => {
    setLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.date === selectedDate);
      const newEntry: SleepLog = {
        date: selectedDate,
        hours: Number(inputHours),
        bedTime,
        wakeTime,
      };

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newEntry;
        return updated;
      } else {
        return [...prev, newEntry].sort((a, b) => a.date.localeCompare(b.date));
      }
    });
  }, [selectedDate, inputHours, bedTime, wakeTime]);

  const last7Days = logs.slice(-7);
  const totalSlept7Days = last7Days.reduce((sum, log) => sum + log.hours, 0);
  const target7Days = 7 * 8;
  const sleepBacklog = logs.length === 0 ? 0 : Math.max(0, target7Days - totalSlept7Days);
  const avgSleep = last7Days.length > 0 ? (totalSlept7Days / last7Days.length).toFixed(1) : '0';

  const todayLog = logs.find((l) => l.date === selectedDate) || last7Days[last7Days.length - 1];

  // Detect late bedtime dynamically
  const bedHour = todayLog ? parseInt(todayLog.bedTime.split(':')[0], 10) : 23;
  const bedMin = todayLog ? parseInt(todayLog.bedTime.split(':')[1], 10) : 0;
  const isLateBedtime = todayLog ? bedHour >= 1 && bedHour < 5 : false;
  const isOversleeping = todayLog ? todayLog.hours >= 9.5 : false;

  // 1. DYNAMIC CATCH-UP EXTRA SLEEP COMPUTATION
  const dynamicExtraMins = Math.round((sleepBacklog / 7) * 60);

  // 2. DYNAMIC BEDTIME SHIFT COMPUTATION
  const currentBedMinsFromMidnight = bedHour < 12 ? bedHour * 60 + bedMin : (bedHour - 24) * 60 + bedMin;
  const targetBedMinsFromMidnight = -60; // 23:00 is -60 mins from 00:00
  const bedtimeDiffMins = Math.max(30, currentBedMinsFromMidnight - targetBedMinsFromMidnight);
  const dynamicBedtimeShift = formatDurationFromMinutes(bedtimeDiffMins);

  return (
    <main className="min-h-screen bg-white px-6 py-8 max-w-6xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="text-sm text-gray-400 mb-4">
        Home <span className="mx-1.5">/</span> Utilities{' '}
        <span className="mx-1.5">/</span>
        <span className="text-gray-700 font-medium">Sleep Tracker & Backlog</span>
      </div>

      {/* Page Header */}
      <h1
        className="text-4xl font-bold text-gray-900 mb-3"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Sleep Tracker & Backlog
      </h1>
      <p className="text-gray-500 max-w-2xl mb-8 leading-relaxed">
        Log your sleep hours, monitor rolling cumulative sleep debt, and align your circadian rhythm for proactive physical recovery.
      </p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT COLUMN: Input Form & 7-Day Trend Chart */}
        <div className="space-y-6">
          {/* Main Log Entry Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-xl font-bold text-gray-900"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  Log Sleep Duration
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Record your bedtime and total sleep duration
                </p>
              </div>
              <span
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: BLUE_LIGHT, color: BLUE }}
              >
                ⚡ Auto-Calculated
              </span>
            </div>

            {/* Input Form Controls */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Log Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Hours Slept
                </label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="18"
                    value={inputHours}
                    onChange={(e) => setInputHours(Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-bold text-gray-900 focus:outline-none"
                  />
                  <span className="text-xs text-gray-400 font-semibold">hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Bedtime
                </label>
                <input
                  type="time"
                  value={bedTime}
                  onChange={(e) => handleBedTimeChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Wake Time
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => handleWakeTimeChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Centered & Enlarged Button */}
            <div className="flex justify-center mt-2">
              <button
                onClick={handleSaveEntry}
                className="px-8 py-3 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md hover:opacity-90 active:scale-95 border border-blue-200/80 cursor-pointer"
                style={{ backgroundColor: BLUE_LIGHT, color: NAVY }}
              >
                Save Sleep Entry
              </button>
            </div>
          </div>

          {/* 7-Day History Visualizer Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🌙</span> 7-Day Sleep Trend
            </h3>

            <div className="space-y-3">
              {last7Days.map((log) => {
                const isDeficit = log.hours < 7;
                const isOver = log.hours >= 9.5;
                const barWidth = Math.min(100, (log.hours / 10) * 100);
                const barColor = isDeficit ? BLUE_DEFICIT : isOver ? BLUE_OVER : BLUE_OPTIMAL;

                return (
                  <div key={log.date} className="flex items-center gap-4 text-xs">
                    <span className="w-20 text-gray-500 font-medium">
                      {new Date(log.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right font-bold text-gray-800">
                      {log.hours}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Stats & Smart Guidance */}
        <div className="flex flex-col gap-6">
          {/* Dynamic 7-Day Sleep Backlog Card */}
          <div
            className="rounded-2xl p-6 shadow-sm border border-blue-100/60 relative overflow-hidden"
            style={{ backgroundColor: BLUE_LIGHT }}
          >
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: BLUE }}
            >
              7-Day Sleep Backlog
            </p>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-bold text-gray-900">
                {sleepBacklog.toFixed(1)}
              </span>
              <span className="text-lg text-gray-700 font-medium">hours</span>
            </div>

            <p className="text-xs text-gray-800 leading-relaxed border-t border-gray-900/10 pt-4 font-medium">
              {sleepBacklog >= 4 ? (
                <span className="text-amber-800 font-semibold">
                  ⚠️ High cumulative sleep loss detected. Aim for an extra {formatDurationFromMinutes(dynamicExtraMins)} of sleep tonight to start paying off debt.
                </span>
              ) : sleepBacklog > 0 ? (
                <span>
                  Mild sleep backlog detected. Aim for an extra {formatDurationFromMinutes(dynamicExtraMins)} tonight to get back on track.
                </span>
              ) : (
                <span className="text-green-800 font-semibold">
                  🎉 Excellent! You have no accumulated sleep deficit this week.
                </span>
              )}
            </p>
          </div>

          {/* Quick Metrics Breakdown Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: BLUE }}>📊</span>
              <h3 className="font-bold text-gray-900">Sleep Stats</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">7-Day Daily Average</span>
                <span className="text-sm font-bold text-gray-900">{avgSleep} hrs/night</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Ideal Daily Target</span>
                <span className="text-sm font-bold text-gray-900">8.0 hrs/night</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Circadian Status</span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: isLateBedtime ? PURPLE_LIGHT : GREEN_LIGHT,
                    color: isLateBedtime ? PURPLE : GREEN,
                  }}
                >
                  {isLateBedtime ? 'Irregular Schedule' : 'Normal Rhythm'}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Standalone Sleep Guidance Card */}
          <div className="rounded-2xl p-6 border border-gray-200 bg-gray-50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              💡 Smart NxtHealth Guidance
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              {isOversleeping ? (
                <span>
                  <strong>Moderate Your Sleep:</strong> Logging {todayLog ? todayLog.hours : 8}h exceeds optimal recovery ranges. Keep your wake-up time consistent to prevent sleep inertia.
                </span>
              ) : isLateBedtime ? (
                <span>
                  <strong>Schedule Drift Detected:</strong> Bedtime of {todayLog ? todayLog.bedTime : '23:00'} disrupts circadian rhythm. Shift bedtime {dynamicBedtimeShift} earlier tonight.
                </span>
              ) : (
                <span>
                  <strong>Optimal Sleep Hygiene:</strong> Maintain a cool room temperature (65–68°F / 18–20°C) and avoid blue light exposure 45 minutes before bedtime.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
