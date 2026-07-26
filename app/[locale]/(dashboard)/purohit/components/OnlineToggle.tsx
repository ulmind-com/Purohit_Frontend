"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { setOnlineStatus } from "@/lib/api/purohits";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/api/axios";
import type { PurohitResponse } from "@/types";

export function OnlineToggle() {
  const profile = useAuthStore((s) => s.profile) as PurohitResponse | null;
  const setProfile = useAuthStore((s) => s.setProfile);

  const [isPending, setIsPending] = useState(false);

  const isOnline = profile?.is_online ?? false;

  const statusMutation = useMutation({
    mutationFn: setOnlineStatus,
    onMutate: () => setIsPending(true),
    onSuccess: (updated) => {
      setProfile(updated);
      setIsPending(false);
      if (updated.is_online) {
        toast.success("You're online", {
          description: "Live matching engine activated. Standby for bookings.",
        });
      } else {
        toast.info("You're offline", {
          description: "Matching engine paused.",
        });
      }
    },
    onError: (error) => {
      setIsPending(false);
      toast.error("Couldn't update status", {
        description:
          error instanceof ApiError
            ? error.message
            : "Please check your connection.",
      });
    },
  });

  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Matching Engine</p>
        <p className="mt-1 flex items-center gap-2 text-xl font-semibold">
          <span
            className={`size-2.5 rounded-full ${
              isOnline
                ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]"
                : "bg-muted-foreground/40"
            }`}
          />
          {isOnline ? "Online & Searching" : "Offline"}
        </p>
      </div>
      <div className="relative flex items-center gap-2">
        {isPending && (
          <Loader2 className="absolute -left-6 size-4 animate-spin text-muted-foreground" />
        )}
        <Switch
          checked={isOnline}
          disabled={isPending}
          onCheckedChange={(checked) => statusMutation.mutate(checked)}
          className="scale-125 data-[state=checked]:bg-emerald-500"
        />
      </div>
    </div>
  );
}
