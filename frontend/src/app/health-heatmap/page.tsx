'use client';

import React, { useState, useEffect, useMemo } from 'react';

// ============================================================
// 100 HEALTHY TASKS POOL
// ============================================================
const HEALTH_TASKS_POOL = [
  "Drink 7 glasses of water today", "Get 8 hours of sleep tonight", "Walk at least 7,000 steps",
  "Eat 1 fresh apple or whole fruit", "Do 10 minutes of morning stretching", "Take a 15-minute phone-free walk outdoors",
  "Eat a serving of green leafy vegetables", "Practice 5 minutes of deep breathing exercises", "Avoid sugary beverages all day",
  "Do 20 bodyweight squats during work breaks", "Drink a warm glass of water upon waking", "Floss your teeth before bedtime",
  "Take the stairs instead of the elevator", "Do 15 push-ups (or knee push-ups)", "Avoid screens for 30 minutes before bedtime",
  "Eat a handful of raw nuts or seeds", "Spend 10 minutes in morning sunlight", "Maintain posture: check spine alignment 3 times",
  "Drink a cup of green or herbal tea", "Do 30 seconds of cold water splash on face", "Eat a high-protein breakfast",
  "Do a 1-minute plank hold", "Clean and sanitize your phone screen", "Limit caffeine after 2:00 PM",
  "Stretch your neck and shoulders for 3 minutes", "Eat a home-cooked meal", "Rest your eyes: 20-20-20 rule every hour",
  "Refill your water bottle 3 times today", "Do 10 calf raises while waiting or boiling water", "Include a fermented food in your meal (curd/kimchi)",
  "Write down 3 things you are grateful for", "Take a 5-minute mental break every 2 hours", "Eat slow: chew each bite 20 times",
  "Do 15 arm circles forward and backward", "Stand up every 45 minutes of sitting", "Wash your hands thoroughly before every meal",
  "Do 10 lunges per leg", "Eat meal without watching any screen", "Drink 1 glass of water before each meal",
  "Do 5 minutes of foam rolling or self-massage", "Avoid ultra-processed fried snacks today", "Take 10 slow, deep belly breaths mid-day",
  "Keep your bedroom temperature cool for sleep", "Eat at least two different colored vegetables", "Do 20 jumping jacks",
  "Unclench your jaw and drop your shoulders right now", "Perform 10 cat-cow yoga stretches", "Limit added sugar intake to under 25g today",
  "Wipe down your workspace/desk", "Walk for 10 minutes immediately after dinner", "Replace a processed snack with a cucumber or carrot",
  "Do 10 glute bridges on the floor", "Listen to soothing music for 10 minutes", "Drink electrolyte or lemon water after workout",
  "Pack or prepare a healthy snack for tomorrow", "Do 10 wall sit seconds (hold 30s)", "Avoid consuming food 2 hours before sleep",
  "Spend 15 minutes reading a physical book", "Soak your feet in warm water for recovery", "Eat a bowl of fresh salad with olive oil",
  "Do 10 torso twists to mobilise lower back", "Set a consistent bedtime target for tonight", "Swap white bread/rice for whole grain options",
  "Perform a 2-minute seated hamstring stretch", "Do 15 side-leg raises each side", "Take a break to laugh or call a close friend",
  "Air out your bedroom by opening windows", "Consume 25g+ of dietary fiber today", "Do 10 high knees on the spot",
  "Dim bright house lights 1 hour before sleeping", "Drink zero alcohol today", "Do 5 minutes of wrist and forearm mobility",
  "Add chia or flaxseeds to a meal or drink", "Practice mindfulness or silence for 3 minutes", "Eat a portion of wild berries or pomegranates",
  "Do 10 incline push-ups against a desk/wall", "Keep your water bottle within arm's reach all day", "Do 2 minutes of spinal decompression (dead hang)",
  "Replace refined salt with a balanced mineral salt", "Take 30 deep breaths during an afternoon slump", "Eat garlic or ginger for immune boost",
  "Do 10 seated leg extensions at your chair", "Avoid purchasing packaged junk food today", "Do a 5-minute wind-down stretch routine",
  "Drink a glass of water right before bedtime", "Spend 20 minutes doing a dedicated workout", "Eat a bowl of warm oats or whole grains",
  "Do 10 standing side bends for lateral flex", "Sanitize your reusable water bottle", "Write down tomorrow's primary healthy goals",
  "Do 15 glute kickbacks each leg", "Avoid snacking between main meals today", "Spend 5 minutes decluttering your immediate room",
  "Exhale longer than you inhale for 2 minutes", "Eat 1 fresh tomato or citrus fruit", "Do 10 door-frame chest opening stretches",
  "Limit social media scrolling to under 30 mins", "Perform 10 ankle rotations clockwise & anti-clockwise", "Log your daily wellness accomplishments today",
  "Smile at yourself in the mirror and reset energy",
  "Drink a glass of water before your morning coffee",
  "Do 5 wall push-ups",
  "Roll your ankles 10 times in each direction",
  "Write down one positive affirmation for the day",
  "Unfollow one negative or toxic social media account",
  "Tidy up one small area or drawer for 5 minutes",
  "Open the curtains immediately to let in natural light",
  "Send a kind, unexpected text to a friend or family member",
  "Stretch your arms overhead and hold for 30 seconds",
  "Walk around the room while taking a phone call",
  "Do 10 gentle shoulder shrugs to release tension",
  "Eat one entirely plant-based meal today",
  "Sprinkle cinnamon on your breakfast or morning beverage",
  "Practice 4-7-8 breathing for 2 minutes",
  "Doodle or draw freely on a piece of paper for 5 minutes",
  "Wipe down your computer keyboard and mouse",
  "Make your bed immediately after waking up",
  "Read 5 pages of a non-fiction or self-growth book",
  "Turn on 'Night Shift' or blue light filters on all devices",
  "Unsubscribe from 3 promotional email lists",
  "Put your phone in another room during dinner",
  "Squeeze your glutes for 5 seconds, 10 times",
  "Stretch your calves using a step or wall",
  "Drink a cup of chamomile or peppermint tea",
  "Hug a loved one or pet for at least 10 seconds",
  "Listen to a song that makes you feel nostalgic and happy",
  "Eat a piece of dark chocolate (70%+ cocoa)",
  "Wash your face with cold water to refresh your nervous system",
  "Change your pillowcase for better skin and respiratory health",
  "Do 5 seated torso twists on each side",
  "Take a 5-minute break to sit and do absolutely nothing",
  "Replace one refined carbohydrate with a complex carb today",
  "Do 10 standing heel raises for lower leg circulation",
  "Chew your next meal entirely in silence",
  "Massage your own hands and fingers for 2 minutes",
  "Stand on one leg for 30 seconds (each leg) for balance",
  "Look at an object 20 feet away for 1 minute to rest your eyes",
  "Fluff your pillows and prepare an inviting sleep environment",
  "Compliment a colleague or stranger genuinely",
  "Add a squeeze of fresh lemon or lime to your water",
  "Do 5 gentle neck rolls in both directions",
  "Avoid adding any extra salt to your meals today",
  "Write a brain-dump of your to-dos to clear mental clutter",
  "Delete 5 unused apps from your smartphone",
  "Turn off all non-essential push notifications for the day",
  "Eat a vegetable you haven't consumed in the last month",
  "Do a 2-minute seated forward fold stretch",
  "Take 5 deep breaths before opening your morning emails",
  "Organize your physical desktop or immediate workspace",
  "Drink a glass of water immediately after brushing your teeth",
  "Park slightly further away to accumulate extra steps",
  "Do 15 seconds of a gentle butterfly leg stretch",
  "Listen to a 5-minute guided meditation or soundscape",
  "Swap out a sweetened yogurt for plain curd/yogurt",
  "Clean your reading glasses or sunglasses lenses",
  "Do 10 knee-to-chest pulls while lying on your back",
  "Write down one specific thing you are looking forward to",
  "Challenge yourself to not complain about anything for 2 hours",
  "Rub your temples gently in circular motions for 1 minute",
  "Take a brisk 5-minute walk within an hour of waking up",
  "Add a pinch of turmeric or black pepper to a meal",
  "Do 10 repetitions of opening and closing your fists tightly",
  "Sit in complete silence without audio input for 3 minutes",
  "Read an inspiring quote and reflect on it for a moment",
  "Portion your snack into a bowl instead of eating from the bag",
  "Stretch your chest by clasping your hands behind your back",
  "Walk barefoot on grass or a natural surface for 2 minutes",
  "Write down one sincere compliment to yourself",
  "Do 10 gentle hip circles to loosen your lower back",
  "Replace a regular potato with a nutrient-dense sweet potato",
  "Sip a warm beverage slowly over 15 mindful minutes",
  "Do a quick 3-minute sweep or vacuum of your floor",
  "Leave your smartphone out of the bathroom today",
  "Stretch your forearms by gently pulling your fingers back",
  "Try a brand new healthy recipe or ingredient today",
  "Close your eyes and vividly visualize a calming memory",
  "Do 10 light air punches to slightly elevate your heart rate",
  "Breathe in for 4 seconds, exhale for 6 seconds (Repeat 5x)",
  "Wipe down your kitchen counters before going to bed",
  "Add a small side of leafy greens to your lunch",
  "Do 5 wall angels to improve your shoulder mobility",
  "Politely refuse one piece of junk food offered to you",
  "Listen to a podcast episode about health or personal growth",
  "Take a mindful shower, focusing entirely on the water's temperature",
  "Do 20 alternating high knees while standing in place",
  "Set an alarm to consciously drink water mid-afternoon",
  "Eat a whole piece of fruit instead of drinking fruit juice",
  "Take 3 deep breaths before starting your commute or car",
  "Do a gentle 1-minute child's pose stretch on the floor",
  "Avoid checking any news portals first thing in the morning",
  "Mute your active group chats for a 2-hour deep focus block",
  "Savor the very first bite of your dinner for 10 full seconds",
  "Do 10 alternating reverse lunges (5 per leg) carefully",
  "Clean out expired or processed items from your fridge",
  "Express verbal gratitude to a service worker today",
  "Do a quick posture check: pull shoulders back, tuck chin",
  "Write your top 3 goals for tomorrow before going to sleep",
  "Listen to nature sounds (rain, ocean) while working",
  "Gently massage your own scalp for 2 uninterrupted minutes",
  "Smile and make eye contact with a stranger today"
];

