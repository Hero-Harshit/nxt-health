"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import { Pill, Search, X, AlertCircle, HeartPulse, Sparkles, HelpCircle } from "lucide-react";

type Medicine = {
  id: number;
  medicine_name: string;
  brand_manufacturer: string;
  active_ingredient: string;
  drug_class: string;
  common_use_case: string;
  generic_alternative_names: string;
  generic_manufacturers_examples: string;
  estimated_brand_price_inr: string;
  estimated_generic_price_inr: string;
  price_difference_note: string;
  dosage_form: string;
  needs_manual_verification: boolean;
  verification_note: string;
};

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMedicines = async () => {
      const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
      try {
        const response = await fetch(`${backendBaseUrl}/api/medicines`);
        if (!response.ok) {
          throw new Error(`Failed to load medicines: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === "ok") {
          setMedicines(data.medicines);
        } else {
          throw new Error(data.message || "Unknown error loading medicines.");
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Could not retrieve medicines from backend.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredMedicines = searchQuery.trim()
    ? medicines.filter(
        (m) =>
          m.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.active_ingredient.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelect = (med: Medicine) => {
    setSelectedMedicine(med);
    setSearchQuery(med.medicine_name);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedMedicine(null);
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-[#FBF6EE] text-[#24322F] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 border-b border-[#D8CDBB] pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#1F5B5B] flex items-center justify-center shadow-md">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1F5B5B] flex items-center gap-2">
                NxtHealth <span className="text-xs bg-[#DCEEE6] text-[#1F5B5B] px-2 py-0.5 rounded-full border border-[#1F5B5B]/20">Medicines</span>
              </h1>
              <p className="text-xs text-[#6E8B8B]">Explainable healthcare decision platform — non-diagnostic guidance</p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
            <RefreshCw className="h-8 w-8 animate-spin text-[#1F5B5B] mb-4" />
            <p className="text-sm font-medium text-[#6E8B8B]">Loading medicines database...</p>
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl bg-[#3A4B47] text-[#FBF6EE] p-6 shadow-sm flex items-start gap-4 mb-8">
            <AlertCircle className="h-6 w-6 text-[#E0A458] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-white">Database Unreachable</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Autocomplete Search Input */}
            <div className="relative" ref={dropdownRef}>
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-[#6E8B8B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Enter brand name or active ingredient (e.g. Paracetamol, Lipitor)..."
                  className="w-full rounded-2xl border border-[#D8CDBB] bg-white pl-12 pr-12 py-4 text-[#24322F] focus:border-[#1F5B5B] focus:outline-none focus:ring-1 focus:ring-[#1F5B5B] shadow-sm transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={handleClear}
                    className="absolute right-4 p-1 rounded-full hover:bg-[#FBF6EE] text-[#6E8B8B] hover:text-[#24322F] transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Dropdown Menu */}
              {showDropdown && searchQuery.trim() !== "" && (
                <div className="absolute z-10 mt-2 w-full rounded-2xl border border-[#D8CDBB] bg-white shadow-lg max-h-72 overflow-y-auto animate-fadeIn">
                  {filteredMedicines.length > 0 ? (
                    filteredMedicines.map((med) => (
                      <button
                        key={med.id}
                        onClick={() => handleSelect(med)}
                        className="w-full text-left px-5 py-3.5 hover:bg-[#FBF6EE] transition-colors border-b border-[#D8CDBB]/30 last:border-0 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-[#24322F]">{med.medicine_name}</div>
                          <div className="text-xs text-[#6E8B8B] mt-0.5">{med.active_ingredient}</div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#E5E9E7] text-[#3A4B47]">
                          {med.dosage_form}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-6 text-center text-sm text-[#6E8B8B]">
                      Our database does not contain an alternative generic medicine for that.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Medicine Info Card */}
            {selectedMedicine ? (
              <div className="rounded-2xl border border-[#D8CDBB] bg-white p-6 shadow-sm space-y-6">
                {/* Header Section */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D8CDBB]/40 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#1F5B5B] tracking-tight">
                      {selectedMedicine.medicine_name}
                    </h2>
                    <p className="text-xs text-[#6E8B8B] mt-1">Manufactured by: {selectedMedicine.brand_manufacturer}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E5E9E7] text-[#3A4B47] uppercase tracking-wider">
                    {selectedMedicine.dosage_form}
                  </span>
                </div>

                {/* Active Ingredient Banner */}
                <div className="rounded-xl bg-[#FBF6EE] p-4 border border-[#D8CDBB]/30 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#DCEEE6] flex items-center justify-center">
                    <Pill className="h-4.5 w-4.5 text-[#1F5B5B]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#6E8B8B] font-bold">Active Ingredient (Salt)</p>
                    <p className="text-sm font-semibold text-[#24322F] mt-0.5">{selectedMedicine.active_ingredient}</p>
                  </div>
                </div>

                {/* Price Comparison Box */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#D8CDBB] p-4 text-center bg-[#FBF6EE]/30">
                    <p className="text-xs text-[#6E8B8B] font-semibold">Estimated Brand Price</p>
                    <p className="text-lg font-bold text-[#24322F] mt-1">{selectedMedicine.estimated_brand_price_inr}</p>
                  </div>
                  <div className="rounded-xl border border-[#D8CDBB] p-4 text-center bg-[#FBF6EE]/30">
                    <p className="text-xs text-[#6E8B8B] font-semibold">Estimated Generic Price</p>
                    <p className="text-lg font-bold text-[#1F5B5B] mt-1">{selectedMedicine.estimated_generic_price_inr}</p>
                  </div>
                  <div className="rounded-xl bg-[#DCEEE6] border border-[#1F5B5B]/10 p-4 text-center flex flex-col justify-center items-center">
                    <span className="text-xs text-[#1F5B5B] font-bold uppercase tracking-wider">Potential Savings</span>
                    <span className="text-xs font-semibold text-[#1F5B5B] mt-1 leading-snug">
                      {selectedMedicine.price_difference_note}
                    </span>
                  </div>
                </div>

                {/* Use Case & Drug Class Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#6E8B8B]">Drug Class</h3>
                    <p className="text-sm text-[#24322F] font-medium leading-relaxed">{selectedMedicine.drug_class}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#6E8B8B]">Common Use Case</h3>
                    <p className="text-sm text-[#24322F] font-medium leading-relaxed">{selectedMedicine.common_use_case}</p>
                  </div>
                </div>

                {/* Alternatives Section */}
                <div className="border-t border-[#D8CDBB]/40 pt-5 space-y-4">
                  <h3 className="text-sm font-bold text-[#1F5B5B] flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-[#E0A458]" /> Available Generic Alternatives
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#D8CDBB]/40 p-4 bg-[#FBF6EE]/20">
                      <p className="text-xs text-[#6E8B8B] font-bold uppercase tracking-wider">Alternative Brands / Generics</p>
                      <p className="text-sm text-[#24322F] font-medium mt-1 leading-relaxed">
                        {selectedMedicine.generic_alternative_names}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#D8CDBB]/40 p-4 bg-[#FBF6EE]/20">
                      <p className="text-xs text-[#6E8B8B] font-bold uppercase tracking-wider">Generic Manufacturers</p>
                      <p className="text-sm text-[#24322F] font-medium mt-1 leading-relaxed">
                        {selectedMedicine.generic_manufacturers_examples}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification/Disclaimer Note */}
                <div className="rounded-xl bg-[#F3DCB0] text-[#6E4A0B] p-4 border border-[#E0A458]/20 flex gap-3">
                  <HelpCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Verification Note & Disclaimer</h4>
                    <p className="text-xs mt-1 leading-relaxed">
                      {selectedMedicine.verification_note} Always consult with a qualified doctor or pharmacist before switching medications.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-[#D8CDBB] bg-white/40 shadow-sm">
                <HeartPulse className="h-12 w-12 text-[#6E8B8B] mb-4" />
                <h3 className="text-lg font-semibold text-[#1F5B5B]">Search for Medication</h3>
                <p className="text-sm text-[#6E8B8B] max-w-sm mt-2">
                  Use the lookup bar above to explore brand-name drugs, compare pricing, and find generic alternative matches.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple loader helper used in fallback block
function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
