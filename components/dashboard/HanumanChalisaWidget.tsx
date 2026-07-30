"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchChalisaStatus } from "@/lib/api/hanuman-chalisa";
import { Link } from "@/navigation";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Flame, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function HanumanChalisaWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["chalisa-status"],
    queryFn: fetchChalisaStatus,
  });

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-orange-200 bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3 bg-orange-100" />
            <Skeleton className="h-10 w-full bg-orange-50" />
            <Skeleton className="h-12 w-full bg-orange-100/50 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback data if error or not yet started
  const status = data || {
    streak_count: 0,
    best_streak: 0,
    total_reads: 0,
    completed_today: false,
    weekly_status: Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 3 + i); // 3 days back to 3 days ahead approx
      const isToday = i === 3;
      return {
        day: d.toLocaleDateString("en-US", { weekday: "short" }).substring(0, 3),
        date: d.getDate().toString(),
        full_date: d.toISOString(),
        completed: false,
        is_today: isToday,
        is_future: i > 3,
      };
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border border-orange-200 bg-gradient-to-br from-amber-50 via-orange-50/50 to-orange-100/30 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl group">
        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <span className="text-8xl">🕉️</span>
        </div>
        
        <CardContent className="p-5 sm:p-6 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                <span className="text-2xl">🙏</span> Daily Hanuman Chalisa
              </h3>
              <p className="text-sm text-orange-700/80 mt-1">Read daily for spiritual growth & peace</p>
            </div>
            <div className="bg-orange-100/80 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-orange-200/60 shadow-sm">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span className="text-sm font-bold text-orange-800">{status.streak_count} Day Streak</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 px-1">
            {status.weekly_status.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className={cn(
                  "text-xs font-medium",
                  day.is_today ? "text-orange-600" : "text-gray-500"
                )}>
                  {day.day}
                </span>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  day.completed 
                    ? "bg-green-100 text-green-600 border border-green-200"
                    : day.is_today && !day.completed
                      ? "bg-white text-orange-600 border-2 border-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.3)] animate-pulse"
                      : day.is_future
                        ? "bg-gray-50 text-gray-400 border border-gray-100"
                        : "bg-red-50 text-red-500 border border-red-100"
                )}>
                  {day.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : !day.is_future && !day.is_today ? (
                    <XCircle className="w-5 h-5 text-red-400 opacity-70" />
                  ) : (
                    <span>{day.date}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {status.completed_today ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Completed Today!</p>
                  <p className="text-xs text-green-600 font-medium">Great job keeping up the habit.</p>
                </div>
              </div>
              <Link href="/user/hanuman-chalisa">
                <span className="text-sm font-medium text-green-700 hover:text-green-800 underline underline-offset-2">
                  Read Again
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <p className="text-sm font-medium text-orange-700 bg-orange-100/50 px-3 py-1.5 rounded-md border border-orange-200/50">
                ⚠️ Complete today to keep your streak!
              </p>
              <Link href="/user/hanuman-chalisa" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg transform transition-all active:scale-95 px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Start Reading →
                </button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
