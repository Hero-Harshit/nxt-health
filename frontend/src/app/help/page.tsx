"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, HelpCircle, X, MessageSquare, ChevronDown, ChevronRight, BookOpen, Mail, Lightbulb, ExternalLink, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { faqData } from '@/data/faqs';
import { moduleDocs, DocModule } from '@/data/documentation';
import { PROBLEM_STATEMENTS, MAIN_PLATFORM_PROBLEM } from '@/data/problemStatements';

export default function HelpPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<DocModule | null>(null);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
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

        {/* FULL-WIDTH HORIZONTAL CARD: Light Blue Platform Theme */}
        <div className="mt-12 w-full">
          <div 
            onClick={() => setIsProblemModalOpen(true)}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-indigo-50/80 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md border border-blue-100/90 transition-all cursor-pointer active:scale-[0.99]"
          >
            {/* Soft Ambient Background Glow */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl group-hover:bg-blue-300/40 transition-all pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Left Content Area */}
              <div className="space-y-2.5 max-w-2xl">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/80 border border-blue-200/80 rounded-full text-xs font-bold text-blue-800">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Platform Vision & Engineering Architecture</span>
                </div>
                {/* Title (Dark Text) */}
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
                  Comprehensive List of Problem Statements
                </h2>
                {/* Description Paragraph (Readable Slate Text) */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                  Discover how NxtHealth addresses systemic healthcare challenges—from emergency response delays to medical billing opacity—with structured technology solutions.
                </p>
              </div>
              {/* Right Action Button */}
              <div className="shrink-0">
                <button className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-blue-600/20 transition-all group-hover:translate-x-1">
                  <span>Explore Solutions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Module Explanations Placeholder */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Documentation</h2>
          </div>
          {/* Dynamic Documentation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {moduleDocs.map((doc) => {
              const Icon = doc.icon;
              return (
                <button 
                  key={doc.id}
                  onClick={() => {
                    if (doc.isModalTrigger) {
                      setIsSuggestModalOpen(true);
                    } else {
                      setActiveDoc(doc);
                    }
                  }}
                  className={`group text-left p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 ${doc.border}`}
                >
                  <div className="flex flex-col items-start gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${doc.bg}`}>
                      <Icon className={`w-6 h-6 ${doc.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. Support & Direct Contact Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Support & Direct Contact</h2>
          </div>
          <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/30 border border-purple-100/60 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-base mb-1">Still need help?</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                If you encounter any issues or have questions not covered in our documentation, feel free to reach out directly to our team.
              </p>
            </div>
            <a 
              href="mailto:heroharshitlaptop@gmail.com"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-purple-500/20 hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
            >
              <Mail className="w-4 h-4" /> Email Support
            </a>
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
      {/* DOCUMENTATION READING MODAL */}
      {activeDoc && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm">
          <div 
            className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-6 sm:p-8 border-b border-gray-100 ${activeDoc.bg} bg-opacity-30`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-white shadow-sm ${activeDoc.color}`}>
                    <activeDoc.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900">{activeDoc.title}</h3>
                    <p className="text-sm font-medium text-gray-600 mt-1">{activeDoc.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveDoc(null)} 
                  className="p-2 bg-white/50 hover:bg-white text-gray-600 rounded-full transition-colors shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Rich Text Reading Area) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white custom-scrollbar">
              <div className="space-y-8">
                {activeDoc.content.map((section, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                      {section.heading}
                    </h4>
                    {section.body && (
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">
                        {section.body}
                      </p>
                    )}
                    {section.list && (
                      <ul className="space-y-2 mt-3">
                        {section.list.map((listItem, lIdx) => (
                          <li key={lIdx} className="flex items-start gap-3 text-sm text-gray-600 font-medium leading-relaxed">
                            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${activeDoc.color.replace('text-', 'bg-')}`} />
                            {listItem}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Suggest Us Modal */}
      {isSuggestModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setIsSuggestModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Lightbulb Icon Badge */}
            <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/10">
              <Lightbulb className="w-7 h-7" />
            </div>

            {/* Title & Explanation */}
            <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">
              We’re Listening! 💡
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              We are always actively listening to feedback and continuously improving our platform. Have an idea for a feature or utility we don’t have yet? We’d love to hear it!
            </p>

            {/* Action CTA Button */}
            <a
              href="mailto:heroharshitlaptop@gmail.com?subject=NxtHealth%20Feature%20Suggestion&body=Hi%20NxtHealth%20Team%2C%0A%0AI%20have%20a%20feature%20suggestion%20for%20the%20platform%3A%0A%0A"
              onClick={() => setIsSuggestModalOpen(false)}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all active:scale-95 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Suggest a Feature</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      )}
      {/* Problem Statements & Solutions Modal */}
      {isProblemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 sm:p-8 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800 shrink-0">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>NxtHealth Problem & Solution Architecture</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Problem Statements & Impact Matrix
                </h2>
              </div>
              <button
                onClick={() => setIsProblemModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body - Scrollable */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-slate-50/50">
              
              {/* Main Overarching Platform Problem Hero Box */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-6 space-y-3">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  OVERARCHING PLATFORM MISSION
                </span>
                <h3 className="text-lg font-bold text-blue-950">
                  {MAIN_PLATFORM_PROBLEM.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed pt-1">
                  <div className="bg-white/80 p-3.5 rounded-xl border border-blue-100">
                    <strong className="text-red-700 block mb-1 font-bold">⚠️ Core Problem:</strong>
                    <span className="text-slate-700">{MAIN_PLATFORM_PROBLEM.problem}</span>
                  </div>
                  <div className="bg-white/80 p-3.5 rounded-xl border border-blue-100">
                    <strong className="text-emerald-700 block mb-1 font-bold">💡 NxtHealth Solution:</strong>
                    <span className="text-slate-700">{MAIN_PLATFORM_PROBLEM.solution}</span>
                  </div>
                </div>
              </div>
              {/* Priority-Ordered Feature Cards List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Feature-by-Feature Problem Statements (Ranked by Priority)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {PROBLEM_STATEMENTS.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-extrabold rounded-md border border-slate-200">
                            {item.badge}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {item.category}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
                        <div className="p-3 bg-red-50/50 rounded-xl border border-red-100/60 text-slate-700">
                          <strong className="text-red-700 block text-[11px] font-bold mb-0.5">Problem Statement:</strong>
                          {item.problem}
                        </div>
                        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60 text-slate-700">
                          <strong className="text-emerald-700 block text-[11px] font-bold mb-0.5">How NxtHealth Solves It:</strong>
                          {item.solution}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                onClick={() => setIsProblemModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
