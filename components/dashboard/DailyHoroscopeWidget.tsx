"use client";

import { useQuery } from "@tanstack/react-query";
import { getDailyHoroscope } from "@/lib/api/users";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ActivitySquare, Palette, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import type { DailyHoroscope, UserResponse } from "@/types";

export function DailyHoroscopeWidget() {
  const userStoreProfile = useAuthStore((s) => s.profile);
  const profile = userStoreProfile as UserResponse | null;
  const today = new Date().toISOString().split("T")[0];
  const locale = useLocale();

  const hasBirthDetails = !!(profile?.dob);

  const { data: horoscope, isLoading } = useQuery<DailyHoroscope>({
    queryKey: ["daily-horoscope", profile?._id, profile?.rashi, today, locale],
    queryFn: () => getDailyHoroscope(locale),
    enabled: !!profile && hasBirthDetails,
  });

  if (!hasBirthDetails) return null;

  if (isLoading) {
    return (
      <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm animate-pulse h-32">
        <CardContent className="flex items-center justify-center h-full">
          <ActivitySquare className="w-8 h-8 text-muted-foreground/50 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!horoscope) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
      <Card className="relative overflow-hidden border border-indigo-500/30 bg-indigo-950/40 backdrop-blur-xl shadow-[0_0_15px_rgba(99,102,241,0.15)]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white leading-none">Daily Horoscope</h3>
              <p className="text-xs text-indigo-300 mt-1.5 uppercase tracking-widest font-bold bg-indigo-500/20 px-2 py-0.5 rounded-full inline-block border border-indigo-500/40">
                {horoscope.rashi}
              </p>
            </div>
          </div>
          
          <p className="text-sm text-indigo-100/90 leading-relaxed mb-6 font-medium">
            {horoscope.prediction}
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <Hash className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-100/80 font-medium">Lucky Number: <strong className="text-emerald-400 font-bold ml-1">{horoscope.lucky_number}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.1)]">
              <Palette className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-pink-100/80 font-medium">Lucky Color: <strong className="text-pink-400 font-bold ml-1">{horoscope.lucky_color}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
