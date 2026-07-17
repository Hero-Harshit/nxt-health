"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Flame, 
  Info, 
  Activity, 
  Dumbbell, 
  Zap, 
  Trophy, 
  GlassWater, 
  Scale, 
  Calendar
} from "lucide-react";

type UnitSystem = "metric" | "imperial";
type Gender = "male" | "female";

interface ActivityOption {
  value: number;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface GoalOption {
  value: number;
  label: string;
  deficitLabel: string;
  colorClass: string;
  badgeClass: string;
}

export default function CalorieCalculator() {
  // Activity descriptions and multipliers
  const activityOptions: ActivityOption[] = [
    {
      value: 1.2,
      label: "Sedentary",
      description: "Little or no exercise, office/desk job",
      icon: <Scale className="h-5 w-5" />
    },
    {
      value: 1.375,
      label: "Lightly Active",
      description: "Light exercise or sports 1-3 days/week",
      icon: <Activity className="h-5 w-5" />
    },
    {
      value: 1.55,
      label: "Moderately Active",
      description: "Moderate exercise or sports 3-5 days/week",
      icon: <Dumbbell className="h-5 w-5" />
    },
    {
      value: 1.725,
      label: "Very Active",
      description: "Hard exercise or heavy sports 6-7 days/week",
      icon: <Zap className="h-5 w-5" />
    },
    {
      value: 1.9,
      label: "Extra Active",
      description: "Physical job or training 2x/day",
      icon: <Trophy className="h-5 w-5" />
    }
  ];

  // Goal options
  const goalOptions: GoalOption[] = [
    {
      value: -1000,
      label: "Extreme Loss",
      deficitLabel: "-1.0 kg/week",
      colorClass: "border-rose-200 hover:border-rose-400 text-rose-700 bg-rose-50/10",
      badgeClass: "bg-rose-100 text-rose-800"
    },
    {
      value: -500,
      label: "Weight Loss",
      deficitLabel: "-0.5 kg/week",
      colorClass: "border-amber-200 hover:border-amber-400 text-amber-700 bg-amber-50/10",
      badgeClass: "bg-amber-100 text-amber-800"
    },
    {
      value: -250,
      label: "Mild Loss",
      deficitLabel: "-0.25 kg/week",
      colorClass: "border-yellow-200 hover:border-yellow-400 text-yellow-700 bg-yellow-50/10",
      badgeClass: "bg-yellow-100 text-yellow-800"
    },
    {
      value: 0,
      label: "Maintain",
      deficitLabel: "0.0 kg/week",
      colorClass: "border-sky-200 hover:border-sky-400 text-sky-700 bg-sky-50/10",
      badgeClass: "bg-sky-100 text-sky-800"
    },
    {
      value: 250,
      label: "Mild Gain",
      deficitLabel: "+0.25 kg/week",
      colorClass: "border-emerald-200 hover:border-emerald-400 text-emerald-700 bg-emerald-50/10",
      badgeClass: "bg-emerald-100 text-emerald-800"
    },
    {
      value: 500,
      label: "Muscle Gain",
      deficitLabel: "+0.5 kg/week",
      colorClass: "border-indigo-200 hover:border-indigo-400 text-indigo-700 bg-indigo-50/10",
      badgeClass: "bg-indigo-100 text-indigo-800"
    }
  ];

  // State variables
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState<number>(25);
  
  // Weights (Metric: kg, Imperial: lbs)
  const [weight, setWeight] = useState<number>(70); 
  
  // Height Metric (cm)
  const [heightCm, setHeightCm] = useState<number>(175);
  // Height Imperial (feet and inches)
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(9);

  const [activity, setActivity] = useState<number>(1.2);
  const [goal, setGoal] = useState<number>(0);

  // 1. Get weight in kg
  const weightKg = unitSystem === "metric" ? weight : weight / 2.20462;

  // 2. Get height in cm
  const hCm = unitSystem === "metric" ? heightCm : (heightFt * 12 + heightIn) * 2.54;

  // 3. Mifflin-St Jeor formula
  let bmr = 0;
  if (weightKg && hCm && age) {
    if (gender === "male") {
      bmr = Math.round(10 * weightKg + 6.25 * hCm - 5 * age + 5);
    } else {
      bmr = Math.round(10 * weightKg + 6.25 * hCm - 5 * age - 161);
    }
  }

  // 4. TDEE
  const tdee = Math.round(bmr * activity);

  // 5. Target Calories with deficit/surplus and safety cap
  let targetCalories = tdee + goal;
  const safetyMin = gender === "male" ? 1500 : 1200;
  let isCapped = false;

  if (targetCalories < safetyMin) {
    targetCalories = safetyMin;
    isCapped = true;
  }

  // Convert unit system values
  const handleUnitToggle = (system: UnitSystem) => {
    if (system === unitSystem) return;
    setUnitSystem(system);

    if (system === "imperial") {
      // Metric -> Imperial
      // Weight: kg -> lbs
      setWeight(Math.round(weight * 2.20462));
      // Height: cm -> ft/in
      const totalInches = heightCm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      setHeightFt(feet);
      setHeightIn(inches);
    } else {
      // Imperial -> Metric
      // Weight: lbs -> kg
      setWeight(Math.round(weight / 2.20462));
      // Height: ft/in -> cm
      const totalIn = heightFt * 12 + heightIn;
      setHeightCm(Math.round(totalIn * 2.54));
    }
  };

  // Macro Splits (Balanced High-Protein Default: 30% Protein, 40% Carbs, 30% Fats)
  const proteinCals = targetCalories * 0.30;
  const carbCals = targetCalories * 0.40;
  const fatCals = targetCalories * 0.30;

  const proteinGrams = Math.round(proteinCals / 4);
  const carbGrams = Math.round(carbCals / 4);
  const fatGrams = Math.round(fatCals / 9);

  // Daily Hydration (liters)
  const hydrationLiters = (weightKg * 0.033) + (activity > 1.2 ? (activity - 1.2) * 1.5 : 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Input Form */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Calorie & Macro Estimator
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Precision calorie configuration utilizing the MSJ equation.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-100">
            <Sparkles className="h-3 w-3" /> Clinical Standard
          </span>
        </div>

        <div className="space-y-6">
          {/* Segmented Controls for Unit and Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unit System Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Unit System
              </label>
              <div className="bg-slate-100 p-1 rounded-xl flex">
                <button
                  type="button"
                  onClick={() => handleUnitToggle("metric")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    unitSystem === "metric"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Metric (kg/cm)
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitToggle("imperial")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    unitSystem === "imperial"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Imperial (lbs/ft)
                </button>
              </div>
            </div>

            {/* Gender Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Biological Sex
              </label>
              <div className="bg-slate-100 p-1 rounded-xl flex">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    gender === "male"
                      ? "bg-[#0F2744] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    gender === "female"
                      ? "bg-[#0F2744] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          {/* Grid Inputs: Age, Weight, Height */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Age Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Age (Years)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="15"
                  max="100"
                  value={age || ""}
                  onChange={(e) => setAge(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Weight Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Weight ({unitSystem === "metric" ? "kg" : "lbs"})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={weight || ""}
                  onChange={(e) => setWeight(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-12 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all font-semibold"
                />
                <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
                  {unitSystem === "metric" ? "kg" : "lbs"}
                </span>
              </div>
            </div>

            {/* Height Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Height
              </label>
              {unitSystem === "metric" ? (
                <div className="relative">
                  <input
                    type="number"
                    min="80"
                    max="250"
                    value={heightCm || ""}
                    onChange={(e) => setHeightCm(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-12 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all font-semibold"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
                    cm
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="3"
                      max="8"
                      value={heightFt || ""}
                      onChange={(e) => setHeightFt(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-3 pr-8 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all font-semibold"
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                      ft
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={heightIn || ""}
                      onChange={(e) => setHeightIn(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-3 pr-8 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all font-semibold"
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Daily Activity Level
            </label>
            <div className="space-y-2.5">
              {activityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActivity(option.value)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    activity === option.value
                      ? "border-sky-500 bg-sky-50/50 ring-1 ring-sky-500 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity === option.value ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {option.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{option.label}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-sky-600 bg-sky-100/50 px-2 py-1 rounded">
                    x{option.value}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Goal Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Your Fitness Goal
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {goalOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGoal(option.value)}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center ${
                    goal === option.value
                      ? "border-[#0F2744] bg-[#0F2744]/5 ring-1 ring-[#0F2744]"
                      : option.colorClass
                  }`}
                >
                  <span className="text-xs font-bold block text-slate-900">{option.label}</span>
                  <span className={`mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    goal === option.value ? "bg-[#0F2744] text-white" : option.badgeClass
                  }`}>
                    {option.deficitLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Results Dashboard */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
        <div className="bg-[#0F2744] text-white rounded-2xl p-6 shadow-md border border-[#1b3d68]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300">
            Daily Budget Target
          </h3>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tight">
              {targetCalories}
            </span>
            <span className="text-sm font-semibold text-sky-200">kcal / day</span>
          </div>

          {isCapped && (
            <div className="mt-3.5 flex items-start gap-2 bg-amber-500/20 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
              <Info className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Safety Minimum Applied:</span> 
                {` Target calories are capped at ${gender === "male" ? "1500" : "1200"} kcal to prevent unhealthy caloric deficit levels.`}
              </div>
            </div>
          )}

          <div className="border-t border-sky-950 mt-6 pt-5 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-sky-300 block font-medium">BMR (Base Metabolism)</span>
              <span className="text-base font-bold mt-0.5 block">{bmr} kcal</span>
            </div>
            <div>
              <span className="text-sky-300 block font-medium">TDEE (Total Expenditure)</span>
              <span className="text-base font-bold mt-0.5 block">{tdee} kcal</span>
            </div>
          </div>
        </div>

        {/* Interactive Macro Visualizer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Flame className="h-4.5 w-4.5 text-sky-600" /> Macro Nutrition Targets
          </h4>
          
          <div className="space-y-4">
            {/* Protein */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-600 inline-block" />
                  Protein (30%)
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {proteinGrams}g <span className="text-slate-500 font-medium">/ {proteinCals} kcal</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-sky-600 h-full rounded-full" style={{ width: "30%" }} />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0F2744] inline-block" />
                  Carbohydrates (40%)
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {carbGrams}g <span className="text-slate-500 font-medium">/ {carbCals} kcal</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#0F2744] h-full rounded-full" style={{ width: "40%" }} />
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 inline-block" />
                  Healthy Fats (30%)
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {fatGrams}g <span className="text-slate-500 font-medium">/ {fatCals} kcal</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: "30%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Daily Hydration Recommendation */}
        <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-5 flex gap-3.5 items-start">
          <div className="p-2 bg-sky-100 text-sky-700 rounded-xl shrink-0">
            <GlassWater className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider">
              Optimal Hydration Target
            </h4>
            <p className="text-sm font-bold text-sky-700 mt-1">
              {hydrationLiters.toFixed(1)} Liters / Day
            </p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Recommended baseline daily intake tailored to your current physical weight and daily activity load.
            </p>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="flex gap-2 p-2 bg-slate-50 border border-slate-200/60 rounded-xl">
          <Info className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-normal">
            Calculations use the Mifflin-St Jeor equation. Consult a nutritionist or medical expert for personalized clinical diet plans.
          </p>
        </div>
      </div>
    </div>
  );
}
