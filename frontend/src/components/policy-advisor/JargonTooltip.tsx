"use client";

import React, { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

interface JargonTooltipProps {
  term: string;
  customDefinition?: string;
}

const JARGON_DICT: Record<string, string> = {
  "co-pay": "The fixed percentage of the medical bill you pay out of pocket, while the insurance company pays the rest. E.g., a 10% co-pay on a ₹10,000 bill means you pay ₹1,000.",
  "co-payment": "The fixed percentage of the medical bill you pay out of pocket, while the insurance company pays the rest. E.g., a 10% co-pay on a ₹10,000 bill means you pay ₹1,000.",
  "copay": "The fixed percentage of the medical bill you pay out of pocket, while the insurance company pays the rest. E.g., a 10% co-pay on a ₹10,000 bill means you pay ₹1,000.",
  "copayment": "The fixed percentage of the medical bill you pay out of pocket, while the insurance company pays the rest. E.g., a 10% co-pay on a ₹10,000 bill means you pay ₹1,000.",
  "ped waiting period": "The time (usually 1 to 4 years) you must wait before the insurance company covers illness/conditions you had prior to buying the policy.",
  "waiting period": "The time (usually 1 to 4 years) you must wait before the insurance company covers illness/conditions you had prior to buying the policy.",
  "room rent cap": "The maximum daily hospital room charge covered by the policy. Exceeding this limit often reduces coverage for associated doctor fees and nursing charges.",
  "room rent capping": "The maximum daily hospital room charge covered by the policy. Exceeding this limit often reduces coverage for associated doctor fees and nursing charges.",
  "restoration benefit": "Automatically refills your total coverage sum if you exhaust your insurance limit during a policy year due to hospitalization.",
  "restoration": "Automatically refills your total coverage sum if you exhaust your insurance limit during a policy year due to hospitalization.",
  "no claim bonus": "A reward (usually an increased sum insured at no extra cost) given for every year you don't file an insurance claim.",
  "ncb": "A reward (usually an increased sum insured at no extra cost) given for every year you don't file an insurance claim.",
  "sub-limit": "A specific cap on how much the insurer will pay for a particular surgery, treatment, or hospital charge (e.g., Cataract surgery capped at ₹30,000).",
  "sub-limits": "A specific cap on how much the insurer will pay for a particular surgery, treatment, or hospital charge (e.g., Cataract surgery capped at ₹30,000).",
  "sublimit": "A specific cap on how much the insurer will pay for a particular surgery, treatment, or hospital charge (e.g., Cataract surgery capped at ₹30,000).",
  "sublimits": "A specific cap on how much the insurer will pay for a particular surgery, treatment, or hospital charge (e.g., Cataract surgery capped at ₹30,000).",
  "cashless hospitalization": "Treatment at a network hospital where the insurance company settles the bill directly, requiring no upfront payment from you.",
  "cashless": "Treatment at a network hospital where the insurance company settles the bill directly, requiring no upfront payment from you.",
  "daycare procedure": "Surgeries or medical treatments (like cataract or chemotherapy) that take less than 24 hours of hospitalization due to advanced medical technology.",
  "daycare procedures": "Surgeries or medical treatments (like cataract or chemotherapy) that take less than 24 hours of hospitalization due to advanced medical technology."
};

export default function JargonTooltip({ term, customDefinition }: JargonTooltipProps) {
  const [show, setShow] = useState<boolean>(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const lowerTerm = term.toLowerCase();
  const definition = customDefinition || JARGON_DICT[lowerTerm] || "Insurance policy definition.";

  // Handle tap-outside on mobile to close the tooltip
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show]);

  return (
    <span 
      ref={containerRef}
      className="relative inline-flex items-center gap-0.5 group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="border-b border-dashed border-slate-400 hover:border-sky-600 hover:text-sky-700 cursor-help transition-colors font-medium">
        {term}
      </span>
      <HelpCircle className="h-3 w-3 text-slate-400 hover:text-sky-600 cursor-help transition-colors" />

      {/* Tooltip Overlay */}
      {show && (
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3.5 bg-[#0F2744] text-white text-xs rounded-xl shadow-lg z-50 animate-fadeIn pointer-events-none">
          {/* Header */}
          <span className="font-bold text-sky-300 block mb-1 uppercase tracking-wider text-[10px]">
            {term} Explained
          </span>
          {/* Definition */}
          <span className="leading-relaxed block font-medium">
            {definition}
          </span>
          {/* Small Arrow down using pure Tailwind border styles */}
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 border-t-[6px] border-x-[6px] border-b-0 border-solid border-t-[#0F2744] border-x-transparent h-0 w-0" />
        </span>
      )}
    </span>
  );
}

// Utility to parse a string block and replace matching jargon keywords with JargonTooltips
export function parseJargon(text: string): React.ReactNode {
  if (!text) return text;

  // Sort keywords descending by length to ensure longer terms like "PED Waiting Period" match before "PED"
  const sortedKeywords = Object.keys(JARGON_DICT).sort((a, b) => b.length - a.length);

  // Build regex matching the keywords on word boundaries
  const pattern = new RegExp(`\\b(${sortedKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");

  const parts = text.split(pattern);
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part: string, index: number) => {
        const lowerPart = part.toLowerCase();
        if (JARGON_DICT[lowerPart] !== undefined) {
          return <JargonTooltip key={index} term={part} />;
        }
        return part;
      })}
    </>
  );
}
