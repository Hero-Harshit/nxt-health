'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  HeartPulse, Activity, Wine, Cigarette, Utensils, Moon, 
  Zap, TrendingUp, Award, RotateCcw, Sparkles, ShieldCheck, AlertCircle
} from 'lucide-react';

const NAVY = '#0B1E3D';
const STORAGE_KEY = 'longevity_calculator_v1';

export interface HealthInputs {
  age: number; gender: 'male' | 'female';
  walkSteps: 'under3k' | '3k_7k' | '7k_10k' | '10k_plus';
  alcohol: 'none' | 'moderate' | 'heavy';
  smoking: 'never' | 'former' | 'current';
  diet: 'poor' | 'average' | 'healthy';
  sleepHours: 'under6' | '6_to_8' | 'over8';
  stress: 'low' | 'moderate' | 'high';
}

const DEFAULT_INPUTS: HealthInputs = {
  age: 25, gender: 'male', walkSteps: '7k_10k',
  alcohol: 'none', smoking: 'never', diet: 'healthy',
  sleepHours: '6_to_8', stress: 'low',
};

function calculateLongevity(inputs: HealthInputs) {
  const baseLifeExpectancy = inputs.gender === 'female' ? 82 : 78;
  let impactYears = 0;
  const factors: { label: string; impact: number; category: string; tip: string }[] = [];

  // 1. Walking Activity
  switch (inputs.walkSteps) {
    case 'under3k':
      impactYears -= 3.0; factors.push({ label: 'Sedentary Activity Level', impact: -3.0, category: 'Activity', tip: 'Aim for at least 7,000 steps daily to reduce cardiovascular risk.' }); break;
    case '3k_7k':
      impactYears += 1.0; factors.push({ label: 'Moderate Daily Movement', impact: 1.0, category: 'Activity', tip: 'Increasing steps toward 10k can yield further health gains.' }); break;
    case '7k_10k':
      impactYears += 3.5; factors.push({ label: 'Optimal Daily Step Count', impact: 3.5, category: 'Activity', tip: 'Excellent active routine! Maintain this consistent baseline.' }); break;
    case '10k_plus':
      impactYears += 4.5; factors.push({ label: 'High Physical Endurance', impact: 4.5, category: 'Activity', tip: 'Ensure proper recovery and joint protection with high activity.' }); break;
  }

  // 2. Alcohol
  switch (inputs.alcohol) {
    case 'none':
      impactYears += 1.5; factors.push({ label: 'Zero Alcohol Intake', impact: 1.5, category: 'Alcohol', tip: 'Abstaining supports liver health and metabolic stability.' }); break;
    case 'moderate':
      impactYears -= 1.0; factors.push({ label: 'Moderate Drinking', impact: -1.0, category: 'Alcohol', tip: 'Keep alcohol intake strictly capped to weekends or special events.' }); break;
    case 'heavy':
      impactYears -= 5.0; factors.push({ label: 'Heavy Alcohol Consumption', impact: -5.0, category: 'Alcohol', tip: 'Reducing alcohol is one of your strongest opportunities for gains.' }); break;
  }

  // 3. Smoking
  switch (inputs.smoking) {
    case 'never':
      impactYears += 2.0; factors.push({ label: 'Non-Smoker', impact: 2.0, category: 'Smoking', tip: 'Avoiding nicotine protects cardiovascular and respiratory systems.' }); break;
    case 'former':
      impactYears -= 1.5; factors.push({ label: 'Former Smoker', impact: -1.5, category: 'Smoking', tip: 'Your body continues cellular repair every year post-cessation.' }); break;
    case 'current':
      impactYears -= 7.0; factors.push({ label: 'Active Tobacco Usage', impact: -7.0, category: 'Smoking', tip: 'Smoking cessation programs provide immediate longevity benefits.' }); break;
  }

  // 4. Diet
  switch (inputs.diet) {
    case 'poor':
      impactYears -= 2.5; factors.push({ label: 'Processed Diet High in Refined Sugar', impact: -2.5, category: 'Diet', tip: 'Swap ultra-processed foods for whole grains, lean proteins, and greens.' }); break;
    case 'average':
      impactYears += 0.5; factors.push({ label: 'Standard Balanced Diet', impact: 0.5, category: 'Diet', tip: 'Incorporate more micronutrient-dense plant foods and healthy fats.' }); break;
    case 'healthy':
      impactYears += 3.0; factors.push({ label: 'Whole-Food / Mediterranean Diet', impact: 3.0, category: 'Diet', tip: 'Antioxidant and omega-rich diets directly lower metabolic age.' }); break;
  }

  // 5. Sleep
  switch (inputs.sleepHours) {
    case 'under6':
      impactYears -= 2.0; factors.push({ label: 'Chronic Sleep Deficit (<6 hrs)', impact: -2.0, category: 'Sleep', tip: 'Prioritize a 7-8 hour sleep schedule to reduce biological strain.' }); break;
    case '6_to_8':
      impactYears += 2.0; factors.push({ label: 'Restorative Sleep Duration', impact: 2.0, category: 'Sleep', tip: 'Consistently getting optimal rest accelerates cellular recovery.' }); break;
    case 'over8':
      impactYears += 0.5; factors.push({ label: 'Extended Sleep Pattern', impact: 0.5, category: 'Sleep', tip: 'Maintain high sleep quality and consistent bedtimes.' }); break;
  }

  // 6. Stress Management
  switch (inputs.stress) {
    case 'low':
      impactYears += 1.5; factors.push({ label: 'Effective Stress Regulation', impact: 1.5, category: 'Stress', tip: 'Low stress preserves telomere length and controls inflammation.' }); break;
    case 'moderate':
      impactYears -= 0.5; factors.push({ label: 'Moderate Stress Level', impact: -0.5, category: 'Stress', tip: 'Incorporate daily mindfulness, breathing exercises, or outdoor breaks.' }); break;
    case 'high':
      impactYears -= 3.0; factors.push({ label: 'Elevated Cortisol & Stress', impact: -3.0, category: 'Stress', tip: 'Address chronic stressors through work-life boundaries or wellness routines.' }); break;
  }

  const calculatedLifespan = Math.round(baseLifeExpectancy + impactYears);
  const remainingYears = Math.max(0, calculatedLifespan - inputs.age);
  const healthspan = Math.round(calculatedLifespan * 0.88);

  return {
    baseLifeExpectancy, calculatedLifespan, remainingYears, healthspan,
    totalImpactYears: parseFloat(impactYears.toFixed(1)), factors,
  };
}

