import { z } from "zod";

import { CEREMONY_TYPES } from "@/lib/constants";

export const bookingLocationSchema = z.object({
  label: z.string().min(1, "Select a location"),
  formattedAddress: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
});
export type BookingLocationValue = z.infer<typeof bookingLocationSchema>;

export const bookingWizardSchema = z.object({
  ceremonyType: z.string().min(2, "Choose or enter a ceremony type"),
  date: z.date({
    error: "A date is required.",
  }),
  time: z.string({
    error: "A start time is required.",
  }),
  durationHours: z.number().min(1, "Duration must be at least 1 hour"),
  offered_dakshina: z.number().min(101, "Minimum Dakshina is ₹101"),
  location: bookingLocationSchema,
  isEPuja: z.boolean().optional(),
  yajmanName: z.string().optional(),
  gotra: z.string().optional(),
  purpose: z.string().optional(),
  nakshatra: z.string().optional(),
  preferredLanguage: z.string().nullable().optional(),
  preferredTradition: z.string().nullable().optional(),
});


export type BookingWizardValues = z.infer<typeof bookingWizardSchema>;
