"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardEyebrow, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import {
  BLOCK_LABELS,
  WEEKDAYS,
  bestTimes,
  dayKey,
  slotLabel,
  type BestTimes,
  type BrandFilter,
  type TimeSlot,
} from "./compute";
import { MethodNotes } from "./sections";
import { BRAND_META, PLATFORM_META, PLATFORM_ORDER, type AnalyticsSnapshot, type Brand, type Platform, type SnapshotPost } from "./types";
import { PageHeader, PlatformTile, Segmented, perPostFmt, stampOf } from "./ui";

type BtRange = 90 | 365;

/** Accent intensity for a lift value (1 = average). */
function liftColor(lift: number): string {
  if (lift >= 1) {
    const t = Math.min(1, (lift - 1) / 0.8);
    return `color-mix(in srgb, var(--color-accent) ${Math.round(22 + t * 78)}%, var(--color-surface-2))`;
  }
  const t = Math.min(1, (1 - lift) / 0.5);
  return `color-mix(in srgb, var(--color-surface-2) ${Math.round(60 + t * 40)}%, var(--color-accent) )`;
}

const fmtLift = (l: number) => `${l.toFixed(l >= 10 ? 0 : 1)}×`;

function hourLabel(h: number) {
  return `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "a" : "p"}`;
}

