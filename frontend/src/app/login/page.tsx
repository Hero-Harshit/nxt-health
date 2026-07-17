"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lock, Mail, User, ShieldCheck, HeartPulse, RefreshCw, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (activeTab === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;
        
        setSuccessMsg("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setSuccessMsg("Signed in successfully! Redirecting...");
        setTimeout(() => {
          router.push("/preventive-health");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-[#0F2744] flex items-center justify-center shadow-md">
          <HeartPulse className="h-7 w-7 text-white" />
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#0F2744]">
          Welcome to NxtHealth
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Your trusted partner for explainable healthcare decisions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 rounded-2xl shadow-sm sm:px-10">
          
          {/* Tab Selection */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => {
                setActiveTab("signin");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`w-1/2 pb-4 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
                activeTab === "signin"
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`w-1/2 pb-4 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
                activeTab === "signup"
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {activeTab === "signup" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <div className="mt-1.5 relative">
                  <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-4 text-xs flex gap-2.5 items-start">
                <AlertCircle className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="rounded-xl bg-sky-100 text-sky-700 p-4 text-xs flex gap-2.5 items-start border border-sky-200">
                <ShieldCheck className="h-5 w-5 text-sky-700 shrink-0 mt-0.5" />
                <div className="font-semibold leading-relaxed">{successMsg}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  Please wait...
                </>
              ) : (
                <>
                  {activeTab === "signin" ? "Sign In" : "Create Account"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
