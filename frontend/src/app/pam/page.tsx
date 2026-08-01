'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Sidebar, X, Mic, ArrowRight, FileText, HeartPulse, Activity, ShieldCheck, Search, Plus, MessageSquare, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const HEALTH_QUOTES = [
  { text: "The greatest wealth is health.", author: "Virgil" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Good health is not something we can buy. However, it can be an extremely valuable savings account.", author: "Anne Wilson Schaef" },
  { text: "Let food be thy medicine and medicine be thy food.", author: "Hippocrates" },
  { text: "Physical fitness is the first requisite of happiness.", author: "Joseph Pilates" }
];

export default function PamInterface() {
  const router = useRouter();
  const [userName, setUserName] = useState("Hero");
  const [quote, setQuote] = useState(HEALTH_QUOTES[0]);
  const [isMounted, setIsMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [messages, setMessages] = useState<{role: 'user' | 'pam', content: string}[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  useEffect(() => {
    // Randomize quote on load
    const randomQuote = HEALTH_QUOTES[Math.floor(Math.random() * HEALTH_QUOTES.length)];
    setQuote(randomQuote);

    // Fetch user name from local storage if available
    try {
      const possibleKeys = ['user_profile', 'health_passport', 'profile_data', 'nxthealth_profile'];
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.name || parsed.firstName) {
            setUserName(parsed.name || parsed.firstName);
            break;
          }
        }
      }
    } catch (e) {
      console.error("Could not parse profile for name");
    }

    // Fetch chat history securely from local storage
    try {
      const history = localStorage.getItem('pam_chat_history');
      if (history) {
        setChatHistory(JSON.parse(history));
      }
    } catch (e) {
      console.error("Failed to parse chat history");
    }
    
    setIsMounted(true);
  }, []);

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setIsDrawerOpen(false);
  };

  const loadChat = (chat: any) => {
    setMessages(chat.messages || []);
    setCurrentChatId(chat.id);
    setIsDrawerOpen(false);
  };

  const deleteChat = (id: number) => {
    const updatedHistory = chatHistory.filter((c: any) => c.id !== id);
    setChatHistory(updatedHistory);
    localStorage.setItem('pam_chat_history', JSON.stringify(updatedHistory));
    if (currentChatId === id) {
      setMessages([]);
      setCurrentChatId(null);
    }
    setActiveMenuId(null);
  };

  const editChatTitle = (id: number, oldTitle: string) => {
    const newTitle = prompt("Edit conversation title:", oldTitle);
    if (newTitle && newTitle.trim() !== "") {
      const updatedHistory = chatHistory.map((c: any) => 
        c.id === id ? { ...c, title: newTitle.trim() } : c
      );
      setChatHistory(updatedHistory);
      localStorage.setItem('pam_chat_history', JSON.stringify(updatedHistory));
    }
    setActiveMenuId(null);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue("");
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages as any);
    setIsLoading(true);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, ""); 
      const res = await fetch(`${backendUrl}/api/pam/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, history: messages })
      });

      const data = await res.json();
      const pamReply = data.reply || data.message || data.text;

      const updatedMessages = [...newMessages, { role: 'pam', content: pamReply }];
      setMessages(updatedMessages as any);

      // --- REPLACE THE OLD LOCAL STORAGE LOGIC WITH THIS ---
      const existingHistory = JSON.parse(localStorage.getItem('pam_chat_history') || '[]');
      const chatIdToUse = currentChatId || Date.now();
      if (!currentChatId) setCurrentChatId(chatIdToUse);

      const existingChatIndex = existingHistory.findIndex((c: any) => c.id === chatIdToUse);
      
      let newHistory;
      if (existingChatIndex >= 0) {
        // Update existing session
        existingHistory[existingChatIndex].messages = updatedMessages;
        newHistory = [...existingHistory];
      } else {
        // Create new session
        const newHistoryItem = {
          id: chatIdToUse,
          title: userText.substring(0, 30) + (userText.length > 30 ? '...' : ''),
          date: 'Just now',
          messages: updatedMessages
        };
        newHistory = [newHistoryItem, ...existingHistory];
      }
      
      localStorage.setItem('pam_chat_history', JSON.stringify(newHistory));
      setChatHistory(newHistory);
      // -----------------------------------------------------

    } catch (error) {
      console.error("Pam API Error:", error);
      setMessages([...newMessages, { role: 'pam', content: "I'm having trouble connecting to my servers right now. Please try again in a moment." }] as any);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-[#f8faff] flex flex-col font-sans selection:bg-blue-100">
      {/* DRAWER OVERLAY (Closes drawer on click outside) */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100] transition-opacity" 
          onClick={() => setIsDrawerOpen(false)} 
        />
      )}

      {/* SLIDE-OUT DRAWER */}
      <div className={`fixed inset-y-0 left-0 w-full sm:w-[340px] bg-[#f8faff] z-[101] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 flex items-center justify-between border-b border-gray-100/50">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDrawerOpen(false)} 
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-gray-700"
            >
              <Sidebar className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-gray-900 text-lg">Conversations</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-gray-700 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </button>
            <button onClick={startNewChat} className="p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer History List / Empty State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col">
          {chatHistory.length === 0 ? (
            // EMPTY STATE UI
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-12">
              <div className="w-20 h-20 bg-indigo-50/50 border border-indigo-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <MessageSquare className="w-8 h-8 text-indigo-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-extrabold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px]">
                Your health chats and analysis with Pam will securely appear here.
              </p>
            </div>
          ) : (
            // FILLED HISTORY UI
            <>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Recent History
                </p>
                <span className="bg-gray-200/80 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {chatHistory.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {chatHistory.map((chat: any) => (
                  <div key={chat.id} className="relative group">
                    {/* Added pr-12 to create a safe zone for the absolute 3-dot menu */}
                    <button 
                      onClick={() => loadChat(chat)} 
                      className={`w-full py-4 pl-4 pr-12 rounded-2xl border transition-all flex items-center justify-between text-left ${currentChatId === chat.id ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200'}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden w-full">
                        <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${currentChatId === chat.id ? 'bg-blue-100' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        </div>
                        {/* Added w-full and block to ensure truncation happens before the padding */}
                        <div className="flex flex-col overflow-hidden w-full">
                          <span className={`text-sm font-bold truncate transition-colors block w-full ${currentChatId === chat.id ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-700'}`}>
                            {chat.title}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">{chat.date}</span>
                        </div>
                      </div>
                    </button>

                    {/* Three Dot Menu Button - Removed hover opacity, now always visible */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === chat.id ? null : chat.id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === chat.id && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-32 bg-white border border-gray-100 shadow-xl rounded-xl z-[110] py-1 overflow-hidden">
                        <button 
                          onClick={(e) => { e.stopPropagation(); editChatTitle(chat.id, chat.title); }} 
                          className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gray-400" /> Edit Title
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} 
                          className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-xs font-semibold text-gray-400">That's all your conversations</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-[60] flex items-center justify-between p-4 sm:p-6 bg-[#f8faff]/80 backdrop-blur-md border-b border-gray-100/50">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-gray-700"
        >
          <Sidebar className="w-5 h-5" />
        </button>
        <h1 className="text-sm sm:text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-wide text-center drop-shadow-sm">
          Personal Assistant & Manager <span className="opacity-80 font-bold">(PAM)</span>
        </h1>
        <button 
          onClick={() => router.back()} 
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* MAIN HERO CONTENT */}
      <main className="flex-1 flex flex-col items-center px-4 pt-4 pb-32 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <>
            {/* Large Pam Orb */}
            <div 
              className="flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full mb-6 border-[1px] border-black/20 shadow-[0_12px_24px_-6px_rgba(37,99,235,0.4),inset_0_-6px_12px_rgba(0,0,0,0.3),inset_0_3px_6px_rgba(255,255,255,0.5)]"
              style={{ background: 'radial-gradient(circle at 30% 30%, #93c5fd 0%, #3b82f6 50%, #1e40af 100%)' }}
            >
              <span className="text-white text-xl sm:text-2xl font-black tracking-[0.15em] select-none pointer-events-none mt-[2px] ml-[3px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                PAM
              </span>
            </div>

            <h2 className="text-indigo-700 font-semibold text-sm sm:text-base mb-4">
              Hello, {userName}
            </h2>
            
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
              How can I assist with your well-being today?
            </h3>

            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
                "{quote.text}"
              </p>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                — {quote.author}
              </p>
            </div>

            {/* ACTION CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
              {/* Card 1 */}
              <div 
                onClick={() => setInputValue("Review and summarize my latest medical reports securely stored in my Health Vault.")}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1.5">Clinical Analysis</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">Ask me to review and summarize the latest medical reports securely stored in your Health Vault.</p>
              </div>

              {/* Card 2 */}
              <div 
                onClick={() => setInputValue("Give me personalized daily habits to increase my active healthspan based on my metrics.")}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <HeartPulse className="w-5 h-5 text-indigo-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1.5">Improve My Healthspan</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">Get personalized daily habits to increase your active lifespan based on your current metrics.</p>
              </div>

              {/* Card 3 */}
              <div 
                onClick={() => setInputValue("Log my daily health metrics, sleep, stress levels, and activity for today.")}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <Activity className="w-5 h-5 text-indigo-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1.5">Log Daily Metrics</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">Quickly update your sleep, stress levels, and activity for today's Healthy Heatmap streak.</p>
              </div>

              {/* Card 4 */}
              <div 
                onClick={() => setInputValue("Analyze my recent hospital invoices to check for overcharges or billing errors.")}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1.5">Verify Medical Bills</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">Let me analyze your recent hospital invoices to check for overcharges or billing errors.</p>
              </div>
            </div>
          </>
        )}

        {messages.length > 0 && (
          <div className="w-full max-w-3xl flex flex-col gap-6 mt-8 mb-20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  {msg.role === 'user' ? (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  ) : (
                    <div className="markdown-body">
                      <ReactMarkdown 
                        components={{
                          strong: ({node, ...props}) => <span className="font-bold text-gray-900" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1.5" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1.5" {...props} />,
                          li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="px-5 py-4 bg-white border border-gray-100 rounded-2xl rounded-bl-none shadow-sm flex gap-2 items-center">
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                   <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                 </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* BOTTOM CHAT INPUT BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#f8faff] via-[#f8faff] to-transparent pointer-events-none flex justify-center">
        <div className="w-full max-w-3xl relative pointer-events-auto">
          <input 
            type="text" 
            placeholder="Ask Pam anything about your health..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-full pl-6 pr-24 py-4 sm:py-5 shadow-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 font-medium"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50">
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleSendMessage()}
              disabled={isLoading}
              className="p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
