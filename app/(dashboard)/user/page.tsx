import { UserBentoDashboard } from "@/components/dashboard/user-bento-dashboard";

export default function UserDashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          A quick look at your ceremonies and account.
        </p>
      </div>
      <UserBentoDashboard />
    </div>
  );
}
