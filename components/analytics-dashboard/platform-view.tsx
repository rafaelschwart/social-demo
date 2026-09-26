"use client";

import { useMemo, useState } from "react";
import { BarChart3, Eye, FileText, Heart, Percent, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { MetricStat } from "@/components/analytics/metric-stat";
import { formatCompact } from "@/lib/utils";
import {
  change,
  engagementSeries,
  postsIn,
  summarize,
  windowFor,
  type BrandFilter,
  type RangeDays,
  type SeriesRow,
} from "./compute";
import { sectionHref } from "./nav";
import { RANGES, commonNotes, type NavBase } from "./overview";
import { BestTimesMini } from "./best-times-view";
import { SpecialistPreview } from "./recommendations-view";
import { PlatformPostsTable } from "./posts-table";
import { ActivityChart, EngagementMix, GroupCard, MethodNotes, PatternsCard } from "./sections";
import { BRAND_META, PLATFORM_META, type AnalyticsSnapshot, type Brand, type Platform } from "./types";
import { PageHeader, PlatformTile, Segmented, perPostFmt, pct, stampOf, whole, type LinkMode } from "./ui";

/** Secondary account colors on a platform chart (first account = platform color). */
const ACCOUNT_TONES = ["", "var(--color-text-2)", "var(--color-faint)"];

export function PlatformView({
  snapshot,
  platform,
  linkMode = "internal",
  nav,
}: {
  snapshot: AnalyticsSnapshot;
  platform: Platform;
  linkMode?: LinkMode;
  nav: NavBase;
}) {
  const meta = PLATFORM_META[platform];
  const tz = snapshot.timeZone;
  const platformAccounts = useMemo(
    () => snapshot.accounts.filter((a) => a.platform === platform),
    [snapshot, platform],
  );
  const brands = [...new Set(platformAccounts.map((a) => a.brand))] as Brand[];
  const [brand, setBrand] = useState<BrandFilter>("all");
  const [range, setRange] = useState<RangeDays>(90);

  const view = useMemo(() => {
    const f = { brand, platform };
    const w = windowFor(snapshot, range, tz);
    const accounts = platformAccounts.filter((a) => brand === "all" || a.brand === brand);
    const current = postsIn(snapshot, f, w.from, w.to, tz);
    const previous = postsIn(snapshot, f, w.prevFrom, w.prevTo, tz);
    // Chart: one series per account (so two Instagram accounts read separately).
    const perAccount = accounts.map((a) => {
      const own = current.filter((p) => p.accountKey === a.key);
      const s = engagementSeries(own, w, range, [platform], tz);
      return { account: a, rows: s.rows, bucket: s.bucket };
    });
    const rows = perAccount[0]?.rows.map((r, i) => {
      const row: SeriesRow = { date: r.date as string };
      perAccount.forEach((pa) => (row[pa.account.key] = pa.rows[i][platform] as number | null));
      return row;
    }) ?? [];
    return {
      accounts,
      current,
      cur: summarize(current),
      prev: summarize(previous),
      followers: accounts.reduce((a, x) => a + (x.followers ?? 0), 0),
      rows,
      bucket: perAccount[0]?.bucket ?? "week",
      perAccount,
      groups: accounts.map((a) => ({
        account: a,
        cur: summarize(current.filter((p) => p.accountKey === a.key)),
        prev: summarize(previous.filter((p) => p.accountKey === a.key)),
        posts: current.filter((p) => p.accountKey === a.key),
      })),
    };
  }, [snapshot, platform, platformAccounts, brand, range, tz]);

  if (platformAccounts.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Platform" title={meta.label} subtitle={`No ${meta.label} account is connected and assigned to a brand yet.`} icon={<PlatformTile platform={platform} />} />
        <EmptyState title={`No ${meta.label} account`} description="Connect it in Zernio and assign it a brand in lib/brands.ts." />
      </div>
    );
  }

  const rangeLabel = RANGES.find((r) => r.value === range)?.label ?? "";
  const hasAnyPosts = snapshot.posts.some((p) => p.platform === platform);
  const recs = snapshot.recommendations.find((r) => r.platform === platform) ?? null;
  const brandText = brands.map((b) => BRAND_META[b].label).join(" + ");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`Platform · ${brandText}`}
        title={meta.label}
        subtitle={`Every ${meta.label} post, how it performed, when it performs best, and what the ${meta.label} specialist recommends.`}
        icon={<PlatformTile platform={platform} />}
        stamp={stampOf(snapshot)}
      />

      <div className="flex flex-wrap items-center gap-2.5">
        {brands.length > 1 && (
          <Segmented
            label="Brand"
            value={brand}
            onChange={setBrand}
            options={[
              { value: "all", label: "All accounts" },
              ...brands.map((b) => ({
                value: b as BrandFilter,
                label: `${BRAND_META[b].label} · @${platformAccounts.find((a) => a.brand === b)?.handle}`,
              })),
            ]}
          />
        )}
        <div className="ml-auto">
          <Segmented label="Range" value={range} onChange={setRange} options={RANGES} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricStat
          label="Engagements"
          value={view.cur.engagements}
          display={whole(view.cur.engagements)}
          deltaPct={change(view.cur.engagements, view.prev.engagements)}
          sublabel={rangeLabel}
          icon={<Heart />}
          accent
        />
        <MetricStat
          label="Per post"
          value={view.cur.perPost}
          display={perPostFmt(view.cur.perPost)}
          deltaPct={change(view.cur.perPost, view.prev.perPost)}
          sublabel="Engagements per post"
          icon={<BarChart3 />}
        />
        <MetricStat
          label="Engagement rate"
          value={view.cur.avgRate}
          display={pct(view.cur.avgRate)}
          deltaPct={change(view.cur.avgRate, view.prev.avgRate)}
          sublabel={`Average, on ${meta.erBasis}`}
          icon={<Percent />}
        />
        <MetricStat
          label="Posts"
          value={view.cur.posts}
          display={whole(view.cur.posts)}
          deltaPct={change(view.cur.posts, view.prev.posts)}
          sublabel={`Last ${rangeLabel}`}
          icon={<FileText />}
        />
        <MetricStat
          label={platform === "instagram" ? "Reach" : "Impressions"}
          value={platform === "instagram" ? view.cur.reach : view.cur.impressions}
          deltaPct={
            platform === "instagram"
              ? change(view.cur.reach, view.prev.reach)
              : change(view.cur.impressions, view.prev.impressions)
          }
          sublabel={
            platform === "instagram"
              ? `${formatCompact(view.cur.impressions)} views/impressions`
              : `${formatCompact(view.cur.reach)} reach`
          }
          icon={<Eye />}
        />
        <MetricStat
          label="Followers"
          value={view.followers}
          display={whole(view.followers)}
          tag={`${view.accounts.length} account${view.accounts.length === 1 ? "" : "s"}`}
          sublabel="Current total"
          icon={<Users />}
        />
      </div>

      {!hasAnyPosts && (
        <Card>
          <CardContent className="pt-5">
            <EmptyState
              title={`Zernio returns no ${meta.label} posts yet`}
              description={`${view.accounts.map((a) => `@${a.handle}`).join(", ")} is connected (${whole(view.followers)} followers), but Zernio's analytics feed has no posts for it. Posts published through Zernio are tracked automatically; the specialist's first recommendation covers how to close this gap.`}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SpecialistPreview
          recs={recs}
          platform={platform}
          href={`${sectionHref(nav.base, "recommendations", nav.trailingSlash)}#${meta.slug}`}
          className="lg:col-span-2"
        />
        <BestTimesMini
          posts={snapshot.posts.filter((p) => p.platform === platform && view.accounts.some((a) => a.key === p.accountKey))}
          reference={snapshot.posts}
          tz={tz}
          href={sectionHref(nav.base, "best-times", nav.trailingSlash)}
        />
      </div>

      {view.groups.length > 1 && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {view.groups.map((g) => (
            <GroupCard
              key={g.account.key}
              eyebrow={BRAND_META[g.account.brand].label}
              title={`@${g.account.handle}`}
              accounts={[g.account]}
              current={g.cur}
              previous={g.prev}
              posts={g.posts}
            />
          ))}
        </div>
      )}

      {hasAnyPosts && (
        <ActivityChart
          title="Engagement over time"
          subtitle={`Engagements by publish ${view.bucket === "day" ? "day" : "week"} · last ${rangeLabel}`}
          rows={view.rows}
          series={view.perAccount.map((pa, i) => ({
            key: pa.account.key,
            label: `@${pa.account.handle}`,
            color: i === 0 ? meta.color : ACCOUNT_TONES[Math.min(i, ACCOUNT_TONES.length - 1)],
          }))}
          emptyText="Widen the range."
        />
      )}

      {hasAnyPosts && (
        <PlatformPostsTable platform={platform} posts={view.current} accounts={view.accounts} tz={tz} linkMode={linkMode} />
      )}

      {hasAnyPosts && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <EngagementMix posts={view.current} platforms={[platform]} />
          <PatternsCard posts={view.current} tz={tz} />
        </div>
      )}

      <MethodNotes notes={commonNotes(snapshot, rangeLabel)} />
    </div>
  );
}
