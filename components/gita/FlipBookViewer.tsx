"use client";

import React, { useState, useRef, forwardRef, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface BookOption {
  label: string;
  value: string;
  url: string;
}

interface FlipBookViewerProps {
  title: string;
  books: BookOption[];
  defaultBook?: string;
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

export function FlipBookViewer({ title, books, defaultBook }: FlipBookViewerProps) {
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
    <div className="flex flex-col items-center w-full h-full bg-[#fdf6e3]/50 dark:bg-[#0f172a]/50 rounded-2xl border border-amber-900/10 overflow-hidden relative">
      
      {/* Top Controls */}
      <div className="w-full flex items-center justify-between p-4 bg-white/80 dark:bg-black/40 backdrop-blur-md border-b border-amber-900/10 z-10 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-600">
            <BookOpen className="size-5" />
            <span className="font-serif font-medium text-amber-950 dark:text-amber-100 hidden sm:inline">{title}</span>
          </div>
          
          <Select value={activeBook} onValueChange={handleBookChange}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {books.map((book) => (
                <SelectItem key={book.value} value={book.value}>
                  {book.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={zoomOut} className="size-8 rounded-full">
            <ZoomOut className="size-4" />
          </Button>
          <span className="text-xs font-medium w-12 text-center text-muted-foreground">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="icon" onClick={zoomIn} className="size-8 rounded-full">
            <ZoomIn className="size-4" />
          </Button>
        </div>
      </div>

      {/* Book Container */}
      <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        <Document
          key={activeBook}
          file={activePdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center text-amber-600">
              <Loader2 className="size-10 animate-spin mb-4" />
              <p className="font-serif animate-pulse">Loading Divine Wisdom...</p>
            </div>
          }
          className="flex items-center justify-center"
        >
          {numPages > 0 && (
            <div className="shadow-2xl ring-1 ring-black/5 transition-transform duration-300 ease-in-out" style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
              {/* @ts-ignore */}
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
                  // Only fully render pages within a +/- 4 page window of the current page to save memory
                  // We must render DOM nodes for all pages so HTMLFlipBook knows the total page count
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
            </div>
          )}
        </Document>
      </div>

      {/* Bottom Navigation */}
      {numPages > 0 && (
        <div className="w-full flex items-center justify-between p-4 bg-white/80 dark:bg-black/40 backdrop-blur-md border-t border-amber-900/10 z-10">
          <Button 
            variant="outline" 
            onClick={prevButtonClick}
            disabled={currentPage === 0}
            className="rounded-full shadow-sm hover:bg-amber-50"
          >
            <ChevronLeft className="size-4 mr-1" /> Prev Page
          </Button>
          
          <div className="text-sm font-serif text-slate-600 dark:text-slate-400 font-medium bg-amber-100/50 dark:bg-amber-900/20 px-4 py-1.5 rounded-full">
            Page {currentPage + 1} of {numPages}
          </div>

          <Button 
            variant="outline" 
            onClick={nextButtonClick}
            disabled={currentPage >= numPages - 1}
            className="rounded-full shadow-sm hover:bg-amber-50"
          >
            Next Page <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
