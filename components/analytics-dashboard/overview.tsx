"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BarChart3, Eye, FileText, Heart, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { MetricStat, TrendPill } from "@/components/analytics/metric-stat";
import { formatCompact } from "@/lib/utils";
import {
  bestTimes,
  change,
  engagementSeries,
  matchAccount,
  platformsPresent,
  postsIn,
  slotLabel,
  summarize,
  windowFor,
  type BrandFilter,
  type RangeDays,
} from "./compute";
import { sectionHref } from "./nav";
import {
  AccountTable,
  ActivityChart,
  EngagementMix,
  GroupCard,
  MethodNotes,
  PatternsCard,
  TopPosts,
} from "./sections";
import { BRAND_META, PLATFORM_META, PLATFORM_ORDER, type AnalyticsSnapshot, type Brand } from "./types";
import {
  BrandChip,
  PageHeader,
  PlatformTile,
  Segmented,
  noPostsReason,
  perPostFmt,
  pct,
  stampOf,
  whole,
  type LinkMode,
} from "./ui";

export const RANGES: { value: RangeDays; label: string }[] = [
  { value: 30, label: "30D" },
  { value: 90, label: "90D" },
  { value: 365, label: "12M" },
];

export interface NavBase {
  base: string;
  trailingSlash?: boolean;
}

export function commonNotes(snapshot: AnalyticsSnapshot, rangeLabel: string): React.ReactNode[] {
  const noPosts = snapshot.accounts.filter((a) => !snapshot.posts.some((p) => p.accountKey === a.key));
  return [
    `Engagements are likes + comments + shares + saves as each platform reports them through Zernio. Periods compare posts published in the last ${rangeLabel} against the ${rangeLabel} before; recent posts are still collecting engagement.`,
    "Engagement rate is engagements ÷ impressions, as Zernio reports it. Impressions mean different things per platform (Instagram counts repeat views), so rates are compared within a platform, never across.",
    "Personal LinkedIn: LinkedIn only returns analytics for posts published through Zernio.",
    ...noPosts.map((a) => `${PLATFORM_META[a.platform].label}: ${noPostsReason(snapshot, a)}`),
    "Missing values show as a dash — not available is not zero.",
  ];
}

