"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPinned, Save } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiZoneMap } from "@/components/purohit/MultiZoneMap";
import { ZoneControlPanel } from "@/components/purohit/ZoneControlPanel";
import { zoneSchema, type ZoneFormValues } from "@/components/purohit/ZoneFormSchema";
import { api } from "@/lib/api/axios";
import { useAuthStore } from "@/store/useAuthStore";

export default function ZonesPage() {
  const [saving, setSaving] = useState(false);
  const profile = useAuthStore((s) => s.profile);

  const methods = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      service_zones: ((profile as any)?.service_zones as ZoneFormValues["service_zones"]) ?? [],
    },
  });

  const onSubmit = async (data: ZoneFormValues) => {
    setSaving(true);
    try {
      // Transform to backend format
      const payload = {
        service_zones: data.service_zones.map((z) => ({
          id: z.id,
          name: z.name,
          location: {
            type: "Point" as const,
            coordinates: [z.lng, z.lat] as [number, number],
          },
          radius_km: z.radius_km,
        })),
      };
      await api.patch("/purohits/me", payload);
      toast.success("Service zones saved successfully!");
    } catch (err) {
      toast.error("Failed to save zones. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20">
          <MapPinned className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Zones</h1>
          <p className="text-sm text-muted-foreground">
            Define the areas where you offer your services. Click on the map to add zones.
          </p>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Map */}
            <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Map View</CardTitle>
                <CardDescription>
                  Click anywhere on the map to add a new service zone.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <MultiZoneMap />
              </CardContent>
            </Card>

            {/* Controls */}
            <div className="space-y-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Your Zones</CardTitle>
                  <CardDescription>
                    Adjust radius or remove zones below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ZoneControlPanel />
                </CardContent>
              </Card>

              {/* Error message */}
              {methods.formState.errors.service_zones?.root?.message && (
                <p className="text-sm text-destructive">
                  {methods.formState.errors.service_zones.root.message}
                </p>
              )}
              {methods.formState.errors.service_zones?.message && (
                <p className="text-sm text-destructive">
                  {methods.formState.errors.service_zones.message}
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600"
                size="lg"
              >
                {saving ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                Save Zones
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
