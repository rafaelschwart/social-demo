"use client";

import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MethodNotes } from "./sections";
import { ANY_PLATFORM_LABEL, BRAND_META, type AnalyticsSnapshot, type Brand, type SnapshotConnection } from "./types";
import { AccountAvatar, BrandChip, PageHeader, stampOf, whole } from "./ui";

const STATUS: Record<string, { label: string; cls: string }> = {
  healthy: {
    label: "Healthy",
    cls: "border-[color-mix(in_srgb,var(--color-positive)_32%,transparent)] bg-[var(--color-positive-soft)] text-[var(--color-positive)]",
  },
  warning: {
    label: "Needs attention",
    cls: "border-[color-mix(in_srgb,var(--color-warning)_32%,transparent)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  },
  error: {
    label: "Error",
    cls: "border-[color-mix(in_srgb,var(--color-danger)_32%,transparent)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  },
  reauth_required: {
    label: "Reconnect needed",
    cls: "border-[color-mix(in_srgb,var(--color-danger)_32%,transparent)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  },
  disconnected: {
    label: "Disconnected",
    cls: "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-muted)]",
  },
};

function statusOf(c: SnapshotConnection) {
  return c.status !== "connected" ? STATUS[c.status] : STATUS[c.health];
}

function ConnectionCard({ c, tz }: { c: SnapshotConnection; tz: string }) {
  const st = statusOf(c);
  const updated = c.followersUpdatedAt
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: tz }).format(new Date(c.followersUpdatedAt))
    : null;
  const name = c.displayName || c.handle;
  return (
    <Card className={cn("flex flex-col gap-4 p-4", !c.inAnalytics && "opacity-80")}>
      <div className="flex items-start gap-3">
        <AccountAvatar src={c.avatarUrl} name={name} platform={c.platform} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-bold tracking-[-0.01em]">{name}</p>
          <p className="truncate text-xs text-[var(--color-muted)]">
            @{c.handle} · {ANY_PLATFORM_LABEL[c.platform] ?? c.platform}
          </p>
          {c.via && (
            <p className="mt-0.5 truncate text-[11px] text-[var(--color-faint)]">
              Via the {c.via} connection (page mode)
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <BrandChip brand={c.brand} />
            <span className={cn("num rounded-[var(--radius-chip)] border px-1.5 text-[10px] uppercase leading-[18px] tracking-[0.06em]", st.cls)}>
              {st.label}
            </span>
            {c.analyticsOff && (
              <span
                title="Post analytics are switched off for this account in Zernio (X bills each metrics read). Posting still works."
                className="num rounded-[var(--radius-chip)] border border-[color-mix(in_srgb,var(--color-warning)_32%,transparent)] bg-[var(--color-warning-soft)] px-1.5 text-[10px] uppercase leading-[18px] tracking-[0.06em] text-[var(--color-warning)]"
              >
                Analytics off in Zernio
              </span>
            )}
          </div>
        </div>
        {c.profileUrl && (
          <a
            href={c.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${name} on ${ANY_PLATFORM_LABEL[c.platform] ?? c.platform}`}
            className="text-[var(--color-faint)] transition-colors hover:text-[var(--color-accent-text)]"
          >
            <ExternalLink className="size-4" />
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-2)_60%,transparent)]">
        <div className="px-3 py-2">
          <p className="text-[11px] text-[var(--color-muted)]">Followers</p>
          <p className="num mt-0.5 text-[16px] font-medium">{whole(c.followers)}</p>
          {updated && <p className="num text-[10px] text-[var(--color-faint)]">as of {updated}</p>}
        </div>
        <div className="px-3 py-2">
          <p className="text-[11px] text-[var(--color-muted)]">Posts tracked</p>
          <p className="num mt-0.5 text-[16px] font-medium">{whole(c.postsTracked)}</p>
          <p className="text-[10px] text-[var(--color-faint)]">
            {!c.inAnalytics ? "Outside this dashboard" : c.analyticsOff ? "Posting only · no metrics" : "In analytics"}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function AccountsView({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const tz = snapshot.timeZone;
  const cs = snapshot.connections;
  const inScope = cs.filter((c) => c.inAnalytics);
  const groups: { key: Brand | "none"; title: string; items: SnapshotConnection[] }[] = [
    { key: "personal", title: `${BRAND_META.personal.label} · ${BRAND_META.personal.blurb}`, items: cs.filter((c) => c.brand === "personal") },
    { key: "arqentia", title: `${BRAND_META.arqentia.label} · ${BRAND_META.arqentia.blurb}`, items: cs.filter((c) => c.brand === "arqentia") },
    { key: "none", title: "Unassigned", items: cs.filter((c) => !c.brand) },
  ];
  const attention = cs.filter((c) => c.status !== "connected" || c.health !== "healthy");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Accounts"
        title="Connected accounts"
        subtitle="Every account connected through Zernio, which brand it belongs to, and whether it feeds this dashboard."
        stamp={stampOf(snapshot)}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Connected", value: whole(cs.length), sub: `${inScope.length} in analytics` },
          { label: "Followers in analytics", value: whole(inScope.reduce((a, c) => a + (c.followers ?? 0), 0)), sub: "X · LinkedIn · Instagram" },
          ...(["personal", "arqentia"] as Brand[]).map((b) => ({
            label: `${BRAND_META[b].label} followers`,
            value: whole(inScope.filter((c) => c.brand === b).reduce((a, c) => a + (c.followers ?? 0), 0)),
            sub: `${inScope.filter((c) => c.brand === b).length} accounts in analytics`,
          })),
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-[13px] font-medium text-[var(--color-muted)]">{s.label}</p>
            <p className="num mt-1 text-[26px] font-medium leading-9">{s.value}</p>
            <p className="text-xs text-[var(--color-muted)]">{s.sub}</p>
          </div>
        ))}
      </div>

      {attention.length > 0 && (
        <p className="rounded-[var(--radius-control)] border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[var(--color-warning-soft)] px-3 py-2.5 text-xs text-[var(--color-text-2)]">
          {attention.length} account{attention.length === 1 ? " needs" : "s need"} attention:{" "}
          {attention.map((c) => `@${c.handle}`).join(", ")}.
        </p>
      )}

      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => (
          <section key={g.key} aria-label={g.title} className="space-y-3">
            <p className="eyebrow">{g.title}</p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {g.items.map((c) => (
                <ConnectionCard key={c.key} c={c} tz={tz} />
              ))}
            </div>
          </section>
        ))}

      <MethodNotes
        notes={[
          "Accounts are connected in Zernio; each is assigned to Personal or Arqentia by its Zernio account id (the Zernio profiles mix both brands).",
          "The Arqentia LinkedIn company page is not a separate connection: the personal LinkedIn connection switches to the page to publish, and its analytics are pulled the same way.",
          "This dashboard covers X, LinkedIn and Instagram. TikTok and Facebook stay connected for publishing but sit outside these analytics.",
          "Followers are the latest count Zernio reports; posts tracked counts every synced post on the account.",
        ]}
      />
    </div>
  );
}
