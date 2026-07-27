"use client";

import React, { useState, useRef, forwardRef, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface BookOption {
  label: string;
  value: string;
  url: string;
}

interface FlipBookViewerProps {
  title: string;
  books: BookOption[];
  defaultBook?: string;
  audioUrl?: string;
}

interface PdfPageProps {
  pageNumber: number;
  isActive: boolean;
  pageWidth: number;
}

// ForwardRef wrapper for individual pages
const PdfPage = forwardRef<HTMLDivElement, PdfPageProps>(({ pageNumber, isActive, pageWidth }, ref) => {
  return (
    <div className="page bg-[#fdfaf6] overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] border-r border-slate-200" ref={ref}>
      {isActive ? (
        <Page
          pageNumber={pageNumber}
          width={pageWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="w-full h-full flex flex-col items-center justify-center"
          loading={
            <div className="flex h-full w-full items-center justify-center absolute inset-0">
              <Loader2 className="size-6 animate-spin text-amber-500" />
            </div>
          }
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center absolute inset-0">
          <span className="text-amber-900/10 text-4xl font-serif">{pageNumber}</span>
        </div>
      )}
      {/* Page styling for book fold effect */}
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-10" />
    </div>
  );
});
PdfPage.displayName = "PdfPage";

export function FlipBookViewer({ title, books, defaultBook, audioUrl }: FlipBookViewerProps) {
  const [activeBook, setActiveBook] = useState<string>(defaultBook || books[0].value);
  const activePdfUrl = books.find(b => b.value === activeBook)?.url || books[0].url;

  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [windowWidth, setWindowWidth] = useState(1000);
  const flipBookRef = useRef<any>(null);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(0);
  };

  const handleBookChange = (value: string) => {
    setActiveBook(value);
    setNumPages(0);
    setCurrentPage(0);
    setScale(1.0);
  };

  const onFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  const nextButtonClick = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const prevButtonClick = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.8));

  const isMobile = windowWidth < 768;
  const bookWidth = isMobile ? 320 : 450;
  const bookHeight = isMobile ? 480 : 650;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center w-full h-full bg-white/5 dark:bg-black/20 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      
      {/* Top Controls */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        className="w-full flex items-center justify-between p-4 bg-black/20 backdrop-blur-md border-b border-white/5 z-10 flex-wrap gap-4 rounded-t-[2.5rem]"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <BookOpen className="size-5" />
            <span className="font-serif font-medium text-amber-100 hidden sm:inline">{title}</span>
          </div>
          
          <Select value={activeBook} onValueChange={handleBookChange}>
            <SelectTrigger className="w-[180px] h-10 rounded-full border-white/10 bg-black/40 text-amber-100 hover:bg-black/60 transition-colors">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/90 backdrop-blur-xl border-white/10 text-amber-100 rounded-2xl">
              {books.map((book) => (
                <SelectItem key={book.value} value={book.value} className="focus:bg-amber-500/20 focus:text-amber-300 cursor-pointer">
                  {book.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {audioUrl && (
            <div className="hidden md:flex items-center gap-3 bg-black/40 rounded-full pr-2 pl-4 border border-white/10 shadow-inner">
              <BookOpen className="size-4 text-amber-500/80 animate-pulse" />
              <audio controls controlsList="nodownload" className="h-10 w-64 max-w-full opacity-80 hover:opacity-100 transition-opacity [&::-webkit-media-controls-panel]:bg-transparent [&::-webkit-media-controls-current-time-display]:text-amber-100 [&::-webkit-media-controls-time-remaining-display]:text-amber-100 [&::-webkit-media-controls-play-button]:invert">
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

        <div className="flex items-center gap-1 bg-black/40 rounded-full p-1 border border-white/10">
          <Button variant="ghost" size="icon" onClick={zoomOut} className="size-8 rounded-full text-amber-100 hover:bg-white/10 hover:text-white">
            <ZoomOut className="size-4" />
          </Button>
          <span className="text-xs font-medium w-12 text-center text-amber-100/70">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={zoomIn} className="size-8 rounded-full text-amber-100 hover:bg-white/10 hover:text-white">
            <ZoomIn className="size-4" />
          </Button>
        </div>
      </motion.div>

      {/* Book Container */}
      <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
        <Document
          key={activeBook}
          file={activePdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-amber-500 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
            >
              <Loader2 className="size-12 animate-spin mb-6" />
              <p className="font-serif text-xl tracking-widest uppercase text-amber-200/80 animate-pulse">Summoning Sacred Texts...</p>
            </motion.div>
          }
          className="flex items-center justify-center"
        >
          {numPages > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10 rounded-lg transition-transform duration-300 ease-in-out" 
              style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
            >
              <HTMLFlipBook
                width={bookWidth}
                height={bookHeight}
                size="fixed"
                minWidth={300}
                maxWidth={600}
                minHeight={400}
                maxHeight={800}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                onFlip={onFlip}
                className="flipbook-component"
                ref={flipBookRef}
                style={{}}
                startPage={0}
                drawShadow={true}
                flippingTime={1000}
                usePortrait={isMobile}
                startZIndex={0}
                autoSize={true}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                disableFlipByClick={false}
              >
                {Array.from(new Array(numPages), (el, index) => {
                  const isActive = Math.abs(currentPage - index) <= 4;
                  return (
                    <PdfPage
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      isActive={isActive}
                      pageWidth={bookWidth}
                    />
                  );
                })}
              </HTMLFlipBook>
            </motion.div>
          )}
        </Document>
      </div>

      {/* Bottom Navigation */}
      <AnimatePresence>
      {numPages > 0 && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="w-full flex items-center justify-between p-4 bg-black/20 backdrop-blur-md border-t border-white/5 z-10 rounded-b-[2.5rem]"
        >
          <Button 
            variant="ghost" 
            onClick={prevButtonClick}
            disabled={currentPage === 0}
            className="rounded-full shadow-sm hover:bg-white/10 text-amber-100 hover:text-white border border-transparent hover:border-white/10 px-6 transition-all"
          >
            <ChevronLeft className="size-4 mr-2" /> Prev Page
          </Button>
          
          <div className="text-sm font-serif text-amber-200/80 font-medium bg-black/40 border border-white/10 shadow-inner px-6 py-2 rounded-full tracking-wider">
            Page {currentPage + 1} of {numPages}
          </div>

          <Button 
            variant="ghost" 
            onClick={nextButtonClick}
            disabled={currentPage >= numPages - 1}
            className="rounded-full shadow-sm hover:bg-white/10 text-amber-100 hover:text-white border border-transparent hover:border-white/10 px-6 transition-all"
          >
            Next Page <ChevronRight className="size-4 ml-2" />
          </Button>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
