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
  const hasToastedErrorRef = useRef<boolean>(false);
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

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
        hasToastedErrorRef.current = false;
        startTracking(true);
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
        description:
          error instanceof ApiError
            ? error.message
            : "Please check your connection.",
      });
    },
  });

  const locationMutation = useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
      updateLocation(lat, lng),
    onSuccess: (updated) => {
      setProfile(updated);
    },
    onError: (err) => {
      console.warn("Location sync warning:", err);
    },
  });

  const startTracking = (highAccuracy = true) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      if (!hasToastedErrorRef.current) {
        toast.error("Geolocation not supported by your browser");
        hasToastedErrorRef.current = true;
      }
      return;
    }

    stopTracking();

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const lastCoords = lastCoordsRef.current;

      let shouldUpdate = true;
      if (lastCoords) {
        const dLat = Math.abs(latitude - lastCoords.lat);
        const dLng = Math.abs(longitude - lastCoords.lng);
        if (dLat < 0.0005 && dLng < 0.0005) {
          shouldUpdate = false;
        }
      }

      if (shouldUpdate) {
        lastCoordsRef.current = { lat: latitude, lng: longitude };
        locationMutation.mutate({ lat: latitude, lng: longitude });
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      const errorMsg =
        error.message ||
        (error.code === 1
          ? "Permission denied"
          : error.code === 2
          ? "Position unavailable"
          : "Location request timed out");

      console.warn(`[GPS Watch] Code ${error.code}: ${errorMsg}`);

      // Fallback: If high accuracy timed out or failed, try standard accuracy
      if (highAccuracy && (error.code === 2 || error.code === 3)) {
        console.warn("[GPS Watch] Retrying with standard accuracy positioning...");
        startTracking(false);
        return;
      }

      if (!hasToastedErrorRef.current) {
        hasToastedErrorRef.current = true;
        toast.error("GPS tracking notice", {
          description:
            error.code === 1
              ? "Location permission is required for real-time matching."
              : "Using estimated location. Check browser location permissions.",
        });
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: highAccuracy,
        maximumAge: 30000,
        timeout: highAccuracy ? 15000 : 30000,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null && typeof window !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    if (isOnline && watchIdRef.current === null) {
      startTracking(true);
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
