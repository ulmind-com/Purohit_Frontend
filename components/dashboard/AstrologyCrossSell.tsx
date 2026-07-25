"use client";

import { useQuery } from "@tanstack/react-query";
import { getAstrologyInsights } from "@/lib/api/users";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, ArrowRight, ActivitySquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { CurrentDasha, UserResponse } from "@/types";

export function AstrologyCrossSell() {
  const userStoreProfile = useAuthStore((s) => s.profile);
  const profile = userStoreProfile as UserResponse | null;
  const router = useRouter();

  const hasBirthDetails = !!(profile?.dob);

  const { data: dasha, isLoading, isError } = useQuery<CurrentDasha>({
    queryKey: ["astrology-insights", profile?._id],
    queryFn: getAstrologyInsights,
    enabled: hasBirthDetails && !!profile,
    retry: false,
  });

  if (isLoading) {
    return (
      <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm animate-pulse h-32">
        <CardContent className="flex items-center justify-center h-full">
          <ActivitySquare className="w-8 h-8 text-muted-foreground/50 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Missing Details CTA
  if (!hasBirthDetails || isError) {
    return (
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-950 to-purple-950 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <CardContent className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-purple-200 mb-2 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              Cosmic Insights
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Unlock Personalized Puja Recommendations</h3>
            <p className="text-purple-200 text-sm max-w-md">
              Add your Date of Birth to your profile to discover your current Mahadasha and recommended spiritual remedies.
            </p>
          </div>
          <Button 
            onClick={() => router.push("/user/profile")}
            className="shrink-0 bg-white text-indigo-950 hover:bg-white/90 rounded-full h-12 px-6 font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
          >
            Add Birth Details <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Premium Insight Widget
  if (dasha) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border border-purple-500/30 bg-purple-900/40 backdrop-blur-xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none"></div>
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="w-16 h-16 shrink-0 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <Sparkles className="w-8 h-8 text-purple-300" />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                Cosmic Insight
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-purple-500/30 text-purple-200 border border-purple-500/50">
                  {dasha.dasha_name} Mahadasha
                </span>
              </h3>
              <p className="text-sm text-purple-100/80 leading-relaxed">
                You are currently under the strong astrological influence of <strong className="text-white">{dasha.dasha_name}</strong>. 
                Based on ancient Vedic scriptures, we highly recommend performing a <strong className="text-saffron-400">{dasha.recommended_puja_name}</strong> to harmonize this cosmic energy.
              </p>
            </div>
            <Button 
              onClick={() => router.push(`/user/book?ceremony=${encodeURIComponent(dasha.recommended_puja_name)}`)}
              className="shrink-0 rounded-full h-11 px-6 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-400 hover:to-saffron-500 text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all animate-pulse hover:animate-none"
            >
              Book {dasha.recommended_puja_name}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
}
