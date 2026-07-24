"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Circle, Marker, useJsApiLoader } from "@react-google-maps/api";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Sparkles, Video, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GOOGLE_MAPS_LOADER_OPTIONS } from "@/lib/google-maps-loader";
import { getNearbyPurohits } from "@/lib/api/purohits";
import { GOOGLE_MAPS_API_KEY } from "@/lib/constants";

interface RapidoSearchingMapProps {
  userLocation: { lat: number; lng: number; formattedAddress?: string };
  ceremonyType: string;
  budget: number;
  isEPuja?: boolean;
  onCancel: () => void;
}

export function RapidoSearchingMap({
  userLocation,
  ceremonyType,
  budget,
  isEPuja,
  onCancel,
}: RapidoSearchingMapProps) {
  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);
  const [pulseRadius, setPulseRadius] = useState(800);

  // Fetch real online purohits nearby from DB
  const nearbyQuery = useQuery({
    queryKey: ["nearby-purohits-search", userLocation.lat, userLocation.lng],
    queryFn: () =>
      getNearbyPurohits({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius_km: 25,
      }),
    refetchInterval: 5000,
  });

  // Animated expanding radar ring effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseRadius((r) => (r >= 3500 ? 600 : r + 400));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const realPurohits = nearbyQuery.data ?? [];

  const purohitMarkers = realPurohits.map((p) => ({
    id: p._id,
    name: p.name,
    lat: p.location.coordinates[1],
    lng: p.location.coordinates[0],
    distance: `${(p.distance_in_km ?? 1).toFixed(1)} km`,
  }));

  if (!GOOGLE_MAPS_API_KEY || loadError || !isLoaded) {
    return (
      <Card className="trip-sheet border-none p-6 text-center space-y-4">
        <div className="flex flex-col items-center py-6">
          <Loader2 className="size-10 animate-spin text-saffron-500 mb-3" />
          <h3 className="text-lg font-semibold">Broadcasting to nearby Purohits...</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Matching you with the nearest available Panditji for {ceremonyType}.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-saffron-500/20 shadow-2xl">
      {/* Google Map Background View */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "460px" }}
        center={userLocation}
        zoom={14}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          clickableIcons: false,
          styles: MAP_STYLE_DARK,
        }}
      >
        {/* Pulsing Radar Ring 1 */}
        <Circle
          center={userLocation}
          radius={pulseRadius}
          options={{
            strokeColor: "#F97316",
            strokeOpacity: 0.6,
            strokeWeight: 2,
            fillColor: "#EA580C",
            fillOpacity: 0.12,
          }}
        />

        {/* Outer Static Service Ring */}
        <Circle
          center={userLocation}
          radius={4000}
          options={{
            strokeColor: "#F59E0B",
            strokeOpacity: 0.3,
            strokeWeight: 1,
            fillColor: "#FBBF24",
            fillOpacity: 0.04,
          }}
        />

        {/* Yajman Pickup Pin */}
        <Marker
          position={userLocation}
          icon={{
            url: "data:image/svg+xml;utf8," + encodeURIComponent(YAJMAN_PIN_SVG),
            scaledSize: new window.google.maps.Size(46, 46),
          }}
        />

        {/* Nearby Purohit Pins (Rapido Style) */}
        {purohitMarkers.map((purohit) => (
          <Marker
            key={purohit.id}
            position={{ lat: purohit.lat, lng: purohit.lng }}
            icon={{
              url:
                "data:image/svg+xml;utf8," +
                encodeURIComponent(PUROHIT_PIN_SVG),
              scaledSize: new window.google.maps.Size(42, 42),
            }}
            title={`${purohit.name} (${purohit.distance})`}
          />
        ))}
      </GoogleMap>

      {/* Rapido-Style Top Live Status Floating Badge */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-background/90 backdrop-blur-md border border-saffron-500/30 px-4 py-2 shadow-lg">
          <span className="relative flex size-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-3 bg-saffron-500"></span>
          </span>
          <span className="text-xs font-bold tracking-wide text-foreground uppercase">
            Live Dispatching Radar
          </span>
        </div>

        <Badge variant="secondary" className="pointer-events-auto bg-background/90 backdrop-blur-md text-xs gap-1 border-none shadow-md">
          <ShieldCheck className="size-3.5 text-emerald-500" /> Verified Panditjis
        </Badge>
      </div>

      {/* Rapido-Style Bottom Sheet Floating Card */}
      <div className="absolute bottom-3 left-3 right-3 z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl border border-saffron-500/30 bg-background/95 backdrop-blur-xl p-5 shadow-2xl space-y-4"
        >
          {/* Animated Gradient Progress Line */}
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full saffron-gradient"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl saffron-gradient text-white shadow-md">
                <Sparkles className="size-6 animate-spin" style={{ animationDuration: "4s" }} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base">
                  Broadcasting request to nearby Panditjis...
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <span className="font-medium text-saffron-600 dark:text-saffron-400">
                    {nearbyQuery.isLoading
                      ? "Scanning database..."
                      : purohitMarkers.length > 0
                        ? `${purohitMarkers.length} Online Purohit${purohitMarkers.length > 1 ? "s" : ""}`
                        : "Broadcasting request to active Purohits"}
                  </span>{" "}
                  {purohitMarkers.length > 0 ? "notified within service radius" : "in your area"}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="size-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
              title="Cancel search"
            >
              <X className="size-5" />
            </Button>
          </div>

          {/* Ceremony details summary pill */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border text-xs">
            <Badge variant="outline" className="gap-1 border-saffron-500/30 bg-saffron-500/5">
              🕉️ {ceremonyType}
            </Badge>
            <Badge variant="outline" className="gap-1 border-saffron-500/30 bg-saffron-500/5 font-mono">
              💰 Offered Dakshina: ₹{budget}
            </Badge>
            {isEPuja && (
              <Badge variant="secondary" className="gap-1 bg-saffron-500/20 text-saffron-700 dark:text-saffron-300 border-none">
                <Video className="size-3" /> E-Puja 1-on-1 Virtual Call
              </Badge>
            )}
            {userLocation.formattedAddress && (
              <span className="text-muted-foreground truncate max-w-[200px] flex items-center gap-1">
                <MapPin className="size-3 text-saffron-500 shrink-0" />
                {userLocation.formattedAddress}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Dark Muted Map Styling for Rapido look & feel
const MAP_STYLE_DARK: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1d1d24" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d1d24" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#74747a" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#cfcfd4" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c36" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1b1b22" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a93" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3d3d4b" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1117" }] },
];

const YAJMAN_PIN_SVG = `<svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="23" cy="23" r="22" fill="#EA580C" fill-opacity="0.25"/>
  <circle cx="23" cy="23" r="15" fill="url(#saffron-grad)"/>
  <path d="M23 15C19.6863 15 17 17.6863 17 21C17 25.5 23 31 23 31C23 31 29 25.5 29 21C29 17.6863 26.3137 15 23 15ZM23 23C21.8954 23 21 22.1046 21 21C21 19.8954 21.8954 19 23 19C24.1046 19 25 19.8954 25 21C25 22.1046 24.1046 23 23 23Z" fill="white"/>
  <defs>
    <linearGradient id="saffron-grad" x1="8" y1="8" x2="38" y2="38" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F97316"/>
      <stop offset="1" stop-color="#DC2626"/>
    </linearGradient>
  </defs>
</svg>`;

const PUROHIT_PIN_SVG = `<svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="21" cy="21" r="20" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
  <circle cx="21" cy="21" r="14" fill="#D97706"/>
  <text x="21" y="26" font-size="14" text-anchor="middle" fill="white" font-weight="bold">🕉️</text>
</svg>`;
