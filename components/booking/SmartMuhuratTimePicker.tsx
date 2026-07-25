"use client";

import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sparkles, CheckCircle2, ShieldCheck, SunMedium } from "lucide-react";
import { getShubhMuhuratSlots } from "@/lib/api/bookings";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SmartMuhuratTimePickerProps {
  selectedDate: Date;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  lat?: number;
  lng?: number;
  className?: string;
}

const DEFAULT_TIME_SLOTS = [
  "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", 
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM"
];

export function SmartMuhuratTimePicker({
  selectedDate,
  selectedTime,
  onSelectTime,
  lat = 22.5726,
  lng = 88.3639,
  className,
}: SmartMuhuratTimePickerProps) {
  const [filterMode, setFilterMode] = useState<"all" | "shubh">("shubh");

  const dateStr = useMemo(() => {
    try {
      return format(selectedDate, "yyyy-MM-dd");
    } catch {
      return format(new Date(), "yyyy-MM-dd");
    }
  }, [selectedDate]);

  const formattedDisplayDate = useMemo(() => {
    try {
      return format(selectedDate, "EEEE, MMMM d, yyyy");
    } catch {
      return "";
    }
  }, [selectedDate]);

  const { data, isLoading } = useQuery({
    queryKey: ["shubh-time-slots", dateStr, lat, lng],
    queryFn: () => getShubhMuhuratSlots(dateStr, lat, lng),
    staleTime: 12 * 60 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: !!dateStr,
  });

  const slots = useMemo(() => {
    if (data?.slots && data.slots.length > 0) {
      return data.slots;
    }
    // Fallback if data loading
    return DEFAULT_TIME_SLOTS.map((t) => ({
      time: t,
      is_auspicious: t === "11:30 AM" || t === "08:00 AM" || t === "05:00 PM",
      muhurat_name: t === "11:30 AM" ? "Abhijit Muhurat" : "Shubh Choghadiya",
      category: t === "11:30 AM" ? "Abhijit" : "Shubh",
    }));
  }, [data]);

  const auspiciousSlotsCount = useMemo(() => {
    return slots.filter((s) => s.is_auspicious).length;
  }, [slots]);

  const visibleSlots = useMemo(() => {
    if (filterMode === "shubh") {
      const shubh = slots.filter((s) => s.is_auspicious);
      return shubh.length > 0 ? shubh : slots;
    }
    return slots;
  }, [slots, filterMode]);

  const selectedSlotData = useMemo(() => {
    return slots.find((s) => s.time === selectedTime);
  }, [slots, selectedTime]);

  return (
    <div className={cn("space-y-4 rounded-2xl border bg-card p-4 shadow-sm", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Clock className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              Select Start Time
              <Badge variant="secondary" className="gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                <Sparkles className="size-3 text-emerald-500" /> Shubh Muhurat
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">{formattedDisplayDate}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterMode("shubh")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition-all",
              filterMode === "shubh"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            ✨ Shubh Slots ({auspiciousSlotsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition-all",
              filterMode === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All Slots ({slots.length})
          </button>
        </div>
      </div>

      {/* Summary Card for Shubh Muhurats */}
      {data?.auspicious_summary && data.auspicious_summary.length > 0 && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2 font-medium">
            <SunMedium className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Panchang Shubh Muhurat:</strong> Highlighting {auspiciousSlotsCount} blessed time windows today:
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {data.auspicious_summary.map((summaryName) => (
              <span
                key={summaryName}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300"
              >
                ✨ {summaryName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Time Slots */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {visibleSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isAuspicious = slot.is_auspicious;

          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => onSelectTime(slot.time)}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl p-2.5 text-center text-xs font-semibold transition-all hover:scale-[1.02]",
                isSelected && isAuspicious
                  ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-background"
                  : isSelected
                  ? "bg-saffron-500 text-white shadow-md ring-2 ring-saffron-500 ring-offset-2 dark:ring-offset-background"
                  : isAuspicious
                  ? "border-2 border-emerald-400/80 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                  : "border border-border bg-card text-foreground hover:bg-accent"
              )}
            >
              <div className="flex items-center gap-1">
                <span>{slot.time}</span>
                {isAuspicious && !isSelected && (
                  <span className="text-[10px]">✨</span>
                )}
              </div>

              {/* Muhurat Sub-label Badge */}
              {isAuspicious && (
                <span
                  className={cn(
                    "mt-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none uppercase tracking-wide truncate max-w-full",
                    isSelected
                      ? "bg-white/20 text-white"
                      : slot.category === "Abhijit"
                      ? "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                      : "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                  )}
                >
                  {slot.category === "Abhijit" ? "🟢 Abhijit" : `✨ ${slot.category || "Shubh"}`}
                </span>
              )}

              {isSelected && (
                <motion.span
                  layoutId="active-slot-check"
                  className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm"
                >
                  <CheckCircle2 className="size-3" />
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Slot Feedback Banner */}
      {selectedSlotData && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTime}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center justify-between rounded-xl p-3 text-xs font-medium border",
              selectedSlotData.is_auspicious
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                : "bg-muted/40 border-border text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              {selectedSlotData.is_auspicious ? (
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Clock className="size-4 opacity-70 shrink-0" />
              )}
              <div>
                <span className="font-bold text-foreground">{selectedTime}</span>
                {selectedSlotData.is_auspicious ? (
                  <span className="ml-1.5">
                    — Auspicious slot blessed by <strong>{selectedSlotData.muhurat_name}</strong>
                  </span>
                ) : (
                  <span className="ml-1.5">— Standard time slot</span>
                )}
              </div>
            </div>
            {selectedSlotData.is_auspicious && (
              <Badge className="bg-emerald-600 text-white border-none text-[10px]">
                Recommended
              </Badge>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
