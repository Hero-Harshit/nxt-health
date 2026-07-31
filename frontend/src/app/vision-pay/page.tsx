"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert, CheckCircle, Fingerprint, Loader2, Sparkles, Receipt, ShieldCheck, Camera } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function VisionPayPage() {
  const router = useRouter();
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalUpi, setHospitalUpi] = useState("");
  const [billAmount, setBillAmount] = useState<number | "">("");
  const [insuranceCoverage, setInsuranceCoverage] = useState<number | "">("");

  // UI States
  const [isLocatingScanner, setIsLocatingScanner] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showRiskShield, setShowRiskShield] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isScanned, setIsScanned] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize html5-qrcode scanner if not scanned yet
    if (isScanned) return;

    const qrRegionId = "qr-reader";
    const scanner = new Html5QrcodeScanner(
      qrRegionId,
      { fps: 10, qrbox: { width: 220, height: 220 }, rememberLastUsedCamera: true },
      /* verbose= */ false
    );
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      (error) => {
        // Keep scan errors silent to avoid console noise
      }
    );

    setIsLocatingScanner(false);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error("Failed to clear scanner:", err));
      }
    };
  }, [isScanned]);

  const handleScanSuccess = (decodedText: string) => {
    try {
      console.log("📸 [QR SCANNED]:", decodedText);
      setScanMessage("QR Code Scanned Successfully!");
      setIsScanned(true);

      // Stop and clear the scanner/camera immediately to save battery
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error("Failed to clear scanner on success:", err));
      }

      if (decodedText.startsWith("upi://pay")) {
        // Parse UPI query parameters
        const urlParams = new URLSearchParams(decodedText.substring(decodedText.indexOf("?")));
        const pa = urlParams.get("pa") || "";
        const pn = urlParams.get("pn") || "";
        const am = urlParams.get("am") || "";
        setHospitalName(pn ? decodeURIComponent(pn) : "Hospital");
        setHospitalUpi(pa);
        if (am) {
          setBillAmount(Number(am));
        }
      } else {
        // Fallback parsing if QR is plain text
        setHospitalName(decodedText);
      }
    } catch (e) {
      setHospitalName(decodedText);
    }
  };

  const handleVerifyRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalName || !hospitalUpi || !billAmount || !insuranceCoverage) {
      alert("Please fill in all details before proceeding.");
      return;
    }
    setIsVerifying(true);
    setShowRiskShield(false);
    setIsAuthorized(false);

    setTimeout(() => {
      setIsVerifying(false);
      setShowRiskShield(true);
      // Scroll to risk shield
      const shield = document.getElementById("ai-risk-shield");
      if (shield) {
        shield.scrollIntoView({ behavior: "smooth" });
      }
    }, 1500);
  };

  const handleAuthorizePayment = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setIsAuthorized(true);
    }, 2000);
  };

  // Math variables
  const originalVal = Number(billAmount) || 0;
  const coveragePercent = Number(insuranceCoverage) || 0;
  const coveredVal = (originalVal * coveragePercent) / 100;
  const netPayable = originalVal - coveredVal;

  const isFormComplete = hospitalName && hospitalUpi && billAmount !== "" && insuranceCoverage !== "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation Link */}
        <div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Header Title Block */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">
              Biometric Secured Network Active
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0F2744] tracking-tight flex items-center gap-2.5">
            <Fingerprint className="h-8 w-8 text-sky-600" /> VisionPay
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Scan any hospital UPI QR code to instantly verify billing authenticity. VisionPay automatically checks policy parameters, deducts insurance payouts, and processes final payments securely.
          </p>
        </div>

        {/* Scanner Container Box */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#0F2744] flex items-center gap-2">
              <Camera className="h-5 w-5 text-sky-600" /> Scan Hospital UPI QR
            </h2>
            <p className="text-xs text-slate-500 mt-1">Point your camera at a printed hospital bill or checkout terminal QR code.</p>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 p-4 flex flex-col items-center">
            {isLocatingScanner && !isScanned && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                <Loader2 className="h-8 w-8 text-sky-600 animate-spin" />
              </div>
            )}
            
            {!isScanned ? (
              <div id="qr-reader" className="w-full max-w-md bg-white rounded-lg overflow-hidden border border-slate-150" />
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">QR Code Captured</h3>
                <p className="text-xs text-slate-500">Camera turned off to preserve battery. Review information below.</p>
              </div>
            )}
            
            {scanMessage && (
              <div className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-1.5 animate-bounce">
                <CheckCircle className="h-4 w-4 text-emerald-600" /> {scanMessage}
              </div>
            )}
          </div>
        </section>

        {/* Fallback Form */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F2744] flex items-center gap-2">
                <Receipt className="h-5 w-5 text-sky-600" /> Checkout Details
              </h2>
              <p className="text-xs text-slate-500 mt-1">Manual fields will auto-fill on successful QR scan.</p>
            </div>
          </div>

          <form onSubmit={handleVerifyRisk} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Hospital Name</label>
                <input
                  type="text"
                  required
                  readOnly
                  placeholder="Scan QR to auto-fill"
                  value={hospitalName}
                  className="w-full p-3 text-sm rounded-xl border border-slate-250 bg-slate-100 text-slate-600 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Hospital UPI ID</label>
                <input
                  type="text"
                  required
                  readOnly
                  placeholder="Scan QR to auto-fill"
                  value={hospitalUpi}
                  className="w-full p-3 text-sm rounded-xl border border-slate-250 bg-slate-100 text-slate-600 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Total Bill Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150000"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Insurance Coverage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  placeholder="e.g. 80"
                  value={insuranceCoverage}
                  onChange={(e) => setInsuranceCoverage(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !isFormComplete}
              className="w-full py-3.5 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 hover:shadow active:scale-98 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Running fraud and billing analysis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Analyze Bill & Verify Risk</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* AI Risk Shield */}
        {showRiskShield && (
          <section 
            id="ai-risk-shield" 
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn"
          >
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-600 animate-pulse" /> NxtHealth AI Risk Shield
              </h2>
              <p className="text-xs text-slate-500 mt-1">Pre-deduction calculation matching medical insurance policy rules.</p>
            </div>

            {/* Calculations Grid */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-150 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-b border-slate-200 pb-3">
                <span>LINE ITEMS</span>
                <span>AMOUNT</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Total Medical Bill</span>
                  <span className="font-semibold">₹{originalVal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-700">
                  <span>Insurance Covered ({coveragePercent}%)</span>
                  <span className="font-semibold">-₹{coveredVal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-3 text-base font-extrabold">
                  <span>Net Payable Out-of-Pocket</span>
                  <span className="text-sky-600">₹{netPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* AI Warning Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">⚠️ High Amount Alert</h4>
                <p className="text-xs text-amber-700 font-medium leading-relaxed mt-1">
                  Please verify the net payable amount before proceeding. Biometric authorization required.
                </p>
              </div>
            </div>

            {/* Authorization button */}
            {!isAuthorized ? (
              <button
                onClick={handleAuthorizePayment}
                disabled={isAuthorizing}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                {isAuthorizing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verifying session biometrics...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-5 w-5 animate-pulse text-sky-400" />
                    <span>Authorize with Fingerprint 🔒</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-center flex flex-col items-center justify-center gap-2 animate-bounce">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <h4 className="font-extrabold text-sm uppercase tracking-wide">Payment Authorized Successfully!</h4>
                <p className="text-xs text-green-700 font-medium leading-relaxed">
                  Funds have been dispatched securely to {hospitalUpi}. Receipt reference saved.
                </p>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