function inRange(posts: SnapshotPost[], snapshot: AnalyticsSnapshot, days: BtRange): SnapshotPost[] {
  const to = dayKey(snapshot.generatedAt, snapshot.timeZone);
  const from = new Date(new Date(`${to}T12:00:00Z`).getTime() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  return posts.filter((p) => dayKey(p.publishedAt, snapshot.timeZone) >= from);
}

/** Compact best-times card for a platform page. */
export function BestTimesMini({
  posts,
  reference,
  tz,
  href,
}: {
  posts: SnapshotPost[];
  reference: SnapshotPost[];
  tz: string;
  href: string;
}) {
  const bt = useMemo(() => bestTimes(posts, reference, tz), [posts, reference, tz]);
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardEyebrow>From {bt.sample} posts</CardEyebrow>
          <CardTitle className="mt-1 text-base">Best times to post</CardTitle>
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent-text)] hover:underline">
          Full map <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {bt.top.length === 0 ? (
          <p className="text-xs text-[var(--color-muted)]">Not enough posts yet to learn a best time.</p>
        ) : (
          <ol className="space-y-2">
            {bt.top.slice(0, 3).map((s, i) => (
              <li key={`${s.day}-${s.index}`} className="flex items-center gap-3">
                <span className="num w-4 text-xs text-[var(--color-faint)]">{i + 1}</span>
                <span className="flex-1 text-[13px] font-medium">{slotLabel(s)}</span>
                <span className="num text-xs text-[var(--color-muted)]">{s.n} posts</span>
                <span className="num w-12 text-right text-[13px] font-semibold text-[var(--color-accent-text)]">{fmtLift(s.lift)}</span>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-faint)]">
          Lift vs this account&apos;s usual post · times in {tz.replace(/_/g, " ")}
        </p>
      </CardContent>
    </Card>
  );
}

function Heatmap({ bt }: { bt: BestTimes }) {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[560px] grid-cols-[2.75rem_repeat(8,minmax(0,1fr))] gap-1">
        <span />
        {BLOCK_LABELS.map((b) => (
          <span key={b} className="num pb-1 text-center text-[10.5px] text-[var(--color-faint)]">
            {b}
          </span>
        ))}
        {WEEKDAYS.map((d, di) => (
          <div key={d} className="contents">
            <span className="flex items-center text-xs text-[var(--color-muted)]">{d}</span>
            {bt.grid[di].map((cell, bi) => (
              <div
                key={bi}
                title={
                  cell
                    ? `${slotLabel(cell)} · ${cell.n} post${cell.n === 1 ? "" : "s"} · ${fmtLift(cell.lift)} lift · ${perPostFmt(cell.avgEngagements)} avg engagements`
                    : `${d} ${BLOCK_LABELS[bi]} · no posts`
                }
                className={cn(
                  "flex h-11 flex-col items-center justify-center rounded-[4px] border",
                  cell ? "border-transparent" : "well border-[var(--color-border)]",
                )}
                style={cell ? { background: liftColor(cell.lift) } : undefined}
              >
                {cell && (
                  <>
                    <span
                      className={cn(
                        "num text-[11.5px] font-semibold leading-none",
                        cell.lift >= 1.35 ? "text-[var(--color-on-accent)]" : "text-[var(--color-text)]",
                      )}
                    >
                      {fmtLift(cell.lift)}
                    </span>
                    <span
                      className={cn(
                        "num mt-0.5 text-[9.5px] leading-none",
                        cell.lift >= 1.35 ? "text-[color-mix(in_srgb,var(--color-on-accent)_75%,transparent)]" : "text-[var(--color-faint)]",
                      )}
                    >
                      {cell.n}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-muted)]">
        <span>Below usual</span>
        {[0.6, 0.85, 1, 1.25, 1.5, 1.8].map((l) => (
          <span key={l} className="h-2.5 w-6 rounded-[2px]" style={{ background: liftColor(l) }} />
        ))}
        <span>Above usual</span>
        <span className="ml-auto">number = posts in the slot</span>
      </div>
    </div>
  );
}

function Bars({ slots, labels, compact }: { slots: (TimeSlot | null)[]; labels: string[]; compact?: boolean }) {
  const max = Math.max(1.2, ...slots.map((s) => s?.lift ?? 0));
  const best = slots.reduce<TimeSlot | null>((b, s) => (s && s.n >= 2 && (!b || s.lift > b.lift) ? s : b), null);
  return (
    <div
      className="grid items-end gap-1"
      style={{ gridTemplateColumns: `repeat(${slots.length}, minmax(0, 1fr))` }}
    >
      {slots.map((s, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1"
          title={s ? `${labels[i]} · ${s.n} posts · ${fmtLift(s.lift)}` : `${labels[i]} · no posts`}
        >
          <div className="well flex h-24 w-full items-end overflow-hidden rounded-[3px]">
            {s && (
              <div
                className="w-full rounded-[2px]"
                style={{
                  height: `${(s.lift / max) * 100}%`,
                  background: s === best ? "var(--color-accent)" : "color-mix(in srgb, var(--color-accent) 38%, var(--color-surface-2))",
                }}
              />
            )}
          </div>
          <span className={cn("num text-[var(--color-muted)]", compact ? "text-[9px]" : "text-[10.5px]")}>
            {compact ? (i % 3 === 0 ? labels[i] : "") : labels[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BestTimesView({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const tz = snapshot.timeZone;
  const withPosts = PLATFORM_ORDER.filter((pl) => snapshot.posts.some((p) => p.platform === pl));
  const defaultPlatform =
    [...withPosts].sort(
      (a, b) =>
        snapshot.posts.filter((p) => p.platform === b).length - snapshot.posts.filter((p) => p.platform === a).length,
    )[0] ?? "linkedin";
  const [platform, setPlatform] = useState<Platform>(defaultPlatform);
  const [brand, setBrand] = useState<BrandFilter>("all");
  const [range, setRange] = useState<BtRange>(365);

  const accounts = snapshot.accounts.filter((a) => a.platform === platform);
  const brands = [...new Set(accounts.map((a) => a.brand))] as Brand[];
  const activeBrand = brands.includes(brand as Brand) ? brand : "all";

  const summary = useMemo(
    () =>
      PLATFORM_ORDER.filter((pl) => snapshot.accounts.some((a) => a.platform === pl)).map((pl) => {
        const posts = inRange(snapshot.posts.filter((p) => p.platform === pl), snapshot, 365);
        return { platform: pl, bt: bestTimes(posts, snapshot.posts, tz), hasPosts: withPosts.includes(pl) };
      }),
    [snapshot, tz, withPosts],
  );

  const bt = useMemo(() => {
    const posts = inRange(
      snapshot.posts.filter((p) => p.platform === platform && (activeBrand === "all" || p.brand === activeBrand)),
      snapshot,
      range,
    );
    return bestTimes(posts, snapshot.posts, tz);
  }, [snapshot, platform, activeBrand, range, tz]);

  const top = bt.top;
  const bestDay = bt.days.reduce<TimeSlot | null>((b, s) => (s && s.n >= 2 && (!b || s.lift > b.lift) ? s : b), null);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Insights"
        title="Best times to post"
        subtitle={`When each account's posts earn more engagement than its usual post — learned from your own posts, in ${tz.replace(/_/g, " ")} time.`}
        stamp={stampOf(snapshot)}
      />

      {/* One-line answer per platform */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {summary.map(({ platform: pl, bt: s, hasPosts }) => (
          <button
            key={pl}
            type="button"
            disabled={!hasPosts}
            onClick={() => setPlatform(pl)}
            className={cn(
              "card card-hover flex items-start gap-3 p-4 text-left transition-colors disabled:cursor-default",
              pl === platform && "border-[var(--color-accent)]",
            )}
          >
            <PlatformTile platform={pl} />
            <div className="min-w-0">
              <p className="text-[15px] font-bold tracking-[-0.01em]">{PLATFORM_META[pl].label}</p>
              {hasPosts && s.top[0] ? (
                <>
                  <p className="mt-1 text-[13px]">
                    Best: <span className="font-semibold">{slotLabel(s.top[0])}</span>
                  </p>
                  <p className="num mt-0.5 text-xs text-[var(--color-muted)]">
                    {fmtLift(s.top[0].lift)} usual · from {s.sample} posts (12M)
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
                  {hasPosts
                    ? "Not enough posts yet."
                    : snapshot.connections.some((c) => c.platform === pl && c.analyticsOff)
                      ? "Post analytics are off in Zernio — no metrics to learn a best time from."
                      : "Zernio returns no posts yet — no best time to learn from."}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Segmented
          label="Platform"
          value={platform}
          onChange={(v) => {
            setPlatform(v);
            setBrand("all");
          }}
          options={PLATFORM_ORDER.map((pl) => ({
            value: pl,
            label: PLATFORM_META[pl].label,
            disabled: !withPosts.includes(pl),
            title: withPosts.includes(pl) ? undefined : "No posts synced for this platform",
          }))}
        />
        {brands.length > 1 && (
          <Segmented
            label="Account"
            value={activeBrand}
            onChange={setBrand}
            options={[
              { value: "all", label: "All accounts" },
              ...brands.map((b) => ({
                value: b as BrandFilter,
                label: `${BRAND_META[b].label} · @${accounts.find((a) => a.brand === b)?.handle}`,
              })),
            ]}
          />
        )}
        <div className="ml-auto">
          <Segmented
            label="Range"
            value={range}
            onChange={setRange}
            options={[
              { value: 90, label: "90D" },
              { value: 365, label: "12M" },
            ]}
          />
        </div>
      </div>

      {bt.sample === 0 ? (
        <EmptyState title="No posts to learn from" description="Pick another platform, or widen the range." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardEyebrow>Weekday × time of day · {bt.sample} posts</CardEyebrow>
                <CardTitle className="mt-1 text-base">When {PLATFORM_META[platform].label} posts do best</CardTitle>
                <CardDescription className="mt-1">
                  Each cell is the lift over the account&apos;s usual post, pulled toward average when few posts back it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Heatmap bt={bt} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardEyebrow>Ranked</CardEyebrow>
                <CardTitle className="mt-1 text-base">Top slots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="space-y-2.5">
                  {top.map((s, i) => (
                    <li key={`${s.day}-${s.index}`}>
                      <div className="flex items-center gap-3 text-[13px]">
                        <span className="num w-4 text-xs text-[var(--color-faint)]">{i + 1}</span>
                        <span className="flex-1 font-medium">{slotLabel(s)}</span>
                        <span className="num font-semibold text-[var(--color-accent-text)]">{fmtLift(s.lift)}</span>
                      </div>
                      <p className="num ml-7 mt-0.5 text-[11px] text-[var(--color-muted)]">
                        {s.n} post{s.n === 1 ? "" : "s"} · {perPostFmt(s.avgEngagements)} avg engagements
                        {s.n < 2 ? " · low confidence" : ""}
                      </p>
                    </li>
                  ))}
                </ol>
                <div className="rounded-[var(--radius-control)] border border-[color-mix(in_srgb,var(--color-accent)_28%,transparent)] bg-[var(--color-accent-soft)] px-3 py-2.5 text-xs leading-relaxed text-[var(--color-text-2)]">
                  {top[0] ? (
                    <>
                      Post in <span className="font-semibold text-[var(--color-text)]">{slotLabel(top[0])}</span>
                      {top[1] ? (
                        <>
                          {" "}and <span className="font-semibold text-[var(--color-text)]">{slotLabel(top[1])}</span>
                        </>
                      ) : null}
                      {bestDay ? (
                        <>
                          ; {WEEKDAYS[bestDay.day]} is the strongest day overall ({fmtLift(bestDay.lift)}).
                        </>
                      ) : (
                        "."
                      )}{" "}
                      Test the top slot for four weeks before locking it in.
                    </>
                  ) : (
                    "Not enough posts to suggest a schedule yet."
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardEyebrow>Hour of day</CardEyebrow>
                <CardTitle className="mt-1 text-base">By publish hour</CardTitle>
              </CardHeader>
              <CardContent>
                <Bars slots={bt.hours} labels={Array.from({ length: 24 }, (_, h) => hourLabel(h))} compact />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardEyebrow>Weekday</CardEyebrow>
                <CardTitle className="mt-1 text-base">By publish day</CardTitle>
              </CardHeader>
              <CardContent>
                <Bars slots={bt.days} labels={WEEKDAYS} />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <MethodNotes
        notes={[
          "Lift = (a post's engagements + 1) ÷ (its account's median + 1). 1.0× is a usual post; 1.5× earns half again as much. Measuring against each account's own median lets a 3K-follower account and a 120-follower account share one map.",
          "Slots backed by few posts are pulled toward 1.0× (three posts of prior), so one lucky post can't crown a slot. Treat anything with fewer than two posts as a hint.",
          `Times are in ${tz.replace(/_/g, " ")}. Your audience's local time matters more than yours — if most followers are in another timezone, shift accordingly.`,
          "This learns from when you have posted. Slots you never use show empty; the only way to test them is to post there.",
        ]}
      />
    </div>
  );
}
