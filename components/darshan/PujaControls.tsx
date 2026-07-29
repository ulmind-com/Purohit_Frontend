"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Wind, Drum, Flower2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PujaControlsProps {
  onShower: () => void;
  isShowering: boolean;
  isAartiActive: boolean;
  onAartiToggle: () => void;
}

export function PujaControls({ onShower, isShowering, isAartiActive, onAartiToggle }: PujaControlsProps) {
  const shankhaRef = useRef<HTMLAudioElement | null>(null);
  const dhakRef = useRef<HTMLAudioElement | null>(null);
  const bellRef = useRef<HTMLAudioElement | null>(null);

  const [activeSounds, setActiveSounds] = useState<Record<string, boolean>>({
    shankha: false,
    dhak: false,
    bell: false,
  });

  useEffect(() => {
    shankhaRef.current = new Audio("/sounds/shankha.mp3");
    shankhaRef.current.loop = true;
    
    dhakRef.current = new Audio("/sounds/dhak.mp3");
    dhakRef.current.loop = true;
    
    bellRef.current = new Audio("/sounds/bell.mp3");
    bellRef.current.loop = true;

    // Memory-Safe Audio Engine Cleanup
    return () => {
      const refs = [shankhaRef, dhakRef, bellRef];
      refs.forEach((r) => {
        if (r.current) {
          r.current.pause();
          r.current.src = ""; // Free memory
          r.current = null;
        }
      });
    };
  }, []);

  const toggleSound = async (
    key: "shankha" | "dhak" | "bell",
    ref: React.MutableRefObject<HTMLAudioElement | null>
  ) => {
    if (!ref.current) return;

    try {
      if (ref.current.paused) {
        ref.current.currentTime = 0;
        await ref.current.play();
        setActiveSounds((prev) => ({ ...prev, [key]: true }));
      } else {
        ref.current.pause();
        setActiveSounds((prev) => ({ ...prev, [key]: false }));
      }
    } catch (error) {
      console.error(`Failed to play ${key} audio. Autoplay might be blocked by the browser.`, error);
      setActiveSounds((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleAartiClick = () => {
    const isTurningOn = !isAartiActive;
    onAartiToggle();

    if (isTurningOn) {
      // Turn on Shankha
      if (shankhaRef.current && shankhaRef.current.paused) {
        shankhaRef.current.currentTime = 0;
        shankhaRef.current.play().catch(e => console.error("Shankha play failed", e));
        setActiveSounds(prev => ({ ...prev, shankha: true }));
      }
      // Turn on Dhak
      if (dhakRef.current && dhakRef.current.paused) {
        dhakRef.current.currentTime = 0;
        dhakRef.current.play().catch(e => console.error("Dhak play failed", e));
        setActiveSounds(prev => ({ ...prev, dhak: true }));
      }
      // Turn on Flower Shower
      if (!isShowering) {
        onShower();
      }
    } else {
      // Turn off sounds when Aarti stops
      if (shankhaRef.current && !shankhaRef.current.paused) {
        shankhaRef.current.pause();
        setActiveSounds(prev => ({ ...prev, shankha: false }));
      }
      if (dhakRef.current && !dhakRef.current.paused) {
        dhakRef.current.pause();
        setActiveSounds(prev => ({ ...prev, dhak: false }));
      }
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-4 shadow-2xl">
        <ControlButton
          icon={Wind}
          label="Shankha"
          isActive={activeSounds.shankha}
          onClick={() => toggleSound("shankha", shankhaRef)}
        />
        <ControlButton
          icon={Drum}
          label="Dhak"
          isActive={activeSounds.dhak}
          onClick={() => toggleSound("dhak", dhakRef)}
        />
        <ControlButton
          icon={Bell}
          label="Bell"
          isActive={activeSounds.bell}
          onClick={() => toggleSound("bell", bellRef)}
        />
        <div className="w-px h-8 bg-white/20 mx-2" />
        <ControlButton
          icon={Flower2}
          label="Flower Shower"
          isActive={isShowering}
          onClick={onShower}
          isTrigger
        />
        <ControlButton
          icon={Flame}
          label="Aarti"
          isActive={isAartiActive}
          onClick={handleAartiClick}
        />
      </div>
    </div>
  );
}

function ControlButton({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick,
  isTrigger = false 
}: { 
  icon: any; 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
  isTrigger?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={isTrigger && isActive}
      className={cn(
        "rounded-full size-12 transition-all duration-300",
        isActive
          ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 hover:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-500/50"
          : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent"
      )}
      title={label}
      aria-label={label}
    >
      <Icon className={cn("size-6", isActive && "animate-pulse")} />
    </Button>
  );
}
