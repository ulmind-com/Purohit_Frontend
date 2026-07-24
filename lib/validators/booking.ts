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
  ceremonyType: z.enum(CEREMONY_TYPES, {
    message: "Choose a ceremony type",
  }),
  date: z.date({
    error: "A date is required.",
  }),
  time: z.string({
    error: "A start time is required.",
  }),
  durationHours: z.number().min(1, "Duration must be at least 1 hour"),
  budget: z.number().gt(0, "Enter an offered dakshina amount"),
  location: bookingLocationSchema,
  isEPuja: z.boolean().optional(),
  yajmanName: z.string().optional(),
  gotra: z.string().optional(),
  purpose: z.string().optional(),
  nakshatra: z.string().optional(),
});

export type BookingWizardValues = z.infer<typeof bookingWizardSchema>;
