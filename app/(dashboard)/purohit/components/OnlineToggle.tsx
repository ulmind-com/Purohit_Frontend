"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { setOnlineStatus, updateLocation } from "@/lib/api/purohits";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/api/axios";
import type { PurohitResponse } from "@/types";

export function OnlineToggle() {
  const profile = useAuthStore((s) => s.profile) as PurohitResponse | null;
  const setProfile = useAuthStore((s) => s.setProfile);
  
  const [isPending, setIsPending] = useState(false);
  const watchIdRef = useRef<number | null>(null);

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
        startTracking();
      } else {
        toast.info("You're offline", {
          description: "Location tracking paused.",
        });
        stopTracking();
      }
    },
    onError: (error) => {
      setIsPending(false);
      toast.error("Couldn't update status", {
        description: error instanceof ApiError ? error.message : "Please check your connection.",
      });
    },
  });

  const locationMutation = useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) => updateLocation(lat, lng),
    onSuccess: (updated) => {
      // Silently update profile in store so map reflects it
      setProfile(updated);
    },
    onError: (err) => {
      console.error("Failed to update real-time location:", err);
    }
  });

  // Track the most recent coordinates so we don't spam the API for micro-movements
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }

    if (watchIdRef.current !== null) return; // Already watching

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const lastCoords = lastCoordsRef.current;

        // Calculate rough distance (approx) to avoid spamming the API
        let shouldUpdate = true;
        if (lastCoords) {
          const dLat = Math.abs(latitude - lastCoords.lat);
          const dLng = Math.abs(longitude - lastCoords.lng);
          // Roughly 50 meters threshold
          if (dLat < 0.0005 && dLng < 0.0005) {
            shouldUpdate = false;
          }
        }

        if (shouldUpdate) {
          lastCoordsRef.current = { lat: latitude, lng: longitude };
          locationMutation.mutate({ lat: latitude, lng: longitude });
        }
      },
      (error) => {
        console.error("GPS Watch error:", error);
        toast.error("GPS tracking failed", {
          description: "Please ensure location permissions are granted."
        });
        // Auto-toggle offline if GPS fails, but wait a bit before doing it
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    // If the component mounts and the purohit is supposed to be online, restart tracking
    if (isOnline && watchIdRef.current === null) {
      startTracking();
    }
    
    return () => {
      stopTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Matching Engine</p>
        <p className="mt-1 flex items-center gap-2 text-xl font-semibold">
          <span
            className={`size-2.5 rounded-full ${isOnline ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" : "bg-muted-foreground/40"}`}
          />
          {isOnline ? "Online & Searching" : "Offline"}
        </p>
      </div>
      <div className="flex items-center gap-2 relative">
        {isPending && <Loader2 className="absolute -left-6 size-4 animate-spin text-muted-foreground" />}
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
