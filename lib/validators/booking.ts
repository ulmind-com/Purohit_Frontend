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
  budget: z.number().gt(0, "Enter an offered dakshina amount"),
  location: bookingLocationSchema,
});
export type BookingWizardValues = z.infer<typeof bookingWizardSchema>;
