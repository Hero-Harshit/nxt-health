'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function PamBlob() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const blobRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, moved: false });
  const router = useRouter();
  const pathname = usePathname();

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
  
  // Hide the blob if we are already inside Pam's dedicated page
  if (pathname === '/pam') return null;

  return (
    <div
      ref={blobRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ 
        left: pos.x, 
        top: pos.y, 
        touchAction: 'none',
        background: 'radial-gradient(circle at 30% 30%, #93c5fd 0%, #3b82f6 50%, #1e40af 100%)'
      }}
      className={`fixed z-[9999] flex items-center justify-center w-[64px] h-[64px] rounded-full cursor-grab active:cursor-grabbing transition-transform select-none
        border-[1px] border-black/20 
        shadow-[0_8px_16px_-4px_rgba(37,99,235,0.4),inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.5)]
        ${isDragging ? 'scale-110' : 'hover:scale-105'}`}
    >
      <span className="text-white text-[11px] font-black tracking-[0.15em] select-none pointer-events-none mt-[1px] ml-[2px] drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.8)]">
        PAM
      </span>
    </div>
  );
}
