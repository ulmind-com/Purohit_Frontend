"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Volume2, VolumeX, Trophy, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api/axios";
import { JapMalaLeaderboard } from "@/components/dashboard/jap-mala-leaderboard";

// --- Web Audio Synthesizers --- //

const playBeadSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.06);
};

const playBellSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  
  const freqs = [400, 520, 800, 1040, 1200];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5 / freqs.length, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2 + i * 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 4);
  });
};

// --- Gada Ful (Marigold) Confetti Component --- //
const FlowerConfetti = () => {
  const flowers = Array.from({ length: 40 });
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {flowers.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 3 + Math.random() * 2;
        const size = 30 + Math.random() * 30;
        const rotation = Math.random() * 360;

        return (
          <motion.div
            key={i}
            initial={{ y: -100, x: `${left}vw`, rotate: rotation, opacity: 0 }}
            animate={{
              y: "110vh",
              x: `${left + (Math.random() * 20 - 10)}vw`,
              rotate: rotation + 360,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: duration,
              delay: delay,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="absolute drop-shadow-lg"
            style={{ width: size, height: size }}
          >
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M50 10 L55 35 L80 25 L65 45 L90 60 L65 65 L70 90 L50 70 L30 90 L35 65 L10 60 L35 45 L20 25 L45 35 Z"
                fill="#f97316"
              />
              <path
                d="M50 20 L53 40 L70 35 L60 50 L75 60 L58 62 L60 80 L50 65 L40 80 L42 62 L25 60 L40 50 L30 35 L47 40 Z"
                fill="#fb923c"
              />
              <circle cx="50" cy="50" r="8" fill="#facc15" />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
};

export default function JapMalaPage() {
  const t = useTranslations("Navigation");
  const [count, setCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedCount = localStorage.getItem("japMalaCount");
    const savedRounds = localStorage.getItem("japMalaRounds");
    if (savedCount) setCount(parseInt(savedCount, 10));
    if (savedRounds) setRounds(parseInt(savedRounds, 10));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("japMalaCount", count.toString());
      localStorage.setItem("japMalaRounds", rounds.toString());
    }
  }, [count, rounds, mounted]);

  const handleBeadClick = async () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (soundEnabled) {
      playBeadSound();
    }

    if (count + 1 >= 108) {
      setCount(0);
      setRounds((prev) => prev + 1);
      setShowCelebration(true);
      if (soundEnabled) {
        setTimeout(playBellSound, 300); // Slight delay for dramatic effect
      }
      
      try {
        await api.post("/japmala/sync", { malas_completed: 1 });
      } catch (error) {
        console.error("Failed to sync jap mala count", error);
      }

      setTimeout(() => setShowCelebration(false), 5000); // Celebration duration
    } else {
      setCount((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your counting?")) {
      setCount(0);
      setRounds(0);
    }
  };

  if (!mounted) return null;

  const progressPercentage = (count / 108) * 100;

  return (
    <div className="mx-auto flex min-h-[75vh] w-full max-w-6xl flex-col items-start justify-center gap-8 p-4 lg:flex-row lg:items-center">
      
      {/* Jap Mala Widget */}
      <div className="relative w-full max-w-md shrink-0 overflow-hidden rounded-3xl border border-white/40 bg-white/50 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/60">
        
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-2xl font-black tracking-tight text-transparent">
            {t("japMala")}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="rounded-full bg-black/5 p-2 text-muted-foreground transition-colors hover:bg-orange-500/10 hover:text-orange-500 dark:bg-white/5 dark:hover:bg-orange-500/20"
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button
              onClick={handleReset}
              className="rounded-full bg-black/5 p-2 text-muted-foreground transition-colors hover:bg-red-500/20 hover:text-red-500 dark:bg-white/5"
              title="Reset Counter"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Progress Display */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative flex size-32 items-center justify-center rounded-full">
            {/* Glowing progress ring */}
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-black/5 dark:text-white/5"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progressPercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-foreground drop-shadow-md">
                {count}
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                / 108
              </span>
            </div>
          </div>
        </div>

        {/* The Realistic 3D Bead Area */}
        <div className="relative mb-10 flex h-64 w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-black/5 shadow-inner dark:bg-black/40">
          
          {/* Sacred Thread */}
          <div className="absolute top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-900/40 via-orange-500/70 to-orange-900/40 shadow-sm" />

          {/* Interactive Bead with AnimatePresence for real sliding effect */}
          <AnimatePresence mode="popLayout">
            <motion.button
              key={count}
              initial={{ y: -150, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 150, opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={handleBeadClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="z-10 flex size-28 items-center justify-center rounded-full active:cursor-grabbing"
              style={{
                // Hyper-realistic 3D Rudraksha/Tulsi bead texture using advanced CSS gradients
                background: "radial-gradient(circle at 35% 35%, #fb923c 0%, #c2410c 40%, #7c2d12 80%, #431407 100%)",
                boxShadow: "inset -12px -12px 24px rgba(0,0,0,0.5), inset 6px 6px 16px rgba(255,255,255,0.3), 0 12px 24px rgba(0,0,0,0.4)"
              }}
            >
              {/* Center hole of the bead */}
              <div className="size-4 rounded-full bg-black/80 shadow-inner ring-1 ring-orange-900/50" />
            </motion.button>
          </AnimatePresence>

          <div className="pointer-events-none absolute bottom-4 text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Pull Bead Down
          </div>
        </div>

        {/* Rounds Counter Footer */}
        <div className="flex items-center justify-center gap-4 rounded-2xl border border-orange-500/20 bg-orange-500/10 py-4 shadow-sm dark:bg-orange-500/5">
          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg">
            <Trophy size={24} />
          </div>
          <div>
            <div className="text-3xl font-black text-foreground drop-shadow-sm">{rounds}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Malas Completed
            </div>
          </div>
        </div>

        {/* Divine Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <>
              <FlowerConfetti />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.5 } }}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center rounded-3xl bg-white/95 backdrop-blur-xl dark:bg-black/95"
              >
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
                  className="mb-6 text-saffron-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                >
                  <Sparkles size={80} />
                </motion.div>
                <h2 className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-center text-4xl font-black text-transparent">
                  1 Mala Completed!
                </h2>
                <p className="mt-4 max-w-[80%] text-center font-medium leading-relaxed text-muted-foreground">
                  You have successfully chanted 108 times. May you be blessed with peace and prosperity.
                </p>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Realtime Leaderboard Widget */}
      <div className="w-full max-w-md lg:w-96">
        <JapMalaLeaderboard />
      </div>
    </div>
  );
}
