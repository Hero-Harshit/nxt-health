'use client';
import React, { useState, useEffect } from 'react';
import { Smartphone, QrCode, Navigation, X, Download, ShieldAlert } from 'lucide-react';

const STORAGE_KEY = 'nxthealth_dismiss_install_prompt';

export default function InstallAppModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Check if user previously clicked "Don't remind me again"
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    if (isDismissed === 'true') return;

    // 2. Listen for native browser PWA install event (Android / Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsOpen(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    // 3. Fallback: Show modal after 2.5s delay if not dismissed (for desktop/iOS testing)
    const timer = setTimeout(() => {
      if (!isDismissed) setIsOpen(true);
    }, 2500);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  // Handle "Install NxtHealth" Click
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User installed NxtHealth PWA');
      }
      setDeferredPrompt(null);
    } else {
      alert('To install NxtHealth on mobile: Open browser settings (⋮) and tap "Add to Home Screen" / "Install App".');
    }
    setIsOpen(false);
  };

  // Handle "Don't Remind Me Again"
  const handleDontRemindAgain = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  // Handle Close (X) - Just closes for current session
  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Top Right Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Mobile App Icon Badge */}
        <div className="w-14 h-14 mx-auto mb-4 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Smartphone className="w-7 h-7" />
        </div>
        {/* Title & Headline */}
        <div className="text-center mb-5">
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Get NxtHealth Mobile App
          </h3>
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mt-1">
            Recommended for Full Functionality
          </p>
        </div>
        {/* Reason Explanations (VisionPay & SOS) */}
        <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          
          {/* SOS GPS Reason */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl shrink-0 mt-0.5">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Emergency SOS Requires GPS</h4>
              <p className="text-[11px] text-gray-600 leading-snug">
                Laptops lack hardware GPS sensors needed to dispatch instant precise location coordinates during emergencies.
              </p>
            </div>
          </div>
          {/* VisionPay Reason */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shrink-0 mt-0.5">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">VisionPay & Camera QR Scanning</h4>
              <p className="text-[11px] text-gray-600 leading-snug">
                Mobile camera scanning and direct integration with UPI payment apps require a phone device.
              </p>
            </div>
          </div>
        </div>
        {/* Bottom Action Buttons */}
        <div className="space-y-2.5 text-center">
          {/* 1. Primary Action: Install NxtHealth */}
          <button
            onClick={handleInstallClick}
            className="w-full py-3 px-5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install NxtHealth App</span>
          </button>
          {/* 2. Secondary Action: Don't Remind Me Again */}
          <button
            onClick={handleDontRemindAgain}
            className="w-full py-2 px-4 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            Don’t remind me again
          </button>
        </div>
      </div>
    </div>
  );
}
