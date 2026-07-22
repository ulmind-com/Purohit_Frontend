"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const RINGS = [0, 1, 2];

/** Full-bleed radar sweep used while a booking request is broadcasting to nearby Purohits. */
export function SearchingRadar({ label }: { label: string }) {
  return (
    <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
      {RINGS.map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-saffron-400/60"
          initial={{ width: 40, height: 40, opacity: 0.8 }}
          animate={{ width: 320, height: 320, opacity: 0 }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 0.85,
          }}
        />
      ))}

      <motion.div
        className="absolute inset-6 rounded-full bg-gradient-to-br from-saffron-100/60 to-marigold-100/40 dark:from-saffron-900/20 dark:to-marigold-900/10"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="saffron-gradient relative z-10 flex size-20 items-center justify-center rounded-full text-white shadow-lg"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="size-8" />
      </motion.div>

      <div className="absolute -bottom-2 left-1/2 w-max -translate-x-1/2 text-center">
        <p className="font-medium">{label}</p>
      </div>
    </div>
  );
}
