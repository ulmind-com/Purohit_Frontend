"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Circle, Marker } from "@react-google-maps/api";
import { Loader2, Map as MapIcon } from "lucide-react";
import api from "@/lib/api/axios";

// Map container styling
const containerStyle = {
  width: "100%",
  height: "100%",
};

// Default center (Kolkata)
const center = {
  lat: 22.5726,
  lng: 88.3639,
};

// Custom styles to make it dark mode / God View
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

interface PurohitZone {
  purohit_name: string;
  zone_name: string;
  lat: number;
  lng: number;
  radius_km: number;
}

interface LiveBooking {
  id: string;
  lat: number;
  lng: number;
}

export default function LiveMapPage() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", // Ensure you add this to .env
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [zones, setZones] = useState<PurohitZone[]>([]);
  const [bookings, setBookings] = useState<LiveBooking[]>([]);

  const fetchMapData = async () => {
    try {
      const res = await api.get("/admin/analytics/live-map");
      setZones(res.data.purohit_zones);
      setBookings(res.data.live_bookings);
    } catch (err) {
      console.error("Failed to fetch map data", err);
    }
  };

  useEffect(() => {
    fetchMapData();
    // Simulate real-time by polling every 5 seconds (MVP)
    const interval = setInterval(fetchMapData, 5000);
    return () => clearInterval(interval);
  }, []);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <MapIcon className="text-amber-500" />
          Live God-View Map
        </h1>
        <p className="text-slate-400 mt-2">Real-time monitoring of Purohit Service Zones and incoming user requests.</p>
      </div>

      <div className="flex-1 w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
        {!isLoaded ? (
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
             <Loader2 className="size-10 animate-spin text-amber-500" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={11}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              styles: mapStyles,
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            {/* Draw Purohit Service Zones */}
            {zones.map((zone, idx) => (
              <Circle
                key={`zone-${idx}`}
                center={{ lat: zone.lat, lng: zone.lng }}
                radius={zone.radius_km * 1000} // convert to meters
                options={{
                  strokeColor: "#3b82f6", // Blue stroke
                  strokeOpacity: 0.5,
                  strokeWeight: 1,
                  fillColor: "#3b82f6", // Transparent blue fill
                  fillOpacity: 0.1,
                }}
              />
            ))}

            {/* Draw Live Incoming Bookings */}
            {bookings.map((booking) => (
              <Marker
                key={booking.id}
                position={{ lat: booking.lat, lng: booking.lng }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#ef4444", // Red fill for urgent bookings
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#ffffff",
                }}
                animation={google.maps.Animation.BOUNCE}
              />
            ))}
          </GoogleMap>
        )}
      </div>
    </div>
  );
}
