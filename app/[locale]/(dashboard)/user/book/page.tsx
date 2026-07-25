import { UserBookingWizard } from "@/components/booking/user-booking-wizard";
import { useTranslations } from "next-intl";

export default function BookPage() {
  const t = useTranslations("Booking");
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("bookPujaTitle")}</h1>
        <p className="mt-1 text-muted-foreground">
          {t("bookPujaSubtitle")}
        </p>
      </div>
      <UserBookingWizard />
    </div>
  );
}
