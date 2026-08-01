'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Check, MessageCircle, FileText, Download, Printer } from 'lucide-react';

interface ShareMenuProps {
  title: string;
  content: string;
  fileName?: string;
}

export default function ShareMenu({ title, content, fileName = 'nxthealth-summary' }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Copy to Clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${content}\n\nGenerated via NxtHealth AI`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  // 2. Share on WhatsApp
  const handleWhatsApp = () => {
    const shareText = `*${title}*\n\n${content.substring(0, 800)}...\n\n_Generated on NxtHealth Ecosystem_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  // 3. Download as TXT File
  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([`${title.toUpperCase()}\n${'='.repeat(40)}\n\n${content}\n\n---\nNxtHealth Ecosystem`], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${fileName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setIsOpen(false);
  };

  // 4. Download as PDF / Print
  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title} - NxtHealth</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 40px; color: #111827; line-height: 1.6; }
              h1 { color: #2563eb; font-size: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; }
              .content { font-size: 14px; white-space: pre-wrap; margin-top: 20px; }
              .footer { margin-top: 40px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <div class="content">${content}</div>
            <div class="footer">NxtHealth — A Complete Healthcare Ecosystem</div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
        title="Share or Export"
      >
        <Share2 className="w-3.5 h-3.5 text-blue-600" />
        <span className="hidden sm:inline">Share</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xl border border-gray-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
            <span className={copied ? 'text-emerald-600 font-semibold' : ''}>
              {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
            </span>
          </button>
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Share on WhatsApp</span>
          </button>
          <button
            onClick={handleDownloadTxt}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            <span>Download Text (.txt)</span>
          </button>
          <button
            onClick={handlePrintPdf}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Save as PDF / Print</span>
          </button>
        </div>
      )}
    </div>
  );
}
