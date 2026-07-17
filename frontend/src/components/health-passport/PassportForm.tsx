"use client";

import React, { useState } from "react";
import { HealthPassportData, Medication } from "@/types/passport";
import { Plus, Trash2, ShieldAlert, Heart, User, Shield } from "lucide-react";

interface PassportFormProps {
  data: HealthPassportData;
  onChange: (newData: HealthPassportData) => void;
}

export default function PassportForm({ data, onChange }: PassportFormProps) {
  const [allergyInput, setAllergyInput] = useState<string>("");
  const [conditionInput, setConditionInput] = useState<string>("");

  const updateField = <K extends keyof HealthPassportData>(field: K, value: HealthPassportData[K]) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (allergyInput.trim() && !data.allergies.includes(allergyInput.trim())) {
      updateField("allergies", [...data.allergies, allergyInput.trim()]);
      setAllergyInput("");
    }
  };

  const handleRemoveAllergy = (index: number) => {
    updateField("allergies", data.allergies.filter((_, idx) => idx !== index));
  };

  const handleAddCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (conditionInput.trim() && !data.chronicConditions.includes(conditionInput.trim())) {
      updateField("chronicConditions", [...data.chronicConditions, conditionInput.trim()]);
      setConditionInput("");
    }
  };

  const handleRemoveCondition = (index: number) => {
    updateField("chronicConditions", data.chronicConditions.filter((_, idx) => idx !== index));
  };

  const handleAddMedication = () => {
    const newMed: Medication = { name: "", dosage: "", frequency: "" };
    updateField("activeMedications", [...data.activeMedications, newMed]);
  };

  const handleUpdateMedication = (index: number, field: keyof Medication, value: string) => {
    const updatedMeds = data.activeMedications.map((med, idx) => {
      if (idx === index) {
        return { ...med, [field]: value };
      }
      return med;
    });
    updateField("activeMedications", updatedMeds);
  };

  const handleRemoveMedication = (index: number) => {
    updateField("activeMedications", data.activeMedications.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: Basic Vitals & Emergency Contact */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F2744] flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <User className="h-4.5 w-4.5 text-sky-600" />
          Basic Vitals & Emergency Contact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={data.dob}
              onChange={(e) => updateField("dob", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
            <select
              value={data.bloodGroup}
              onChange={(e) => updateField("bloodGroup", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
            <input
              type="text"
              value={data.gender}
              onChange={(e) => updateField("gender", e.target.value)}
              placeholder="e.g. Male, Female, Non-binary"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-3">
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Emergency Contact</span>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
              <input
                type="text"
                value={data.emergencyContactName}
                onChange={(e) => updateField("emergencyContactName", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relation</label>
              <input
                type="text"
                value={data.emergencyContactRelation}
                onChange={(e) => updateField("emergencyContactRelation", e.target.value)}
                placeholder="e.g. Spouse, Parent"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={data.emergencyContactPhone}
                onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Critical Clinical Flags */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F2744] flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <ShieldAlert className="h-4.5 w-4.5 text-rose-600" />
          Critical Clinical Flags
        </h3>

        {/* Allergies tag editor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Allergies</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. Penicillin, Peanuts"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
            />
            <button
              type="button"
              onClick={handleAddAllergy}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-3.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {data.allergies.length === 0 ? (
              <span className="text-[10px] text-slate-400 font-semibold italic">No allergies listed</span>
            ) : (
              data.allergies.map((allergy, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-2 py-0.5 rounded-full"
                >
                  {allergy}
                  <button 
                    type="button"
                    onClick={() => handleRemoveAllergy(idx)}
                    className="hover:text-red-950 font-bold focus:outline-none cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Chronic Conditions tag editor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Chronic Conditions</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. Type 2 Diabetes, Asthma"
              value={conditionInput}
              onChange={(e) => setConditionInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
            />
            <button
              type="button"
              onClick={handleAddCondition}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-3.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {data.chronicConditions.length === 0 ? (
              <span className="text-[10px] text-slate-400 font-semibold italic">No chronic conditions listed</span>
            ) : (
              data.chronicConditions.map((condition, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2 py-0.5 rounded-full"
                >
                  {condition}
                  <button 
                    type="button"
                    onClick={() => handleRemoveCondition(idx)}
                    className="hover:text-amber-950 font-bold focus:outline-none cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Past Surgeries & Major Records</label>
          <textarea
            rows={2}
            value={data.pastSurgeries}
            onChange={(e) => updateField("pastSurgeries", e.target.value)}
            placeholder="e.g. Appendectomy (2018), Knee Arthroscopy (2021)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
          />
        </div>
      </div>

      {/* SECTION 3: Active Medication Regimen */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-2">
          <h3 className="text-sm font-bold text-[#0F2744] flex items-center gap-2">
            <Heart className="h-4.5 w-4.5 text-sky-600" />
            Active Medication Regimen
          </h3>
          <button
            type="button"
            onClick={handleAddMedication}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Row
          </button>
        </div>

        {data.activeMedications.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-semibold italic">
            No active medications listed. Click Add Row to add details.
          </div>
        ) : (
          <div className="space-y-3">
            {data.activeMedications.map((med, index) => (
              <div key={index} className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Med Name (e.g. Metformin)"
                    value={med.name}
                    onChange={(e) => handleUpdateMedication(index, "name", e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:border-sky-600 focus:outline-none focus:ring-1"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 500mg)"
                    value={med.dosage}
                    onChange={(e) => handleUpdateMedication(index, "dosage", e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:border-sky-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Frequency (e.g. 1x daily)"
                    value={med.frequency}
                    onChange={(e) => handleUpdateMedication(index, "frequency", e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:border-sky-600 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedication(index)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove medication"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: Care Team & Insurance */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F2744] flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <Shield className="h-4.5 w-4.5 text-sky-600" />
          Care Team & Insurance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Doctor Name</label>
            <input
              type="text"
              value={data.primaryDoctorName}
              onChange={(e) => updateField("primaryDoctorName", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Phone</label>
            <input
              type="tel"
              value={data.primaryDoctorPhone}
              onChange={(e) => updateField("primaryDoctorPhone", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Insurance Provider</label>
            <input
              type="text"
              value={data.insuranceProvider}
              onChange={(e) => updateField("insuranceProvider", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Policy Number</label>
            <input
              type="text"
              value={data.insurancePolicyNum}
              onChange={(e) => updateField("insurancePolicyNum", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
