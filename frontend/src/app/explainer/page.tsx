"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { HeartPulse, Sparkles, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
import { TextToSpeech } from "@/components/common/TextToSpeech";

type Context = "term" | "prescription";

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

export default function ExplainerPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [context, setContext] = useState<Context>("term");
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoadingAuth(false);
      if (!session) {
        router.push("/login");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session || !input.trim()) return;

    setIsLoading(true);
    setErrorMsg("");
    setResult(null);

    const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${backendBaseUrl}/api/term-explainer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ context, input }),
      });

      const data = await response.json();

      if (response.ok && data && (data.status === "ok" || data.status === "no_match") && Array.isArray(data.results)) {
        if (data.results.length > 0) {
          setResult(data.results[0] as ExplanationResult);
        } else {
          setErrorMsg("No explanation matches found.");
        }
      } else {
        setErrorMsg(data.message || "We could not explain that right now. Please try again.");
      }
    } catch (err) {
      setErrorMsg("We could not reach the backend. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-20 text-center animate-pulse font-sans">
        <RefreshCw className="h-8 w-8 animate-spin text-sky-600 mb-4" />
        <p className="text-sm font-medium text-slate-500">Verifying user session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="mb-8 border-b border-slate-200 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0F2744] flex items-center justify-center shadow-md">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F2744] flex items-center gap-2">
                NxtHealth <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200/50">Explainer</span>
              </h1>
              <p className="text-xs text-slate-500">Explainable healthcare decision platform — non-diagnostic guidance</p>
            </div>
          </div>
        </header>

        {/* Input Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#0F2744] flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-sky-600" /> Explain a term or prescription note
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Context Category</label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value as Context)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
              >
                <option value="term">Medical Terminology</option>
                <option value="prescription">Prescription / Medication Note</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {context === "term" ? "Healthcare Term" : "Prescription Text"}
              </label>
              <textarea
                rows={5}
                required
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={context === "term" ? "e.g. Hypertension, LDL Cholesterol, HbA1c..." : "Paste your doctor's note or prescription details here..."}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 py-3.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  Preparing plain-text explanation...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-white" />
                  Explain
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {errorMsg && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 p-5 shadow-sm flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-rose-700">Explanation Unavailable</h3>
              <p className="text-sm text-rose-600 mt-1 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Success / Result Display */}
        {result && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5.5 w-5.5 text-sky-600" />
                <h2 className="text-lg font-bold text-[#0F2744]">{result.title}</h2>
              </div>
              <TextToSpeech text={result.explanation} />
            </div>

            {/* Core Explanation */}
            <div className="rounded-xl bg-sky-50/50 p-5 border border-sky-100 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Plain-Language explanation</span>
              <p className="text-sm leading-relaxed text-slate-700">{result.explanation}</p>
            </div>

            {/* Explanation Details Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              {result.why_not && (
                <div className="rounded-xl border border-slate-200/60 p-4 bg-slate-50 space-y-1.5">
                  <h4 className="font-bold text-xs text-slate-900">Why Not This?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{result.why_not}</p>
                </div>
              )}
              
              {result.alternatives && (
                <div className="rounded-xl border border-slate-200/60 p-4 bg-slate-50 space-y-1.5">
                  <h4 className="font-bold text-xs text-slate-900">Alternatives</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{result.alternatives}</p>
                </div>
              )}

              {result.trade_offs && (
                <div className="rounded-xl border border-slate-200/60 p-4 bg-slate-50 space-y-1.5">
                  <h4 className="font-bold text-xs text-slate-900">Trade-offs</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{result.trade_offs}</p>
                </div>
              )}
            </div>

            {/* Confidence info */}
            {result.confidence_note && (
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex justify-between items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Confidence Note: {result.confidence_note}
                </span>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full border border-sky-200/50 capitalize">
                  {result.confidence_level || "Neutral"}
                </span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
