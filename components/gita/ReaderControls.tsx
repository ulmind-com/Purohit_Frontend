"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Verse } from "@/types/gita"; // We'll assume this type exists or define it locally

interface ReaderControlsProps {
  currentVerse: Verse;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function ReaderControls({ currentVerse, onNext, onPrev, hasPrev, hasNext }: ReaderControlsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Sync Audio with Verse Change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [currentVerse.id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 rounded-full border border-white/20 bg-white/40 px-6 py-3 shadow-2xl backdrop-blur-2xl dark:bg-black/40">
      
      {/* Hidden Audio Element */}
      {currentVerse.audio_url && (
        <audio
          ref={audioRef}
          src={currentVerse.audio_url}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}

      {/* Prev Button */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-black/10 dark:hover:bg-white/10"
        onClick={onPrev}
        disabled={!hasPrev}
      >
        <ChevronLeft className="size-6 text-slate-800 dark:text-slate-200" />
      </Button>

      {/* Play/Pause Button */}
      <Button
        size="icon"
        className={`relative size-14 shrink-0 rounded-full bg-amber-600 text-white shadow-xl hover:bg-amber-700 dark:bg-amber-500 dark:text-amber-950 dark:hover:bg-amber-600 ${
          !isPlaying && currentVerse.audio_url ? "animate-pulse" : ""
        }`}
        onClick={togglePlay}
        disabled={!currentVerse.audio_url}
      >
        {isPlaying ? (
          <Pause className="size-6" />
        ) : (
          <Play className="ml-1 size-6" />
        )}
      </Button>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-black/10 dark:hover:bg-white/10"
        onClick={onNext}
        disabled={!hasNext}
      >
        <ChevronRight className="size-6 text-slate-800 dark:text-slate-200" />
      </Button>

      {/* Mute Toggle (Optional but good for UX) */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-16 rounded-full bg-white/40 hover:bg-black/10 dark:bg-black/40 dark:hover:bg-white/10 backdrop-blur-md hidden sm:flex"
        onClick={toggleMute}
      >
        {isMuted ? (
          <VolumeX className="size-5 text-slate-800 dark:text-slate-200" />
        ) : (
          <Volume2 className="size-5 text-slate-800 dark:text-slate-200" />
        )}
      </Button>
    </div>
  );
}
