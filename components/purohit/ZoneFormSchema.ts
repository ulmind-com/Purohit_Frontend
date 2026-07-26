import { z } from "zod";

export const zoneSchema = z.object({
  service_zones: z
    .array(
      z.object({
        id: z.string(),
        lat: z.number(),
        lng: z.number(),
        radius_km: z.number().min(1, "Min 1 km").max(500, "Max 500 km"),
        name: z.string().min(1, "Zone name is required"),
      })
    )
    .min(1, "Please define at least one service zone."),
});

export type ZoneFormValues = z.infer<typeof zoneSchema>;
