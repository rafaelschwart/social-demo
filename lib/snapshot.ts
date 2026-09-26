import snapshotJson from "@/data/snapshot.json";
import type { AnalyticsSnapshot } from "@/components/analytics-dashboard/types";

/** The baked analytics snapshot every page renders (exported by the app's demo:publish). */
export const snapshot = snapshotJson as unknown as AnalyticsSnapshot;

/** Demo routes live at the site root with trailing slashes (GitHub Pages). */
export const NAV = { base: "", trailingSlash: true } as const;
