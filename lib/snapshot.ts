import snapshotJson from "@/data/snapshot.json";
import enginesJson from "@/data/engines.json";
import type { AnalyticsSnapshot, EngineStatus } from "@/components/analytics-dashboard/types";

/** The baked analytics snapshot every page renders (exported by the app's demo:publish). */
export const snapshot = snapshotJson as unknown as AnalyticsSnapshot;

/** Execution engines' status at publish time (no local folder paths). */
export const engines = enginesJson as unknown as EngineStatus[];

/** Demo routes live at the site root with trailing slashes (GitHub Pages). */
export const NAV = { base: "", trailingSlash: true } as const;
