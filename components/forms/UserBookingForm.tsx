"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Languages, ScrollText, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CEREMONY_TYPES } from "@/lib/constants";
import {
  SUPPORTED_LANGUAGES,
  PUJA_TRADITIONS,
  type SupportedLanguage,
  type PujaTradition,
  type GeoJSONPoint,
} from "@/types";
import { requestBooking, type UberBookingRequestPayload } from "@/lib/api/bookings";

// --- Zod Schema with optional language and tradition ---
export const userBookingFormSchema = z.object({
  ceremony_type: z.string().min(2, "Select a ceremony type"),
  budget: z.number().gt(0, "Enter an offered dakshina amount"),
  preferred_language: z.enum(SUPPORTED_LANGUAGES).nullable().optional(),
  preferred_tradition: z.enum(PUJA_TRADITIONS).nullable().optional(),
  scheduled_start_time: z.string().optional(),
  scheduled_end_time: z.string().optional(),
});

export type UserBookingFormValues = z.infer<typeof userBookingFormSchema>;

interface UserBookingFormProps {
  location: GeoJSONPoint;
  onSuccess?: (bookingId: string) => void;
}

export function UserBookingForm({ location, onSuccess }: UserBookingFormProps) {
  const form = useForm<UserBookingFormValues>({
    resolver: zodResolver(userBookingFormSchema),
    defaultValues: {
      ceremony_type: CEREMONY_TYPES[0],
      budget: 2100,
      preferred_language: null,
      preferred_tradition: null,
    },
  });

  const onSubmit = async (values: UserBookingFormValues) => {
    try {
      // Sanitize null / undefined values
      const sanitizedLanguage = values.preferred_language
        ? (values.preferred_language as SupportedLanguage)
        : null;

      const sanitizedTradition = values.preferred_tradition
        ? (values.preferred_tradition as PujaTradition)
        : null;


      const payload: UberBookingRequestPayload = {
        ceremony_type: values.ceremony_type,
        budget: values.budget,
        location,
        scheduled_start_time: values.scheduled_start_time,
        scheduled_end_time: values.scheduled_end_time,
        preferred_language: sanitizedLanguage,
        preferred_tradition: sanitizedTradition,
      };

      const doc = await requestBooking(payload);
      toast.success("Broadcast Request Dispatched!", {
        description: "Notifying nearby Purohits matching your language and tradition preferences.",
      });

      if (onSuccess) onSuccess(doc._id);
    } catch (error: any) {
      toast.error("Failed to submit request", {
        description: error?.message || "Please check your connection and try again.",
      });
    }
  };

  return (
    <Card className="rounded-3xl border bg-card/80 backdrop-blur-md shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl saffron-gradient text-white shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Cultural & Language Preference</CardTitle>
            <CardDescription className="text-xs">
              Optionally specify a preferred spoken language or Puja tradition for strict matching.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Preferred Language Dropdown */}
              <FormField
                control={form.control}
                name="preferred_language"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="flex items-center gap-1 text-xs font-semibold">
                        <Languages className="size-3.5 text-saffron-500" />
                        Preferred Spoken Language
                      </FormLabel>
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => field.onChange(null)}
                          className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <XCircle className="size-3" /> Any Language
                        </button>
                      )}
                    </div>
                    <Select
                      value={field.value || "ANY"}
                      onValueChange={(val) => field.onChange(val === "ANY" ? null : val)}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Any Language (Recommended)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ANY">
                          <span className="text-muted-foreground font-normal">Any Language (No restriction)</span>
                        </SelectItem>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preferred Tradition Dropdown */}
              <FormField
                control={form.control}
                name="preferred_tradition"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="flex items-center gap-1 text-xs font-semibold">
                        <ScrollText className="size-3.5 text-saffron-500" />
                        Puja Sampradaya / Tradition
                      </FormLabel>
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => field.onChange(null)}
                          className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <XCircle className="size-3" /> Any Tradition
                        </button>
                      )}
                    </div>
                    <Select
                      value={field.value || "ANY"}
                      onValueChange={(val) => field.onChange(val === "ANY" ? null : val)}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Any Tradition (No restriction)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ANY">
                          <span className="text-muted-foreground font-normal">Any Tradition (No restriction)</span>
                        </SelectItem>
                        {PUJA_TRADITIONS.map((tradition) => (
                          <SelectItem key={tradition} value={tradition}>
                            {tradition} Tradition
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-11 w-full rounded-full text-sm font-semibold saffron-gradient text-white shadow-md hover:shadow-lg transition-all"
            >
              {form.formState.isSubmitting ? "Dispatching Broadcast..." : "Find Matching Purohit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
