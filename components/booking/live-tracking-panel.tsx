"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DirectionsRenderer,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { motion } from "framer-motion";
import { Clock, Loader2, MapPin, Navigation } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GOOGLE_MAPS_API_KEY } from "@/lib/constants";
import { GOOGLE_MAPS_LOADER_OPTIONS } from "@/lib/google-maps-loader";
import { usePusherChannel } from "@/hooks/usePusherChannel";
import { getBookingEta } from "@/lib/api/bookings";
import { getPurohitById } from "@/lib/api/purohits";
import type { PurohitLocationUpdateEvent } from "@/types";

interface LatLng {
  lat: number;
  lng: number;
}

/** Bookings normalize their location as "lat, lng" (see `_normalize_booking_doc` in the backend). */
function parseBookingLocation(location: string): LatLng | null {
  const match = location.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
}

const ETA_POLL_MS = 20_000;

/**
 * Live "matched" tracking view: Purohit and Yajman markers, driving route,
 * and distance/ETA — mirrors the two roles by label (`viewerRole` decides
 * whose position is "you" vs. the other party) but the data flow is
 * identical either way.
 */
export function LiveTrackingPanel({
  bookingId,
  purohitId,
  userId,
  destination,
  viewerRole,
}: {
  bookingId: string;
  purohitId: string;
  userId: string;
  destination: string;
  viewerRole: "user" | "purohit";
}) {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);

  const yajmanLocation = parseBookingLocation(destination);
  const [purohitLocation, setPurohitLocation] = useState<LatLng | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const lastRoutedRef = useRef<string>("");

  // Seed the initial Purohit position before the first live tick arrives.
  const { data: purohitProfile } = useQuery({
    queryKey: ["purohit", purohitId],
    queryFn: () => getPurohitById(purohitId),
    enabled: Boolean(purohitId) && !purohitLocation,
  });

  useEffect(() => {
    if (purohitProfile && !purohitLocation) {
      const [lng, lat] = purohitProfile.location.coordinates;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPurohitLocation({ lat, lng });
    }
  }, [purohitProfile, purohitLocation]);

  // Live position ticks pushed from the backend on every Purohit GPS update.
  usePusherChannel<PurohitLocationUpdateEvent>(
    userId ? `user_${userId}` : null,
    "purohit_location_update",
    useCallback(
      (data) => {
        if (data.booking_id !== bookingId) return;
        setPurohitLocation({ lat: data.lat, lng: data.lng });
      },
      [bookingId]
    )
  );

  const etaQuery = useQuery({
    queryKey: ["booking-eta", bookingId, purohitLocation?.lat, purohitLocation?.lng],
    queryFn: () =>
      getBookingEta(bookingId, purohitLocation!.lat, purohitLocation!.lng),
    enabled: Boolean(purohitLocation),
    refetchInterval: ETA_POLL_MS,
    retry: false,
  });

  // Recompute the driving route whenever the Purohit moves meaningfully.
  useEffect(() => {
    if (!isLoaded || !purohitLocation || !yajmanLocation) return;
    const key = `${purohitLocation.lat.toFixed(4)},${purohitLocation.lng.toFixed(4)}`;
    if (key === lastRoutedRef.current) return;
    lastRoutedRef.current = key;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: purohitLocation,
        destination: yajmanLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) setDirections(result);
      }
    );
  }, [isLoaded, purohitLocation, yajmanLocation]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable live tracking.
        </CardContent>
      </Card>
    );
  }

  if (!yajmanLocation) {
    return null;
  }

  const otherPartyLabel = viewerRole === "user" ? "Purohit" : "Yajman";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <div className="relative">
          {!isLoaded || !purohitLocation ? (
            <Skeleton className="h-64 w-full sm:h-80" />
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "320px" }}
              center={purohitLocation}
              zoom={13}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                clickableIcons: false,
              }}
            >
              <Marker
                position={purohitLocation}
                label={{ text: "🪔", fontSize: "18px" }}
                title="Purohit"
              />
              <Marker
                position={yajmanLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#EA580C",
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 2,
                }}
                title="Ceremony location"
              />
              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: "#EA580C",
                      strokeWeight: 4,
                      strokeOpacity: 0.85,
                    },
                  }}
                />
              )}
            </GoogleMap>
          )}

          {!purohitLocation && isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/60 text-sm text-muted-foreground backdrop-blur-sm">
              <Loader2 className="size-4 animate-spin" /> Locating {otherPartyLabel}...
            </div>
          )}
        </div>

        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 text-saffron-500" />
            <span className="text-muted-foreground">{otherPartyLabel} distance</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            {etaQuery.data ? (
              <>
                <span className="flex items-center gap-1">
                  <Navigation className="size-3.5 text-muted-foreground" />
                  {etaQuery.data.distance_text}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {etaQuery.data.duration_text}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Calculating...</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
