"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert, CheckCircle, Fingerprint, Loader2, Sparkles, Receipt, ShieldCheck, Camera } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { startRegistration } from "@simplewebauthn/browser";

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
  const [upiLink, setUpiLink] = useState<string | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize html5-qrcode scanner automatically on load
    if (isScanned) return;

    const qrRegionId = "qr-reader";
    const scanner = new Html5QrcodeScanner(
      qrRegionId,
      { fps: 10, qrbox: { width: 200, height: 200 }, rememberLastUsedCamera: true },
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
        scannerRef.current.clear().catch((err) => console.error("Failed to clear scanner on unmount:", err));
      }
    };
  }, [isScanned]);

  const handleScanSuccess = (decodedText: string) => {
    try {
      console.log("📸 [QR SCANNED]:", decodedText);
      setScanMessage("QR Code Scanned Successfully!");
      setIsScanned(true);

      // Stop and clear the scanner/camera immediately to unmount and stop tracks
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

  const handleAuthorizePayment = async () => {
    setIsAuthorizing(true);
    try {
      const email = "user@nxthealth.com";

      // Step A: Fetch Options
      let options;
      try {
        const optionsRes = await fetch("/api/webauthn/register-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!optionsRes.ok) {
          throw new Error(`Server returned status ${optionsRes.status}`);
        }
        options = await optionsRes.json();
      } catch (err: any) {
        console.error("Failed to fetch biometric challenge:", err);
        alert("Failed to fetch biometric challenge: " + err.message);
        throw err;
      }

      // Step B: Trigger OS Hardware via startRegistration
      let credential;
      try {
        credential = await startRegistration(options);
      } catch (err: any) {
        console.error("Hardware auth blocked:", err);
        alert("Hardware auth blocked: " + err.message);
        throw err;
      }

      // Step C: Verify on Backend
      let verifyResult;
      try {
        const verifyRes = await fetch("/api/webauthn/register-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, credential }),
        });
        if (!verifyRes.ok) {
          throw new Error(`Server returned status ${verifyRes.status}`);
        }
        verifyResult = await verifyRes.json();
      } catch (err: any) {
        console.error("Backend verification failed:", err);
        alert("Backend verification failed: " + err.message);
        throw err;
      }

      if (verifyResult.verified) {
        // Step D: Generate the Final Payment Link
        const linkRes = await fetch("/api/payment/generate-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            billAmount: Number(billAmount) || 0,
            insuranceCoverage: Number(insuranceCoverage) || 0,
            payeeUPI: hospitalUpi,
            hospitalName: hospitalName,
          }),
        });

        if (!linkRes.ok) {
          throw new Error("Failed to generate payment deep link.");
        }

        const linkData = await linkRes.json();
        setUpiLink(linkData.upiLink);
        setIsAuthorized(true);
      } else {
        alert("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Biometric Authentication Flow Stopped:", err);
    } finally {
      setIsAuthorizing(false);
    }
  };

  // Math variables
  const originalVal = Number(billAmount) || 0;
  const coveragePercent = Number(insuranceCoverage) || 0;
  const coveredVal = (originalVal * coveragePercent) / 100;
  const netPayable = originalVal - coveredVal;

  const isFormComplete = hospitalName && hospitalUpi && billAmount !== "" && insuranceCoverage !== "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      {/* Global CSS overrides for the html5-qrcode renderer */}
      <style>{`
        #qr-reader {
          border: none !important;
          background: transparent !important;
        }
        #qr-reader img {
          display: none !important;
        }
        #qr-reader__header_message {
          display: none !important;
        }
        #qr-reader__status_span {
          display: none !important;
        }
        #qr-reader button {
          background-color: #0284c7 !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          font-size: 12px !important;
          font-weight: bold !important;
          cursor: pointer !important;
          margin-top: 8px !important;
          transition: all 0.2s !important;
        }
        #qr-reader button:hover {
          background-color: #0369a1 !important;
        }
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
      `}</style>

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
              <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-black">
                {/* HTML5 QR Code target */}
                <div id="qr-reader" className="w-full h-full object-cover" />
                
                {/* Google Lens Scan Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Subtle dark tint outside the scanning zone */}
                  <div className="absolute inset-0 border-[40px] border-black/45" />
                  
                  {/* Center Scanning Frame */}
                  <div className="w-[180px] h-[180px] border-2 border-white/80 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]">
                    {/* Corner brackets */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-md" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-md" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-md" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-md" />
                    
                    {/* Pulse Line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>
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
              <div className="space-y-4">
                <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center flex flex-col items-center justify-center gap-2 shadow-sm animate-fadeIn">
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h4 className="font-extrabold text-lg uppercase tracking-wide text-emerald-950">
                    Biometrics Verified & Payment Secured
                  </h4>
                  <p className="text-xs text-emerald-700 font-medium leading-relaxed max-w-md">
                    Secure handshake successful. The billing signature matches Apollo Hospitals verification keys. You can now execute the final dispatch.
                  </p>
                </div>

                {upiLink && (
                  <a
                    href={upiLink}
                    className="block w-full text-center py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
                  >
                    Pay ₹{netPayable.toLocaleString()} via UPI ⚡
                  </a>
                )}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
