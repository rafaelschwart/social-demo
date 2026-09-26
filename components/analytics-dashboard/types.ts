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
  /** Fraction (0.084 = 8.4%): engagements ÷ impressions, as Zernio reports it on every platform. */
  engagementRate: number | null;
  /** Composite performance score, 0–1 (relative to the account/platform cohort). */
  score: number | null;
}

/** Every connected account (incl. platforms outside the analytics scope). */
export interface SnapshotConnection {
  key: string;
  /** Zernio platform id — may be outside Platform (tiktok, facebook, …). */
  platform: string;
  brand: Brand | null;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
  profileUrl: string | null;
  followers: number | null;
  followersUpdatedAt: string | null;
  status: "connected" | "disconnected" | "error" | "reauth_required";
  health: "healthy" | "warning" | "error";
  inAnalytics: boolean;
  postsTracked: number;
  /** True when post analytics are switched off for this account in Zernio (X: xCapabilities.analytics). */
  analyticsOff: boolean;
  /** Set when this "account" is reached through another connection (the LinkedIn company page). */
  via?: string | null;
}

export interface SpecialistPoint {
  point: string;
  evidence: string;
}

export interface SpecialistAction {
  title: string;
  detail: string;
  evidence: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  /** Handle the action is for, when it targets one account. */
  account?: string | null;
}

/** One platform specialist agent's read of the data. */
export interface SpecialistRecs {
  platform: Platform;
  agent: string;
  model: string;
  generatedAt: string;
  dataQuality: "good" | "limited" | "none";
  headline: string;
  diagnosis: string;
  working: SpecialistPoint[];
  fix: SpecialistPoint[];
  actions: SpecialistAction[];
  experiments: { hypothesis: string; test: string; metric: string }[];
  cadence: string;
}

export interface AnalyticsSnapshot {
  generatedAt: string;
  /** IANA timezone every calendar day is computed in (the operator's). */
  timeZone: string;
  lastSyncedAt: string | null;
  accounts: SnapshotAccount[];
  posts: SnapshotPost[];
  connections: SnapshotConnection[];
  recommendations: SpecialistRecs[];
}

export const PLATFORM_ORDER: Platform[] = ["twitter", "linkedin", "instagram"];

export const PLATFORM_META: Record<Platform, { label: string; slug: string; color: string; erBasis: string }> = {
  twitter: { label: "X", slug: "x", color: "var(--color-platform-x)", erBasis: "impressions" },
  linkedin: { label: "LinkedIn", slug: "linkedin", color: "var(--color-platform-linkedin)", erBasis: "impressions" },
  instagram: { label: "Instagram", slug: "instagram", color: "var(--color-platform-instagram)", erBasis: "impressions" },
};

export function platformFromSlug(slug: string): Platform | null {
  return PLATFORM_ORDER.find((p) => PLATFORM_META[p].slug === slug) ?? null;
}

/** Labels for every Zernio platform (connections include out-of-scope ones). */
export const ANY_PLATFORM_LABEL: Record<string, string> = {
  twitter: "X",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  threads: "Threads",
  pinterest: "Pinterest",
  reddit: "Reddit",
  bluesky: "Bluesky",
};

export const BRAND_META: Record<Brand, { label: string; blurb: string }> = {
  personal: { label: "Personal", blurb: "Rafael Schwart" },
  arqentia: { label: "Arqentia", blurb: "Company accounts" },
};
