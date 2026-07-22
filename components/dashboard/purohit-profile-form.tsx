"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LocationMapPicker } from "@/components/map/location-map-picker";
import { EXPERTISE_OPTIONS, type PurohitResponse } from "@/types";
import { updateMyPurohitProfile } from "@/lib/api/purohits";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/api/axios";

const schema = z.object({
  name: z.string().min(2),
  mobile_number: z.string().min(10).max(15),
  expertise: z.array(z.enum(EXPERTISE_OPTIONS)).min(1, "Select at least one"),
  price: z.coerce.number().gt(0),
  service_radius_km: z.coerce.number().min(1).max(200),
});
type FormValues = z.infer<typeof schema>;

export function PurohitProfileForm({ profile }: { profile: PurohitResponse }) {
  const setProfile = useAuthStore((s) => s.setProfile);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: profile.name,
      mobile_number: profile.mobile_number,
      expertise: profile.expertise,
      price: profile.price,
      service_radius_km: profile.service_radius_km,
    },
  });

  const mutation = useMutation({
    mutationFn: updateMyPurohitProfile,
    onSuccess: (updated) => {
      setProfile(updated);
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error("Couldn't update profile", {
        description: error instanceof ApiError ? error.message : undefined,
      });
    },
  });

  const radius = form.watch("service_radius_km");
  const [lng, lat] = profile.location.coordinates;

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purohit profile</CardTitle>
        <CardDescription>
          Update your expertise, Dakshina, and service radius.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile_number"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Mobile number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expertise"
              render={() => (
                <FormItem>
                  <FormLabel>Areas of expertise</FormLabel>
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/30 p-3 sm:grid-cols-3">
                    {EXPERTISE_OPTIONS.map((option) => (
                      <FormField
                        key={option}
                        control={form.control}
                        name="expertise"
                        render={({ field }) => {
                          const checked = field.value?.includes(option);
                          return (
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-background">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(isChecked) => {
                                  const current = field.value ?? [];
                                  field.onChange(
                                    isChecked
                                      ? [...current, option]
                                      : current.filter((v) => v !== option)
                                  );
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Dakshina (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="service_radius_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service radius: {radius} km</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={200}
                        step={1}
                        value={[field.value]}
                        onValueChange={([v]) => field.onChange(v)}
                        className="pt-2.5"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Base location</FormLabel>
              <p className="mb-2 text-xs text-muted-foreground">
                To change this, drag the pin — new location is saved with your other changes on submit.
              </p>
              <LocationMapPicker
                mapHeight="240px"
                radiusKm={radius}
                value={{ lat, lng, formattedAddress: profile.address_text ?? "" }}
                onChange={(loc) =>
                  mutation.mutate({
                    location: { type: "Point", coordinates: [loc.lng, loc.lat] },
                    address_text: loc.formattedAddress,
                  })
                }
              />
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
