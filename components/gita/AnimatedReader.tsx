"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useRouter } from "@/navigation";
import { Verse } from "@/types/gita";
import { ReaderControls } from "./ReaderControls";

interface AnimatedReaderProps {
  verses: Verse[];
  chapterName: string;
  chapterId: number;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    rotateY: direction > 0 ? 45 : -45,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    rotateY: 0,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    rotateY: direction < 0 ? 45 : -45,
    scale: 0.9,
  }),
};

export function AnimatedReader({ verses, chapterName, chapterId }: AnimatedReaderProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const router = useRouter();

  const currentVerseIndex = page;
  const currentVerse = verses[currentVerseIndex];

  const paginate = useCallback(
    (newDirection: number) => {
      const nextIndex = page + newDirection;
      if (nextIndex >= 0 && nextIndex < verses.length) {
        setPage([nextIndex, newDirection]);
      } else if (nextIndex >= verses.length) {
        if (chapterId < 18) {
          router.push(`/gita/read/${chapterId + 1}`);
        } else {
          router.push(`/gita`);
        }
      } else if (nextIndex < 0) {
        if (chapterId > 1) {
          router.push(`/gita/read/${chapterId - 1}`);
        } else {
          router.push(`/gita`);
        }
      }
    },
    [page, verses.length, chapterId, router]
  );

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        paginate(1);
      } else if (e.key === "ArrowLeft") {
        paginate(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate]);

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1); // Swipe left -> Next
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1); // Swipe right -> Prev
    }
  };

  if (!verses || verses.length === 0) return null;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden py-12 px-4 md:px-8">
      {/* Chapter Title overlay at top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-center">
        <h2 className="text-xl font-medium tracking-widest text-slate-500 uppercase">
          {chapterName}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Verse {currentVerseIndex + 1} of {verses.length}
        </p>
      </div>

      {/* 3D Perspective Container */}
      <div 
        className="relative flex h-full max-h-[80vh] w-full max-w-4xl items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              rotateY: { type: "spring", stiffness: 200, damping: 25 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute flex w-full flex-col items-center justify-center cursor-grab active:cursor-grabbing bg-[#fdf6e3] dark:bg-[#0f172a] shadow-[0_20px_50px_rgba(8,112,184,0.7)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-8 md:p-16 min-h-[400px]"
          >
            {/* Sanskrit Sloka */}
            <h3 className="text-3xl md:text-5xl font-serif text-amber-900 dark:text-amber-400 text-center leading-relaxed tracking-wide whitespace-pre-line">
              {currentVerse.sloka}
            </h3>
            
            {/* Transliteration */}
            <p className="mt-6 text-center text-sm md:text-base font-medium text-amber-700/70 dark:text-amber-500/70 italic whitespace-pre-line">
              {currentVerse.transliteration}
            </p>

            {/* Translation / Meaning */}
            <p className="text-lg md:text-xl text-slate-800 dark:text-slate-300 mt-8 pt-8 border-t border-amber-900/20 text-center whitespace-pre-line w-full max-w-3xl">
              {currentVerse.meaning}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <ReaderControls 
        currentVerse={currentVerse}
        onNext={() => paginate(1)}
        onPrev={() => paginate(-1)}
        hasPrev={true} // Can always go back (to previous chapter or index)
        hasNext={true} // Can always go forward (to next chapter or index)
      />
    </div>
  );
}
