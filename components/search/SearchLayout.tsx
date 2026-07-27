"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, SlidersHorizontal, MapPin } from "lucide-react";
import { api } from "@/lib/api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserResponse } from "@/types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { PurohitCard } from "./PurohitCard";
import { EXPERTISE_OPTIONS, SUPPORTED_LANGUAGES, PUJA_TRADITIONS } from "@/types";

export function SearchLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL State Extractors
  const getParam = (key: string) => searchParams.get(key) || "";
  const getBoolParam = (key: string) => searchParams.get(key) === "true";
  
  const currentLang = getParam("lang");
  const currentTradition = getParam("tradition");
  const currentCeremony = getParam("ceremony");
  const isEPuja = getBoolParam("e_puja");
  const radiusKm = getParam("radius") || "15";

  // Debounced/Callback URL updater
  const updateQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Default coordinates (User's location, ideally fetched from browser/store)
  const profile = useAuthStore((s) => s.profile) as UserResponse | null;
  const savedLat = profile?.saved_addresses?.[0]?.location?.coordinates?.[1];
  const savedLng = profile?.saved_addresses?.[0]?.location?.coordinates?.[0];
  
  const [lat, setLat] = useState(savedLat ?? 22.5726);
  const [lng, setLng] = useState(savedLng ?? 88.3639);
  const [locationName, setLocationName] = useState(profile?.saved_addresses?.[0]?.city || "Kolkata, WB");

  useEffect(() => {
    // If no saved address, try getting browser geolocation
    if (!savedLat || !savedLng) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLat(position.coords.latitude);
            setLng(position.coords.longitude);
            setLocationName("Current Location");
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      }
    }
  }, [savedLat, savedLng]);

  // React Query Fetcher
  const { data, isLoading, isError } = useQuery({
    queryKey: ["search_purohits", lat, lng, radiusKm, currentLang, currentTradition, currentCeremony, isEPuja],
    queryFn: async () => {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius_km: radiusKm,
      });
      if (currentLang) params.set("language", currentLang);
      if (currentTradition) params.set("tradition", currentTradition);
      if (currentCeremony) params.set("ceremony_type", currentCeremony);
      if (isEPuja) params.set("e_puja", "true");
      // Pagination can be added here

      const res = await api.get(`/search/purohits?${params.toString()}`);
      return res.data;
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 md:flex-row">
      
      {/* Sidebar Filters */}
      <aside className="w-full shrink-0 space-y-6 md:w-64">
        <div className="sticky top-20 rounded-3xl border border-white/50 dark:border-white/12 glass p-5 shadow-xl">
          <div className="flex items-center gap-2 pb-4 border-b mb-4">
            <SlidersHorizontal className="size-5" />
            <h2 className="font-semibold">Filters</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Ceremony Type</Label>
              <Select value={currentCeremony} onValueChange={(v) => updateQueryString("ceremony", v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ceremonies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ceremonies</SelectItem>
                  {EXPERTISE_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={currentLang} onValueChange={(v) => updateQueryString("lang", v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Language</SelectItem>
                  {SUPPORTED_LANGUAGES.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tradition</Label>
              <Select value={currentTradition} onValueChange={(v) => updateQueryString("tradition", v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Tradition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Tradition</SelectItem>
                  {PUJA_TRADITIONS.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Distance (km)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  min="1" 
                  max="200" 
                  value={radiusKm} 
                  onChange={(e) => updateQueryString("radius", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="epuja" 
                checked={isEPuja}
                onCheckedChange={(checked) => updateQueryString("e_puja", checked ? "true" : "")}
              />
              <label
                htmlFor="epuja"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Available for E-Puja
              </label>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-6"
            onClick={() => router.push(pathname)}
          >
            Clear Filters
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Discover Purohits</h1>
            <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="size-4" /> Near {locationName}
            </p>
          </div>
          <p className="text-muted-foreground">{data?.total || 0} found near you</p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex h-64 items-center justify-center text-destructive">
            Failed to load purohits.
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center">
            <p className="text-lg font-medium">No Purohits found.</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or expanding your search radius.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data.data.map((purohit: any) => (
              <PurohitCard key={purohit._id} purohit={purohit} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
