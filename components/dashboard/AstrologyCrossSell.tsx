"use client";

import { useQuery } from "@tanstack/react-query";
import { getAstrologyInsights } from "@/lib/api/users";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, ArrowRight, ActivitySquare } from "lucide-react";
import { useRouter } from "@/navigation";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import type { CurrentDasha, UserResponse } from "@/types";

export function AstrologyCrossSell() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const userStoreProfile = useAuthStore((s) => s.profile);
  const profile = userStoreProfile as UserResponse | null;
  const router = useRouter();

  const hasBirthDetails = !!(profile?.dob);
  const today = new Date().toISOString().split('T')[0];

  const { data: dasha, isLoading, isError } = useQuery<CurrentDasha>({
    queryKey: ["astrology-insights", profile?._id, profile?.dob, profile?.rashi, profile?.gotra, today, locale],
    queryFn: () => getAstrologyInsights(locale),
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
              {t("cosmicInsight")}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{t("unlockRecommendations")}</h3>
            <p className="text-purple-200 text-sm max-w-md">
              {t("addDobPrompt")}
            </p>
          </div>
          <Button 
            onClick={() => router.push("/user/profile")}
            className="shrink-0 bg-white text-indigo-950 hover:bg-white/90 rounded-full h-12 px-6 font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
          >
            {t("addBirthDetails")} <ArrowRight className="w-4 h-4 ml-2" />
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
              <h3 className="text-lg font-bold text-white flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {t("cosmicInsight")}
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-purple-500/30 text-purple-200 border border-purple-500/50">
                  {dasha.dasha_name} Mahadasha
                </span>
                {dasha.is_favorable !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${dasha.is_favorable ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : "bg-rose-500/20 text-rose-400 border-rose-500/50"}`}>
                    {dasha.is_favorable ? (locale === "bn" ? "শুভ" : "Favorable") : (locale === "bn" ? "অশুভ" : "Unfavorable")}
                  </span>
                )}
              </h3>
              <p className="text-sm text-purple-100/80 leading-relaxed mb-4">
                {t("underInfluenceOf")} <strong className="text-white">{dasha.dasha_name}</strong>. 
                {t("recommendPerforming")} <strong className="text-saffron-400">{dasha.recommended_puja_name}</strong> {t("toHarmonizeEnergy")}
              </p>
              
              <div className="mt-4 pt-4 border-t border-purple-500/30">
                {dasha.is_favorable ? (
                  dasha.favorable_effects && (
                    <div className="text-sm">
                      <strong className="text-emerald-400 block mb-1">✨ {locale === "bn" ? "প্রভাব (শুভ):" : "Effects (Favorable):"}</strong>
                      <p className="text-emerald-100/80 leading-relaxed">{dasha.favorable_effects}</p>
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    {dasha.unfavorable_effects && (
                      <div className="text-sm">
                        <strong className="text-rose-400 block mb-1">⚠️ {locale === "bn" ? "প্রভাব (অশুভ):" : "Effects (Unfavorable):"}</strong>
                        <p className="text-rose-100/80 leading-relaxed">{dasha.unfavorable_effects}</p>
                      </div>
                    )}
                    
                    {dasha.remedies && dasha.remedies.length > 0 && (
                      <div className="text-sm bg-black/20 p-3 rounded-lg border border-purple-500/20">
                        <strong className="text-saffron-400 block mb-2">🛡️ {locale === "bn" ? "প্রতিকার (Remedies):" : "Remedies to protect yourself:"}</strong>
                        <ul className="list-disc list-inside text-purple-100/80 space-y-1">
                          {dasha.remedies.map((remedy, idx) => (
                            <li key={idx}>{remedy}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Button 
                onClick={() => router.push(`/user/book?ceremony=${encodeURIComponent(dasha.recommended_puja_name)}`)}
                className="w-full rounded-full h-11 px-6 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-400 hover:to-saffron-500 text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all animate-pulse hover:animate-none"
              >
                {t("bookSpecificPuja", { pujaName: dasha.recommended_puja_name })}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
}
