import { PurohitDashboard } from "@/components/dashboard/purohit-dashboard";

export default function PurohitDashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Go online to start receiving nearby booking requests.
        </p>
      </div>
      <PurohitDashboard />
    </div>
  );
}
