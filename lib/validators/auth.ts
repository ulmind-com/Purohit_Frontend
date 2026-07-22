import { z } from "zod";

import { EXPERTISE_OPTIONS } from "@/types";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

const sharedSignupFields = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  mobile_number: z
    .string()
    .min(10, "Enter a valid mobile number")
    .max(15, "Enter a valid mobile number")
    .regex(/^\+?[0-9]{10,15}$/, "Digits only (10-15), optional leading +"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
};

export const userSignupSchema = z.object(sharedSignupFields);
export type UserSignupFormValues = z.infer<typeof userSignupSchema>;

export const purohitSignupSchema = z.object({
  ...sharedSignupFields,
  expertise: z
    .array(z.enum(EXPERTISE_OPTIONS))
    .min(1, "Select at least one area of expertise"),
  service_radius_km: z
    .number()
    .min(1, "Radius must be at least 1 km")
    .max(100, "Radius must be under 100 km"),
  price: z.number().gt(0, "Base dakshina must be greater than 0"),
  address_text: z.string().min(3, "Enter your base address").optional(),
  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .refine((v) => v.coordinates[0] !== 0 || v.coordinates[1] !== 0, {
      message: "Pin your base location on the map",
    }),
});

export type PurohitSignupFormValues = z.infer<typeof purohitSignupSchema>;
