import { BestTimesView } from "@/components/analytics-dashboard/best-times-view";
import { snapshot } from "@/lib/snapshot";

export const metadata = { title: "Best times to post" };

export default function BestTimesPage() {
  return <BestTimesView snapshot={snapshot} />;
}
