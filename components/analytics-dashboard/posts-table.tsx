"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { PostThumb } from "@/components/analytics/post-thumb";
import { cn, formatCompact } from "@/lib/utils";
import { formatLabel } from "./compute";
import { PLATFORM_META, type Platform, type SnapshotAccount, type SnapshotPost } from "./types";
import { BrandChip, Segmented, pct, postLink, whole, type LinkMode } from "./ui";

type SortKey = "recent" | "engagements" | "rate" | "impressions";
const PAGE = 20;

/** Every post on one platform, sortable, with the full metric breakdown. */
export function PlatformPostsTable({
  platform,
  posts,
  accounts,
  tz,
  linkMode,
}: {
  platform: Platform;
  posts: SnapshotPost[];
  accounts: SnapshotAccount[];
  tz: string;
  linkMode: LinkMode;
}) {
  const [sort, setSort] = useState<SortKey>("recent");
  const [shown, setShown] = useState(PAGE);
  const multi = accounts.length > 1;
  const handle = (key: string) => accounts.find((a) => a.key === key)?.handle ?? "";
  const dateFmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: tz });
  const timeFmt = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone: tz });

  const sorted = [...posts].sort((a, b) => {
    if (sort === "recent") return b.publishedAt.localeCompare(a.publishedAt);
    const key = sort === "rate" ? "engagementRate" : sort;
    return (b[key] ?? -1) - (a[key] ?? -1);
  });
  const visible = sorted.slice(0, shown);

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardEyebrow>
            {posts.length} post{posts.length === 1 ? "" : "s"} in range
          </CardEyebrow>
          <CardTitle className="mt-1 text-base">All {PLATFORM_META[platform].label} posts</CardTitle>
        </div>
        <Segmented
          label="Sort posts"
          value={sort}
          onChange={(v) => {
            setSort(v);
            setShown(PAGE);
          }}
          options={[
            { value: "recent", label: "Recent" },
            { value: "engagements", label: "Engagements" },
            { value: "rate", label: "Rate" },
            { value: "impressions", label: "Impressions" },
          ]}
        />
      </CardHeader>
      {posts.length === 0 ? (
        <div className="px-5 pb-5">
          <EmptyState title="No posts in this range" description="Widen the range, or check the data notes below." />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-y border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-2)_70%,transparent)] text-left font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-faint)]">
                  <th className="px-5 py-2 font-medium">Post</th>
                  <th className="px-3 py-2 font-medium">Published</th>
                  <th className="px-3 py-2 text-right font-medium">Impr.</th>
                  <th className="px-3 py-2 text-right font-medium">Reach</th>
                  <th className="px-3 py-2 text-right font-medium">Likes</th>
                  <th className="px-3 py-2 text-right font-medium">Comm.</th>
                  <th className="px-3 py-2 text-right font-medium">Shares</th>
                  <th className="px-3 py-2 text-right font-medium">Saves</th>
                  <th className="px-3 py-2 text-right font-medium">Eng.</th>
                  <th className="px-3 py-2 text-right font-medium">ER</th>
                  <th className="w-8 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => {
                  const href = postLink(p, linkMode);
                  const external = linkMode === "external" || !p.href;
                  const d = new Date(p.publishedAt);
                  const cellNum = "num px-3 py-2.5 text-right text-[13px] text-[var(--color-text-2)]";
                  return (
                    <tr
                      key={p.id}
                      className="group border-b border-[var(--color-border)] last:border-0 transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_3.5%,transparent)]"
                    >
                      <td className="max-w-[28rem] px-5 py-2.5">
                        <div className="flex items-center gap-3">
                          <PostThumb thumbnailUrl={p.thumbnailUrl} mediaType={p.mediaType} size="sm" />
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-[13px] leading-snug text-[var(--color-text)]">
                              {p.text ?? <span className="italic text-[var(--color-faint)]">No caption</span>}
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--color-muted)]">
                              {multi && (
                                <>
                                  <BrandChip brand={p.brand} />
                                  <span>@{handle(p.accountKey)}</span>
                                  <span aria-hidden>·</span>
                                </>
                              )}
                              {formatLabel(p.mediaType)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[12px] text-[var(--color-text-2)]">
                        <span className="num">{dateFmt.format(d)}</span>
                        <span className="num block text-[11px] text-[var(--color-faint)]">{timeFmt.format(d)}</span>
                      </td>
                      <td className={cellNum}>{formatCompact(p.impressions)}</td>
                      <td className={cellNum}>{formatCompact(p.reach)}</td>
                      <td className={cellNum}>{whole(p.likes)}</td>
                      <td className={cellNum}>{whole(p.comments)}</td>
                      <td className={cellNum}>{whole(p.shares)}</td>
                      <td className={cellNum}>{whole(p.saves)}</td>
                      <td className={cn(cellNum, "font-medium text-[var(--color-text)]")}>{whole(p.engagements)}</td>
                      <td className={cellNum}>{pct(p.engagementRate)}</td>
                      <td className="px-3 py-2.5 text-right">
                        {href && (
                          <a
                            href={href}
                            aria-label="Open post"
                            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="text-[var(--color-faint)] transition-colors group-hover:text-[var(--color-accent-text)]"
                          >
                            <ArrowUpRight className="size-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3 px-5 py-3 text-xs text-[var(--color-muted)]">
            <span className="num">
              Showing {visible.length} of {sorted.length}
            </span>
            {shown < sorted.length && (
              <Button variant="secondary" size="sm" onClick={() => setShown((n) => n + PAGE)}>
                Show {Math.min(PAGE, sorted.length - shown)} more
              </Button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
