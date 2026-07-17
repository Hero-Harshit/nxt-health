"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Heart, 
  Brain, 
  Sparkles 
} from "lucide-react";

interface Phase {
  name: string;
  durationMs: number;
  type: "inhale" | "hold" | "exhale" | "holdEmpty";
  description: string;
}

interface Technique {
  name: string;
  description: string;
  badge: string;
  phases: Phase[];
}

const TECHNIQUES: Technique[] = [
  {
    name: "Box Breathing",
    description: "Inhale 4s ➔ Hold 4s ➔ Exhale 4s ➔ Hold empty 4s. Promotes overall calm and anxiety relief.",
    badge: "Box 4-4-4-4",
    phases: [
      { name: "Inhale", durationMs: 4000, type: "inhale", description: "Breathe in deeply through your nose" },
      { name: "Hold", durationMs: 4000, type: "hold", description: "Hold the breath in your lungs" },
      { name: "Exhale", durationMs: 4000, type: "exhale", description: "Release the breath slowly out of your mouth" },
      { name: "Hold Empty", durationMs: 4000, type: "holdEmpty", description: "Hold your breath empty" }
    ]
  },
  {
    name: "4-7-8 Relaxation",
    description: "Inhale 4s ➔ Hold 7s ➔ Exhale 8s. Deep relaxation technique to aid sleep and mitigate stress.",
    badge: "Relax 4-7-8",
    phases: [
      { name: "Inhale", durationMs: 4000, type: "inhale", description: "Inhale quietly through your nose" },
      { name: "Hold", durationMs: 7000, type: "hold", description: "Hold the air in your lungs" },
      { name: "Exhale", durationMs: 8000, type: "exhale", description: "Exhale completely making a whoosh sound" }
    ]
  },
  {
    name: "Coherent Breathing",
    description: "Inhale 5s ➔ Exhale 5s. Balances the autonomic nervous system and regulates heart variability.",
    badge: "Coherent 5-5",
    phases: [
      { name: "Inhale", durationMs: 5000, type: "inhale", description: "Breathe in slowly and continuously" },
      { name: "Exhale", durationMs: 5000, type: "exhale", description: "Release the breath gently without pausing" }
    ]
  }
];

