import { AnalyticsClient } from "@/components/dashboard/AnalyticsClient";
import { getDatasetOverview } from "@/lib/health-data";

export default async function Analytics() {
  const overview = await getDatasetOverview();

  return <AnalyticsClient overview={overview} />;
}
