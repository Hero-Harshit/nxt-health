"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone } from "lucide-react";

interface HelplineItem {
  serviceName: string;
  phoneNumber: string;
  description: string;
}

const helplinesData: HelplineItem[] = [
  { "serviceName": "National Emergency Number", "phoneNumber": "112", "description": "All-in-one emergency number for Police, Fire, and Ambulance." },
  { "serviceName": "Women's Helpline", "phoneNumber": "1091", "description": "Domestic abuse and women's safety emergencies." },
  { "serviceName": "Health Helpline / Blood Bank Info", "phoneNumber": "104", "description": "State-run medical advisory line for health information." },
  { "serviceName": "Fire Brigade", "phoneNumber": "101", "description": "Direct line to report fires and fire-related emergencies." },
  { "serviceName": "Ambulance", "phoneNumber": "102", "description": "Free ambulance service for medical emergencies." },
  { "serviceName": "Emergency Medical Response", "phoneNumber": "108", "description": "State-run emergency response for accidents, trauma." },
  { "serviceName": "National Poison Information Centre", "phoneNumber": "1066", "description": "Guidance on poisoning cases and toxic exposure." },
  { "serviceName": "Poison Control (Alternate)", "phoneNumber": "011-26593677", "description": "Backup line for the National Poison Information Centre." },
  { "serviceName": "KIRAN Mental Health Helpline", "phoneNumber": "1800-599-0019", "description": "24/7 toll-free mental health support." },
  { "serviceName": "AIDS Helpline", "phoneNumber": "1097", "description": "Information, counseling, and support related to HIV/AIDS." },
  { "serviceName": "COVID-19 Helpline", "phoneNumber": "1075", "description": "National helpline for COVID-19 related queries." },
  { "serviceName": "Tuberculosis (TB) Helpline", "phoneNumber": "1800-11-6666", "description": "Support related to TB diagnosis and treatment." },
  { "serviceName": "Organ Donation (NOTTO)", "phoneNumber": "1800-11-4770", "description": "Helpline for organ donation queries." },
  { "serviceName": "Air Ambulance", "phoneNumber": "9540161344", "description": "Emergency air transport for critical medical cases." },
  { "serviceName": "Senior Citizen Helpline", "phoneNumber": "14567", "description": "Support line for elderly citizens." },
  { "serviceName": "Domestic Abuse Helpline", "phoneNumber": "181", "description": "24/7 support for women facing domestic violence." },
  { "serviceName": "LPG Gas Leak Helpline", "phoneNumber": "1906", "description": "Report gas leaks to prevent fire hazards." },
  { "serviceName": "Disaster Management (NDMA)", "phoneNumber": "1078", "description": "National Disaster Management Authority helpline." },
  { "serviceName": "Road Accident Emergency", "phoneNumber": "1073", "description": "Assistance for road accident victims on highways." },
  { "serviceName": "Railway Helpline (RPF)", "phoneNumber": "1512", "description": "Security and medical assistance on trains." }
];

export default function EmergencyHelplines() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 focus:outline-none transition-colors cursor-pointer select-none"
      >
        <Phone className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Helplines</span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 max-w-sm mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-t-xl sticky top-0 z-10">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              🚨 Emergency Helplines
            </h3>
          </div>
          <div className="divide-y divide-slate-150">
            {helplinesData.map((helpline, idx) => (
              <a
                key={idx}
                href={`tel:${helpline.phoneNumber}`}
                className="block p-4 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex justify-between items-start gap-3">
                  <span className="font-bold text-slate-800 text-xs sm:text-sm leading-tight">
                    {helpline.serviceName}
                  </span>
                  <span className="font-extrabold text-red-600 text-xs sm:text-sm whitespace-nowrap bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                    {helpline.phoneNumber}
                  </span>
                </div>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-500 leading-normal">
                  {helpline.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
