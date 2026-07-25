"use client";

import { useFormContext } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Sparkles, Video, Star } from "lucide-react";

export function ServiceToggles() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="provides_samagri"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 shadow-sm transition-colors hover:bg-muted/50">
            <div className="space-y-1.5 pr-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-amber-500" />
                <FormLabel className="text-base font-semibold">Samagri Provider</FormLabel>
              </div>
              <FormDescription>
                "I will bring all the required Puja Samagri." This automatically adds the Samagri cost to your base price and boosts booking chances by 40%.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-amber-500"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="available_for_epuja"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 shadow-sm transition-colors hover:bg-muted/50">
            <div className="space-y-1.5 pr-4">
              <div className="flex items-center gap-2">
                <Video className="size-5 text-blue-500" />
                <FormLabel className="text-base font-semibold">Available for E-Puja</FormLabel>
              </div>
              <FormDescription>
                Allow Yajmans from around the world to book you for virtual pujas via high-quality LiveKit video calls. Great for NRI clients!
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-blue-500"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="provides_astrology"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 shadow-sm transition-colors hover:bg-muted/50">
            <div className="space-y-1.5 pr-4">
              <div className="flex items-center gap-2">
                <Star className="size-5 text-indigo-500" />
                <FormLabel className="text-base font-semibold">Astrology & Horoscope</FormLabel>
              </div>
              <FormDescription>
                Enable this if you provide Koshthi Bichar, Matchmaking, or Muhurat finding services. This ranks your profile in the cross-selling engine.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-indigo-500"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