export function OverviewView({
  snapshot,
  linkMode = "internal",
  nav,
}: {
  snapshot: AnalyticsSnapshot;
  linkMode?: LinkMode;
  nav: NavBase;
}) {
  const [brand, setBrand] = useState<BrandFilter>("all");
  const [range, setRange] = useState<RangeDays>(90);
  const tz = snapshot.timeZone;

  const view = useMemo(() => {
    const f = { brand, platform: "all" as const };
    const w = windowFor(snapshot, range, tz);
    const accounts = snapshot.accounts.filter((a) => matchAccount(a, f));
    const current = postsIn(snapshot, f, w.from, w.to, tz);
    const previous = postsIn(snapshot, f, w.prevFrom, w.prevTo, tz);
    const withPosts = PLATFORM_ORDER.filter((pl) => snapshot.posts.some((p) => p.platform === pl));
    const chartPlatforms = platformsPresent(accounts).filter((pl) => withPosts.includes(pl));
    return {
      w,
      accounts,
      current,
      cur: summarize(current),
      prev: summarize(previous),
      followers: accounts.reduce((a, x) => a + (x.followers ?? 0), 0),
      chartPlatforms,
      series: engagementSeries(current, w, range, chartPlatforms, tz),
      noPostPlatforms: platformsPresent(accounts).filter((pl) => !withPosts.includes(pl)),
      platforms: PLATFORM_ORDER.map((pl) => {
        const accts = accounts.filter((a) => a.platform === pl);
        const cur = current.filter((p) => p.platform === pl);
        const prev = previous.filter((p) => p.platform === pl);
        const bt = bestTimes(
          snapshot.posts.filter((p) => p.platform === pl && accts.some((a) => a.key === p.accountKey)),
          snapshot.posts,
          tz,
        );
        return { platform: pl, accounts: accts, cur: summarize(cur), prev: summarize(prev), best: bt.top[0] ?? null };
      }).filter((x) => x.accounts.length > 0),
    };
  }, [snapshot, brand, range, tz]);

  const brandView = useMemo(() => {
    const w = windowFor(snapshot, range, tz);
    return (["personal", "arqentia"] as Brand[]).map((b) => {
      const f = { brand: b, platform: "all" as const };
      const posts = postsIn(snapshot, f, w.from, w.to, tz);
      return {
        brand: b,
        accounts: snapshot.accounts.filter((a) => matchAccount(a, f)),
        posts,
        current: summarize(posts),
        previous: summarize(postsIn(snapshot, f, w.prevFrom, w.prevTo, tz)),
      };
    });
  }, [snapshot, range, tz]);

  if (snapshot.accounts.length === 0) {
    return (
      <EmptyState
        title="No analytics accounts yet"
        description="Connect X, LinkedIn or Instagram in Zernio, assign each account to a brand in lib/brands.ts, then run a sync."
      />
    );
  }

  const rangeLabel = RANGES.find((r) => r.value === range)?.label ?? "";
  const totalEng = brandView.reduce((a, b) => a + (b.current.engagements ?? 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Analytics · X · LinkedIn · Instagram"
        title="Overview"
        subtitle="How posts perform across the Personal and Arqentia accounts. Open a platform in the menu for every post on it."
        stamp={stampOf(snapshot)}
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <Segmented
          label="Brand"
          value={brand}
          onChange={setBrand}
          options={[
            { value: "all", label: "All accounts" },
            { value: "personal", label: "Personal" },
            { value: "arqentia", label: "Arqentia" },
          ]}
        />
        <div className="ml-auto">
          <Segmented label="Range" value={range} onChange={setRange} options={RANGES} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <MetricStat
          label="Engagements"
          value={view.cur.engagements}
          display={whole(view.cur.engagements)}
          deltaPct={change(view.cur.engagements, view.prev.engagements)}
          sublabel={`Likes, comments, shares, saves · ${rangeLabel}`}
          icon={<Heart />}
          accent
        />
        <MetricStat
          label="Per post"
          value={view.cur.perPost}
          display={perPostFmt(view.cur.perPost)}
          deltaPct={change(view.cur.perPost, view.prev.perPost)}
          sublabel="Average engagements per post"
          icon={<BarChart3 />}
        />
        <MetricStat
          label="Posts"
          value={view.cur.posts}
          display={whole(view.cur.posts)}
          deltaPct={change(view.cur.posts, view.prev.posts)}
          sublabel={`Published in the last ${rangeLabel}`}
          icon={<FileText />}
        />
        <MetricStat
          label="Impressions"
          value={view.cur.impressions}
          deltaPct={change(view.cur.impressions, view.prev.impressions)}
          sublabel={view.cur.reach !== null ? `${formatCompact(view.cur.reach)} reach` : "Reach n/a"}
          icon={<Eye />}
        />
        <MetricStat
          label="Followers"
          value={view.followers}
          display={whole(view.followers)}
          tag={`${view.accounts.length} account${view.accounts.length === 1 ? "" : "s"}`}
          sublabel="Current total, selected accounts"
          icon={<Users />}
          className="col-span-2 md:col-span-1"
        />
      </div>

      {/* Platforms */}
      <section aria-label="Platforms" className="space-y-3">
        <p className="eyebrow">By platform · {rangeLabel}</p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {view.platforms.map(({ platform, accounts, cur, prev, best }) => {
            const hasPosts = snapshot.posts.some((p) => p.platform === platform);
            return (
              <Link
                key={platform}
                href={sectionHref(nav.base, PLATFORM_META[platform].slug, nav.trailingSlash)}
                className="card card-hover group flex flex-col gap-3 p-4"
              >
                <div className="flex items-center gap-2.5">
                  <PlatformTile platform={platform} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold tracking-[-0.01em]">{PLATFORM_META[platform].label}</p>
                    <p className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-muted)]">
                      {accounts.map((a) => (
                        <span key={a.key} className="inline-flex items-center gap-1">
                          @{a.handle} <BrandChip brand={a.brand} />
                        </span>
                      ))}
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-[var(--color-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-accent-text)]" />
                </div>
                {hasPosts ? (
                  <>
                    <div className="flex items-end gap-2">
                      <span className="num text-[26px] font-semibold leading-none">{whole(cur.engagements)}</span>
                      <span className="pb-0.5 text-xs text-[var(--color-muted)]">engagements</span>
                      <span className="pb-0.5">
                        <TrendPill pct={change(cur.engagements, prev.engagements)} />
                      </span>
                    </div>
                    <p className="num text-xs text-[var(--color-text-2)]">
                      {cur.posts} posts · {perPostFmt(cur.perPost)}/post · {pct(cur.avgRate)} ER on {PLATFORM_META[platform].erBasis}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {best ? (
                        <>
                          Best slot: <span className="font-medium text-[var(--color-text)]">{slotLabel(best)}</span>
                        </>
                      ) : (
                        "Not enough posts for a best time yet"
                      )}
                    </p>
                  </>
                ) : (
                  <p className="text-xs leading-relaxed text-[var(--color-muted)]">
                    {whole(accounts.reduce((a, x) => a + (x.followers ?? 0), 0))} followers ·{" "}
                    {accounts.map((a) => noPostsReason(snapshot, a)).join(" ")}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Brand comparison */}
      {brand === "all" && (
        <section aria-label="Personal vs Arqentia" className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow">Personal vs Arqentia · share of engagements</p>
            {totalEng > 0 && (
              <div className="flex min-w-48 flex-1 items-center gap-3">
                <div className="well flex h-2 flex-1 overflow-hidden rounded-full">
                  {brandView.map((b) => (
                    <span
                      key={b.brand}
                      className="h-full border-r border-[var(--color-surface)] last:border-0"
                      style={{
                        width: `${((b.current.engagements ?? 0) / totalEng) * 100}%`,
                        background: b.brand === "personal" ? "var(--color-text-2)" : "var(--color-accent)",
                      }}
                    />
                  ))}
                </div>
                <span className="num text-xs text-[var(--color-muted)]">
                  {brandView
                    .map((b) => `${BRAND_META[b.brand].label} ${Math.round(((b.current.engagements ?? 0) / totalEng) * 100)}%`)
                    .join(" · ")}
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {brandView.map((b) =>
              b.accounts.length === 0 ? (
                <Card key={b.brand}>
                  <CardContent className="pt-5">
                    <EmptyState title={`No ${BRAND_META[b.brand].label} accounts connected`} />
                  </CardContent>
                </Card>
              ) : (
                <GroupCard
                  key={b.brand}
                  eyebrow={BRAND_META[b.brand].blurb}
                  title={BRAND_META[b.brand].label}
                  accounts={b.accounts}
                  current={b.current}
                  previous={b.previous}
                  posts={b.posts}
                />
              ),
            )}
          </div>
        </section>
      )}

      <ActivityChart
        title="Engagement over time"
        subtitle={`Engagements by publish ${view.series.bucket === "day" ? "day" : "week"} · last ${rangeLabel}`}
        rows={view.series.rows}
        series={view.chartPlatforms.map((pl) => ({ key: pl, label: PLATFORM_META[pl].label, color: PLATFORM_META[pl].color }))}
        missing={view.noPostPlatforms.map((pl) => `${PLATFORM_META[pl].label} · no post metrics`)}
        emptyText="Widen the range or pick another brand."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <TopPosts
          posts={view.current}
          tz={tz}
          linkMode={linkMode}
          singlePlatform={false}
          className="lg:col-span-2"
        />
        <div className="space-y-5">
          <EngagementMix posts={view.current} platforms={view.chartPlatforms} />
          <PatternsCard posts={view.current} tz={tz} />
        </div>
      </div>

      <AccountTable snapshot={snapshot} accounts={view.accounts} posts={view.current} linkMode={linkMode} />

      <MethodNotes notes={commonNotes(snapshot, rangeLabel)} />
    </div>
  );
}
