"use client";

import { Circle, GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

import { Skeleton } from "@/components/ui/skeleton";
import { GOOGLE_MAPS_API_KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PurohitRadiusMapProps {
  center: { lat: number; lng: number };
  radiusKm: number;
  online: boolean;
  height?: string;
  className?: string;
}

/** Read-only "driver app" map: current position + live service radius. */
export function PurohitRadiusMap({
  center,
  radiusKm,
  online,
  height = "420px",
  className,
}: PurohitRadiusMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "purohit-booking-google-maps",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground",
          className
        )}
        style={{ height }}
      >
        Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to preview your live radius map.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return <Skeleton className={cn("w-full rounded-2xl", className)} style={{ height }} />;
  }

  const strokeColor = online ? "#EA580C" : "#94a3b8";
  const fillColor = online ? "#FB923C" : "#94a3b8";

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border shadow-sm", className)}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height }}
        center={center}
        zoom={12}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          styles: MUTED_STYLE,
        }}
      >
        <Circle
          center={center}
          radius={radiusKm * 1000}
          options={{
            strokeColor,
            strokeOpacity: 0.7,
            strokeWeight: 2,
            fillColor,
            fillOpacity: 0.1,
          }}
        />
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}

const MUTED_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ saturation: -60 }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];
