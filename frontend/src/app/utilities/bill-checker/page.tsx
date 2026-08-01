'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, IndianRupee, MapPin, ShieldCheck, Activity, ReceiptText, ChevronDown, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

// --- DESIGN TOKENS ---
const NAVY = '#0B1E3D';
const BLUE = '#2F6FED';
const BLUE_LIGHT = '#EAF2FE';

// --- DATABASE ---
const PROCEDURES_DATA: Record<string, { min: number; max: number }> = {
  "MRI Scan": { "min": 3000, "max": 15000 },
  "CT Scan": { "min": 2000, "max": 8000 },
  "X-Ray": { "min": 300, "max": 1200 },
  "Ultrasound Scan": { "min": 800, "max": 3000 },
  "ECG": { "min": 200, "max": 700 },
  "2D Echo": { "min": 2000, "max": 6000 },
  "TMT (Stress Test)": { "min": 2000, "max": 5000 },
  "Blood Test (CBC)": { "min": 300, "max": 800 },
  "Thyroid Function Test": { "min": 500, "max": 2000 },
  "Liver Function Test": { "min": 700, "max": 2500 },
  "Kidney Function Test": { "min": 700, "max": 2500 },
  "Endoscopy": { "min": 4000, "max": 15000 },
  "Colonoscopy": { "min": 8000, "max": 25000 },
  "Appendectomy (Appendix Removal)": { "min": 45000, "max": 100000 },
  "Gallbladder Removal": { "min": 60000, "max": 200000 },
  "Hernia Repair": { "min": 50000, "max": 150000 },
  "Normal Delivery": { "min": 40000, "max": 120000 },
  "Cesarean Delivery (C-Section)": { "min": 70000, "max": 200000 },
  "Kidney Stone Removal (Laser)": { "min": 50000, "max": 200000 },
  "Dialysis (Per Session)": { "min": 2500, "max": 5500 },
  "Angiography": { "min": 18000, "max": 45000 },
  "Angioplasty (1 Stent)": { "min": 180000, "max": 450000 },
  "Cataract Surgery": { "min": 25000, "max": 80000 },
  "LASIK Eye Surgery": { "min": 25000, "max": 100000 },
  "Root Canal Treatment": { "min": 4000, "max": 12000 },
  "Dental Implant": { "min": 25000, "max": 60000 },
  "Hair Transplant": { "min": 50000, "max": 180000 },
  "Dengue Treatment": { "min": 15000, "max": 80000 },
  "Typhoid Treatment": { "min": 10000, "max": 50000 },
  "Pneumonia Treatment": { "min": 25000, "max": 120000 },
  "Tonsillectomy": { "min": 40000, "max": 90000 },
  "Sinus Surgery": { "min": 70000, "max": 200000 },
  "Thyroid Surgery": { "min": 80000, "max": 220000 },
  "Hysterectomy": { "min": 80000, "max": 250000 },
  "Knee Replacement": { "min": 250000, "max": 550000 },
  "Hip Replacement": { "min": 280000, "max": 600000 },
  "Varicose Vein Surgery": { "min": 60000, "max": 180000 },
  "Hemorrhoid (Piles) Surgery": { "min": 40000, "max": 120000 },
  "Chemotherapy (Per Cycle)": { "min": 20000, "max": 120000 },
  "Pacemaker Implantation": { "min": 200000, "max": 600000 }
};

const PROCEDURE_NAMES = Object.keys(PROCEDURES_DATA);
const CITY_TIERS = ['Tier 1 (Metros)', 'Tier 2 (Cities)', 'Tier 3 / Rural'];

