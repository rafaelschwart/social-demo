"use client";

import { useState } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardEyebrow, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { TrendPill } from "@/components/analytics/metric-stat";
import { TrendChart, type TrendSeries } from "@/components/analytics/trend-chart";
import { PostThumb } from "@/components/analytics/post-thumb";
import { formatCompact } from "@/lib/utils";
import {
  accountRows,
  change,
  formatRows,
  summarize,
  weekdayRows,
  type SeriesRow,
  type Summary,
} from "./compute";
import { PLATFORM_META, type AnalyticsSnapshot, type Platform, type SnapshotAccount, type SnapshotPost } from "./types";
import { BrandChip, PlatformDot, Segmented, noPostsReason, perPostFmt, pct, postLink, whole, type LinkMode } from "./ui";

/* ──────────────────────────── group comparison card ─────────────────────────── */

/** A brand (or account) at a glance: engagements, key stats, per-account bars. */
export function GroupCard({
  eyebrow,
  title,
  accounts,
  current,
  previous,
  posts,
}: {
  eyebrow: string;
  title: string;
  accounts: SnapshotAccount[];
  current: Summary;
  previous: Summary;
  posts: SnapshotPost[];
}) {
  // Unknown stays unknown: only sum when at least one account reports followers.
  const known = accounts.filter((x) => x.followers !== null);
  const followers = known.length ? known.reduce((a, x) => a + (x.followers ?? 0), 0) : null;
  const rows = accountRows(accounts, posts);
  const maxEng = Math.max(1, ...rows.map((r) => r.summary.engagements ?? 0));

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
        <div>
          <CardEyebrow>{eyebrow}</CardEyebrow>
          <CardTitle className="mt-1 text-base">{title}</CardTitle>
        </div>
        <div className="text-right">
          <p className="num text-[15px] font-medium text-[var(--color-text)]">{whole(followers)}</p>
          <p className="text-[11px] text-[var(--color-muted)]">followers</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="num text-[34px] font-semibold leading-none tracking-[-0.03em] text-[var(--color-text)]">
            {whole(current.engagements)}
          </span>
          <span className="pb-0.5 text-[13px] text-[var(--color-muted)]">engagements</span>
          <span className="pb-0.5">
            <TrendPill pct={change(current.engagements, previous.engagements)} />
          </span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-2)_60%,transparent)]">
          {[
            { label: "Posts", value: whole(current.posts) },
            { label: "Per post", value: perPostFmt(current.perPost) },
            { label: "Impressions", value: formatCompact(current.impressions) },
          ].map((s) => (
            <div key={s.label} className="px-3 py-2">
              <p className="text-[11px] text-[var(--color-muted)]">{s.label}</p>
              <p className="num mt-0.5 text-[15px] font-medium text-[var(--color-text)]">{s.value}</p>
            </div>
          ))}
        </div>

        <ul className="space-y-2.5">
          {rows.map(({ account, summary }) => (
            <li key={account.key}>
              <div className="flex items-center gap-2 text-[13px]">
                <PlatformDot platform={account.platform} />
                <span className="font-medium text-[var(--color-text)]">{PLATFORM_META[account.platform].label}</span>
                <span className="min-w-0 flex-1 truncate text-[var(--color-muted)]">@{account.handle}</span>
                {summary.posts === 0 ? (
                  <span className="text-xs text-[var(--color-faint)]">no posts in range</span>
                ) : (
                  <span className="num text-xs text-[var(--color-text-2)]">
                    {summary.posts} posts · {perPostFmt(summary.perPost)}/post ·{" "}
                    <span title={`Engagement rate on ${PLATFORM_META[account.platform].erBasis}`}>
                      {pct(summary.avgRate)} ER
                    </span>
                  </span>
                )}
              </div>
              <div className="well mt-1.5 h-1.5 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${((summary.engagements ?? 0) / maxEng) * 100}%`,
                    background: PLATFORM_META[account.platform].color,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ──────────────────────────────── activity chart ─────────────────────────────── */

export function ActivityChart({
  title,
  subtitle,
  rows,
  series,
  missing,
  emptyText,
}: {
  title: string;
  subtitle: string;
  rows: SeriesRow[];
  series: TrendSeries[];
  /** Legend entries for series with no data (dashed swatch). */
  missing?: string[];
  emptyText: string;
}) {
  const hasData = series.length > 0 && rows.some((r) => series.some((s) => typeof r[s.key] === "number" && (r[s.key] as number) > 0));
  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="mt-1 text-[13px]">{subtitle}</CardDescription>
        </div>
        <div className="flex flex-wrap justify-end gap-4 text-xs text-[var(--color-muted)]">
          {series.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px]" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
          {missing?.map((m) => (
            <span key={m} className="inline-flex items-center gap-1.5 text-[var(--color-faint)]">
              <span className="size-2.5 rounded-[2px] border border-dashed border-[var(--color-border-strong)]" />
              {m}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <TrendChart data={rows} series={series} height={280} />
        ) : (
          <EmptyState title="No posts in this range" description={emptyText} />
        )}
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────── top posts ─────────────────────────────── */

export function TopPosts({
  posts,
  tz,
  linkMode,
  singlePlatform,
  className,
}: {
  posts: SnapshotPost[];
  tz: string;
  linkMode: LinkMode;
  singlePlatform: boolean;
  className?: string;
}) {
  const [sort, setSort] = useState<"engagements" | "rate">("engagements");
  const effective = singlePlatform ? sort : "engagements";
  const dateFmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: tz });
  const ranked = [...posts]
    .filter((p) => (effective === "rate" ? p.engagementRate !== null : p.engagements !== null))
    .sort((a, b) =>
      effective === "rate"
        ? (b.engagementRate ?? 0) - (a.engagementRate ?? 0)
        : (b.engagements ?? 0) - (a.engagements ?? 0),
    )
    .slice(0, 8);

  return (
    <Card className={className}>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardEyebrow>Posts in range</CardEyebrow>
          <CardTitle className="mt-1 text-base">Top posts</CardTitle>
        </div>
        <Segmented
          label="Sort posts"
          value={effective}
          onChange={setSort}
          options={[
            { value: "engagements", label: "Engagements" },
            {
              value: "rate",
              label: "Rate",
              disabled: !singlePlatform,
              title: singlePlatform
                ? undefined
                : "Open one platform — engagement rates use different bases per platform",
            },
          ]}
        />
      </CardHeader>
      {ranked.length === 0 ? (
        <CardContent>
          <EmptyState title="No posts in this range" description="Widen the range or pick another brand." />
        </CardContent>
      ) : (
        <ol className="pb-2">
          {ranked.map((p, i) => {
            const href = postLink(p, linkMode);
            const external = linkMode === "external" || !p.href;
            const row = (
              <div className="group flex items-center gap-3 border-t border-[var(--color-border)] px-5 py-3 transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-text)_3.5%,transparent)]">
                <span className="num w-5 shrink-0 text-xs text-[var(--color-faint)]">{String(i + 1).padStart(2, "0")}</span>
                <PostThumb thumbnailUrl={p.thumbnailUrl} mediaType={p.mediaType} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[13.5px] font-medium text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent-text)]">
                    {p.text ?? <span className="italic text-[var(--color-faint)]">No caption</span>}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-muted)]">
                    <BrandChip brand={p.brand} />
                    <span className="inline-flex items-center gap-1.5">
                      <PlatformDot platform={p.platform} />
                      {PLATFORM_META[p.platform].label}
                    </span>
                    <span className="num">{dateFmt.format(new Date(p.publishedAt))}</span>
                    <span className="num hidden sm:inline">
                      {formatCompact(p.impressions)} impr. · {pct(p.engagementRate)} ER
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num text-[17px] font-medium leading-6 text-[var(--color-text)]">
                    {effective === "rate" ? pct(p.engagementRate) : whole(p.engagements)}
                  </p>
                  <p className="text-[11px] text-[var(--color-faint)]">
                    {effective === "rate" ? `on ${PLATFORM_META[p.platform].erBasis}` : "engagements"}
                  </p>
                </div>
                {href && (
                  <ArrowUpRight className="size-4 shrink-0 text-[var(--color-faint)] transition-colors group-hover:text-[var(--color-accent-text)]" />
                )}
              </div>
            );
            return (
              <li key={p.id}>
                {href ? (
                  <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {row}
                  </a>
                ) : (
                  row
                )}
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

/* ───────────────────────────── engagement mix ──────────────────────────── */

const MIX = [
  { key: "likes", label: "Likes", tone: 100 },
  { key: "comments", label: "Comments", tone: 62 },
  { key: "shares", label: "Shares", tone: 36 },
  { key: "saves", label: "Saves", tone: 18 },
] as const;

export function EngagementMix({ posts, platforms }: { posts: SnapshotPost[]; platforms: Platform[] }) {
  const rows = platforms
    .map((pl) => ({ platform: pl, s: summarize(posts.filter((p) => p.platform === pl)) }))
    .filter((r) => r.s.posts > 0 && (r.s.engagements ?? 0) > 0);

  return (
    <Card>
      <CardHeader>
        <CardEyebrow>What people do</CardEyebrow>
        <CardTitle className="mt-1 text-base">Engagement mix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-xs text-[var(--color-muted)]">No engagement in this range.</p>
        ) : (
          rows.map(({ platform, s }) => {
            const total = s.engagements ?? 0;
            return (
              <div key={platform}>
                <div className="mb-1.5 flex items-center gap-2 text-[13px]">
                  <PlatformDot platform={platform} />
                  <span className="font-medium">{PLATFORM_META[platform].label}</span>
                  <span className="num ml-auto text-xs text-[var(--color-muted)]">{whole(total)}</span>
                </div>
                <div className="well flex h-2.5 overflow-hidden rounded-full">
                  {MIX.map((m) => {
                    const v = s[m.key] ?? 0;
                    if (!v) return null;
                    return (
                      <span
                        key={m.key}
                        title={`${m.label}: ${whole(v)}`}
                        className="h-full border-r border-[var(--color-surface)] last:border-0"
                        style={{
                          width: `${(v / total) * 100}%`,
                          background: `color-mix(in srgb, var(--color-accent) ${m.tone}%, var(--color-surface-2))`,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="num mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[var(--color-muted)]">
                  {MIX.map((m) => (
                    <span key={m.key}>
                      {m.label.toLowerCase()} {whole(s[m.key])}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
        <div className="flex flex-wrap gap-3 border-t border-[var(--color-border)] pt-3 text-[11px] text-[var(--color-muted)]">
          {MIX.map((m) => (
            <span key={m.key} className="inline-flex items-center gap-1.5">
              <span
                className="size-2 rounded-[2px]"
                style={{ background: `color-mix(in srgb, var(--color-accent) ${m.tone}%, var(--color-surface-2))` }}
              />
              {m.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ───────────────────────────── format + weekday ─────────────────────────── */

export function PatternsCard({ posts, tz }: { posts: SnapshotPost[]; tz: string }) {
  const formats = formatRows(posts).filter((f) => f.posts > 0);
  const days = weekdayRows(posts, tz);
  const maxFormat = Math.max(1, ...formats.map((f) => f.perPost ?? 0));
  const maxDay = Math.max(1, ...days.map((d) => d.perPost ?? 0));
  const bestDay = days.reduce((b, d) => ((d.perPost ?? -1) > (b.perPost ?? -1) ? d : b), days[0]);

  return (
    <Card>
      <CardHeader>
        <CardEyebrow>Engagements per post</CardEyebrow>
        <CardTitle className="mt-1 text-base">What works</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="eyebrow mb-2 text-[9.5px]">By format · posts</p>
          {formats.length === 0 ? (
            <p className="text-xs text-[var(--color-muted)]">No posts in this range.</p>
          ) : (
            <ul className="space-y-2">
              {formats.map((f) => (
                <li key={f.format} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2.5 text-[13px]">
                  <span className="text-[var(--color-text-2)]">{f.format}</span>
                  <span className="well h-1.5 overflow-hidden rounded-full">
                    <span
                      className="block h-full rounded-full bg-[var(--color-accent)]"
                      style={{ width: `${((f.perPost ?? 0) / maxFormat) * 100}%` }}
                    />
                  </span>
                  <span className="num w-20 text-right text-xs text-[var(--color-text)]">
                    {perPostFmt(f.perPost)}
                    <span className="text-[var(--color-faint)]"> · {f.posts}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="eyebrow mb-2 text-[9.5px]">
            By weekday{bestDay && bestDay.perPost !== null ? ` · best: ${bestDay.day}` : ""}
          </p>
          <div className="grid grid-cols-7 items-end gap-1.5">
            {days.map((d) => (
              <div
                key={d.day}
                className="flex flex-col items-center gap-1"
                title={`${d.day}: ${d.posts} posts, ${perPostFmt(d.perPost)} per post`}
              >
                <div className="well flex h-20 w-full items-end overflow-hidden rounded-[4px]">
                  <div
                    className="w-full rounded-[3px]"
                    style={{
                      height: `${((d.perPost ?? 0) / maxDay) * 100}%`,
                      background:
                        d === bestDay && d.perPost !== null
                          ? "var(--color-accent)"
                          : "color-mix(in srgb, var(--color-accent) 40%, var(--color-surface-2))",
                    }}
                  />
                </div>
                <span className="text-[10.5px] text-[var(--color-muted)]">{d.day}</span>
                <span className="num text-[10px] text-[var(--color-faint)]">{d.posts}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ───────────────────────────── account table ───────────────────────────── */

export function AccountTable({
  snapshot,
  accounts,
  posts,
  linkMode,
}: {
  snapshot: AnalyticsSnapshot;
  accounts: SnapshotAccount[];
  posts: SnapshotPost[];
  linkMode: LinkMode;
}) {
  const allPosts = snapshot.posts;
  const rows = accountRows(accounts, posts);
  return (
    <Card>
      <CardHeader>
        <CardEyebrow>Per account · selected range</CardEyebrow>
        <CardTitle className="mt-1 text-base">Accounts</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto pb-2">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-y border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-2)_70%,transparent)] text-left font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-faint)]">
              <th className="px-5 py-2 font-medium">Account</th>
              <th className="px-3 py-2 text-right font-medium">Followers</th>
              <th className="px-3 py-2 text-right font-medium">Posts</th>
              <th className="px-3 py-2 text-right font-medium">Impressions</th>
              <th className="px-3 py-2 text-right font-medium">Engagements</th>
              <th className="px-3 py-2 text-right font-medium">Per post</th>
              <th className="px-3 py-2 text-right font-medium">Avg ER</th>
              <th className="px-5 py-2 font-medium">Best post</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ account, summary, best }) => {
              const never = !allPosts.some((p) => p.accountKey === account.key);
              const href = best ? postLink(best, linkMode) : null;
              return (
                <tr key={account.key} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <PlatformDot platform={account.platform} className="size-2.5" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--color-text)]">@{account.handle}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                          {PLATFORM_META[account.platform].label} <BrandChip brand={account.brand} />
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="num px-3 py-3 text-right text-[var(--color-text)]">{whole(account.followers)}</td>
                  {never ? (
                    <td colSpan={6} className="px-3 py-3 text-xs text-[var(--color-muted)]">
                      {noPostsReason(snapshot, account)}
                    </td>
                  ) : (
                    <>
                      <td className="num px-3 py-3 text-right text-[var(--color-text-2)]">{summary.posts}</td>
                      <td className="num px-3 py-3 text-right text-[var(--color-text-2)]">{formatCompact(summary.impressions)}</td>
                      <td className="num px-3 py-3 text-right font-medium text-[var(--color-text)]">{whole(summary.engagements)}</td>
                      <td className="num px-3 py-3 text-right text-[var(--color-text-2)]">{perPostFmt(summary.perPost)}</td>
                      <td className="num px-3 py-3 text-right text-[var(--color-text-2)]">
                        {pct(summary.avgRate)}
                        <span className="block text-[10px] text-[var(--color-faint)]">
                          on {PLATFORM_META[account.platform].erBasis}
                        </span>
                      </td>
                      <td className="max-w-[16rem] px-5 py-3">
                        {best ? (
                          <a
                            href={href ?? undefined}
                            {...(linkMode === "external" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="group block"
                          >
                            <p className="truncate text-[13px] text-[var(--color-text-2)] group-hover:text-[var(--color-accent-text)]">
                              {best.text ?? "No caption"}
                            </p>
                            <p className="num text-[11px] text-[var(--color-faint)]">{whole(best.engagements)} engagements</p>
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--color-faint)]">—</span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ───────────────────────────── method notes ───────────────────────────── */

export function MethodNotes({ notes }: { notes: React.ReactNode[] }) {
  return (
    <div className="flex gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-border)] px-4 py-3 text-xs leading-relaxed text-[var(--color-muted)]">
      <Info className="mt-0.5 size-3.5 shrink-0 text-[var(--color-faint)]" aria-hidden />
      <ul className="space-y-1">
        {notes.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
