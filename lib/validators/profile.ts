import { z } from "zod";

// Mirrors `UserUpdate` in app/models/user.py exactly — note the backend
// field is `phone`, not `mobile_number`, despite `UserBase` using
// `mobile_number` for signup. Keep both spellings straight.
export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Enter a 10-digit phone number")
    .optional()
    .or(z.literal("")),
});
export type UserProfileFormValues = z.infer<typeof userProfileSchema>;

export const addressSchema = z.object({
  title: z.string().min(1, "Give this address a label").max(50),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(4, "Enter a valid ZIP/PIN code"),
});
export type AddressFormValues = z.infer<typeof addressSchema>;