export default function LongevityCalculator() {
  const [inputs, setInputs] = useState<HealthInputs>(DEFAULT_INPUTS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setInputs(JSON.parse(saved)); } catch (e) { setInputs(DEFAULT_INPUTS); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs, isLoaded]);

  const results = useMemo(() => calculateLongevity(inputs), [inputs]);
  const updateInput = <K extends keyof HealthInputs>(key: K, value: HealthInputs[K]) => setInputs((prev) => ({ ...prev, [key]: value }));
  const resetForm = () => setInputs(DEFAULT_INPUTS);

  if (!isLoaded) return null; // Hydration safety

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6 antialiased font-sans text-gray-900">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl text-white font-bold" style={{ backgroundColor: NAVY }}>
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: NAVY }}>Longevity & Healthspan Estimator</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Analyze how daily habits impact your life expectancy.</p>
              </div>
            </div>
          </div>
          <button onClick={resetForm} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-4 py-2.5 rounded-xl border border-gray-200/80 transition-all">
            <RotateCcw className="w-4 h-4" /> <span>Reset Baseline</span>
          </button>
        </div>

        {/* SUMMARY STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Projected Lifespan */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Projected Lifespan</span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Award className="w-5 h-5" /></div>
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-emerald-600">{results.calculatedLifespan}</span>
                <span className="text-sm font-semibold text-gray-400">Years</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{results.totalImpactYears >= 0 ? '+' : ''}{results.totalImpactYears} yrs relative to baseline</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (results.calculatedLifespan / 100) * 100)}%` }} />
            </div>
          </div>

          {/* Active Healthspan */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Healthspan</span>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Zap className="w-5 h-5" /></div>
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-blue-600">{results.healthspan}</span>
                <span className="text-sm font-semibold text-gray-400">Years</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Years of vibrant, disease-free living.</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (results.healthspan / 100) * 100)}%` }} />
            </div>
          </div>

          {/* Years Ahead */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Years Ahead</span>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black" style={{ color: NAVY }}>{results.remainingYears}</span>
                <span className="text-sm font-semibold text-gray-400">Years Left</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Based on current age of {inputs.age}.</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (inputs.age / results.calculatedLifespan) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* QUESTIONNAIRE FORM */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: NAVY }}>
                <Activity className="w-5 h-5 text-indigo-600" /> <span>Lifestyle Metrics Questionnaire</span>
              </h2>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Interactive Form</span>
            </div>
            <div className="space-y-5">
              {/* Age & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Age: <span className="text-indigo-600 font-extrabold">{inputs.age}</span></label>
                  <input type="range" min="18" max="90" value={inputs.age} onChange={(e) => updateInput('age', parseInt(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Biological Sex</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['male', 'female'] as const).map((g) => (
                      <button key={g} onClick={() => updateInput('gender', g)} className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all capitalize ${inputs.gender === g ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{g}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Walking */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-600" /> <span>Daily Physical Activity / Walking</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[{ id: 'under3k', label: '< 3k steps' }, { id: '3k_7k', label: '3k–7k' }, { id: '7k_10k', label: '7k–10k' }, { id: '10k_plus', label: '10k+ steps' }].map((opt) => (
                    <button key={opt.id} onClick={() => updateInput('walkSteps', opt.id as HealthInputs['walkSteps'])} className={`p-3 text-xs font-bold rounded-xl border transition-all text-center ${inputs.walkSteps === opt.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Alcohol */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Wine className="w-4 h-4 text-purple-600" /> <span>Alcohol Consumption</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'none', label: 'None / Rare' }, { id: 'moderate', label: 'Moderate' }, { id: 'heavy', label: 'Heavy' }].map((opt) => (
                    <button key={opt.id} onClick={() => updateInput('alcohol', opt.id as HealthInputs['alcohol'])} className={`p-3 text-xs font-bold rounded-xl border transition-all text-center ${inputs.alcohol === opt.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Smoking */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Cigarette className="w-4 h-4 text-amber-600" /> <span>Smoking & Tobacco Status</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'never', label: 'Never Smoked' }, { id: 'former', label: 'Former Smoker' }, { id: 'current', label: 'Active Smoker' }].map((opt) => (
                    <button key={opt.id} onClick={() => updateInput('smoking', opt.id as HealthInputs['smoking'])} className={`p-3 text-xs font-bold rounded-xl border transition-all text-center ${inputs.smoking === opt.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Diet */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Utensils className="w-4 h-4 text-emerald-600" /> <span>Diet & Nutrition Pattern</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'poor', label: 'Processed / Sugar' }, { id: 'average', label: 'Balanced Standard' }, { id: 'healthy', label: 'Whole Food' }].map((opt) => (
                    <button key={opt.id} onClick={() => updateInput('diet', opt.id as HealthInputs['diet'])} className={`p-3 text-xs font-bold rounded-xl border transition-all text-center ${inputs.diet === opt.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Sleep & Stress */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Moon className="w-4 h-4 text-indigo-600" /> <span>Nightly Sleep Duration</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ id: 'under6', label: '< 6 hrs' }, { id: '6_to_8', label: '6–8 hrs' }, { id: 'over8', label: '8+ hrs' }].map((opt) => (
                      <button key={opt.id} onClick={() => updateInput('sleepHours', opt.id as HealthInputs['sleepHours'])} className={`p-2.5 text-xs font-bold rounded-xl border transition-all text-center ${inputs.sleepHours === opt.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> <span>Perceived Stress Level</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ id: 'low', label: 'Low' }, { id: 'moderate', label: 'Moderate' }, { id: 'high', label: 'High' }].map((opt) => (
                      <button key={opt.id} onClick={() => updateInput('stress', opt.id as HealthInputs['stress'])} className={`p-2.5 text-xs font-bold rounded-xl border transition-all text-center ${inputs.stress === opt.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SCORECARD BREAKDOWN & TIPS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold flex items-center gap-2" style={{ color: NAVY }}><ShieldCheck className="w-5 h-5 text-emerald-600" /> <span>Factor Scorecard</span></h2>
              </div>
              <div className="space-y-2.5">
                {results.factors.map((factor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/70 border border-gray-100 text-xs">
                    <div><p className="font-bold text-gray-800">{factor.label}</p><p className="text-[11px] text-gray-400">{factor.category}</p></div>
                    <span className={`font-black px-2.5 py-1 rounded-xl text-xs ${factor.impact > 0 ? 'bg-emerald-100 text-emerald-700' : factor.impact < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}`}>
                      {factor.impact > 0 ? `+${factor.impact}` : factor.impact} yrs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Sparkles className="w-5 h-5 shrink-0" />
                <h2 className="text-base font-bold text-gray-900">Actionable Longevity Tips</h2>
              </div>
              <div className="space-y-3">
                {results.factors.filter((f) => f.impact < 2).slice(0, 3).map((factor, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900"><AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> <span>{factor.category} Opportunity</span></div>
                    <p className="text-amber-800 leading-relaxed">{factor.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