export default function BillCheckerPage() {
  // Form State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [cityTier, setCityTier] = useState('');
  
  // Result State
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter procedures based on search
  const filteredProcedures = useMemo(() => {
    return PROCEDURE_NAMES.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcedure || !amount || !cityTier) return;
    
    setIsLoading(true);
    setResult(null);
    setErrorMsg(null); // Clear previous errors
    
    const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

    try {
      const res = await fetch(`${backendBaseUrl}/api/check-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ procedure: selectedProcedure, amount: Number(amount), cityTier })
      });
      
      const data = await res.json(); // Always parse the response, even on 500
      
      if (res.ok) {
        setResult(data);
      } else {
        // Capture the exact backend error details
        console.error("Backend Error:", data);
        setErrorMsg(data.details || data.error || "An unknown 500 error occurred on the server.");
      }
    } catch (err: any) {
      console.error("Network/Fetch Error:", err);
      setErrorMsg(err.message || "Failed to reach the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4">
          Home <span className="mx-1.5">/</span> Utilities <span className="mx-1.5">/</span>
          <span className="text-gray-700 font-medium">Hospital Bill Checker</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: NAVY }}>
            Hospital Bill Overcharge Checker
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl">
            Ensure you aren't paying inflated medical bills. Select a procedure, enter your quoted amount, and let our AI compare it against standard city benchmarks.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">
          
          {/* LEFT: Input Form */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ReceiptText className="w-5 h-5" style={{ color: BLUE }} />
              Enter Bill Details
            </h2>

            <form onSubmit={handleCheck} className="space-y-6">
              
              {/* 1. Procedure Search */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Medical Procedure
                </label>
                <div 
                  className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-gray-300 transition-colors"
                  onClick={() => setIsDropdownOpen(true)}
                >
                  <Activity className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search procedure (e.g. MRI Scan)"
                    className="w-full bg-transparent text-sm text-gray-900 font-medium focus:outline-none"
                    value={isDropdownOpen ? searchQuery : selectedProcedure || searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                      if (selectedProcedure) setSelectedProcedure('');
                    }}
                  />
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredProcedures.length > 0 ? (
                      filteredProcedures.map(proc => (
                        <div
                          key={proc}
                          onClick={() => {
                            setSelectedProcedure(proc);
                            setSearchQuery('');
                            setIsDropdownOpen(false);
                          }}
                          className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                          {proc}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">No procedures found</div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Quoted Amount */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Quoted Amount (Budget)
                </label>
                <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                  <IndianRupee className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 15000"
                    className="w-full bg-transparent text-sm text-gray-900 font-bold focus:outline-none"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* 3. City Tier */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location Category
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {CITY_TIERS.map(tier => (
                    <div
                      key={tier}
                      onClick={() => setCityTier(tier)}
                      className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${
                        cityTier === tier 
                          ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <span className={`text-xs font-bold ${cityTier === tier ? 'text-blue-700' : 'text-gray-600'}`}>
                        {tier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedProcedure || !amount || !cityTier || isLoading}
                className="w-full mt-4 py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-[0.98]"
                style={{ backgroundColor: BLUE, color: 'white' }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing Data...
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Check For Overcharging
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: AI Analysis Result */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col h-full min-h-[400px]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
              <span style={{ color: BLUE }}>✨</span> AI Analysis Result
            </h3>
            
            {!result && !isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10" style={{ color: BLUE }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Awaiting Details</p>
                  <p className="text-xs text-gray-500 max-w-[250px] mx-auto mt-1">
                    Fill out the form on the left to see if your hospital bill aligns with standard pricing benchmarks.
                  </p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-600 animate-pulse">Analyzing benchmarks...</p>
              </div>
            )}

            {errorMsg && !isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl max-w-full">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-red-900 mb-1">Production Error Captured</h4>
                  <p className="text-xs text-red-700 font-mono break-words text-left bg-red-100/50 p-2 rounded">
                    {errorMsg}
                  </p>
                </div>
              </div>
            )}

            {result && !isLoading && (
              <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
                {/* Status Badge */}
                <div className={`p-4 rounded-xl border flex items-start gap-4 ${
                  result.color === 'RED' ? 'bg-red-50 border-red-200 text-red-900' :
                  result.color === 'YELLOW' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                  result.color === 'BLUE' ? 'bg-blue-50 border-blue-200 text-blue-900' :
                  'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="mt-0.5">
                    {result.color === 'RED' ? <AlertCircle className="w-6 h-6 text-red-600" /> :
                     result.color === 'YELLOW' ? <AlertTriangle className="w-6 h-6 text-amber-600" /> :
                     <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                  </div>
                  <div>
                    <h4 className="text-lg font-black tracking-tight mb-1">{result.verdict}</h4>
                    <p className="text-sm font-medium opacity-90 leading-relaxed">{result.explanation}</p>
                  </div>
                </div>

                {/* Actionable Tips */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Negotiation & Action Plan
                  </h4>
                  <ul className="space-y-3">
                    {result.tips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 bg-gray-50 border border-gray-100 p-3.5 rounded-xl">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-gray-700 font-medium leading-snug">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
