'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================
// Types
// ============================================================
type SlotKey = 'morning' | 'afternoon' | 'evening' | 'night';

interface Medicine {
  id: string;
  name: string;
  taken: boolean;
}

interface SlotData {
  medicines: Medicine[];
}

interface DayState {
  date: string;
  slots: Record<SlotKey, SlotData>;
}

interface StreakState {
  count: number;
  lastCompletedDate: string | null;
}

const STORAGE_KEY = 'nxthealth_medicine_wheel_day';
const STREAK_KEY = 'nxthealth_medicine_wheel_streak';

// ============================================================
// Design tokens — matched to NxtHealth's existing UI
// ============================================================
const NAVY = '#0B1E3D';
const BLUE = '#2F6FED';
const BLUE_LIGHT = '#EAF2FE';
const GREEN = '#1FAA59';
const GREEN_LIGHT = '#E5F7EC';

const SLOT_CONFIG: Record<
  SlotKey,
  { label: string; icon: string; angleStart: number }
> = {
  morning: { label: 'Morning', icon: '🌅', angleStart: 270 },
  afternoon: { label: 'Afternoon', icon: '☀️', angleStart: 0 },
  evening: { label: 'Evening', icon: '🌇', angleStart: 90 },
  night: { label: 'Night', icon: '🌙', angleStart: 180 },
};

const SLOT_ORDER: SlotKey[] = ['morning', 'afternoon', 'evening', 'night'];

const DEFAULT_MEDICINES: Record<SlotKey, string[]> = {
  morning: ['Vitamin C', 'Zinc'],
  afternoon: ['Blood Pressure Tablet'],
  evening: ['Multivitamin'],
  night: ['Calcium'],
};

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}
function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
function createFreshDay(): DayState {
  const slots = {} as Record<SlotKey, SlotData>;
  SLOT_ORDER.forEach((key) => {
    slots[key] = {
      medicines: DEFAULT_MEDICINES[key].map((name, i) => ({
        id: `${key}-${i}`,
        name,
        taken: false,
      })),
    };
  });
  return { date: todayString(), slots };
}
function isSlotComplete(slot: SlotData): boolean {
  return slot.medicines.length > 0 && slot.medicines.every((m) => m.taken);
}

