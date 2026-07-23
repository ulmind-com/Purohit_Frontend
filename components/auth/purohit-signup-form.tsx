"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LocationMapPicker } from "@/components/map/location-map-picker";
import {
  purohitSignupSchema,
  type PurohitSignupFormValues,
} from "@/lib/validators/auth";
import { useSignupPurohit } from "@/hooks/useAuth";
import { EXPERTISE_OPTIONS } from "@/types";

export function PurohitSignupForm() {
  const signup = useSignupPurohit();
  const form = useForm<PurohitSignupFormValues>({
    resolver: zodResolver(purohitSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile_number: "",
      password: "",
      expertise: [],
      service_radius_km: 10,
      price: 2100,
      address_text: "",
      location: { type: "Point", coordinates: [0, 0] },
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const radius = form.watch("service_radius_km");

  function onSubmit(values: PurohitSignupFormValues) {
    signup.mutate({
      ...values,
      address_text: values.address_text || undefined,
    });
  }

  return (
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
                  <Input placeholder="Pandit Ram Sharma" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile_number"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Mobile number</FormLabel>
                <FormControl>
                  <Input placeholder="9876543210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
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
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-background"
                        >
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
                  <Input
                    type="number"
                    min={1}
                    placeholder="2100"
                    value={Number.isNaN(field.value) ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
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
                    max={50}
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

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base location</FormLabel>
              <FormControl>
                <LocationMapPicker
                  radiusKm={radius}
                  onChange={(loc) => {
                    field.onChange({
                      type: "Point",
                      coordinates: [loc.lng, loc.lat],
                    });
                    form.setValue("address_text", loc.formattedAddress, {
                      shouldValidate: true,
                    });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" size="lg" disabled={signup.isPending}>
          {signup.isPending && <Loader2 className="size-4 animate-spin" />}
          Create Purohit account
        </Button>
      </form>
    </Form>
  );
}
