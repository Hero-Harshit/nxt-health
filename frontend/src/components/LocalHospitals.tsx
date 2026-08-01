"use client";

import React, { useState, useEffect, useRef } from "react";
import { Hospital, Phone, MapPin, Loader2 } from "lucide-react";

interface HospitalItem {
  hospitalName: string;
  area: string;
  emergencyNumber: string;
  googleMapsLink: string;
}

const hospitalsData: HospitalItem[] = [
  { "hospitalName": "Apollo Hospitals", "area": "Jubilee Hills, Hyderabad", "emergencyNumber": "+91 40 6907 1200", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Apollo+Hospitals+Jubilee+Hills+Hyderabad" },
  { "hospitalName": "CARE Hospitals", "area": "Banjara Hills, Hyderabad", "emergencyNumber": "+91 40 6810 6589", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=CARE+Hospitals+Banjara+Hills+Hyderabad" },
  { "hospitalName": "KIMS Hospitals", "area": "Begumpet, Hyderabad", "emergencyNumber": "+91 40 4488 5000", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=KIMS+Hospitals+Begumpet+Hyderabad" },
  { "hospitalName": "Yashoda Hospitals", "area": "Secunderabad, Hyderabad", "emergencyNumber": "+91 40 4567 4567", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Yashoda+Hospitals+Secunderabad+Hyderabad" },
  { "hospitalName": "AIG Hospitals", "area": "Gachibowli, Hyderabad", "emergencyNumber": "+91 40 4244 4222", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=AIG+Hospitals+Gachibowli+Hyderabad" },
  { "hospitalName": "Continental Hospitals", "area": "Gachibowli, Hyderabad", "emergencyNumber": "+91 40 6700 0000", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Continental+Hospitals+Gachibowli+Hyderabad" },
  { "hospitalName": "Medicover Hospitals", "area": "HITEC City, Hyderabad", "emergencyNumber": "+91 40 6833 4455", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Medicover+Hospitals+HITEC+City+Hyderabad" },
  { "hospitalName": "Sunshine Hospitals", "area": "Paradise, Secunderabad", "emergencyNumber": "+91 40 4455 0000", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Sunshine+Hospitals+Paradise+Secunderabad" },
  { "hospitalName": "Citizens Specialty Hospital", "area": "Nallagandla, Hyderabad", "emergencyNumber": "+91 40 6719 1919", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Citizens+Specialty+Hospital+Nallagandla+Hyderabad" },
  { "hospitalName": "Kamineni Hospitals", "area": "L.B. Nagar, Hyderabad", "emergencyNumber": "+91 70362 70362", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Kamineni+Hospitals+LB+Nagar+Hyderabad" },
  { "hospitalName": "Gleneagles AWARE Hospital", "area": "L.B. Nagar, Hyderabad", "emergencyNumber": "+91 92402 61112", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Gleneagles+AWARE+Hospital+LB+Nagar+Hyderabad" },
  { "hospitalName": "OMNI Hospitals", "area": "Kukatpally, Hyderabad", "emergencyNumber": "+91 88801 01000", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=OMNI+Hospitals+Kukatpally+Hyderabad" },
  { "hospitalName": "Owaisi Hospital", "area": "Kanchanbagh, Hyderabad", "emergencyNumber": "+91 40243 42222", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Owaisi+Hospital+Kanchanbagh+Hyderabad" },
  { "hospitalName": "Princess Esra Hospital", "area": "Charminar, Hyderabad", "emergencyNumber": "+91 40245 28911", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Princess+Esra+Hospital+Charminar+Hyderabad" },
  { "hospitalName": "Osmania General Hospital", "area": "Afzal Gunj, Hyderabad", "emergencyNumber": "+91 40246 00190", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Osmania+General+Hospital+Afzal+Gunj+Hyderabad" },
  { "hospitalName": "Government General Hospital", "area": "King Koti, Hyderabad", "emergencyNumber": "--", "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Government+General+Hospital+King+Koti+Hyderabad" }
];

export default function LocalHospitals() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
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

  useEffect(() => {
    if (isOpen) {
      setIsLocating(true);
      const timer = setTimeout(() => {
        setIsLocating(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 focus:outline-none transition-colors cursor-pointer select-none"
      >
        <Hospital className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Hospitals</span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 max-w-sm mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {isLocating ? (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Fetching your location and recommending nearby hospitals...
              </p>
            </div>
          ) : (
            <>
              {/* Sticky Location Header */}
              <div className="p-3 border-b border-emerald-100 bg-emerald-50 rounded-t-xl sticky top-0 z-10">
                <h3 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  📍 Location identified: Hyderabad
                </h3>
              </div>
              <div className="divide-y divide-slate-150">
                {hospitalsData.map((hospital, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center gap-4">
                    {/* Left side: Hospital name and Area */}
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-tight">
                        {hospital.hospitalName}
                      </h4>
                      <p className="mt-0.5 text-[10px] sm:text-xs text-gray-500 leading-normal">
                        {hospital.area}
                      </p>
                    </div>

                    {/* Right side: Actions */}
                    <div className="flex items-center gap-2">
                      {hospital.emergencyNumber !== "--" && (
                        <a
                          href={`tel:${hospital.emergencyNumber}`}
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-100 transition-colors"
                          title="Call Emergency"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <a
                        href={hospital.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-colors"
                        title="View on Google Maps"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
