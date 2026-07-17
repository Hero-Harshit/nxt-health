"use client";

import React, { useState, FormEvent } from "react";
import { ShieldCheck, Sparkles, HeartPulse, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type ExplanationResult = {
  title: string;
  reference_id: string | null;
  explanation: string;
  why_not: string | null;
  alternatives: string | null;
  trade_offs: string | null;
  confidence_level: "high" | "medium" | "low" | null;
  confidence_note: string | null;
};

type ApiResponse = {
  status: "ok" | "no_match" | "error";
  results: ExplanationResult[];
  message?: string;
};

export default function AdvisorPage() {
  const [age, setAge] = useState<number>(30);
  const [policyType, setPolicyType] = useState<"Individual" | "Family Floater">("Family Floater");
  const [kidsCount, setKidsCount] = useState<number>(1);
  const [cityTier, setCityTier] = useState<string>("Tier 1 - Metro");
  const [budgetBand, setBudgetBand] = useState<"Economy" | "Moderate" | "Premium">("Moderate");
  const [maxPedWaitingMonths, setMaxPedWaitingMonths] = useState<string>("Any");
  const [requiresMaternity, setRequiresMaternity] = useState<boolean>(false);
  const [requiresNoRoomRentCap, setRequiresNoRoomRentCap] = useState<boolean>(false);
  const [requiresOpd, setRequiresOpd] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ExplanationResult[]>([]);
  const [status, setStatus] = useState<"idle" | "success" | "no_match" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [expandedCard, setExpandedCard] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCard((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getConfidenceBadgeClass = (level: "high" | "medium" | "low" | null) => {
    if (level === "high") {
      return "bg-sky-100 text-sky-700 border border-sky-200/50";
    } else if (level === "medium" || level === "low") {
      return "bg-amber-50 text-amber-700 border border-amber-200/50";
    } else {
      return "bg-slate-100 text-slate-700 border border-slate-200/50";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setStatus("idle");
    setResults([]);

    const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
    const pedVal = maxPedWaitingMonths === "Any" ? 0 : Number(maxPedWaitingMonths);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${backendBaseUrl}/api/insurance-advisor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          age: Number(age),
          budgetBand,
          kidsCount: Number(kidsCount),
          policyType,
          cityTier,
          maxPedWaitingMonths: pedVal,
          requiresMaternity,
          requiresNoRoomRentCap,
          requiresOpd,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned code ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.status === "ok") {
        setResults(data.results);
        setStatus(data.results.length > 0 ? "success" : "no_match");
      } else if (data.status === "no_match") {
        setStatus("no_match");
        setResults([]);
      } else {
        throw new Error(data.message || "Unable to retrieve advisor recommendations.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "Something went wrong while matching plans.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 border-b border-slate-200 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0F2744] flex items-center justify-center shadow-md">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F2744] flex items-center gap-2">
                NxtHealth <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200/50">Advisor</span>
              </h1>
              <p className="text-xs text-slate-500">Explainable healthcare decision platform — non-diagnostic guidance</p>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Form Sidebar */}
          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0F2744] mb-6 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-sky-600" />
                Find Coverage
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
                  <input
                    type="number"
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Policy Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Individual", "Family Floater"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPolicyType(type)}
                        className={`rounded-xl py-2 text-xs font-semibold border transition-all duration-200 ${
                          policyType === type
                            ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-500 hover:border-sky-600/40 hover:text-slate-900"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dependents / Kids Count</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={kidsCount}
                    onChange={(e) => setKidsCount(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City Tier</label>
                  <select
                    value={cityTier}
                    onChange={(e) => setCityTier(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
                  >
                    <option value="Tier 1 - Metro">Tier 1 - Metro</option>
                    <option value="Tier 2">Tier 2</option>
                    <option value="Tier 3">Tier 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Annual Premium Budget</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Economy", "Moderate", "Premium"] as const).map((band) => (
                      <button
                        key={band}
                        type="button"
                        onClick={() => setBudgetBand(band)}
                        className={`rounded-xl py-2 text-xs font-semibold border transition-all duration-200 ${
                          budgetBand === band
                            ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-500 hover:border-sky-600/40 hover:text-slate-900"
                        }`}
                      >
                        {band}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max PED Waiting Period</label>
                  <select
                    value={maxPedWaitingMonths}
                    onChange={(e) => setMaxPedWaitingMonths(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
                  >
                    <option value="Any">Any</option>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                    <option value="36">36 Months</option>
                    <option value="48">48 Months</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresMaternity}
                      onChange={(e) => setRequiresMaternity(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-sky-600 accent-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-xs font-medium text-slate-700">Needs Maternity Benefits</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresNoRoomRentCap}
                      onChange={(e) => setRequiresNoRoomRentCap(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-sky-600 accent-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-xs font-medium text-slate-700">Requires No Room Rent Capping</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresOpd}
                      onChange={(e) => setRequiresOpd(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-sky-600 accent-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-xs font-medium text-slate-700">Requires OPD / Teleconsultation Cover</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      Analyzing policies...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-white" />
                      Get AI Recommendations
                    </>
                  )}
                </button>
              </form>
            </div>
          </aside>

          {/* Results Area */}
          <main className="lg:col-span-8">
            {isLoading && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-sky-600 animate-pulse mb-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-semibold tracking-wide">AI analyzing policies...</span>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && status === "idle" && (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-white/40 shadow-sm">
                <HeartPulse className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-[#0F2744]">Ready for Analysis</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-2">
                  Enter your age, preferences, and coverage parameters to compare matched policies.
                </p>
              </div>
            )}

            {!isLoading && status === "no_match" && (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-white/40 shadow-sm">
                <AlertCircle className="h-12 w-12 text-sky-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">No Matching Policies</h3>
                <p className="text-sm text-slate-500 max-w-md mt-2 px-6">
                  We could not find any policies matching your criteria even after dropping constraints. Try adjusting your parameters.
                </p>
              </div>
            )}

            {!isLoading && status === "error" && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 p-6 shadow-sm flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-rose-700">Analysis Failed</h3>
                  <p className="text-sm text-rose-600 mt-2 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {!isLoading && status === "success" && (
              <div className="space-y-6">
                {results.map((policy) => {
                  const policyId = policy.reference_id || policy.title;
                  const isExpanded = expandedCard[policyId] || false;

                  return (
                    <div
                      key={policyId}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-[#0F2744] tracking-tight">{policy.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">ID: {policy.reference_id}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${getConfidenceBadgeClass(policy.confidence_level)}`}>
                          {policy.confidence_level || "neutral"} Match
                        </span>
                      </div>

                      <div className="text-sm text-slate-700 leading-relaxed mb-6">
                        {policy.explanation}
                      </div>

                      {/* Expandable Sections */}
                      <div className="border-t border-slate-100 pt-4">
                        <button
                          onClick={() => toggleExpand(policyId)}
                          className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4" /> Hide details & trade-offs
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" /> Show details & trade-offs
                            </>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-4 space-y-4">
                            {policy.why_not && (
                              <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-200/60">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">Why not others?</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">{policy.why_not}</p>
                              </div>
                            )}

                            {policy.trade_offs && (
                              <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-200/60">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">Trade-offs</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">{policy.trade_offs}</p>
                              </div>
                            )}

                            {policy.alternatives && (
                              <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-200/60">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2744] mb-2">Alternatives</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">{policy.alternatives}</p>
                              </div>
                            )}

                            {policy.confidence_note && (
                              <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-200/60">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Confidence note</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">{policy.confidence_note}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
