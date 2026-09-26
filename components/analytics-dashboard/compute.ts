/**
 * Pure aggregation over an AnalyticsSnapshot. No server imports, no Date.now():
 * "now" is the snapshot's generatedAt and every calendar day is taken in the
 * snapshot's timezone, so the static demo renders the same on the server and in
 * any browser.
 *
 * Honesty rules (CLAUDE.md): a missing metric stays null ("not available" is
 * not zero), and engagement rates are only ever shown per platform, because the
 * basis differs (Instagram = reach, X / LinkedIn = impressions).
 */
import type { AnalyticsSnapshot, Brand, Platform, SnapshotAccount, SnapshotPost } from "./types";
import { PLATFORM_ORDER } from "./types";

export type BrandFilter = Brand | "all";
export type PlatformFilter = Platform | "all";
export type RangeDays = 30 | 90 | 365;

const DAY = 24 * 60 * 60 * 1000;

export function nullableSum(values: (number | null)[]): number | null {
  let acc: number | null = null;
  for (const v of values) if (v !== null && Number.isFinite(v)) acc = (acc ?? 0) + v;
  return acc;
}

function mean(values: (number | null)[]): number | null {
  const xs = values.filter((v): v is number => v !== null && Number.isFinite(v));
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

/** YYYY-MM-DD for an instant, in the given IANA timezone. */
export function dayKey(iso: string | Date, tz: string): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function addDays(key: string, n: number): string {
  const d = new Date(`${key}T12:00:00Z`);
  return new Date(d.getTime() + n * DAY).toISOString().slice(0, 10);
}

/** Monday of the week containing `key`. */
function weekKey(key: string): string {
  const d = new Date(`${key}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // Mon = 0
  return addDays(key, -dow);
}

export interface Summary {
  posts: number;
  engagements: number | null;
  perPost: number | null;
  impressions: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  /** Mean ER — only meaningful within ONE platform (one basis). */
  avgRate: number | null;
}

export function summarize(posts: SnapshotPost[]): Summary {
  const engagements = nullableSum(posts.map((p) => p.engagements));
  const withEng = posts.filter((p) => p.engagements !== null).length;
  return {
    posts: posts.length,
    engagements,
    perPost: engagements !== null && withEng > 0 ? engagements / withEng : null,
    impressions: nullableSum(posts.map((p) => p.impressions)),
    reach: nullableSum(posts.map((p) => p.reach)),
    likes: nullableSum(posts.map((p) => p.likes)),
    comments: nullableSum(posts.map((p) => p.comments)),
    shares: nullableSum(posts.map((p) => p.shares)),
    saves: nullableSum(posts.map((p) => p.saves)),
    avgRate: mean(posts.map((p) => p.engagementRate)),
  };
}

/** Fractional change a→b, null when there is no baseline. */
export function change(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return (current - previous) / previous;
}

export interface Filters {
  brand: BrandFilter;
  platform: PlatformFilter;
  range: RangeDays;
}

export function matchAccount(a: SnapshotAccount, f: Pick<Filters, "brand" | "platform">): boolean {
  return (f.brand === "all" || a.brand === f.brand) && (f.platform === "all" || a.platform === f.platform);
}

export interface Window {
  /** Inclusive first day key of the current window. */
  from: string;
  /** Inclusive last day key (the snapshot day). */
  to: string;
  prevFrom: string;
  prevTo: string;
}

export function windowFor(snapshot: AnalyticsSnapshot, range: RangeDays, tz: string): Window {
  const to = dayKey(snapshot.generatedAt, tz);
  const from = addDays(to, -(range - 1));
  return { from, to, prevFrom: addDays(from, -range), prevTo: addDays(from, -1) };
}

export function postsIn(
  snapshot: AnalyticsSnapshot,
  f: Pick<Filters, "brand" | "platform">,
  from: string,
  to: string,
  tz: string,
): SnapshotPost[] {
  return snapshot.posts.filter((p) => {
    if (f.brand !== "all" && p.brand !== f.brand) return false;
    if (f.platform !== "all" && p.platform !== f.platform) return false;
    const k = dayKey(p.publishedAt, tz);
    return k >= from && k <= to;
  });
}

export interface SeriesRow {
  date: string;
  [platform: string]: number | string | null;
}

/**
 * Engagements per platform per bucket (daily for 30d, weekly otherwise), with
 * every bucket present. A bucket with no posts is a true 0; one whose posts
 * expose no engagement metric stays null.
 */
export function engagementSeries(
  posts: SnapshotPost[],
  w: Window,
  range: RangeDays,
  platforms: Platform[],
  tz: string,
): { rows: SeriesRow[]; bucket: "day" | "week" } {
  const bucket = range === 30 ? "day" : "week";
  const keyOf = (k: string) => (bucket === "day" ? k : weekKey(k));
  const acc = new Map<string, Map<Platform, (number | null)[]>>();
  for (const p of posts) {
    const b = keyOf(dayKey(p.publishedAt, tz));
    const m = acc.get(b) ?? new Map<Platform, (number | null)[]>();
    const list = m.get(p.platform) ?? [];
    list.push(p.engagements);
    m.set(p.platform, list);
    acc.set(b, m);
  }
  const rows: SeriesRow[] = [];
  const step = bucket === "day" ? 1 : 7;
  for (let k = keyOf(w.from); k <= w.to; k = addDays(k, step)) {
    const m = acc.get(k);
    const row: SeriesRow = { date: k };
    for (const pl of platforms) {
      const list = m?.get(pl);
      row[pl] = list ? nullableSum(list) : 0;
    }
    rows.push(row);
  }
  return { rows, bucket };
}

export interface AccountRow {
  account: SnapshotAccount;
  summary: Summary;
  best: SnapshotPost | null;
}

export function accountRows(accounts: SnapshotAccount[], posts: SnapshotPost[]): AccountRow[] {
  return accounts.map((account) => {
    const own = posts.filter((p) => p.accountKey === account.key);
    const best = own.reduce<SnapshotPost | null>(
      (b, p) => ((p.engagements ?? -1) > (b?.engagements ?? -1) ? p : b),
      null,
    );
    return { account, summary: summarize(own), best };
  });
}

export function platformsPresent(accounts: SnapshotAccount[]): Platform[] {
  return PLATFORM_ORDER.filter((pl) => accounts.some((a) => a.platform === pl));
}

export interface FormatRow {
  format: string;
  posts: number;
  perPost: number | null;
}

const FORMAT_LABEL: Record<string, string> = {
  video: "Video",
  image: "Image",
  carousel: "Carousel",
  text: "Text",
  document: "Document",
  article: "Article",
};

export function formatLabel(mediaType: string | null): string {
  if (!mediaType) return "Text";
  return FORMAT_LABEL[mediaType] ?? mediaType.charAt(0).toUpperCase() + mediaType.slice(1);
}

/** Engagements per post by media format, best first. */
export function formatRows(posts: SnapshotPost[]): FormatRow[] {
  const groups = new Map<string, SnapshotPost[]>();
  for (const p of posts) {
    const k = formatLabel(p.mediaType);
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  return [...groups.entries()]
    .map(([format, list]) => ({ format, posts: list.length, perPost: summarize(list).perPost }))
    .sort((a, b) => (b.perPost ?? -1) - (a.perPost ?? -1));
}

export interface WeekdayRow {
  day: string;
  posts: number;
  perPost: number | null;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Engagements per post by publish weekday (snapshot timezone). */
export function weekdayRows(posts: SnapshotPost[], tz: string): WeekdayRow[] {
  const groups: SnapshotPost[][] = WEEKDAYS.map(() => []);
  for (const p of posts) {
    const d = new Date(`${dayKey(p.publishedAt, tz)}T12:00:00Z`);
    groups[(d.getUTCDay() + 6) % 7].push(p);
  }
  return groups.map((list, i) => ({ day: WEEKDAYS[i], posts: list.length, perPost: summarize(list).perPost }));
}
