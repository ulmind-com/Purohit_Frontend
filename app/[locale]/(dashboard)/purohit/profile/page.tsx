"use client";

import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { isBefore, startOfDay, parseISO } from "date-fns";
import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "@/store/useAuthStore";
import { updateMyPurohitProfile } from "@/lib/api/purohits";
import { ApiError } from "@/lib/api/axios";
import { EXPERTISE_OPTIONS } from "@/types";

import { ProfileFormSkeleton } from "@/components/shared/loading-skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { MultiZoneMap } from "@/components/purohit/MultiZoneMap";
import { ZoneControlPanel } from "@/components/purohit/ZoneControlPanel";
import { SecureCloudinaryUpload } from "@/components/ui/SecureCloudinaryUpload";
import { ServiceToggles } from "@/components/purohit/ServiceToggles";
import { LeaveCalendar } from "@/components/purohit/LeaveCalendar";

// Zod schema matching the backend models
// Service Zone sub-schema
const serviceZoneSchema = z.object({
  id: z.string(),
  lat: z.number(),
  lng: z.number(),
  radius_km: z.number().min(1, "Min 1 km").max(500, "Max 500 km"),
  name: z.string().min(1, "Zone name is required"),
});

const profileSchema = z.object({
  name: z.string().min(2),
  mobile_number: z.string().min(10).max(15),
  expertise: z.array(z.string()).min(1, "Select at least one"),
  price: z.coerce.number().gt(0),
  service_zones: z.array(serviceZoneSchema).min(1, "Please define at least one service zone."),
  
  // New Fields
  experience_years: z.coerce.number().min(0).default(0),
  education_upadhi: z.string().default(""),
  temple_affiliation: z.string().optional().nullable(),
  mantra_audio_url: z.string().optional().nullable(),
  gallery_urls: z.array(z.string()).default([]),
  kyc_document_url: z.string().optional().nullable(),
  
  provides_samagri: z.boolean().default(false),
  available_for_epuja: z.boolean().default(false),
  provides_astrology: z.boolean().default(false),
  
  blocked_dates: z.array(z.date()).default([]).refine((dates) => {
    return dates.every(date => !isBefore(date, startOfDay(new Date())));
  }, { message: "Cannot block dates in the past" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function PurohitProfilePage() {
  const profile = useAuthStore((s) => s.profile) as any;
  const setProfile = useAuthStore((s) => s.setProfile);
  const [activeTab, setActiveTab] = useState("basic");

  // Handle parsing string dates to Date objects for the form
  const defaultBlockedDates = profile?.blocked_dates?.map((d: string | Date) => 
    typeof d === "string" ? parseISO(d) : d
  ) || [];

  // Transform backend service_zones (GeoJSON) to form format (flat lat/lng)
  const defaultZones = (profile?.service_zones || []).map((z: any) => ({
    id: z.id || crypto.randomUUID(),
    name: z.name || "Zone",
    lat: z.location?.coordinates?.[1] ?? 22.5726,
    lng: z.location?.coordinates?.[0] ?? 88.3639,
    radius_km: z.radius_km || 10,
  }));

  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      mobile_number: profile?.mobile_number || "",
      expertise: profile?.expertise || [],
      price: profile?.price || 1001,
      service_zones: defaultZones,
      experience_years: profile?.experience_years || 0,
      education_upadhi: profile?.education_upadhi || "",
      temple_affiliation: profile?.temple_affiliation || "",
      mantra_audio_url: profile?.mantra_audio_url || "",
      gallery_urls: profile?.gallery_urls || [],
      kyc_document_url: profile?.kyc_document_url || "",
      provides_samagri: profile?.provides_samagri || false,
      available_for_epuja: profile?.available_for_epuja || false,
      provides_astrology: profile?.provides_astrology || false,
      blocked_dates: defaultBlockedDates,
    },
  });

  const mutation = useMutation({
    mutationFn: updateMyPurohitProfile,
    onSuccess: (updated) => {
      setProfile(updated);
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Couldn't update profile", {
        description: error instanceof ApiError ? error.message : "Something went wrong.",
      });
    },
  });

  function onSubmit(values: ProfileFormValues) {
    // Transform zones from flat lat/lng to backend GeoJSON format
    const { service_zones, ...rest } = values;
    const dataToSubmit = {
      ...rest,
      blocked_dates: values.blocked_dates.map(d => d.toISOString()),
      service_zones: service_zones.map((z) => ({
        id: z.id,
        name: z.name,
        location: {
          type: "Point" as const,
          coordinates: [z.lng, z.lat] as [number, number],
        },
        radius_km: z.radius_km,
      })),
    };
    mutation.mutate(dataToSubmit as any);
  }

  if (!profile) return <ProfileFormSkeleton />;



  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Premium Profile Engine</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your high-trust portfolio, media, and availability to attract more Yajmans.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid h-12 w-full grid-cols-4 rounded-xl p-1">
              <TabsTrigger value="basic" className="rounded-lg text-sm sm:text-base">Basic & Cultural</TabsTrigger>
              <TabsTrigger value="media" className="rounded-lg text-sm sm:text-base">Media & Portfolio</TabsTrigger>
              <TabsTrigger value="services" className="rounded-lg text-sm sm:text-base">Services & Upsell</TabsTrigger>
              <TabsTrigger value="scheduling" className="rounded-lg text-sm sm:text-base">Scheduling</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mt-6"
              >
                {/* 1. Basic & Cultural */}
                <TabsContent value="basic" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={methods.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="mobile_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="experience_years"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl><Input type="number" min={0} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="education_upadhi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education / Upadhi (e.g. Kabyatirtha)</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="temple_affiliation"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Temple Affiliation (Optional)</FormLabel>
                          <FormControl><Input placeholder="E.g., Dakshineswar Kali Temple" {...field} value={field.value || ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={methods.control}
                    name="expertise"
                    render={() => (
                      <FormItem>
                        <FormLabel>Areas of Expertise</FormLabel>
                        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/30 p-3 sm:grid-cols-3">
                          {EXPERTISE_OPTIONS.map((option) => (
                            <FormField
                              key={option}
                              control={methods.control}
                              name="expertise"
                              render={({ field }) => {
                                const checked = field.value?.includes(option);
                                return (
                                  <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-background">
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(isChecked) => {
                                        const current = field.value ?? [];
                                        field.onChange(isChecked ? [...current, option] : current.filter((v) => v !== option));
                                      }}
                                    />
                                    {option}
                                  </label>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Dakshina (₹)</FormLabel>
                        <FormControl><Input type="number" min={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Multi-Zone Service Areas */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                      <FormLabel className="text-base font-semibold">Service Zones</FormLabel>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click on the map to add zones where you provide services. Adjust each zone&apos;s radius independently.
                      </p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                      <MultiZoneMap />
                      <ZoneControlPanel />
                    </div>

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
                  </div>
                </TabsContent>

                {/* 2. Media & Portfolio */}
                <TabsContent value="media" className="m-0 space-y-6">
                  <FormField
                    control={methods.control}
                    name="kyc_document_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>KYC Verification (Aadhaar/Voter ID)</FormLabel>
                        <FormControl>
                          <SecureCloudinaryUpload
                            value={field.value || undefined}
                            onChange={field.onChange}
                            variant="kyc"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="my-6 border-t border-border" />
                  <FormField
                    control={methods.control}
                    name="mantra_audio_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mantra Chanting Audio</FormLabel>
                        <p className="text-sm text-muted-foreground mb-3">Upload a 30s audio of your chanting. This builds massive trust!</p>
                        <FormControl>
                          <SecureCloudinaryUpload
                            value={field.value || undefined}
                            onChange={field.onChange}
                            accept="audio/*"
                            resourceType="video"
                            variant="audio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="my-6 border-t border-border" />
                  <FormField
                    control={methods.control}
                    name="gallery_urls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Puja Gallery</FormLabel>
                        <p className="text-sm text-muted-foreground mb-3">Upload photos from previous pujas you've conducted.</p>
                        <FormControl>
                          <SecureCloudinaryUpload
                            value={field.value}
                            onChange={field.onChange}
                            multiple
                            maxFiles={6}
                            variant="gallery"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* 3. Services & Upsell */}
                <TabsContent value="services" className="m-0">
                  <ServiceToggles />
                </TabsContent>

                {/* 4. Scheduling */}
                <TabsContent value="scheduling" className="m-0">
                  <LeaveCalendar />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>

          <div className="sticky bottom-0 left-0 right-0 mt-8 flex justify-end border-t bg-background/80 p-4 backdrop-blur-md">
            <Button size="lg" type="submit" disabled={mutation.isPending} className="shadow-lg">
              {mutation.isPending ? <Loader2 className="mr-2 size-5 animate-spin" /> : <Save className="mr-2 size-5" />}
              Save Profile Settings
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
