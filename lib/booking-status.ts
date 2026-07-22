import type { BookingStatus } from "@/types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
  Pending: "outline",
  SEARCHING: "outline",
  Confirmed: "default",
  ACCEPTED: "default",
  Completed: "secondary",
  Cancelled: "destructive",
};

export function statusLabel(status: BookingStatus | string) {
  if (status === "SEARCHING") return "Searching";
  if (status === "ACCEPTED") return "Accepted";
  return status;
}
