"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GoogleMap,
  Marker,
  Polyline,
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
import type { GeoJSONPoint, PurohitLocationUpdateEvent } from "@/types";

interface LatLng {
  lat: number;
  lng: number;
}

interface RouteTrafficSegment {
  path: LatLng[];
  color: string; // "#10B981" (emerald clear), "#F59E0B" (amber moderate), "#EF4444" (red heavy jam)
  speedKmh: number;
}

/** Parses location whether stored as "lat, lng" string or GeoJSON Point object */
function parseBookingLocation(location: string | GeoJSONPoint | unknown): LatLng | null {
  if (!location) return null;
  if (typeof location === "object" && location !== null && "coordinates" in location) {
    const geo = location as GeoJSONPoint;
    if (Array.isArray(geo.coordinates) && geo.coordinates.length >= 2) {
      const [lng, lat] = geo.coordinates;
      return { lat, lng };
    }
  }
  if (typeof location === "string") {
    const match = location.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
  }
  return null;
}

/** Calculates precise Haversine geodesic distance in meters */
function haversineDistanceMeters(coord1: LatLng, coord2: LatLng): number {
  const R = 6371000;
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Instant fallback distance and ETA calculation */
function calculateDistanceAndDuration(
  origin: LatLng,
  destination: LatLng,
  segments?: RouteTrafficSegment[]
) {
  let distanceMeters = 0;

  if (segments && segments.length > 0) {
    for (const seg of segments) {
      for (let i = 0; i < seg.path.length - 1; i++) {
        distanceMeters += haversineDistanceMeters(seg.path[i], seg.path[i + 1]);
      }
    }
  } else {
    distanceMeters = haversineDistanceMeters(origin, destination);
  }

  let distanceText = "";
  if (distanceMeters < 1000) {
    distanceText = `${Math.round(distanceMeters)} m`;
  } else {
    distanceText = `${(distanceMeters / 1000).toFixed(1)} km`;
  }

  const durationMinutes = Math.max(1, Math.round(distanceMeters / 583));
  let durationText = "";
  if (durationMinutes < 60) {
    durationText = `${durationMinutes} mins`;
  } else {
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    durationText = mins > 0 ? `${hours} hr ${mins} mins` : `${hours} hr`;
  }

  return {
    distance_text: distanceText,
    duration_text: durationText,
    eta_minutes: durationMinutes,
  };
}

/** Maps segment speed (km/h) to traffic congestion color category */
function getTrafficCategory(speedKmh: number): { color: string; label: string } {
  if (speedKmh >= 45) {
    return { color: "#10B981", label: "Clear" }; // Emerald green (fast)
  } else if (speedKmh >= 22) {
    return { color: "#F59E0B", label: "Moderate" }; // Amber / Orange (slowdown)
  } else {
    return { color: "#EF4444", label: "Heavy Jam" }; // Red (heavy jam)
  }
}

/**
 * Fetches real-world driving route and splits it into traffic-aware colored segments
 * directly ON the user's route line (Green = clear flow, Orange = slowdown, Red = heavy jam).
 */
async function fetchTrafficAwareRoute(origin: LatLng, destination: LatLng): Promise<RouteTrafficSegment[]> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&annotations=speed`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Road routing failed");
  const data = await res.json();
  if (!data.routes || !data.routes[0]) throw new Error("No route found");

  const route = data.routes[0];
  const coords: [number, number][] = route.geometry.coordinates;
  const speedsMs: number[] = route.legs[0]?.annotation?.speed || [];

  if (coords.length < 2) return [];

  const segments: RouteTrafficSegment[] = [];
  let currentPath: LatLng[] = [{ lat: coords[0][1], lng: coords[0][0] }];
  let currentCategory = getTrafficCategory(speedsMs[0] ? speedsMs[0] * 3.6 : 40);

  for (let i = 0; i < speedsMs.length; i++) {
    const nextPt = { lat: coords[i + 1][1], lng: coords[i + 1][0] };
    const speedKmh = (speedsMs[i] || 10) * 3.6;
    const category = getTrafficCategory(speedKmh);

    if (category.color === currentCategory.color) {
      currentPath.push(nextPt);
    } else {
      currentPath.push(nextPt); // Connect seamlessly to next segment
      segments.push({
        path: currentPath,
        color: currentCategory.color,
        speedKmh: (speedsMs[i] || 10) * 3.6,
      });
      currentPath = [nextPt];
      currentCategory = category;
    }
  }

  if (currentPath.length > 1) {
    segments.push({
      path: currentPath,
      color: currentCategory.color,
      speedKmh: 40,
    });
  }

  return segments;
}

const ETA_POLL_MS = 20_000;

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
  destination: string | GeoJSONPoint;
  viewerRole: "user" | "purohit";
}) {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);

  const yajmanLocation = parseBookingLocation(destination);
  const [livePurohitLocation, setLivePurohitLocation] = useState<LatLng | null>(null);

  // Seed initial Purohit position from profile
  const { data: purohitProfile } = useQuery({
    queryKey: ["purohit", purohitId],
    queryFn: () => getPurohitById(purohitId),
    enabled: Boolean(purohitId) && !livePurohitLocation,
  });

  const initialLocation = useMemo(() => {
    if (!purohitProfile) return null;
    const [lng, lat] = purohitProfile.location.coordinates;
    return { lat, lng };
  }, [purohitProfile]);

  const activePurohitLocation = livePurohitLocation || initialLocation;

  // Fetch real-world traffic-aware road route segments
  const trafficRouteQuery = useQuery({
    queryKey: [
      "traffic-route",
      activePurohitLocation?.lat,
      activePurohitLocation?.lng,
      yajmanLocation?.lat,
      yajmanLocation?.lng,
    ],
    queryFn: () => fetchTrafficAwareRoute(activePurohitLocation!, yajmanLocation!),
    enabled: Boolean(activePurohitLocation && yajmanLocation),
    staleTime: 60_000,
    retry: 2,
  });

  const routeSegments = useMemo(() => {
    return trafficRouteQuery.data || [];
  }, [trafficRouteQuery.data]);

  // Instant fallback distance and ETA calculation
  const fallbackEta = useMemo(() => {
    if (!activePurohitLocation || !yajmanLocation) return null;
    return calculateDistanceAndDuration(
      activePurohitLocation,
      yajmanLocation,
      routeSegments
    );
  }, [activePurohitLocation, yajmanLocation, routeSegments]);

  // Live position ticks pushed from backend on every Purohit GPS update
  usePusherChannel<PurohitLocationUpdateEvent>(
    userId ? `user_${userId}` : null,
    "purohit_location_update",
    useCallback(
      (data) => {
        if (data.booking_id !== bookingId) return;
        setLivePurohitLocation({ lat: data.lat, lng: data.lng });
      },
      [bookingId]
    )
  );

  const etaQuery = useQuery({
    queryKey: ["booking-eta", bookingId, activePurohitLocation?.lat, activePurohitLocation?.lng],
    queryFn: () =>
      getBookingEta(bookingId, activePurohitLocation!.lat, activePurohitLocation!.lng),
    enabled: Boolean(activePurohitLocation),
    refetchInterval: ETA_POLL_MS,
    retry: false,
  });

  const etaData = etaQuery.data || fallbackEta;

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
          {!isLoaded || !activePurohitLocation ? (
            <Skeleton className="h-64 w-full sm:h-80" />
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "320px" }}
              center={activePurohitLocation}
              zoom={12}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                clickableIcons: false,
              }}
            >
              <Marker
                position={activePurohitLocation}
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

              {/* Traffic-Aware Colored Segments ON THE ROUTE LINE (Green = Clear, Orange = Slow, Red = Jam) */}
              {routeSegments.map((segment, idx) => (
                <Polyline
                  key={`segment-${idx}-${segment.color}`}
                  path={segment.path}
                  options={{
                    strokeColor: segment.color,
                    strokeWeight: 6,
                    strokeOpacity: 0.95,
                    geodesic: true,
                  }}
                />
              ))}
            </GoogleMap>
          )}

          {/* Top-Right Traffic Legend Pill Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur-md shadow-sm">
            <span className="flex items-center gap-1 text-emerald-500">
              <span className="size-2 rounded-full bg-emerald-500" /> Clear
            </span>
            <span className="flex items-center gap-1 text-amber-500">
              <span className="size-2 rounded-full bg-amber-500" /> Moderate
            </span>
            <span className="flex items-center gap-1 text-red-500">
              <span className="size-2 rounded-full bg-red-500" /> Heavy Jam
            </span>
          </div>

          {(!activePurohitLocation || trafficRouteQuery.isLoading) && isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/60 text-sm text-muted-foreground backdrop-blur-sm">
              <Loader2 className="size-4 animate-spin text-saffron-500" /> Locating {otherPartyLabel}...
            </div>
          )}
        </div>

        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 text-saffron-500" />
            <span className="text-muted-foreground">{otherPartyLabel} distance</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            {etaData ? (
              <>
                <span className="flex items-center gap-1">
                  <Navigation className="size-3.5 text-saffron-500" />
                  {etaData.distance_text}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5 text-saffron-500" />
                  {etaData.duration_text}
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
