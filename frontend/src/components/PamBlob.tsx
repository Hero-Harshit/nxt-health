'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function PamBlob() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const blobRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, moved: false });
  const router = useRouter();

  useEffect(() => {
    // Initialize in the bottom right corner
    setPos({ 
      x: window.innerWidth - 100, 
      y: window.innerHeight - 120 
    });
    setIsMounted(true);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y,
      moved: false
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;

    // If moved more than 5 pixels, consider it a drag, not a click
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragInfo.current.moved = true;
      if (!isDragging) setIsDragging(true);
      
      setPos({
        x: dragInfo.current.initialX + dx,
        y: dragInfo.current.initialY + dy
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    if (!dragInfo.current.moved) {
      // It was a click! Route to Pam's dedicated page
      router.push('/pam');
    }
  };

  if (!isMounted) return null;

  return (
    <div
      ref={blobRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ 
        left: pos.x, 
        top: pos.y, 
        touchAction: 'none' // Prevents scrolling while dragging on mobile
      }}
      className={`fixed z-[9999] flex items-center justify-center w-16 h-16 rounded-full cursor-grab active:cursor-grabbing shadow-2xl shadow-blue-500/40 border-2 border-white/70 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 text-white transition-transform select-none ${
        isDragging ? 'scale-110' : 'hover:scale-105'
      }`}
    >
      {/* Subtle breathing effect layer */}
      <div className="absolute inset-0 rounded-full animate-pulse opacity-40 bg-white/20 pointer-events-none" />
      
      {/* Text */}
      <span className="relative z-10 text-[15px] font-black tracking-[0.2em] drop-shadow-md ml-[2px]">
        PAM
      </span>
    </div>
  );
}