// ============================================================
// Main Page Component
// ============================================================
export default function MedicineWheelPage() {
  const [day, setDay] = useState<DayState | null>(null);
  const [streak, setStreak] = useState<StreakState>({ count: 0, lastCompletedDate: null });
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebratedToday, setHasCelebratedToday] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [editingSlot, setEditingSlot] = useState<SlotKey>('morning');

  useEffect(() => {
    try {
      const savedDay = localStorage.getItem(STORAGE_KEY);
      const savedStreak = localStorage.getItem(STREAK_KEY);
      let parsedDay: DayState = savedDay ? JSON.parse(savedDay) : createFreshDay();
      if (parsedDay.date !== todayString()) parsedDay = createFreshDay();
      setDay(parsedDay);
      if (savedStreak) setStreak(JSON.parse(savedStreak));
    } catch {
      setDay(createFreshDay());
    }
  }, []);

  useEffect(() => {
    if (day) localStorage.setItem(STORAGE_KEY, JSON.stringify(day));
  }, [day]);

  useEffect(() => {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  }, [streak]);

  const addMedicine = useCallback(() => {
    if (!newMedName.trim()) return;
    setDay((prev) => {
      if (!prev) return prev;
      const updatedSlots = { ...prev.slots };
      const newMed = {
        id: `${editingSlot}-${Date.now()}`,
        name: newMedName.trim(),
        taken: false,
      };
      updatedSlots[editingSlot] = {
        medicines: [...updatedSlots[editingSlot].medicines, newMed],
      };
      return { ...prev, slots: updatedSlots };
    });
    setNewMedName('');
  }, [newMedName, editingSlot]);

  const removeMedicine = useCallback((slotKey: SlotKey, medId: string) => {
    setDay((prev) => {
      if (!prev) return prev;
      const updatedSlots = { ...prev.slots };
      updatedSlots[slotKey] = {
        medicines: updatedSlots[slotKey].medicines.filter((m) => m.id !== medId),
      };
      return { ...prev, slots: updatedSlots };
    });
  }, []);

  const toggleMedicine = useCallback((slotKey: SlotKey, medId: string) => {
    setDay((prev) => {
      if (!prev) return prev;
      const updatedSlots = { ...prev.slots };
      updatedSlots[slotKey] = {
        medicines: updatedSlots[slotKey].medicines.map((m) =>
          m.id === medId ? { ...m, taken: !m.taken } : m
        ),
      };
      return { ...prev, slots: updatedSlots };
    });
  }, []);

  const markSlotComplete = useCallback((slotKey: SlotKey) => {
    setDay((prev) => {
      if (!prev) return prev;
      const updatedSlots = { ...prev.slots };
      updatedSlots[slotKey] = {
        medicines: updatedSlots[slotKey].medicines.map((m) => ({ ...m, taken: true })),
      };
      return { ...prev, slots: updatedSlots };
    });
  }, []);

  const completedCount = day
    ? SLOT_ORDER.filter((key) => isSlotComplete(day.slots[key])).length
    : 0;
  const progressPercent = (completedCount / 4) * 100;

  useEffect(() => {
    if (progressPercent === 100 && !hasCelebratedToday) {
      setShowCelebration(true);
      setHasCelebratedToday(true);
      setStreak((prev) => {
        const today = todayString();
        if (prev.lastCompletedDate === today) return prev;
        const isConsecutive = prev.lastCompletedDate === yesterdayString();
        return { count: isConsecutive ? prev.count + 1 : 1, lastCompletedDate: today };
      });
    }
  }, [progressPercent, hasCelebratedToday]);

  if (!day) return null;

  const totalMeds = SLOT_ORDER.reduce((sum, k) => sum + day.slots[k].medicines.length, 0);
  const takenMeds = SLOT_ORDER.reduce(
    (sum, k) => sum + day.slots[k].medicines.filter((m) => m.taken).length,
    0
  );

  return (
    <main className="min-h-screen bg-white px-4 sm:px-8 py-8 w-full max-w-full overflow-x-hidden mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-4">
        Home <span className="mx-1.5">/</span> Utilities{' '}
        <span className="mx-1.5">/</span>
        <span className="text-gray-700 font-medium">Medicine Time Wheel</span>
      </div>

      {/* Header */}
      <h1
        className="text-4xl font-bold text-gray-900 mb-3"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Medicine Time Wheel
      </h1>
      <p className="text-gray-500 max-w-2xl mb-8 leading-relaxed">
        Track today's doses across morning, afternoon, evening, and night — tap a
        section of the wheel to check off what you've taken.
      </p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT: Wheel card */}
        <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100 w-full max-w-2xl mx-auto overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Today's Schedule</h3>
              <p className="text-xs text-gray-500 font-medium">Tap any quadrant to view and check off medicines</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
              >
                {isEditing ? 'Done Editing' : 'Edit Medications'}
              </button>
              <span
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: BLUE_LIGHT, color: BLUE }}
              >
                ⚡ Auto-Saved
              </span>
            </div>
          </div>

          <div className="w-full max-w-[280px] sm:max-w-[340px] mx-auto overflow-hidden flex justify-center scale-90 sm:scale-100 origin-center">
            <Wheel
              day={day}
              activeSlot={activeSlot}
              progressPercent={progressPercent}
              streakCount={streak.count}
              onSelectSlot={(key) => setActiveSlot(activeSlot === key ? null : key)}
            />
          </div>

          {activeSlot && (
            <SlotDetail
              slotKey={activeSlot}
              slot={day.slots[activeSlot]}
              onToggle={(medId) => toggleMedicine(activeSlot, medId)}
              onMarkComplete={() => markSlotComplete(activeSlot)}
              onClose={() => setActiveSlot(null)}
            />
          )}

          {isEditing && (
            <div className="mt-6 border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <span>⚙️</span> Edit Schedule
                </h3>
                <span className="text-xs text-gray-500">Add or remove medications per slot</span>
              </div>

              {/* Slot tab selector */}
              <div className="grid grid-cols-4 gap-2">
                {SLOT_ORDER.map((key) => {
                  const config = SLOT_CONFIG[key];
                  const isActive = editingSlot === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEditingSlot(key)}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer ${
                        isActive
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="block text-sm">{config.icon}</span>
                      <span className="block mt-0.5">{config.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add medication input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g., Aspirin"
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addMedicine();
                  }}
                />
                <button
                  type="button"
                  onClick={addMedicine}
                  className="px-4 py-2 text-sm font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* List of current medications for the selected slot */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Current Medications for {SLOT_CONFIG[editingSlot].label}:
                </p>
                {day.slots[editingSlot].medicines.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No medications listed.</p>
                ) : (
                  <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                    {day.slots[editingSlot].medicines.map((med) => (
                      <li
                        key={med.id}
                        className="flex items-center justify-between bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm"
                      >
                        <span className="text-gray-700 font-medium">💊 {med.name}</span>
                        <button
                          type="button"
                          onClick={() => removeMedicine(editingSlot, med.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Stat cards */}
        <div className="flex flex-col gap-6">
          {/* Light blue progress card */}
          <div
            className="rounded-2xl p-6 text-gray-900"
            style={{ backgroundColor: BLUE_LIGHT }}
          >
            <p
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: BLUE }}
            >
              Today's Progress
            </p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold text-gray-900">{Math.round(progressPercent)}</span>
              <span className="text-lg text-gray-700">%</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-900/10">
              <div>
                <p className="text-xs text-gray-600 mb-1">Doses Taken</p>
                <p className="text-lg font-bold text-gray-900">
                  {takenMeds}/{totalMeds}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Streak</p>
                <p className="text-lg font-bold text-gray-900">
                  {streak.count > 0 ? `🔥 ${streak.count}d` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Dose Breakdown card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: BLUE }}>💊</span>
              <h3 className="font-bold text-gray-900">Dose Breakdown</h3>
            </div>

            <div className="space-y-4">
              {SLOT_ORDER.map((key) => {
                const slot = day.slots[key];
                const config = SLOT_CONFIG[key];
                const taken = slot.medicines.filter((m) => m.taken).length;
                const total = slot.medicines.length;
                const pct = total > 0 ? (taken / total) * 100 : 0;
                const complete = isSlotComplete(slot);

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5 text-sm text-gray-700">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: complete ? GREEN : BLUE }}
                        />
                        {config.icon} {config.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {taken}/{total}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: complete ? GREEN : BLUE,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showCelebration && (
        <CelebrationOverlay
          streakCount={streak.count}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </main>
  );
}

// ============================================================
// Wheel — SVG quadrants, navy/blue system
// ============================================================
function Wheel({
  day,
  activeSlot,
  progressPercent,
  streakCount,
  onSelectSlot,
}: {
  day: DayState;
  activeSlot: SlotKey | null;
  progressPercent: number;
  streakCount: number;
  onSelectSlot: (key: SlotKey) => void;
}) {
  const size = 240;
  const center = size / 2;
  const radius = 92;
  const labelOffset = 56;
  const boxSize = size + labelOffset * 2;

  return (
    <div className="flex items-center justify-center py-10">
      <div className="relative" style={{ width: boxSize, height: boxSize }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute"
          style={{ left: labelOffset, top: labelOffset }}
        >
          {SLOT_ORDER.map((key) => {
            const config = SLOT_CONFIG[key];
            const slotComplete = isSlotComplete(day.slots[key]);
            const isActive = activeSlot === key;

            const startAngle = (config.angleStart - 90) * (Math.PI / 180);
            const endAngle = (config.angleStart + 90 - 90) * (Math.PI / 180);
            const x1 = center + radius * Math.cos(startAngle);
            const y1 = center + radius * Math.sin(startAngle);
            const x2 = center + radius * Math.cos(endAngle);
            const y2 = center + radius * Math.sin(endAngle);
            const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

            return (
              <path
                key={key}
                d={pathData}
                fill={slotComplete ? GREEN : isActive ? BLUE : BLUE_LIGHT}
                stroke="#FFFFFF"
                strokeWidth={5}
                opacity={isActive || slotComplete ? 1 : 0.9}
                className="cursor-pointer transition-all duration-500 ease-out hover:opacity-100"
                onClick={() => onSelectSlot(key)}
              />
            );
          })}
          <circle cx={center} cy={center} r={44} fill="#FFFFFF" stroke="#E5E7EB" strokeWidth={2} />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl">{streakCount > 0 ? '🔥' : '❤️'}</span>
          <span className="text-[10px] font-semibold text-gray-400 mt-0.5 leading-tight">
            {streakCount > 0 ? `${streakCount} Day Streak` : "Today's Dose"}
          </span>
          <span className="text-lg font-bold" style={{ color: NAVY }}>
            {Math.round(progressPercent)}%
          </span>
        </div>

        {SLOT_ORDER.map((key) => {
          const config = SLOT_CONFIG[key];
          const boxCenter = boxSize / 2;
          const midAngleDeg = config.angleStart - 45;
          const midAngle = midAngleDeg * (Math.PI / 180);
          const labelRadius = radius + 40;
          const lx = boxCenter + labelRadius * Math.cos(midAngle);
          const ly = boxCenter + labelRadius * Math.sin(midAngle);

          return (
            <button
              key={key}
              onClick={() => onSelectSlot(key)}
              className="absolute flex flex-col items-center gap-0.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              style={{
                left: `${lx}px`,
                top: `${ly}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="text-base leading-none">{config.icon}</span>
              <span className="leading-none whitespace-nowrap">{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Slot Detail Panel
// ============================================================
function SlotDetail({
  slotKey,
  slot,
  onToggle,
  onMarkComplete,
  onClose,
}: {
  slotKey: SlotKey;
  slot: SlotData;
  onToggle: (medId: string) => void;
  onMarkComplete: () => void;
  onClose: () => void;
}) {
  const config = SLOT_CONFIG[slotKey];
  const complete = isSlotComplete(slot);

  return (
    <div className="mt-2 rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <h3 className="text-base font-bold text-gray-900">{config.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <ul className="space-y-2 mb-4">
        {slot.medicines.map((med) => (
          <li key={med.id}>
            <label className="flex items-center gap-3 cursor-pointer bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors">
              <input
                type="checkbox"
                checked={med.taken}
                onChange={() => onToggle(med.id)}
                className="w-4 h-4 rounded"
                style={{ accentColor: BLUE }}
              />
              <span
                className={`text-sm ${
                  med.taken ? 'line-through text-gray-400' : 'text-gray-700'
                }`}
              >
                💊 {med.name}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <button
        onClick={onMarkComplete}
        disabled={complete}
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors text-white disabled:cursor-default"
        style={{ backgroundColor: complete ? GREEN_LIGHT : NAVY, color: complete ? GREEN : '#FFFFFF' }}
      >
        {complete ? '✓ Completed' : 'Mark Completed'}
      </button>
    </div>
  );
}

// ============================================================
// Celebration Overlay
// ============================================================
function CelebrationOverlay({
  streakCount,
  onClose,
}: {
  streakCount: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl px-8 py-10 max-w-xs w-full text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-3">🎉</div>
        <h3
          className="text-lg font-bold text-gray-900 mb-1"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Today's medication completed!
        </h3>
        <p className="text-sm text-gray-500 mb-5">Every dose, right on time.</p>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
          style={{ backgroundColor: BLUE_LIGHT, color: BLUE }}
        >
          🔥 {streakCount} Day Streak
        </div>
        <button
          onClick={onClose}
          className="block w-full mt-6 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: NAVY }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
