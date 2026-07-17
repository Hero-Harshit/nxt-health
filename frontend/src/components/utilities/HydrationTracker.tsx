"use client";

import React, { useState, useEffect } from "react";
import { 
  GlassWater, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Info, 
  Calculator,
  Droplet
} from "lucide-react";

interface LogEntry {
  id: string;
  time: string;
  amountMl: number;
}

interface HydrationData {
  lastDate: string;
  currentMl: number;
  goalMl: number;
  logs: LogEntry[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function HydrationTracker() {
  const [hydration, setHydration] = useState<HydrationData>({
    lastDate: "",
    currentMl: 0,
    goalMl: 2500,
    logs: []
  });

  const [customAmount, setCustomAmount] = useState<string>("");
  const [weightInput, setWeightInput] = useState<string>("");
  const [showEstimator, setShowEstimator] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const rawData = localStorage.getItem("nxt_hydration_data");
    
    let activeData: HydrationData | null = null;
    
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData) as HydrationData;
        if (parsed.lastDate !== today) {
          // New day auto-reset
          activeData = {
            lastDate: today,
            currentMl: 0,
            goalMl: parsed.goalMl || 2500,
            logs: []
          };
          localStorage.setItem("nxt_hydration_data", JSON.stringify(activeData));
        } else {
          activeData = parsed;
        }
      } catch (e) {
        console.error("Error parsing hydration data:", e);
      }
    }
    
    if (!activeData) {
      activeData = {
        lastDate: today,
        currentMl: 0,
        goalMl: 2500,
        logs: []
      };
      localStorage.setItem("nxt_hydration_data", JSON.stringify(activeData));
    }

    const finalData = activeData;
    setTimeout(() => {
      setHydration(finalData);
      setIsLoaded(true);
    }, 0);
  }, []);

  // Update helper
  const updateHydration = (updated: HydrationData) => {
    setHydration(updated);
    localStorage.setItem("nxt_hydration_data", JSON.stringify(updated));
  };

  // Add intake handler
  const handleAddIntake = (amount: number) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: LogEntry = {
      id: generateId(),
      time: timeStr,
      amountMl: amount
    };

    const updated = {
      ...hydration,
      currentMl: hydration.currentMl + amount,
      logs: [newLog, ...hydration.logs]
    };
    updateHydration(updated);
  };

  // Delete individual log entry
  const handleDeleteLog = (id: string, amount: number) => {
    const updatedLogs = hydration.logs.filter(log => log.id !== id);
    const updated = {
      ...hydration,
      currentMl: Math.max(0, hydration.currentMl - amount),
      logs: updatedLogs
    };
    updateHydration(updated);
  };

  // Reset progress
  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset today's progress?")) {
      const updated = {
        ...hydration,
        currentMl: 0,
        logs: []
      };
      updateHydration(updated);
    }
  };

  // Update goal target
  const handleUpdateGoal = (newGoal: number) => {
    const cappedGoal = Math.min(5000, Math.max(1000, newGoal));
    const updated = {
      ...hydration,
      goalMl: cappedGoal
    };
    updateHydration(updated);
  };

  // Estimate goal based on weight
  const handleEstimateGoal = () => {
    const weightVal = parseFloat(weightInput);
    if (!weightVal || isNaN(weightVal)) return;

    const estimatedGoal = Math.round(weightVal * 35);
    // Align with step values of 250ml
    const roundedGoal = Math.round(estimatedGoal / 250) * 250;
    
    handleUpdateGoal(roundedGoal);
    setShowEstimator(false);
    setWeightInput("");
  };

  // SVG Progress Ring calculations
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.round((hydration.currentMl / hydration.goalMl) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Dynamic clinical status
  const getIntakeStatus = () => {
    const pct = (hydration.currentMl / hydration.goalMl) * 100;
    if (pct === 0) return "Getting Started";
    if (pct < 25) return "First sip taken! Hydrating...";
    if (pct < 50) return "Getting there! Keep it up.";
    if (pct < 75) return "Halfway there! Great progress.";
    if (pct < 100) return "Almost at your target! 💧";
    return "Target Achieved! 🎉";
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 font-semibold">
        Loading hydration details...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: Visual Ring & Progress */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
        <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">
          Intake Progress
        </h3>

        {/* SVG Progress Ring */}
        <div className="relative flex items-center justify-center h-52 w-52 mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Outer Circle (Background) */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-slate-100 fill-none"
              strokeWidth={strokeWidth}
            />
            {/* Inner Progress Circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-sky-600 fill-none transition-all duration-500 ease-out"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Details */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-[#0F2744]">
              {hydration.currentMl.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-0.5">
              / {hydration.goalMl.toLocaleString()} ml
            </span>
            <span className="inline-block mt-2 bg-sky-50 text-sky-700 text-xs font-bold px-2 py-0.5 rounded-full border border-sky-100">
              {Math.round((hydration.currentMl / hydration.goalMl) * 100)}%
            </span>
          </div>
        </div>

        {/* Remaining Tracker */}
        <div className="w-full border-t border-slate-100 pt-5 text-sm space-y-3">
          <div className="flex justify-between font-semibold">
            <span className="text-slate-500">Remaining Today</span>
            <span className="text-[#0F2744]">
              {Math.max(0, hydration.goalMl - hydration.currentMl).toLocaleString()} ml
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-slate-500">Clinical Status</span>
            <span className="text-sky-600">{getIntakeStatus()}</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Controls & History */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Header & Adjust Goal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hydration Tracker</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track and log daily water intake targets.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-100">
              <Droplet className="h-3.5 w-3.5" /> Daily Intake Goal
            </span>
          </div>

          {/* Stepper Goal Adjuster */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Daily Goal
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateGoal(hydration.goalMl - 250)}
                  className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="text-sm font-extrabold text-[#0F2744] min-w-16 text-center">
                  {hydration.goalMl} ml
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateGoal(hydration.goalMl + 250)}
                  className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Estimator Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowEstimator(!showEstimator)}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Calculator className="h-3.5 w-3.5" /> Calculate based on weight
              </button>

              {showEstimator && (
                <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Weight in kg"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
                    />
                    <button
                      type="button"
                      onClick={handleEstimateGoal}
                      className="bg-[#0F2744] hover:bg-[#1b3d68] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Apply Goal
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Clinical recommendation formula: Weight (kg) × 35 ml.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Intake Cards */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Quick Add Intake
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Glass", amount: 250, desc: "Standard Cup" },
              { label: "Mug", amount: 350, desc: "Large Glass" },
              { label: "Bottle", amount: 500, desc: "Water Bottle" },
              { label: "Flask", amount: 750, desc: "Sports Flask" }
            ].map((item) => (
              <button
                key={item.amount}
                type="button"
                onClick={() => handleAddIntake(item.amount)}
                className="p-3 bg-slate-50/50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 rounded-xl text-center group cursor-pointer transition-all"
              >
                <div className="mx-auto h-8 w-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <GlassWater className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 block">+{item.amount} ml</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
            <input
              type="number"
              placeholder="Custom intake (e.g. 150)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all font-semibold"
            />
            <button
              type="button"
              onClick={() => {
                const amt = parseInt(customAmount);
                if (amt && amt > 0) {
                  handleAddIntake(amt);
                  setCustomAmount("");
                }
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Today's Activity Log */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Today&apos;s Activity Log
            </h4>
            {hydration.logs.length > 0 && (
              <button
                type="button"
                onClick={handleResetProgress}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Daily Progress
              </button>
            )}
          </div>

          {hydration.logs.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No water intake logged for today. Let&apos;s get hydrating!
            </div>
          ) : (
            <div className="overflow-y-auto max-h-60 space-y-2 pr-1">
              {hydration.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {log.time}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      Drank {log.amountMl} ml
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteLog(log.id, log.amountMl)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health Tip Footer */}
        <div className="flex gap-2.5 p-4 bg-sky-50/50 border border-sky-100 rounded-xl">
          <Info className="h-4.5 w-4.5 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-normal">
            <span className="font-bold text-sky-800">Pro Tip:</span> Drinking a glass of water first thing in the morning boosts metabolism and alertness.
          </p>
        </div>

      </div>
    </div>
  );
}
