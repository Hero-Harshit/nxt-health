"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Lock, Mail, User, ShieldCheck, HeartPulse, RefreshCw, AlertCircle } from "lucide-react";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    <div className="min-h-screen bg-[#FBF6EE] text-[#24322F] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-[#1F5B5B] flex items-center justify-center shadow-md">
          <HeartPulse className="h-7 w-7 text-white" />
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#1F5B5B]">
          Welcome to NxtHealth
        </h2>
        <p className="mt-2 text-xs text-[#6E8B8B]">
          Your trusted partner for explainable healthcare decisions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-[#D8CDBB] rounded-2xl shadow-sm sm:px-10">
          
          {/* Tab Selection */}
          <div className="flex border-b border-[#D8CDBB] mb-6">
            <button
              onClick={() => {
                setActiveTab("signin");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`w-1/2 pb-4 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
                activeTab === "signin"
                  ? "border-[#1F5B5B] text-[#1F5B5B]"
                  : "border-transparent text-[#6E8B8B] hover:text-[#24322F]"
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
                  ? "border-[#1F5B5B] text-[#1F5B5B]"
                  : "border-transparent text-[#6E8B8B] hover:text-[#24322F]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {activeTab === "signup" && (
              <div>
                <label className="block text-sm font-semibold text-[#24322F]">
                  Full Name
                </label>
                <div className="mt-1.5 relative">
                  <User className="absolute left-3.5 top-3.5 h-5 w-5 text-[#6E8B8B]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-[#D8CDBB] bg-[#FBF6EE]/40 pl-11 pr-4 py-3 text-sm text-[#24322F] focus:border-[#1F5B5B] focus:outline-none focus:ring-1 focus:ring-[#1F5B5B] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#24322F]">
                Email Address
              </label>
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-[#6E8B8B]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-[#D8CDBB] bg-[#FBF6EE]/40 pl-11 pr-4 py-3 text-sm text-[#24322F] focus:border-[#1F5B5B] focus:outline-none focus:ring-1 focus:ring-[#1F5B5B] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#24322F]">
                Password
              </label>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-[#6E8B8B]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#D8CDBB] bg-[#FBF6EE]/40 pl-11 pr-4 py-3 text-sm text-[#24322F] focus:border-[#1F5B5B] focus:outline-none focus:ring-1 focus:ring-[#1F5B5B] transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="rounded-xl bg-[#3A4B47] text-[#FBF6EE] p-4 text-xs flex gap-2.5 items-start">
                <AlertCircle className="h-5 w-5 text-[#E0A458] shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="rounded-xl bg-[#DCEEE6] text-[#1F5B5B] p-4 text-xs flex gap-2.5 items-start border border-[#1F5B5B]/10">
                <ShieldCheck className="h-5 w-5 text-[#1F5B5B] shrink-0 mt-0.5" />
                <div className="font-semibold leading-relaxed">{successMsg}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[#1F5B5B] hover:bg-[#174646] py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#FBF6EE]" />
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
