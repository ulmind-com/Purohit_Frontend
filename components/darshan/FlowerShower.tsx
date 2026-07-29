"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Petal {
  id: string;
  startX: number;
  delay: number;
  duration: number;
  rotation: number;
  color: string;
}

interface FlowerShowerProps {
  isShowering: boolean;
  onComplete: () => void;
}

export function FlowerShower({ isShowering, onComplete }: FlowerShowerProps) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    if (!isShowering) {
      setPetals([]);
      return;
    }

    // Hydration-safe random value generation
    const newPetals: Petal[] = Array.from({ length: 40 }).map((_, i) => {
      const isAmber = Math.random() > 0.5;
      return {
        id: `petal-${i}-${Date.now()}`,
        startX: Math.random() * 100, // vw
        delay: Math.random() * 2, // 0 to 2s
        duration: 2.5 + Math.random() * 2, // 2.5s to 4.5s
        rotation: Math.random() * 360,
        color: isAmber ? "text-amber-500" : "text-yellow-400",
      };
    });

    setPetals(newPetals);

    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isShowering, onComplete]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            initial={{ y: -100, x: `${petal.startX}vw`, opacity: 0, rotateZ: petal.rotation }}
            animate={{
              y: "105vh",
              x: [`${petal.startX}vw`, `${petal.startX + (Math.random() * 10 - 5)}vw`, `${petal.startX}vw`],
              opacity: [0, 1, 1, 0],
              rotateZ: petal.rotation + 360,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              ease: "easeInOut",
            }}
            className={`absolute top-0 left-0 ${petal.color}`}
          >
            <div className="relative size-6 md:size-8 shadow-sm rounded-full overflow-hidden">
              <Image
                src="/images/genda.avif"
                alt="Marigold"
                fill
                className="object-cover scale-110"
                sizes="40px"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
