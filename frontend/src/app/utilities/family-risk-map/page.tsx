'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================
// Types
// ============================================================
type RelationKey = 'grandfather' | 'grandmother' | 'father' | 'mother';

interface MemberInfo {
  key: RelationKey;
  label: string;
  icon: string;
  weight: number; // closeness weight — parents count more than grandparents
}

type RiskTierName = 'Low' | 'Moderate' | 'Medium' | 'High';

interface RiskTier {
  label: RiskTierName;
  color: string;
  light: string;
  dot: string;
}

const STORAGE_KEY = 'nxthealth_family_health_map';

// ============================================================
// Design tokens — matched to NxtHealth's existing UI
// ============================================================
const NAVY = '#0B1E3D';
const BLUE = '#2F6FED';
const BLUE_LIGHT = '#EAF2FE';
const GREEN = '#1FAA59';
const GREEN_LIGHT = '#E5F7EC';
const AMBER = '#D6A017';
const AMBER_LIGHT = '#FCF3D9';
const ORANGE = '#E0742A';
const ORANGE_LIGHT = '#FBE7DA';
const RED = '#D6483F';
const RED_LIGHT = '#FBE3E1';

const TIERS: Record<RiskTierName, RiskTier> = {
  Low: { label: 'Low', color: GREEN, light: GREEN_LIGHT, dot: '🟢' },
  Moderate: { label: 'Moderate', color: AMBER, light: AMBER_LIGHT, dot: '🟡' },
  Medium: { label: 'Medium', color: ORANGE, light: ORANGE_LIGHT, dot: '🟠' },
  High: { label: 'High', color: RED, light: RED_LIGHT, dot: '🔴' },
};

function getTier(score: number): RiskTier {
  if (score === 0) return TIERS.Low;
  if (score === 1) return TIERS.Moderate;
  if (score === 2) return TIERS.Medium;
  return TIERS.High;
}

// ============================================================
// Family tree structure
// ============================================================
const MEMBERS: MemberInfo[] = [
  { key: 'grandfather', label: 'Grandfather', icon: '👴', weight: 1 },
  { key: 'grandmother', label: 'Grandmother', icon: '👵', weight: 1 },
  { key: 'father', label: 'Father', icon: '👨', weight: 2 },
  { key: 'mother', label: 'Mother', icon: '👩', weight: 2 },
];

const DISEASES = [
  'Diabetes',
  'Heart Disease',
  'Hypertension',
  'Cancer',
  'Thyroid Disorder',
  'Obesity',
] as const;

type Disease = (typeof DISEASES)[number];

const RECOMMENDATIONS: Record<Disease, string[]> = {
  Diabetes: ['Annual Blood Sugar Test', 'Limit Refined Sugar Intake', 'Maintain Healthy Weight'],
  'Heart Disease': ['Cardiac Checkup Every 2 Years', 'Exercise 150 min/week', 'Monitor Cholesterol'],
  Hypertension: ['Monitor Blood Pressure Regularly', 'Reduce Salt Intake', 'Exercise 150 min/week'],
  Cancer: ['Age-Appropriate Cancer Screenings', 'Avoid Tobacco & Alcohol'],
  'Thyroid Disorder': ['Annual Thyroid Panel (TSH Test)'],
  Obesity: ['Maintain Healthy Weight', 'Balanced Diet', 'Exercise 150 min/week'],
};

type MemberConditions = Record<RelationKey, Disease[]>;

function createEmptyConditions(): MemberConditions {
  return { grandfather: [], grandmother: [], father: [], mother: [] };
}

