"use client";

import { motion } from "framer-motion";

interface Blob {
  className: string;
  color: string;
  size: number;
  initial: { x: string; y: string };
  animate: { x: string[]; y: string[] };
  duration: number;
}

const BLOBS: Blob[] = [
  {
    className: "top-[-10%] left-[-5%]",
    color: "var(--color-saffron-400)",
    size: 620,
    initial: { x: "0%", y: "0%" },
    animate: { x: ["0%", "8%", "0%"], y: ["0%", "6%", "0%"] },
    duration: 22,
  },
  {
    className: "top-[10%] right-[-10%]",
    color: "var(--color-marigold-400)",
    size: 560,
    initial: { x: "0%", y: "0%" },
    animate: { x: ["0%", "-6%", "0%"], y: ["0%", "8%", "0%"] },
    duration: 26,
  },
  {
    className: "bottom-[-15%] left-[15%]",
    color: "var(--color-aurora-rose-400)",
    size: 520,
    initial: { x: "0%", y: "0%" },
    animate: { x: ["0%", "6%", "0%"], y: ["0%", "-8%", "0%"] },
    duration: 24,
  },
  {
    className: "bottom-[5%] right-[10%]",
    color: "var(--color-aurora-violet-400)",
    size: 420,
    initial: { x: "0%", y: "0%" },
    animate: { x: ["0%", "-5%", "0%"], y: ["0%", "-5%", "0%"] },
    duration: 20,
  },
];

/**
 * Fixed, decorative, pointer-events-none layer of large blurred color blobs
 * behind every page. Glass surfaces (Card, Popover, Dialog, ...) only read
 * as "glass" when there is something colorful and varied for the blur to
 * pick up — a flat single-tone background makes frosted panels look like
 * plain translucent gray boxes.
 */
export function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${blob.className}`}
          style={{
            width: blob.size,
            height: blob.size,
            background: blob.color,
            filter: "blur(110px)",
            opacity: 0.5,
          }}
          initial={blob.initial}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      <div className="absolute inset-0 dark:bg-black/10" />
    </div>
  );
}