export default function BreathingExercise() {
  const [techIndex, setTechIndex] = useState<number>(0);
  const [sessionDuration, setSessionDuration] = useState<number>(60000); // 1 Minute default
  
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState<number>(0);
  const [elapsedPhaseMs, setElapsedPhaseMs] = useState<number>(0);
  const [totalElapsedMs, setTotalElapsedMs] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [showCompletionMessage, setShowCompletionMessage] = useState<boolean>(false);

  const activeTechnique = TECHNIQUES[techIndex];
  const activePhase = activeTechnique.phases[currentPhaseIdx];

  // Load from local storage
  useEffect(() => {
    const raw = localStorage.getItem("nxt_breathing_data");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed.completedSessions === "number") {
          setTimeout(() => {
            setCompletedSessions(parsed.completedSessions);
          }, 0);
        }
      } catch (e) {
        console.error("Error loading breathing data:", e);
      }
    }
  }, []);

  // Web Audio Synth Cue
  const playTone = useCallback((frequency: number, duration: number) => {
    if (isMuted || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context fails:", e);
    }
  }, [isMuted]);

  // Main high-precision interval timer (100ms ticks for fluid animations)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(() => {
        setTotalElapsedMs((prevTotal) => {
          const nextTotal = prevTotal + 100;
          
          // Check if session completes
          if (nextTotal >= sessionDuration) {
            setIsActive(false);
            setShowCompletionMessage(true);
            const nextCompleted = completedSessions + 1;
            setCompletedSessions(nextCompleted);
            localStorage.setItem("nxt_breathing_data", JSON.stringify({ completedSessions: nextCompleted }));
            return sessionDuration;
          }
          return nextTotal;
        });

        setElapsedPhaseMs((prevPhase) => {
          const nextPhase = prevPhase + 100;
          
          // Phase transition
          if (nextPhase >= activePhase.durationMs) {
            // Play a soft high tone on transition
            playTone(520, 0.4);
            setCurrentPhaseIdx((prevIdx) => (prevIdx + 1) % activeTechnique.phases.length);
            return 0;
          }
          
          // Sub-second tone for second ticks
          if (nextPhase > 0 && nextPhase % 1000 === 0) {
            // Play a low click sound every second
            playTone(220, 0.1);
          }
          
          return nextPhase;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isActive, activePhase, activeTechnique, completedSessions, sessionDuration, playTone]);

  // Reset helper
  const handleReset = () => {
    setIsActive(false);
    setCurrentPhaseIdx(0);
    setElapsedPhaseMs(0);
    setTotalElapsedMs(0);
    setShowCompletionMessage(false);
  };

  // Switch technique helper
  const handleSelectTechnique = (idx: number) => {
    setTechIndex(idx);
    handleReset();
  };

  // Switch duration helper
  const handleSelectDuration = (ms: number) => {
    setSessionDuration(ms);
    handleReset();
  };

  // Dynamic Scale & Color Calculation for Animation Ring
  const getCircleMetrics = () => {
    const duration = activePhase.durationMs;
    const progress = elapsedPhaseMs / duration;
    
    let scale = 1.0;

    switch (activePhase.type) {
      case "inhale":
        scale = 1.0 + (0.5 * progress); // 1.0 to 1.5
        break;
      case "hold":
        scale = 1.5;
        break;
      case "exhale":
        scale = 1.5 - (0.5 * progress); // 1.5 to 1.0
        break;
      case "holdEmpty":
        scale = 1.0;
        break;
    }
    
    return { scale };
  };

  const { scale } = getCircleMetrics();
  const phaseSecondsRemaining = Math.max(0, Math.ceil((activePhase.durationMs - elapsedPhaseMs) / 1000));
  const totalPercent = Math.min(100, Math.round((totalElapsedMs / sessionDuration) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Breathing Exercise</h2>
          <p className="text-xs text-slate-500 mt-1">
            Calibrate breathing cycles to regulate stress hormones and promote recovery.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {completedSessions > 0 && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
              Completed {completedSessions} sessions 🌿
            </span>
          )}
          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-100">
            <Sparkles className="h-3 w-3" /> Nervous System Reset
          </span>
        </div>
      </div>

      {/* Technique Selector Pills */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-col sm:flex-row gap-1">
        {TECHNIQUES.map((tech, idx) => (
          <button
            key={tech.name}
            type="button"
            onClick={() => handleSelectTechnique(idx)}
            className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              techIndex === idx
                ? "bg-[#0F2744] text-white shadow"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tech.name}
            <span className={`block text-[10px] mt-0.5 font-medium ${
              techIndex === idx ? "text-sky-300" : "text-slate-400"
            }`}>
              {tech.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Technique Description */}
      <p className="text-xs text-slate-500 text-center px-4 leading-relaxed max-w-2xl mx-auto">
        {activeTechnique.description}
      </p>

      {/* MAIN INTERACTIVE CANVAS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[420px]">
        {showCompletionMessage ? (
          <div className="text-center space-y-4 animate-fadeIn">
            <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#0F2744]">Session Complete!</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Excellent job. Your nervous system is now calibrated. Take a moment to feel the calmness before continuing your day.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-6 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Reset Exercise
            </button>
          </div>
        ) : (
          <>
            {/* Concentric Animated Circles */}
            <div className="relative h-64 w-64 flex items-center justify-center">
              {/* Outer soft glowing ring */}
              <div 
                className="absolute inset-0 rounded-full bg-sky-50 opacity-40 transition-transform duration-100 ease-out"
                style={{ transform: `scale(${scale * 1.15})` }}
              />
              {/* Inner ring */}
              <div 
                className="absolute inset-4 rounded-full bg-sky-100/60 transition-transform duration-100 ease-out border border-sky-200/50"
                style={{ transform: `scale(${scale})` }}
              />
              {/* Core Active Ring */}
              <div 
                className="absolute inset-10 rounded-full bg-sky-600 shadow-md flex flex-col items-center justify-center transition-transform duration-100 ease-out"
                style={{ transform: `scale(${scale})` }}
              >
                {/* Text Content inside the circle */}
                <span className="text-xl font-extrabold text-white tracking-wide uppercase transition-all duration-300">
                  {isActive ? activePhase.name : "Ready"}
                </span>
                <span className="text-3xl font-extrabold text-sky-100 mt-1">
                  {isActive ? `${phaseSecondsRemaining}s` : ""}
                </span>
              </div>
            </div>

            {/* Sub-label description */}
            <p className="mt-8 text-sm font-semibold text-slate-700 text-center min-h-[20px] max-w-md">
              {isActive ? activePhase.description : "Select your target time below and click Start."}
            </p>

            {/* Session Progress Bar */}
            {isActive && (
              <div className="w-full max-w-md mt-6 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>SESSION PROGRESS</span>
                  <span>{totalPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0F2744] h-full rounded-full transition-all duration-300"
                    style={{ width: `${totalPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="mt-8 w-full border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Duration Pills */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                {[
                  { label: "1 Min", value: 60000 },
                  { label: "2 Min", value: 120000 },
                  { label: "5 Min", value: 300000 }
                ].map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    disabled={isActive}
                    onClick={() => handleSelectDuration(d.value)}
                    className={`py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all ${
                      isActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    } ${
                      sessionDuration === d.value
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Primary Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-8 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  {isActive ? (
                    <>
                      <Pause className="h-4 w-4 text-white" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 text-white fill-white" /> Start Session
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                  title="Reset session"
                >
                  <RotateCcw className="h-4.5 w-4.5 text-slate-500" />
                </button>
              </div>

              {/* Mute/Sound Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="h-4 w-4 text-rose-500" /> Muted
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 text-sky-600 animate-pulse" /> Audio cues active
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Benefits Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex gap-3.5 items-start">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Lowers Heart Rate
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Slowing and hold cycles stimulate the vagus nerve, initiating parasympathetic calm and dropping systolic tension levels rapidly.
            </p>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex gap-3.5 items-start">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Clears Mental Fog
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Used by medical clinicians, emergency response agents, and professional athletes to stabilize focus and oxygenate brain tissue under load.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
