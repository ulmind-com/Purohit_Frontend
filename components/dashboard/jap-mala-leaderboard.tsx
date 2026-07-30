"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, Loader2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api/axios";

// Assume we export getPusherClient in a way that we can subscribe globally,
// or we can use usePusherChannel if it's available.
import { usePusherChannel } from "@/lib/realtime/pusher";

interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  count: number;
  rank: number;
}

interface LeaderboardData {
  daily: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  all_time: LeaderboardEntry[];
}

export function JapMalaLeaderboard() {
  const profile = useAuthStore((s) => s.profile);
  const [data, setData] = useState<LeaderboardData>({ daily: [], monthly: [], all_time: [] });
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("/japmala/leaderboard");
      setData(res.data);
    } catch (e) {
      console.error("Failed to fetch leaderboard", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Real-time Pusher updates
  usePusherChannel("japmala_global", "leaderboard_update", (payload) => {
    // When anyone updates, just re-fetch for simplicity to get true rank.
    // In a massive scale app we'd do optimistic in-place sorting.
    fetchLeaderboard();
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400 drop-shadow-md" size={24} />;
    if (rank === 2) return <Medal className="text-gray-300 drop-shadow-md" size={22} />;
    if (rank === 3) return <Medal className="text-amber-600 drop-shadow-md" size={20} />;
    return <span className="font-bold text-muted-foreground">#{rank}</span>;
  };

  const renderList = (entries: LeaderboardEntry[]) => {
    if (entries.length === 0) {
      return (
        <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
          <Users size={48} className="mb-4 opacity-20" />
          <p>No devotees have chanted yet.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {entries.map((entry, i) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center justify-between rounded-2xl border p-4 shadow-sm transition-all ${
                entry.user_id === profile?._id
                  ? "border-orange-500/50 bg-orange-500/10 dark:bg-orange-500/20"
                  : "border-white/20 bg-white/40 dark:border-white/5 dark:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex w-8 justify-center">{getRankBadge(entry.rank)}</div>
                <Avatar className="size-10 ring-2 ring-orange-500/20">
                  <AvatarImage src={entry.user_avatar || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white">
                    {entry.user_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {entry.user_id === profile?._id ? "You" : entry.user_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">Devotee</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-orange-500">{entry.count}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Malas
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white/50 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
      <div className="mb-6 flex items-center gap-2">
        <Trophy className="text-yellow-500" size={24} />
        <h2 className="text-xl font-black text-foreground">Top Devotees</h2>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
      ) : (
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all_time">All-Time</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-0 outline-none">
            {renderList(data.daily)}
          </TabsContent>
          <TabsContent value="monthly" className="mt-0 outline-none">
            {renderList(data.monthly)}
          </TabsContent>
          <TabsContent value="all_time" className="mt-0 outline-none">
            {renderList(data.all_time)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
