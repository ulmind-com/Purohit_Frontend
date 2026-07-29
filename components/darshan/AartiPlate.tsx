"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface AartiPlateProps {
  isActive: boolean;
}

export function AartiPlate({ isActive }: AartiPlateProps) {
  // We can automatically stop after some time, or keep it running until toggled off.
  // The user toggles it off manually or we can add a timeout. We'll leave it manual.

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 150 }}
            animate={{ 
              opacity: 1, 
              scale: [1, 1.1, 1, 1.1, 1], // simulates moving closer and further
              // Large sweeping infinity motion covering the deity
              x: [0, 120, 0, -120, 0],
              y: [100, 20, -40, 20, 100],
              rotateZ: [0, 15, 0, -15, 0],
              rotateX: [0, 20, 0, 20, 0] // slight 3D tilt for realism
            }}
            exit={{ opacity: 0, scale: 0.8, y: 150 }}
            transition={{
              opacity: { duration: 0.8 },
              scale: { repeat: Infinity, duration: 6, ease: "easeInOut" },
              x: { repeat: Infinity, duration: 6, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
              rotateZ: { repeat: Infinity, duration: 6, ease: "easeInOut" },
              rotateX: { repeat: Infinity, duration: 6, ease: "easeInOut" }
            }}
            className="relative size-40 md:size-56 lg:size-64 drop-shadow-[0_20px_50px_rgba(251,191,36,0.5)]"
          >
            {/* 
              The Aarti Plate image. 
              Removed the circular crop so the real shape is preserved.
            */}
            <div className="relative w-full h-full">
              <Image
                src="/images/arati_plate-removebg-preview.png"
                alt="Aarti Plate"
                fill
                className="object-contain drop-shadow-[0_10px_20px_rgba(251,191,36,0.6)] scale-125"
                sizes="(max-width: 768px) 128px, 224px"
                priority
              />
              {/* Inner glow/flame overlay for realistic lighting */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-500/10 to-orange-500/20 mix-blend-overlay animate-pulse rounded-full pointer-events-none" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