// ============================================================
// Main Component
// ============================================================
export default function FamilyHealthRiskMap() {
  const [conditions, setConditions] = useState<MemberConditions | null>(null);
  const [activeMember, setActiveMember] = useState<RelationKey | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setConditions(saved ? JSON.parse(saved) : createEmptyConditions());
    } catch {
      setConditions(createEmptyConditions());
    }
  }, []);

  useEffect(() => {
    if (conditions) localStorage.setItem(STORAGE_KEY, JSON.stringify(conditions));
  }, [conditions]);

  const toggleCondition = useCallback((member: RelationKey, disease: Disease) => {
    setConditions((prev) => {
      if (!prev) return prev;
      const current = prev[member];
      const updated = current.includes(disease)
        ? current.filter((d) => d !== disease)
        : [...current, disease];
      return { ...prev, [member]: updated };
    });
  }, []);

  if (!conditions) return null;

  // ---------- Risk calculation ----------
  const riskScores: Record<Disease, number> = DISEASES.reduce((acc, disease) => {
    const score = MEMBERS.reduce((sum, m) => {
      return conditions[m.key].includes(disease) ? sum + m.weight : sum;
    }, 0);
    acc[disease] = score;
    return acc;
  }, {} as Record<Disease, number>);

  const sortedDiseases = [...DISEASES].sort((a, b) => riskScores[b] - riskScores[a]);

  const recommendationSet = new Set<string>();
  DISEASES.forEach((disease) => {
    const tier = getTier(riskScores[disease]);
    if (tier.label !== 'Low') {
      RECOMMENDATIONS[disease].forEach((rec) => recommendationSet.add(rec));
    }
  });
  const recommendations = Array.from(recommendationSet);

  const anyConditionsSet = MEMBERS.some((m) => conditions[m.key].length > 0);

  return (
    <main className="min-h-screen bg-white px-6 py-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-4">
        Home <span className="mx-1.5">/</span> Utilities <span className="mx-1.5">/</span>
        <span className="text-gray-700 font-medium">Family Health Risk Map</span>
      </div>

      {/* Header */}
      <h1
        className="text-4xl font-bold text-gray-900 mb-3"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Family Health Risk Map
      </h1>
      <p className="text-gray-500 max-w-2xl mb-8 leading-relaxed">
        Add health conditions for your close relatives to see a rule-based estimate
        of your hereditary risk — and simple steps to stay ahead of it.
      </p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT: Family Tree */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className="text-xl font-bold text-gray-900"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                Your Family Tree
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Tap a relative to add their known health conditions
              </p>
            </div>
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: BLUE_LIGHT, color: BLUE }}
            >
              ⚡ Auto-Saved
            </span>
          </div>

          {/* Grandparents row */}
          <div className="flex justify-center gap-10">
            <MemberNode
              member={MEMBERS[0]}
              conditions={conditions.grandfather}
              isActive={activeMember === 'grandfather'}
              onClick={() =>
                setActiveMember(activeMember === 'grandfather' ? null : 'grandfather')
              }
            />
            <MemberNode
              member={MEMBERS[1]}
              conditions={conditions.grandmother}
              isActive={activeMember === 'grandmother'}
              onClick={() =>
                setActiveMember(activeMember === 'grandmother' ? null : 'grandmother')
              }
            />
          </div>

          <div className="w-px h-8 bg-gray-200 mx-auto" />

          {/* Parents row */}
          <div className="flex justify-center gap-10">
            <MemberNode
              member={MEMBERS[2]}
              conditions={conditions.father}
              isActive={activeMember === 'father'}
              onClick={() => setActiveMember(activeMember === 'father' ? null : 'father')}
            />
            <MemberNode
              member={MEMBERS[3]}
              conditions={conditions.mother}
              isActive={activeMember === 'mother'}
              onClick={() => setActiveMember(activeMember === 'mother' ? null : 'mother')}
            />
          </div>

          <div className="w-px h-8 bg-gray-200 mx-auto" />

          {/* You */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: NAVY }}
              >
                🧑
              </div>
              <span className="text-sm font-bold text-gray-900">You</span>
            </div>
          </div>

          {activeMember && (
            <ConditionPanel
              member={MEMBERS.find((m) => m.key === activeMember)!}
              selected={conditions[activeMember]}
              onToggle={(disease) => toggleCondition(activeMember, disease)}
              onClose={() => setActiveMember(null)}
            />
          )}
        </div>

        {/* RIGHT: Risk Summary + Recommendations */}
        <div className="flex flex-col gap-6">
          {/* Risk Summary card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: BLUE }}>🧬</span>
              <h3 className="font-bold text-gray-900">Risk Summary</h3>
            </div>

            {!anyConditionsSet ? (
              <p className="text-sm text-gray-400 leading-relaxed">
                Add conditions for at least one relative to see your risk summary.
              </p>
            ) : (
              <div className="space-y-3">
                {sortedDiseases.map((disease) => {
                  const tier = getTier(riskScores[disease]);
                  return (
                    <div key={disease} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {tier.dot} {disease}
                      </span>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: tier.light, color: tier.color }}
                      >
                        {tier.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommendations card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: GREEN }}>✓</span>
              <h3 className="font-bold text-gray-900">Recommendations</h3>
            </div>

            {recommendations.length === 0 ? (
              <p className="text-sm text-gray-400 leading-relaxed">
                {anyConditionsSet
                  ? 'No elevated risks detected yet — keep up preventive care.'
                  : 'Personalized recommendations will appear here once you add family history.'}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {recommendations.map((rec) => (
                  <li key={rec} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: GREEN }}>
                      ✓
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// Member Node — a single clickable tree node
// ============================================================
function MemberNode({
  member,
  conditions,
  isActive,
  onClick,
}: {
  member: MemberInfo;
  conditions: Disease[];
  isActive: boolean;
  onClick: () => void;
}) {
  const hasConditions = conditions.length > 0;

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group text-center cursor-pointer">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all"
        style={{
          borderColor: isActive ? BLUE : hasConditions ? BLUE : '#E5E7EB',
          backgroundColor: isActive ? BLUE_LIGHT : '#FAFAFA',
        }}
      >
        {member.icon}
      </div>
      <span className="text-sm font-bold text-gray-900">{member.label}</span>
      {hasConditions ? (
        <div className="flex flex-wrap justify-center gap-1 max-w-[110px]">
          {conditions.slice(0, 2).map((c) => (
            <span
              key={c}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: BLUE_LIGHT, color: BLUE }}
            >
              {c}
            </span>
          ))}
          {conditions.length > 2 && (
            <span className="text-[10px] font-medium text-gray-400">
              +{conditions.length - 2}
            </span>
          )}
        </div>
      ) : (
        <span className="text-[11px] text-gray-400">Tap to add</span>
      )}
    </button>
  );
}

// ============================================================
// Condition Panel — checkbox list for a selected member
// ============================================================
function ConditionPanel({
  member,
  selected,
  onToggle,
  onClose,
}: {
  member: MemberInfo;
  selected: Disease[];
  onToggle: (disease: Disease) => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{member.icon}</span>
          <h3 className="text-base font-bold text-gray-900">{member.label}'s Conditions</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DISEASES.map((disease) => {
          const checked = selected.includes(disease);
          return (
            <label
              key={disease}
              className="flex items-center gap-2.5 cursor-pointer bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 hover:border-gray-300 transition-colors"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(disease)}
                className="w-4 h-4 rounded"
                style={{ accentColor: BLUE }}
              />
              <span className="text-sm text-gray-700">{disease}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
