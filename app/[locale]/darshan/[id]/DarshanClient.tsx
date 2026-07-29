"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Temple } from "@/types/darshan";
import { FlowerShower } from "@/components/darshan/FlowerShower";
import { PujaControls } from "@/components/darshan/PujaControls";
import { AartiPlate } from "@/components/darshan/AartiPlate";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/navigation";

export function DarshanClient({ temple }: { temple: Temple }) {
  const [isShowering, setIsShowering] = useState(false);
  const [isAartiActive, setIsAartiActive] = useState(false);
  const router = useRouter();

  const handleShowerComplete = useCallback(() => {
    setIsShowering(false);
  }, []);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-neutral-950 to-black font-sans">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 p-6 z-40 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="text-white hover:bg-white/10 rounded-full"
        >
          <ArrowLeft className="size-6" />
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 tracking-wider">
            {temple.name}
          </h1>
          <p className="text-xs text-amber-500/80 font-medium tracking-widest uppercase mt-1">
            {temple.location}
          </p>
        </div>
        <div className="size-10" /> {/* Spacer for centering */}
      </div>

      {/* Deity Image Container */}
      <div className="absolute inset-0 flex items-center justify-center pt-16">
        <div className="relative w-full max-w-lg aspect-[3/4] sm:aspect-square md:aspect-[3/4] mx-4 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(251,191,36,0.15)] ring-1 ring-amber-500/20">
          <Image
            src={temple.deity_image_url}
            alt={temple.name}
            fill
            className="object-cover object-top"
            priority
          />
          {/* Inner Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
          
          <div className="absolute bottom-10 left-0 right-0 text-center px-6">
            <p className="text-sm text-slate-300 leading-relaxed drop-shadow-md">
              {temple.description}
            </p>
          </div>
        </div>
      </div>

      {/* The Digital Puja Systems */}
      <FlowerShower isShowering={isShowering} onComplete={handleShowerComplete} />
      <AartiPlate isActive={isAartiActive} />
      
      <PujaControls 
        isShowering={isShowering} 
        onShower={() => setIsShowering(true)} 
        isAartiActive={isAartiActive}
        onAartiToggle={() => setIsAartiActive((p) => !p)}
      />
    </div>
  );
}
