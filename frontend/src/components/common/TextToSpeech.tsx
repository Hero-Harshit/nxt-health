"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

interface TextToSpeechProps {
  text: string;
}

// Utility to clean markdown formatting so the speech engine reads natural text
function stripMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/#{1,6}\s+/g, "") // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
    .replace(/\*([^*]+)\*/g, "$1") // Remove italic
    .replace(/__([^_]+)__/g, "$1") // Remove bold
    .replace(/_([^_]+)_/g, "$1") // Remove italic
    .replace(/`([^`]+)`/g, "$1") // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to plain text
    .replace(/^[*-]\s+/gm, "") // Remove bullet points
    .replace(/^\d+\.\s+/gm, "") // Remove numbered lists
    .trim();
}

export function TextToSpeech({ text }: TextToSpeechProps) {
  const [supported, setSupported] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  const handleSpeak = () => {
    if (typeof window === "undefined") return;

    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    const cleanText = stripMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Natural, slightly slower pacing for clarity
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handlePauseToggle = () => {
    if (typeof window === "undefined") return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isSpeaking ? (
        <>
          {/* Main Stop Button */}
          <button
            type="button"
            onClick={handleStop}
            className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm animate-pulse rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <VolumeX className="w-3.5 h-3.5 text-white" />
            <span>Stop</span>
          </button>

          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={handlePauseToggle}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-full px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 text-slate-700 fill-slate-700" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-slate-700 fill-slate-700" />
                <span>Pause</span>
              </>
            )}
          </button>
        </>
      ) : (
        /* Idle Listen Button */
        <button
          type="button"
          onClick={handleSpeak}
          className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5 text-sky-600" />
          <span>Listen</span>
        </button>
      )}
    </div>
  );
}