function getSeededRandomTasks(dateString: string): string[] {
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed = (seed << 5) - seed + dateString.charCodeAt(i);
    seed |= 0;
  }
  const lcg = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const poolCopy = [...HEALTH_TASKS_POOL];
  const selected: string[] = [];
  for (let i = 0; i < 10; i++) {
    const index = Math.floor(lcg() * poolCopy.length);
    selected.push(poolCopy[index]);
    poolCopy.splice(index, 1);
  }
  return selected;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getHeatmapColor(count: number): string {
  if (!count || count === 0) return 'bg-gray-50 border-gray-100';
  if (count <= 2) return 'bg-blue-100 border-blue-200';
  if (count <= 4) return 'bg-blue-300 border-blue-400';
  if (count <= 6) return 'bg-blue-400 border-blue-500';
  if (count <= 8) return 'bg-blue-500 border-blue-600';
  return 'bg-blue-600 border-blue-700'; // Light blue optimized theme
}

export default function HealthHeatmapTracker() {
  const [isMounted, setIsMounted] = useState(false);
  const [todayKey, setTodayKey] = useState('');
  const [checkedTasks, setCheckedTasks] = useState<boolean[]>(Array(10).fill(false));
  const [heatmapHistory, setHeatmapHistory] = useState<Record<string, number>>({});
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    setTodayKey(getTodayKey());
    setIsMounted(true);
  }, []);

  const daily10Tasks = useMemo(() => {
    if (!todayKey) return [];
    return getSeededRandomTasks(todayKey);
  }, [todayKey]);

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const resultWeeks: { dateStr: string; dayOfWeek: number; month: string }[][] = [];
    const months: { name: string; colIndex: number }[] = [];
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    while (startDate.getDay() !== 0) startDate.setDate(startDate.getDate() - 1);

    let currentWeek: { dateStr: string; dayOfWeek: number; month: string }[] = [];
    let lastMonth = '';
    const curr = new Date(startDate);
    let colIdx = 0;

    while (curr <= today) {
      const dateStr = curr.toISOString().split('T')[0];
      const monthName = curr.toLocaleString('en-US', { month: 'short' });
      if (curr.getDay() === 0 && currentWeek.length > 0) {
        resultWeeks.push(currentWeek);
        currentWeek = [];
        colIdx++;
      }
      if (monthName !== lastMonth) {
        months.push({ name: monthName, colIndex: colIdx });
        lastMonth = monthName;
      }
      currentWeek.push({ dateStr, dayOfWeek: curr.getDay(), month: monthName });
      curr.setDate(curr.getDate() + 1);
    }
    if (currentWeek.length > 0) resultWeeks.push(currentWeek);
    return { weeks: resultWeeks, monthLabels: months };
  }, []);

  useEffect(() => {
    if (!todayKey) return;
    const TASKS_STORAGE_KEY = `health_tasks_checked_${todayKey}`;
    const HEATMAP_STORAGE_KEY = 'health_heatmap_history_data';
    try {
      const savedChecks = localStorage.getItem(TASKS_STORAGE_KEY);
      if (savedChecks) setCheckedTasks(JSON.parse(savedChecks));
      const savedHistory = localStorage.getItem(HEATMAP_STORAGE_KEY);
      if (savedHistory) setHeatmapHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.error('Failed to parse localStorage health data', e);
    }
  }, [todayKey]);

  const toggleTask = (index: number) => {
    const updated = [...checkedTasks];
    const isNowChecked = !updated[index];
    updated[index] = isNowChecked;
    setCheckedTasks(updated);
    const completedCount = updated.filter(Boolean).length;
    const TASKS_STORAGE_KEY = `health_tasks_checked_${todayKey}`;
    const HEATMAP_STORAGE_KEY = 'health_heatmap_history_data';
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    const updatedHistory = { ...heatmapHistory, [todayKey]: completedCount };
    setHeatmapHistory(updatedHistory);
    localStorage.setItem(HEATMAP_STORAGE_KEY, JSON.stringify(updatedHistory));

    if (isNowChecked) {
      const newStreak = Math.max(1, streak + 1);
      setStreak(newStreak);
      localStorage.setItem('nxthealth_streak_count', newStreak.toString());
      window.dispatchEvent(new Event('streak-updated'));
    }
  };

  if (!isMounted) return null;

  const todayCompletedCount = checkedTasks.filter(Boolean).length;
  const totalCompletedAllTime = Object.values(heatmapHistory).reduce((sum, val) => sum + val, 0);

  // Safely calculate the current streak of consecutive days with at least 1 task done
  const currentStreak = useMemo(() => {
    let streakVal = 0;
    const date = new Date();
    let dateStr = date.toISOString().split('T')[0];

    // If today has 0 tasks done, we check yesterday before breaking the streak
    if (!heatmapHistory[dateStr] || heatmapHistory[dateStr] === 0) {
      date.setDate(date.getDate() - 1);
      dateStr = date.toISOString().split('T')[0];
    }

    // Count backwards sequentially
    while (heatmapHistory[dateStr] && heatmapHistory[dateStr] > 0) {
      streakVal++;
      date.setDate(date.getDate() - 1);
      dateStr = date.toISOString().split('T')[0];
    }
    return streakVal;
  }, [heatmapHistory]);

  useEffect(() => {
    const saved = localStorage.getItem('nxthealth_streak_count');
    if (saved) {
      setStreak(parseInt(saved, 10) || 0);
    } else {
      setStreak(currentStreak);
    }
  }, [currentStreak]);

  return (
    <main className="min-h-screen bg-gray-50/50 px-4 sm:px-6 py-8">
      <div className="w-full max-w-5xl mx-auto p-8 bg-white rounded-3xl border border-gray-200/70 shadow-sm space-y-8 font-sans">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
              Health Activity Overview
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Complete your 10 daily micro-habits to fill your health activity matrix. 
              <br className="hidden md:block" />
              <span className="font-semibold text-blue-600">✨ New tasks are refreshed automatically every day.</span>
            </p>
          </div>
          
          {/* STAT CARDS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* New Streak Card */}
            <div className="bg-orange-50/80 px-5 py-2.5 rounded-2xl border border-orange-100 text-center min-w-[90px] shadow-sm">
              <span className="block text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">Streak</span>
              <span className="text-base font-bold text-orange-700">{streak} 🔥</span>
            </div>
            
            <div className="bg-blue-50/80 px-5 py-2.5 rounded-2xl border border-blue-100 text-center min-w-[90px] shadow-sm">
              <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Today</span>
              <span className="text-base font-bold text-blue-900">{todayCompletedCount} / 10</span>
            </div>
            
            <div className="bg-blue-50/80 px-5 py-2.5 rounded-2xl border border-blue-100 text-center min-w-[90px] shadow-sm">
              <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Total Done</span>
              <span className="text-base font-bold text-blue-900">{totalCompletedAllTime}</span>
            </div>
          </div>
        </div>

        {/* HEATMAP SECTION */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Health Contributions (Last 365 Days)
            </h3>
            <span className="text-xs font-medium text-gray-500">
              {todayCompletedCount === 10 ? '🎉 All tasks completed today!' : `${10 - todayCompletedCount} tasks remaining today`}
            </span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-200/60 overflow-x-auto relative shadow-sm">
            {hoveredCell && (
              <div
                className="pointer-events-none fixed z-50 bg-gray-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl border border-gray-800 -translate-x-1/2 -translate-y-12 transition-all duration-75"
                style={{ left: hoveredCell.x, top: hoveredCell.y }}
              >
                <strong className="text-white">{hoveredCell.count} tasks</strong> on {hoveredCell.date}
              </div>
            )}

            <div className="min-w-[720px]">
              {/* MONTH LABELS */}
              <div className="flex text-[10px] text-gray-400 mb-2 font-medium pl-8">
                {monthLabels.map((m, idx) => (
                  <div key={idx} style={{ width: `${(100 / weeks.length) * 4.3}%` }} className="truncate">
                    {m.name}
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                {/* DAY LABELS */}
                <div className="flex flex-col justify-between text-[10px] text-gray-400 font-medium pr-2 py-0.5 select-none">
                  <span>Mon</span><span>Wed</span><span>Fri</span>
                </div>

                {/* GRID COLUMNS */}
                <div className="flex gap-1 flex-1">
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-1 flex-1">
                      {week.map((day) => {
                        const count = heatmapHistory[day.dateStr] || 0;
                        const colorClass = getHeatmapColor(count);
                        const isToday = day.dateStr === todayKey;
                        return (
                          <div
                            key={day.dateStr}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredCell({ date: day.dateStr, count, x: rect.left + rect.width / 2, y: rect.top });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`w-full aspect-square rounded-[3px] border ${colorClass} transition-all duration-150 cursor-pointer hover:scale-125 hover:z-10 ${
                              isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                            }`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* COLOR LEGEND */}
              <div className="flex items-center justify-end gap-1.5 mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                <span className="text-xs text-gray-400 mr-1">Less</span>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-gray-50 border border-gray-100" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-100 border border-blue-200" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-300 border border-blue-400" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-400 border border-blue-500" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-500 border border-blue-600" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-600 border border-blue-700" />
                <span className="text-xs text-gray-400 ml-1">More</span>
              </div>
            </div>
          </div>
        </div>

        {/* TODAY'S 10 TASKS CHECKLIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Today's Tasks
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {daily10Tasks.map((task, idx) => {
              const isChecked = checkedTasks[idx];
              return (
                <label
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                    isChecked
                      ? 'bg-blue-50/50 border-blue-200/80 text-gray-400 line-through'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm text-gray-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 ${
                      isChecked ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-gray-50'
                  }`}>
                    {isChecked && (
                      <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium leading-normal">{task}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
