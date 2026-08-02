'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient";
import {
  Scan,
  Upload,
  Camera,
  Sparkles,
  ArrowLeft,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

export default function ScanAnythingPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample quick-fill data for demo purposes
  const handleQuickFill = (sampleType: string) => {
    if (sampleType === 'prescription') {
      setSelectedImage('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80');
      setUserPrompt('Explain the medicines listed in this prescription, their dosages, and what precautions I should take.');
    } else if (sampleType === 'lab') {
      setSelectedImage('https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80');
      setUserPrompt('Summarize key abnormal values in this lab report and explain them in plain English.');
    }
  };

  // File Change Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to extract clean base64 data and mime-type
  const prepareImageData = (dataUrl: string) => {
    if (dataUrl.startsWith('data:')) {
      const [header, base64] = dataUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
      return { base64, mimeType };
    }
    return { base64: dataUrl, mimeType: 'image/jpeg' };
  };

  // Live Asynchronous Scan Submit
  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    setIsScanning(true);
    setAnalysisResult(null);

    // Setup 45s AbortController timeout to account for Render cold starts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const { base64, mimeType } = prepareImageData(selectedImage);

      // Construct payload based on Medical Term Explainer pattern
      const payload = {
        image: base64,
        mimeType: mimeType,
        prompt: userPrompt.trim() || 'Analyze this medical document in detail. Identify prescribed medicines, dosages, diagnostic test values, and provide a plain-English explanation with key precautions.',
      };

      // Retrieve backend URL from existing env/config
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, "");
      const fullUrl = `${backendUrl}/api/scan-ocr`;
      const { data: { session } } = await supabase.auth.getSession();

      console.log("Fetching from:", fullUrl, payload);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("HTTP Error Status:", response.status);
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      // Map response key matching your backend return key (e.g., data.result or data.explanation)
      const outputText = data.result || data.explanation || data.text || JSON.stringify(data, null, 2);
      setAnalysisResult(outputText);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Scan Anything API Error:', error);
      if (error.name === 'AbortError') {
        setAnalysisResult(
          "⚠️ Request Timeout: The scanning server took longer than 45 seconds to respond. This is common if the backend on Render is waking up from a cold start. Please try submitting again."
        );
      } else {
        setAnalysisResult(
          `⚠️ Analysis Unavailable: Failed to communicate with the AI scanning server (Error: ${error.message || error}). The server may be waking up from a cold start on Render. Please verify your connection and try again.`
        );
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleClearAll = () => {
    setSelectedImage(null);
    setUserPrompt('');
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          {/* Banner Header Card */}
          <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-indigo-50/90 rounded-3xl border border-blue-100 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {/* Status Pills */}
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-wider">
                  OCR
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Gemini Vision AI</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Scan Anything
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                Upload prescriptions, lab reports, or medical bills to extract, translate, and explain clinical information instantly.
              </p>
            </div>
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Demo Quick-Fill Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-gray-500 mr-1">Demo Samples:</span>
          <button
            type="button"
            onClick={() => handleQuickFill('prescription')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>⚡ Sample Prescription</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('lab')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>⚡ Sample Lab Report</span>
          </button>
        </div>

        {/* Main Input Form & Upload Area */}
        <form onSubmit={handleScanSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Upload Box / Image Preview */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                1. Select or Capture Document Photo
              </label>
              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50/60 rounded-2xl p-8 text-center transition-all cursor-pointer space-y-3 group"
                >
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                      Click to upload image or drag & drop
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      Supports PNG, JPG, WEBP medical document scans
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-2xs">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>Camera</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-2xs">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Gallery</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl border border-blue-100 overflow-hidden bg-slate-900 max-h-80 flex items-center justify-center group">
                  <img
                    src={selectedImage}
                    alt="Uploaded document preview"
                    className="max-h-80 w-auto object-contain"
                  />
                  {/* Animated Scanner Bar when Scanning */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-blue-500/10 pointer-events-none">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#3b82f6] animate-pulse relative top-0" style={{ animation: 'scan 2s infinite linear' }} />
                    </div>
                  )}
                  {/* Top Action Overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Text Prompt Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                2. Specific Question or Prompt (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. What are the dosage instructions? Is there any warning I should know about?"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full p-4 text-xs sm:text-sm font-medium border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between gap-4 pt-2">
              {selectedImage && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <button
                type="submit"
                disabled={!selectedImage || isScanning}
                className={`ml-auto inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer ${
                  !selectedImage || isScanning
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                }`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scanning Document...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    <span>Scan & Analyze Document</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Analysis Result Output Container */}
        {analysisResult && (
          <div className="bg-white rounded-3xl border border-blue-100 p-6 sm:p-8 shadow-sm space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Analysis Complete</span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Powered by Gemini OCR</span>
            </div>
            {/* ✅ Formatted Output without raw asterisks */}
            <FormattedMarkdown content={analysisResult} />
          </div>
        )}
      </div>
    </main>
  );
}

// Helper Component to render raw Gemini Markdown without asterisks
function FormattedMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={idx} className="h-1" />;
        // Render Headers (###)
        if (trimmed.startsWith('###')) {
          const headerText = trimmed.replace(/^###\s*/, '');
          return (
            <h3 key={idx} className="text-sm sm:text-base font-extrabold text-gray-900 pt-2 pb-1 border-b border-gray-100">
              {renderInlineFormatting(headerText)}
            </h3>
          );
        }
        // Render Bullet Points (* or -)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const bulletText = trimmed.replace(/^[\*\-]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-blue-600 font-black shrink-0 mt-0.5">•</span>
              <span>{renderInlineFormatting(bulletText)}</span>
            </div>
          );
        }
        // Regular Paragraphs
        return <p key={idx}>{renderInlineFormatting(trimmed)}</p>;
      })}
    </div>
  );
}

// Helper to parse bold text into strong tags
function renderInlineFormatting(text: string) {
  // Split by ** delimiters for bold text
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-extrabold text-gray-900">
          {boldText}
        </strong>
      );
    }
    return part;
  });
}

