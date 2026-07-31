"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Play, Pause, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { DirectBookModal } from "./DirectBookModal";
import { PurohitProfileModal } from "./PurohitProfileModal";

interface PurohitCardProps {
  purohit: {
    _id: string;
    name: string;
    languages: string[];
    tradition: string;
    expertise: string[];
    rating: number;
    total_reviews: number;
    price: number;
    experience_years: number;
    education_upadhi: string;
    temple_affiliation?: string | null;
    mantra_audio_url?: string | null;
    gallery_urls: string[];
    distance_in_km: number;
  };
}

// Keep track of currently playing audio globally so only one plays at a time
let currentPlayingAudio: HTMLAudioElement | null = null;
let currentPlayingSetter: ((playing: boolean) => void) | null = null;

export function PurohitCard({ purohit }: PurohitCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      currentPlayingAudio = null;
      currentPlayingSetter = null;
    } else {
      // Pause any other playing audio
      if (currentPlayingAudio && currentPlayingAudio !== audioRef.current) {
        currentPlayingAudio.pause();
        if (currentPlayingSetter) currentPlayingSetter(false);
      }

      audioRef.current.play();
      setIsPlaying(true);
      currentPlayingAudio = audioRef.current;
      currentPlayingSetter = setIsPlaying;
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (currentPlayingAudio === audioRef.current) {
      currentPlayingAudio = null;
      currentPlayingSetter = null;
    }
  };

  // Use the first gallery image as profile pic, or a placeholder
  const profilePic = purohit.gallery_urls.length > 0 
    ? purohit.gallery_urls[0] 
    : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + purohit._id;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative flex flex-col justify-between overflow-hidden trip-sheet p-5 transition-all hover:border-saffron-500/50 hover:shadow-saffron-500/10 sm:flex-row"
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Profile Picture & Audio */}
          <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-2 border-white/10 sm:size-32">
            <Image 
              src={profilePic} 
              alt={purohit.name} 
              fill 
              className="object-cover" 
            />
            {purohit.mantra_audio_url && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button 
                  onClick={toggleAudio}
                  className={`flex size-10 items-center justify-center rounded-full bg-saffron-500 text-white shadow-lg transition-transform hover:scale-110 ${isPlaying ? "animate-pulse" : ""}`}
                >
                  {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 ml-1" />}
                </button>
                <audio 
                  ref={audioRef} 
                  src={purohit.mantra_audio_url} 
                  onEnded={handleAudioEnded}
                  className="hidden" 
                />
              </div>
            )}
            {/* If audio is playing, show a glowing ring */}
            {isPlaying && (
              <div className="absolute inset-0 rounded-full border-2 border-saffron-500 animate-ping opacity-50" />
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">{purohit.name}</h3>
              <CheckCircle2 className="size-5 text-blue-500" />
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-amber-500 text-amber-500" />
                <span className="font-medium text-foreground">{purohit.rating?.toFixed(1) || "0.0"}</span>
                <span className="text-muted-foreground ml-1">({purohit.total_reviews || 0})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="size-4" />
                <span>{purohit.distance_in_km.toFixed(1)} km away</span>
              </div>
              <div className="hidden items-center gap-1 sm:flex">
                <span>• {purohit.experience_years} Yrs Exp</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="secondary" className="bg-saffron-500/10 text-saffron-600 dark:text-saffron-400 border-saffron-500/20">
                {purohit.tradition}
              </Badge>
              {purohit.languages.map(lang => (
                <Badge key={lang} variant="outline" className="text-muted-foreground">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Action & Price */}
        <div className="mt-4 flex shrink-0 flex-col items-start justify-center gap-3 sm:mt-0 sm:items-end">
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground">Starting Dakshina</p>
            <p className="text-2xl font-bold text-foreground">₹{purohit.price}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              className="w-full sm:w-auto border-saffron-500/50 text-saffron-600 hover:bg-saffron-50 dark:border-saffron-400 dark:text-saffron-400 dark:hover:bg-saffron-500/10"
              onClick={() => setIsProfileModalOpen(true)}
            >
              View Profile
            </Button>
            <Button 
              className="w-full bg-gradient-to-r from-saffron-500 to-marigold-500 hover:from-saffron-600 hover:to-marigold-600 text-white sm:w-auto"
              onClick={() => setIsModalOpen(true)}
            >
              Direct Book
            </Button>
          </div>
        </div>
      </motion.div>

      <DirectBookModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        purohitId={purohit._id}
        purohitName={purohit.name}
      />
      <PurohitProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        purohit={purohit}
      />
    </>
  );
}
