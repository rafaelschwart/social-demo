import { OverviewView } from "@/components/analytics-dashboard/overview";
import { NAV, snapshot } from "@/lib/snapshot";

export default function OverviewPage() {
  return <OverviewView snapshot={snapshot} linkMode="external" nav={NAV} />;
}
