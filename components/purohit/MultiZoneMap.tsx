"use client";

import { useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { MapPin } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { GOOGLE_MAPS_API_KEY } from "@/lib/constants";
import { GOOGLE_MAPS_LOADER_OPTIONS } from "@/lib/google-maps-loader";
import type { ZoneFormValues } from "./ZoneFormSchema";

const MAP_STYLE_MUTED: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ saturation: -60 }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const CIRCLE_OPTIONS: google.maps.CircleOptions = {
  fillColor: "#f97316",
  fillOpacity: 0.15,
  strokeColor: "#ea580c",
  strokeWeight: 2,
  strokeOpacity: 0.6,
  clickable: false,
};

const DEFAULT_CENTER = { lat: 22.5726, lng: 88.3639 }; // Kolkata

export function MultiZoneMap() {
  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);
  const { control } = useFormContext<ZoneFormValues>();
  const { append } = useFieldArray({ control, name: "service_zones" });
  const zones = useWatch({ control, name: "service_zones" });
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      // Reverse geocode to get a human-readable name
      if (!geocoderRef.current && window.google) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }

      geocoderRef.current?.geocode(
        { location: { lat, lng } },
        (results, status) => {
          let name = `Zone ${(zones?.length ?? 0) + 1}`;
          if (status === "OK" && results?.[0]) {
            // Try to find locality or sublocality
            const locality = results[0].address_components?.find((c) =>
              c.types.includes("locality") || c.types.includes("sublocality")
            );
            const city = results[0].address_components?.find((c) =>
              c.types.includes("administrative_area_level_2")
            );
            name = locality?.long_name || city?.long_name || results[0].formatted_address.split(",")[0];
          }

          append({
            id: crypto.randomUUID(),
            lat,
            lng,
            radius_km: 10,
            name,
          });
        }
      );
    },
    [append, zones?.length]
  );

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground h-[500px]">
        <MapPin className="size-6 text-orange-500" />
        <p className="font-medium text-foreground">Google Maps API key missing</p>
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
    return <Skeleton className="w-full h-[500px] rounded-2xl" />;
  }

  const mapCenter =
    zones && zones.length > 0
      ? { lat: zones[0].lat, lng: zones[0].lng }
      : DEFAULT_CENTER;

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "500px" }}
        center={mapCenter}
        zoom={zones && zones.length > 0 ? 10 : 7}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          styles: MAP_STYLE_MUTED,
        }}
      >
        {zones?.map((zone, index) => (
          <div key={zone.id || index}>
            <Marker
              position={{ lat: zone.lat, lng: zone.lng }}
              label={{
                text: `${index + 1}`,
                color: "#fff",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            />
            <Circle
              center={{ lat: zone.lat, lng: zone.lng }}
              radius={zone.radius_km * 1000}
              options={CIRCLE_OPTIONS}
            />
          </div>
        ))}
      </GoogleMap>
    </div>
  );
}
