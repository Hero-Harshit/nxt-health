'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Flame,
  Trophy,
  ArrowLeft,
  Info,
  Zap,
  Sparkles,
  UserPlus,
  Search,
  CheckCircle2,
  X,
  Award,
  Activity,
  Send,
  ShieldCheck
} from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  weeklyCompletion: number; // percentage
  totalBadges: number;
  lastActive: string;
  isUser?: boolean;
  nudgeSent?: boolean;
  cheerSent?: boolean;
}

export default function CommunityPage() {
  const [userStreak, setUserStreak] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFriendCode, setNewFriendCode] = useState('');

  // Initial Simulated Friends Data Pool
  const [friends, setFriends] = useState<Friend[]>([
    {
      id: 'f1',
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      streak: 12,
      weeklyCompletion: 92,
      totalBadges: 4,
      lastActive: '10 mins ago',
    },
    {
      id: 'f2',
      name: 'Rahul Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      streak: 8,
      weeklyCompletion: 84,
      totalBadges: 3,
      lastActive: '2 hours ago',
    },
    {
      id: 'f3',
      name: 'Ananya Verma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      streak: 3,
      weeklyCompletion: 70,
      totalBadges: 2,
      lastActive: 'Yesterday',
    },
    {
      id: 'f4',
      name: 'Vikram Patel',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      streak: 1,
      weeklyCompletion: 55,
      totalBadges: 1,
      lastActive: '3 days ago',
    }
  ]);

  // Sync User's Real Local Storage Streak
  useEffect(() => {
    const savedStreak = localStorage.getItem('nxthealth_streak_count');
    const current = savedStreak ? parseInt(savedStreak, 10) || 0 : 0;
    setUserStreak(current);
  }, []);

  // Combine User into Leaderboard & Sort by Streak
  const leaderboard: Friend[] = React.useMemo(() => {
    const userObj: Friend = {
      id: 'current-user',
      name: 'Harshit (You)',
      avatar: '',
      streak: userStreak,
      weeklyCompletion: userStreak > 0 ? 88 : 40,
      totalBadges: 1,
      lastActive: 'Just now',
      isUser: true,
    };

    const combined = [...friends, userObj];
    // Sort descending by streak score
    return combined.sort((a, b) => b.streak - a.streak);
  }, [friends, userStreak]);

  // Helper for Toast Notifications
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Action: Send Nudge
  const handleNudge = (friendId: string, name: string) => {
    setFriends(prev =>
      prev.map(f => (f.id === friendId ? { ...f, nudgeSent: true } : f))
    );
    triggerToast(`⚡ Sent a gentle streak reminder nudge to ${name}!`);
  };

  // Action: Send High-Five Cheer
  const handleCheer = (friendId: string, name: string) => {
    setFriends(prev =>
      prev.map(f => (f.id === friendId ? { ...f, cheerSent: true } : f))
    );
    triggerToast(`🔥 Sent a High-Five cheer to ${name}!`);
  };

  // Action: Add Friend Handler
  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendCode.trim()) return;

    const newMember: Friend = {
      id: `f-${Date.now()}`,
      name: `Friend (${newFriendCode.trim().toUpperCase()})`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      streak: Math.floor(Math.random() * 6) + 1,
      weeklyCompletion: 75,
      totalBadges: 2,
      lastActive: 'Just now',
    };
    setFriends(prev => [newMember, ...prev]);
    setNewFriendCode('');
    setShowAddModal(false);
    triggerToast(`🎉 Friend successfully connected!`);
  };

  // Filtered List based on search
  const filteredLeaderboard = leaderboard.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userRank = leaderboard.findIndex(f => f.isUser) + 1;

  return (
    <main className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          {/* Header Banner Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Social Health Network</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Community and Friends
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Compare healthy habit consistency, celebrate streak milestones, and keep your friends accountable.
              </p>
            </div>
            {/* Add Friend Trigger Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-blue-600/20 transition-all shrink-0 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Connect Friend</span>
            </button>
          </div>
        </div>

        {/* ℹ️ TRANSPARENCY DISCLAIMER BANNER */}
        <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Demo Transparency Note
            </h4>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              Community rankings and peer activity shown below are currently simulated for presentation and demonstration purposes. No sensitive clinical, vault, or diagnostic records are ever shared on this network.
            </p>
          </div>
        </div>

        {/* Toast Message Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* User Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Your Rank</span>
              <span className="text-xl font-extrabold text-gray-900">#{userRank} of {leaderboard.length}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Flame className="w-6 h-6 fill-orange-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Your Streak</span>
              <span className="text-xl font-extrabold text-orange-600">{userStreak} Days 🔥</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Privacy Status</span>
              <span className="text-xs font-bold text-emerald-700">Protected & Anonymous</span>
            </div>
          </div>
        </div>

        {/* Search Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex items-center justify-between gap-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search friends on leaderboard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Leaderboard Table / Cards Container */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Streak Consistency Leaderboard
            </h3>
            <span className="text-xs text-gray-400 font-medium">Ranked by Active Streak</span>
          </div>
          <div className="space-y-3">
            {filteredLeaderboard.map((friend, index) => {
              const rankNum = index + 1;
              const isUser = friend.isUser;
              return (
                <div
                  key={friend.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                    isUser
                      ? 'bg-blue-50/70 border-blue-200 ring-2 ring-blue-400/20 shadow-xs'
                      : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-slate-50/50'
                  }`}
                >
                  {/* Left Details */}
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                      rankNum === 1
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : rankNum === 2
                        ? 'bg-slate-200 text-slate-800'
                        : rankNum === 3
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{rankNum}
                    </div>
                    {/* Avatar or Placeholder */}
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                        H
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{friend.name}</h4>
                        {isUser && (
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Active {friend.lastActive} • {friend.totalBadges} {friend.totalBadges === 1 ? 'Badge' : 'Badges'}
                      </p>
                    </div>
                  </div>
                  {/* Center & Right Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    {/* Streak Score Badge */}
                    <div className="px-3.5 py-1.5 bg-orange-50 text-orange-800 border border-orange-200/80 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0">
                      <Flame className={`w-4 h-4 ${friend.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
                      <span>{friend.streak} {friend.streak === 1 ? 'Day' : 'Days'}</span>
                    </div>
                    {/* Interactive Action Buttons */}
                    {!isUser && (
                      <div className="flex items-center gap-2">
                        {/* Head to Head Comparison Trigger */}
                        <button
                          onClick={() => setSelectedFriend(friend)}
                          className="p-2 text-xs font-semibold text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          title="Compare Head-to-Head"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        {/* Nudge Button */}
                        <button
                          onClick={() => handleNudge(friend.id, friend.name)}
                          disabled={friend.nudgeSent}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            friend.nudgeSent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 cursor-pointer'
                          }`}
                        >
                          {friend.nudgeSent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Nudged</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              <span>Nudge</span>
                            </>
                          )}
                        </button>
                        {/* Cheer Button */}
                        <button
                          onClick={() => handleCheer(friend.id, friend.name)}
                          disabled={friend.cheerSent}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            friend.cheerSent
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 active:scale-95 cursor-pointer'
                          }`}
                        >
                          {friend.cheerSent ? '👏 Cheered' : '🔥 High-Five'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📊 HEAD-TO-HEAD COMPARISON MODAL */}
        {selectedFriend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                    Head-to-Head Comparison
                  </span>
                  <h3 className="text-lg font-black text-gray-900 mt-0.5">
                    You vs. {selectedFriend.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedFriend(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Comparison Grid */}
              <div className="grid grid-cols-2 gap-4 text-center">
                {/* You */}
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 space-y-3">
                  <span className="text-xs font-black text-blue-800 uppercase tracking-wider block">YOU</span>
                  <div className="space-y-1">
                    <span className="text-2xl font-black text-gray-900">{userStreak} Days</span>
                    <span className="text-[11px] font-medium text-gray-500 block">Current Streak</span>
                  </div>
                  <div className="pt-2 border-t border-blue-100">
                    <span className="text-sm font-bold text-blue-700">88%</span>
                    <span className="text-[11px] text-gray-500 block">Weekly Completion</span>
                  </div>
                </div>
                {/* Friend */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                    {selectedFriend.name.split(' ')[0]}
                  </span>
                  <div className="space-y-1">
                    <span className="text-2xl font-black text-gray-900">{selectedFriend.streak} Days</span>
                    <span className="text-[11px] font-medium text-gray-500 block">Current Streak</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-sm font-bold text-slate-700">{selectedFriend.weeklyCompletion}%</span>
                    <span className="text-[11px] text-gray-500 block">Weekly Completion</span>
                  </div>
                </div>
              </div>
              {/* Footer Action */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    handleNudge(selectedFriend.id, selectedFriend.name);
                    setSelectedFriend(null);
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Send Nudge to Keep Pace
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ➕ ADD FRIEND MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-blue-100 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-gray-900">Connect a Friend</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddFriend} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Enter Friend Tag / Health Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NXT-8842 or Priya"
                    value={newFriendCode}
                    onChange={(e) => setNewFriendCode(e.target.value)}
                    className="w-full p-3 text-xs font-semibold border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 uppercase"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Add to Leaderboard
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
