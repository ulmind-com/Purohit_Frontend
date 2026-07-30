"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/navigation";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeChalisaReading } from "@/lib/api/hanuman-chalisa";
import { HANUMAN_CHALISA_VERSES, MILESTONES } from "@/lib/data/hanuman-chalisa-data";
import { ChevronLeft, ChevronRight, Minus, Plus, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOTAL_PAGES = HANUMAN_CHALISA_VERSES.length;

function playPageSound() {
  try {
    const ctx = new window.AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

function playCompletionBell() {
  try {
    const ctx = new window.AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.3);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  } catch {}
}

export default function HanumanChalisaPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(20);
  const [isCompleted, setIsCompleted] = useState(false);
  const [direction, setDirection] = useState(1);
  
  const touchStartX = useRef<number | null>(null);

  const completeMutation = useMutation({
    mutationFn: completeChalisaReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chalisa-status"] });
    },
  });

  useEffect(() => {
    const savedPage = localStorage.getItem("chalisa_current_page");
    if (savedPage) {
      const parsed = parseInt(savedPage, 10);
      if (parsed >= 1 && parsed <= TOTAL_PAGES) setCurrentPage(parsed);
    }
    const savedFontSize = localStorage.getItem("chalisa_font_size");
    if (savedFontSize) {
      const parsedFs = parseInt(savedFontSize, 10);
      if (parsedFs >= 16 && parsedFs <= 32) setFontSize(parsedFs);
    }
  }, []);

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= TOTAL_PAGES) {
      setDirection(newPage > currentPage ? 1 : -1);
      setCurrentPage(newPage);
      localStorage.setItem("chalisa_current_page", newPage.toString());
      playPageSound();
    } else if (newPage > TOTAL_PAGES && !isCompleted) {
      finishReading();
    }
  };

  const adjustFontSize = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.max(16, Math.min(32, prev + delta));
      localStorage.setItem("chalisa_font_size", next.toString());
      return next;
    });
  };

  const finishReading = () => {
    setIsCompleted(true);
    playCompletionBell();
    localStorage.removeItem("chalisa_current_page");
    completeMutation.mutate();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        changePage(currentPage + 1);
      } else {
        changePage(currentPage - 1);
      }
    }
    touchStartX.current = null;
  };

  if (isCompleted) {
    const stats = completeMutation.data || {
      streak_count: 1,
      best_streak: 1,
      total_reads: 1,
      next_milestone: 3,
      milestone_progress: "33%",
      milestone_message: "Keep going!",
    };

    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-orange-100 to-red-50 p-4">
        {/* Confetti overlay simulated by CSS/Framer motion elements if desired, skipping for brevity but standard celebration works */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ type: "spring", damping: 12 }}
          className="text-center w-full max-w-md bg-white/60 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-orange-200"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-4"
          >
            🙏
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Jay Shree Ram!
          </h1>
          <p className="text-orange-800 font-medium mb-8">Reading Completed Successfully</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200 shadow-sm">
              <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider mb-1">Day Streak</p>
              <p className="text-3xl font-bold text-orange-900 flex items-center justify-center gap-2">
                <FlameIcon /> {stats.streak_count}
              </p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200 shadow-sm">
              <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider mb-1">Total Reads</p>
              <p className="text-3xl font-bold text-orange-900">{stats.total_reads}</p>
            </div>
          </div>

          <div className="mb-8 text-left bg-white/50 p-4 rounded-xl border border-orange-100">
            <div className="flex justify-between text-xs font-semibold text-orange-800 mb-2">
              <span>Next Milestone: {stats.next_milestone}</span>
              <span>{stats.milestone_progress}</span>
            </div>
            <div className="w-full h-3 bg-orange-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: stats.milestone_progress }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              />
            </div>
            <p className="text-xs text-center mt-3 text-orange-700 italic">{stats.milestone_message}</p>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl h-14 text-lg font-semibold shadow-lg shadow-orange-500/30"
            onClick={() => router.push("/user")}
          >
            <Home className="mr-2 h-5 w-5" /> Go Home
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentVerse = HANUMAN_CHALISA_VERSES[currentPage - 1];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col font-sans pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-orange-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/user">
          <Button variant="ghost" size="icon" className="text-orange-700 hover:bg-orange-100 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="flex-1 px-4">
          <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-orange-400 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentPage / TOTAL_PAGES) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-center text-xs font-semibold text-orange-600 mt-1">
            {currentPage} / {TOTAL_PAGES}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => adjustFontSize(-2)} className="h-8 w-8 text-orange-700 hover:bg-orange-100 rounded-full">
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => adjustFontSize(2)} className="h-8 w-8 text-orange-700 hover:bg-orange-100 rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reader Area */}
      <div 
        className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900 via-transparent to-transparent" />
        
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-2xl text-center z-10"
          >
            <div className="mb-6 inline-block">
              <span className="px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-sm font-semibold tracking-widest uppercase shadow-sm">
                {currentVerse.title}
              </span>
            </div>
            
            <div className="space-y-6 sm:space-y-8">
              {currentVerse.lines.map((line, idx) => (
                <p 
                  key={idx} 
                  className="text-orange-950 font-medium leading-relaxed drop-shadow-sm transition-all duration-300"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-orange-50 via-orange-50/90 to-transparent">
        <div className="max-w-2xl mx-auto flex justify-between gap-4">
          <Button 
            variant="outline" 
            className="flex-1 h-14 rounded-2xl border-orange-200 bg-white/80 hover:bg-orange-50 text-orange-800 text-lg shadow-sm"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Prev
          </Button>
          
          <Button 
            className={`flex-1 h-14 rounded-2xl text-lg shadow-md transition-all ${
              currentPage === TOTAL_PAGES 
                ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white animate-pulse" 
                : "bg-orange-600 hover:bg-orange-700 text-white"
            }`}
            onClick={() => changePage(currentPage + 1)}
          >
            {currentPage === TOTAL_PAGES ? (
              <><Sparkles className="mr-2 h-5 w-5" /> Finish Reading</>
            ) : (
              <>Next <ChevronRight className="ml-2 h-5 w-5" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FlameIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12C20 8.68629 17.3137 6 14 6C13.1361 6 12 4 12 2C12 2 4 6 4 12C4 15.3137 6.68629 18 10 18C10.8639 18 12 20 12 22Z" fill="#F97316"/>
    </svg>
  );
}
