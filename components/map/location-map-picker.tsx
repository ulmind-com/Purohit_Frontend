"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Circle,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { LocateFixed, MapPin, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DEFAULT_MAP_CENTER, GOOGLE_MAPS_API_KEY } from "@/lib/constants";
import { useGeolocation } from "@/hooks/useGeolocation";

const LIBRARIES: "places"[] = ["places"];

export interface PickedLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface LocationMapPickerProps {
  value?: PickedLocation | null;
  onChange: (location: PickedLocation) => void;
  className?: string;
  mapHeight?: string;
  /** Optional radius (km) to preview as a translucent circle — used by the Purohit's service-radius setup. */
  radiusKm?: number;
}

export function LocationMapPicker({
  value,
  onChange,
  className,
  mapHeight = "320px",
  radiusKm,
}: LocationMapPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "purohit-booking-google-maps",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [marker, setMarker] = useState<PickedLocation>(
    value ?? { ...DEFAULT_MAP_CENTER, formattedAddress: "" }
  );
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const { locate, loading: locating, coords } = useGeolocation();

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
    geocoderRef.current?.geocode({ location: { lat, lng } }, (results, status) => {
      const formattedAddress =
        status === "OK" && results?.[0] ? results[0].formatted_address : "";
      const next = { lat, lng, formattedAddress };
      setMarker(next);
      onChange(next);
    });
  }, [onChange]);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      reverseGeocode(e.latLng.lat(), e.latLng.lng());
    },
    [reverseGeocode]
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      reverseGeocode(e.latLng.lat(), e.latLng.lng());
    },
    [reverseGeocode]
  );

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    const loc = place?.geometry?.location;
    if (!loc) return;
    const next = {
      lat: loc.lat(),
      lng: loc.lng(),
      formattedAddress: place?.formatted_address ?? "",
    };
    setMarker(next);
    onChange(next);
  }, [onChange]);

  const handleUseCurrentLocation = useCallback(() => {
    locate();
  }, [locate]);

  // Feed the resolved geolocation coords back into the map once available.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per new `coords` value only
  useEffect(() => {
    if (coords) reverseGeocode(coords.lat, coords.lng);
  }, [coords]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground",
          className
        )}
        style={{ height: mapHeight }}
      >
        <MapPin className="size-6 text-saffron-500" />
        <p className="font-medium text-foreground">Google Maps API key missing</p>
        <p>
          Set <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
          in <code className="rounded bg-muted px-1 py-0.5">.env.local</code> to enable the map picker.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load Google Maps. Check your API key and enabled APIs (Maps JavaScript API, Places API, Geocoding API).
      </div>
    );
  }

  if (!isLoaded) {
    return <Skeleton className={cn("w-full rounded-2xl", className)} style={{ height: mapHeight }} />;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-2">
        <Autocomplete
          onLoad={(a) => (autocompleteRef.current = a)}
          onPlaceChanged={handlePlaceChanged}
          className="flex-1"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for an address..."
              defaultValue={value?.formattedAddress}
              className="pl-9"
            />
          </div>
        </Autocomplete>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          title="Use my current location"
        >
          <LocateFixed className={cn("size-4", locating && "animate-pulse")} />
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: mapHeight }}
          center={marker}
          zoom={14}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            clickableIcons: false,
            styles: MAP_STYLE_MUTED,
          }}
        >
          <Marker
            position={marker}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
          {radiusKm && radiusKm > 0 && (
            <Circle
              center={marker}
              radius={radiusKm * 1000}
              options={{
                strokeColor: "#EA580C",
                strokeOpacity: 0.6,
                strokeWeight: 2,
                fillColor: "#FB923C",
                fillOpacity: 0.12,
              }}
            />
          )}
        </GoogleMap>
      </div>

      {marker.formattedAddress && (
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-saffron-500" />
          {marker.formattedAddress}
        </p>
      )}
    </div>
  );
}

// A soft, muted map style so the saffron accent markers pop.
const MAP_STYLE_MUTED: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ saturation: -60 }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];
