/**
 * Serializable analytics snapshot — the single input of the analytics
 * dashboard. Built server-side from the local mirror (lib/services/
 * analytics-snapshot.ts) and also exported as JSON for the static public demo,
 * so nothing in this folder may import server-only code.
 */
export type Brand = "personal" | "arqentia";
export type Platform = "twitter" | "linkedin" | "instagram";

export interface SnapshotAccount {
  key: string;
  platform: Platform;
  brand: Brand;
  handle: string;
  displayName: string | null;
  followers: number | null;
}

export interface SnapshotPost {
  id: string;
  accountKey: string;
  platform: Platform;
  brand: Brand;
  publishedAt: string;
  text: string | null;
  mediaType: string | null;
  thumbnailUrl: string | null;
  /** Public post URL on the platform, when known. */
  url: string | null;
  /** Internal detail page, when the dashboard runs inside the app. */
  href: string | null;
  impressions: number | null;
  reach: number | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  /** likes + comments + shares + saves; null when the platform exposes none. */
  engagements: number | null;
  /** Fraction (0.084 = 8.4%) on the platform's basis — see ER_BASIS. */
  engagementRate: number | null;
  /** Composite performance score, 0–1 (relative to the account/platform cohort). */
  score: number | null;
}

export interface AnalyticsSnapshot {
  generatedAt: string;
  /** IANA timezone every calendar day is computed in (the operator's). */
  timeZone: string;
  lastSyncedAt: string | null;
  accounts: SnapshotAccount[];
  posts: SnapshotPost[];
}

export const PLATFORM_ORDER: Platform[] = ["twitter", "linkedin", "instagram"];

export const PLATFORM_META: Record<Platform, { label: string; color: string; erBasis: string }> = {
  twitter: { label: "X", color: "var(--color-platform-x)", erBasis: "impressions" },
  linkedin: { label: "LinkedIn", color: "var(--color-platform-linkedin)", erBasis: "impressions" },
  instagram: { label: "Instagram", color: "var(--color-platform-instagram)", erBasis: "reach" },
};

export const BRAND_META: Record<Brand, { label: string; blurb: string }> = {
  personal: { label: "Personal", blurb: "Rafael Schwart" },
  arqentia: { label: "Arqentia", blurb: "Company accounts" },
};
