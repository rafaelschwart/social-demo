import { RecommendationsView } from "@/components/analytics-dashboard/recommendations-view";
import { snapshot } from "@/lib/snapshot";

export const metadata = { title: "Recommendations" };

export default function RecommendationsPage() {
  return <RecommendationsView snapshot={snapshot} />;
}
