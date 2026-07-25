import { UserBentoDashboard } from "@/components/dashboard/user-bento-dashboard";
import { getTranslations } from "next-intl/server";

export default async function UserDashboardPage() {
  const t = await getTranslations("Dashboard");
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard")}</h1>
        <p className="mt-1 text-muted-foreground">
          {t("greeting", { name: "Yajman" })}
        </p>
      </div>
      <UserBentoDashboard />
    </div>
  );
}
