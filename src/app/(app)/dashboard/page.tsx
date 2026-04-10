import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getDatasetOverview } from "@/lib/health-data";

export default async function Dashboard() {
  const overview = await getDatasetOverview();

  return <DashboardClient overview={overview} />;
}
