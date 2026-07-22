import { UserBookingWizard } from "@/components/booking/user-booking-wizard";

export default function BookPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Book a Puja</h1>
        <p className="mt-1 text-muted-foreground">
          Tell us what you need — we&apos;ll match you with a nearby Purohit instantly.
        </p>
      </div>
      <UserBookingWizard />
    </div>
  );
}
