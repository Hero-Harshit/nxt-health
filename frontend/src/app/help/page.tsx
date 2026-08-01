"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, HelpCircle, X, MessageSquare, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { faqData } from '@/data/faqs';

export default function HelpPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Real-time search filtering across questions and answers
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqData;
    
    const lowerQuery = searchQuery.toLowerCase();
    return faqData.map(category => ({
      ...category,
      questions: category.questions.filter(
        q => q.q.toLowerCase().includes(lowerQuery) || q.a.toLowerCase().includes(lowerQuery)
      )
    })).filter(category => category.questions.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8faff] p-4 sm:p-8 font-sans pb-24">
      
      {/* Page Header */}
      <div className="max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-2">
          Help & Support
        </h1>
        <p className="text-gray-500 font-medium">Everything you need to know about navigating NxtHealth.</p>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* 1. Horizontal FAQ Strip */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 bg-blue-50/80 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
              <HelpCircle className="w-7 h-7 text-blue-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Frequently Asked Questions</h2>
              <p className="text-sm text-gray-500 font-medium line-clamp-1">Find quick answers about SOS, Vault, Health Planner & more</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50/50 px-5 py-2.5 rounded-xl group-hover:bg-blue-100 transition-colors shrink-0">
            Browse FAQs <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        {/* 2. Module Explanations Placeholder */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Documentation</h2>
          </div>
          <div className="h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50/50 text-center px-4">
            <p className="text-gray-400 font-bold mb-1">Documentation goes here</p>
            <p className="text-xs text-gray-400 font-medium">Ready for the next injection phase.</p>
          </div>
        </div>

      </div>

      {/* FAQ MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-md">
          <div 
            className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header & Search Bar */}
            <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/30">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-extrabold text-gray-800 flex items-center gap-3">
                  <HelpCircle className="w-7 h-7 text-blue-600" /> Help Center
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search across all utilities, tools, and features..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setExpandedQuestion(null); // Reset accordion on new search
                  }}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Modal Body (Scrollable Results) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white custom-scrollbar">
              {filteredFaqs.length > 0 ? (
                <div className="space-y-10">
                  {filteredFaqs.map((category, catIdx) => (
                    <div key={catIdx} className="space-y-4 animate-in fade-in duration-500">
                      <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest pl-2">
                        {category.category}
                      </h4>
                      <div className="space-y-2">
                        {category.questions.map((item, qIdx) => {
                          const uniqueId = `${catIdx}-${qIdx}`;
                          const isExpanded = expandedQuestion === uniqueId;
                          return (
                            <div 
                              key={qIdx} 
                              className={`border rounded-2xl overflow-hidden transition-all duration-200 ${isExpanded ? 'border-blue-100 bg-blue-50/30 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                            >
                              <button 
                                onClick={() => setExpandedQuestion(isExpanded ? null : uniqueId)}
                                className="w-full text-left px-5 py-4 flex items-center justify-between group/btn"
                              >
                                <span className={`font-bold text-sm pr-4 transition-colors ${isExpanded ? 'text-blue-700' : 'text-gray-700 group-hover/btn:text-blue-600'}`}>
                                  {item.q}
                                </span>
                                <div className={`p-1 rounded-full transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'text-gray-400 group-hover/btn:bg-gray-50'}`}>
                                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                              </button>
                              
                              <div 
                                className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                              >
                                <div className="overflow-hidden">
                                  <div className="px-5 pb-5 pt-1 text-sm text-gray-600 font-medium leading-relaxed">
                                    {item.a}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ASK PAM FALLBACK UI */
                <div className="flex flex-col items-center justify-center h-full text-center py-10 animate-in fade-in zoom-in duration-300">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-70"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-50 to-blue-50 border-4 border-white shadow-lg rounded-full flex items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-indigo-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">No results found</h3>
                  <p className="text-sm text-gray-500 font-medium mb-8 max-w-sm">
                    We couldn't find an exact match, but <strong className="text-gray-700">Pam</strong> knows the NxtHealth platform inside and out.
                  </p>
                  <Link 
                    href="/pam" 
                    onClick={() => setIsModalOpen(false)} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" /> Ask Pam Instead
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
