"use client";

import { useMemo, useState } from "react";
import { DayPicker, DayButtonProps } from "react-day-picker";
import "react-day-picker/style.css";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getAuspiciousDates } from "@/lib/api/bookings";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartMuhuratCalendarProps {
  purpose: string;
  lat: number;
  lng: number;
  selectedDate?: Date | undefined;
  onSelectDate: (date: Date) => void;
  className?: string;
}

function AuspiciousDayButton(props: DayButtonProps) {
  const { day, modifiers, children, ...buttonProps } = props;
  const isAuspicious = modifiers?.auspicious;

  return (
    <button {...buttonProps} className={cn(buttonProps.className, "relative")}>
      {children}
      {isAuspicious && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] leading-none">
          ✨
        </span>
      )}
    </button>
  );
}

export function SmartMuhuratCalendar({
  purpose,
  lat,
  lng,
  selectedDate,
  onSelectDate,
  className,
}: SmartMuhuratCalendarProps) {
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const month = displayMonth.getMonth() + 1;
  const year = displayMonth.getFullYear();

  const { data, isFetching, isError } = useQuery({
    queryKey: ["muhurat", month, year, purpose, lat, lng],
    queryFn: () => getAuspiciousDates({ month, year, purpose, lat, lng }),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    placeholderData: keepPreviousData,
    enabled: !!purpose && !!lat && !!lng,
  });

  const auspiciousDays = useMemo(() => {
    if (!data?.auspicious_dates) return [];
    return data.auspicious_dates.map((d) => new Date(d + "T00:00:00"));
  }, [data]);

  return (
    <div className={cn("rounded-2xl border bg-card p-4 shadow-sm", className)}>
      <style>{`
        .muhurat-auspicious-day:not(.rdp-selected) {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.15));
          color: rgb(4, 120, 87);
          font-weight: 700;
          border: 2px solid rgba(52, 211, 153, 0.5);
          border-radius: 9999px;
          position: relative;
          overflow: hidden;
        }
        .dark .muhurat-auspicious-day:not(.rdp-selected) {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1));
          color: rgb(110, 231, 183);
          border-color: rgba(52, 211, 153, 0.4);
        }
      `}</style>

      <div className="mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span>🕉️</span> Smart Muhurat Calendar
        </h3>
        <p className="text-sm text-muted-foreground">
          Select an auspicious date for {purpose || "your ceremony"}
        </p>
      </div>

      <div className="relative flex justify-center">
        {isFetching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background px-4 py-2 rounded-full border shadow-sm">
              <Loader2 className="size-4 animate-spin" />
              Consulting the stars...
            </div>
          </motion.div>
        )}

        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onSelectDate(date)}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          disabled={{ before: new Date() }}
          modifiers={{
            auspicious: auspiciousDays,
          }}
          modifiersClassNames={{
            auspicious: "muhurat-auspicious-day",
          }}
          components={{
            DayButton: AuspiciousDayButton,
          }}
          className="mx-auto"
        />
      </div>

      <div className="mt-4 pt-4 border-t space-y-2">
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          <span>✨</span> = Auspicious Muhurat
        </div>
        
        {data && auspiciousDays.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No auspicious muhurats found for this month. Try the next month.
          </p>
        )}
        
        {data && auspiciousDays.length > 0 && (
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
            {auspiciousDays.length} auspicious dates this month
          </div>
        )}
      </div>
    </div>
  );
}
