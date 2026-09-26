import { EnginesView } from "@/components/analytics-dashboard/engines-view";
import { engines, snapshot } from "@/lib/snapshot";

export const metadata = { title: "Engines" };

export default function EnginesPage() {
  return <EnginesView engines={engines} timeZone={snapshot.timeZone} readOnly />;
}
