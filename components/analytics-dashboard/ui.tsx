"use client";

import { useState } from "react";
import { cn, formatCompact } from "@/lib/utils";
import { PlatformGlyph } from "./platform-icons";
import {
  BRAND_META,
  PLATFORM_META,
  type AnalyticsSnapshot,
  type Brand,
  type Platform,
  type SnapshotAccount,
  type SnapshotPost,
} from "./types";

/* ─────────────────────────────── formatting ─────────────────────────────── */

export const pct = (v: number | null, digits = 1) => (v === null ? "—" : `${(v * 100).toFixed(digits)}%`);
export const whole = (v: number | null) => (v === null ? "—" : new Intl.NumberFormat("en").format(Math.round(v)));
export const perPostFmt = (v: number | null) => (v === null ? "—" : v >= 100 ? formatCompact(v) : v.toFixed(1));

export type LinkMode = "internal" | "external";

/** Where a post opens: the app's detail page, or the post on the platform. */
export function postLink(p: SnapshotPost, linkMode: LinkMode): string | null {
  return linkMode === "internal" ? (p.href ?? p.url) : p.url;
}

/** Why an account shows no post metrics (analytics switched off in Zernio, or no posts returned). */
export function noPostsReason(snapshot: AnalyticsSnapshot, account: Pick<SnapshotAccount, "key" | "handle">): string {
  const off = snapshot.connections.find((c) => c.key === account.key)?.analyticsOff;
  return off
    ? `Post analytics are switched off for @${account.handle} in Zernio (X bills every metrics read), so it shows followers only.`
    : `Zernio returns no posts for @${account.handle} yet, so it shows followers only.`;
}

export function stampOf(snapshot: AnalyticsSnapshot): string | null {
  return snapshot.lastSyncedAt
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: snapshot.timeZone }).format(
        new Date(snapshot.lastSyncedAt),
      )
    : null;
}

/* ─────────────────────────────── primitives ─────────────────────────────── */

export function PlatformDot({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 shrink-0 rounded-full", className)}
      style={{ background: PLATFORM_META[platform].color }}
    />
  );
}

export function BrandChip({ brand }: { brand: Brand | null }) {
  return (
    <span
      className={cn(
        "rounded-[var(--radius-chip)] border px-1.5 text-[10.5px] font-semibold leading-[18px]",
        brand === "arqentia"
          ? "border-[color-mix(in_srgb,var(--color-accent)_32%,transparent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]"
          : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)]",
      )}
    >
      {brand ? BRAND_META[brand].label : "Unassigned"}
    </span>
  );
}

/** Segmented control (the Citi Zero tab strip). */
export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: React.ReactNode; disabled?: boolean; title?: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="well inline-flex h-9 max-w-full items-center gap-0.5 overflow-x-auto rounded-[var(--radius-control)] border border-[var(--color-border)] p-0.5"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={o.disabled}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-full shrink-0 items-center gap-1.5 rounded-[5px] px-3 text-[13px] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
              active
                ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--shadow-card)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-text)]",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  stamp,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  stamp?: string | null;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-[var(--color-border)] pb-5">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 flex items-center gap-2.5 text-[28px] font-bold leading-none tracking-[-0.02em]">
          {icon}
          {title}
        </h1>
        <p className="mt-2.5 max-w-[68ch] text-sm text-[var(--color-muted)]">{subtitle}</p>
      </div>
      {stamp !== undefined && (
        <p className="num flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[var(--color-muted)]">
          <span className={stamp ? "live-dot" : "size-[7px] rounded-full bg-[var(--color-faint)]"} aria-hidden />
          {stamp ? `Data as of ${stamp}` : "Never synced"}
        </p>
      )}
    </header>
  );
}

/** Square platform glyph tile, tinted with the platform color. */
export function PlatformTile({ platform, size = "md" }: { platform: string; size?: "sm" | "md" }) {
  const color = (PLATFORM_META as Record<string, { color: string }>)[platform]?.color ?? "var(--color-muted)";
  return (
    <span
      className={cn(
        "well inline-flex shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)]",
        size === "sm" ? "size-7" : "size-9",
      )}
      style={{ color }}
    >
      <PlatformGlyph platform={platform} className={size === "sm" ? "size-3.5" : "size-[18px]"} />
    </span>
  );
}

/** Account avatar with a platform badge; falls back to an initial if the image fails. */
export function AccountAvatar({ src, name, platform }: { src: string | null; name: string; platform: string }) {
  const [failed, setFailed] = useState(false);
  const show = !!src && !failed;
  return (
    <span className="relative inline-flex size-11 shrink-0">
      <span className="well flex size-11 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] text-sm font-bold text-[var(--color-muted)]">
        {show ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className="size-full object-cover"
            onError={() => setFailed(true)}
            ref={(el) => {
              if (el && el.complete && el.naturalWidth === 0) setFailed(true);
            }}
          />
        ) : (
          name.replace(/^@/, "").charAt(0).toUpperCase()
        )}
      </span>
      <span
        className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]"
        style={{ color: (PLATFORM_META as Record<string, { color: string }>)[platform]?.color ?? "var(--color-muted)" }}
      >
        <PlatformGlyph platform={platform} className="size-3" />
      </span>
    </span>
  );
}

export function ImpactChip({ level, kind }: { level: "high" | "medium" | "low"; kind: "impact" | "effort" }) {
  const good = kind === "impact" ? level === "high" : level === "low";
  const bad = kind === "impact" ? level === "low" : level === "high";
  return (
    <span
      className={cn(
        "num rounded-[var(--radius-chip)] border px-1.5 text-[10px] uppercase leading-[18px] tracking-[0.06em]",
        good
          ? "border-[color-mix(in_srgb,var(--color-positive)_32%,transparent)] bg-[var(--color-positive-soft)] text-[var(--color-positive)]"
          : bad
            ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-faint)]"
            : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)]",
      )}
    >
      {kind} {level}
    </span>
  );
}
