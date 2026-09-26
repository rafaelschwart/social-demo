import snapshotJson from "@/data/snapshot.json";
import { AnalyticsDashboard } from "@/components/analytics-dashboard/analytics-dashboard";
import type { AnalyticsSnapshot } from "@/components/analytics-dashboard/types";
import { DemoHeader } from "@/components/demo-header";

const snapshot = snapshotJson as unknown as AnalyticsSnapshot;

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col">
      <DemoHeader />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <AnalyticsDashboard snapshot={snapshot} linkMode="external" />
      </main>
      <footer className="border-t border-[var(--color-border)] px-4 py-5 text-center text-[11px] text-[var(--color-faint)]">
        Read-only snapshot · data via Zernio · built by Arqentia
      </footer>
    </div>
  );
}
