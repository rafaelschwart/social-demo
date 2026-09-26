import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn, formatCompact } from "@/lib/utils";

export interface MetricStatProps {
  label: string;
  /** Raw numeric value. null/undefined renders as a dash (gap != 0). */
  value: number | null | undefined;
  /** Optional already-formatted override (e.g. percentages). */
  display?: string;
  /** Signed absolute delta vs. the comparison window. */
  delta?: number | null;
  /** Signed fractional change (0.12 = +12%) vs. the comparison window. Wins over `delta`. */
  deltaPct?: number | null;
  /** Neutral pill shown when there is no delta (e.g. a share or status). */
  tag?: string;
  sublabel?: string;
  icon?: React.ReactNode;
  /** Headline stat: the value reads in the accent. */
  accent?: boolean;
  className?: string;
}

export function TrendPill({ delta, pct }: { delta?: number | null; pct?: number | null }) {
  const v = pct ?? delta;
  if (v === null || v === undefined || !Number.isFinite(v) || v === 0) return null;
  const up = v > 0;
  const text =
    pct !== null && pct !== undefined
      ? `${up ? "+" : ""}${(pct * 100).toFixed(Math.abs(pct) < 0.1 ? 1 : 0)}%`
      : `${up ? "+" : ""}${formatCompact(v)}`;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "num inline-flex items-center gap-1 rounded-[var(--radius-chip)] border px-1.5 text-[11px] font-medium leading-[18px]",
        up
          ? "border-[color-mix(in_srgb,var(--color-positive)_32%,transparent)] bg-[var(--color-positive-soft)] text-[var(--color-positive)]"
          : "border-[color-mix(in_srgb,var(--color-danger)_32%,transparent)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
      )}
    >
      <Icon className="size-3" />
      {text}
    </span>
  );
}

export function MetricStat({
  label,
  value,
  display,
  delta,
  deltaPct,
  tag,
  sublabel,
  icon,
  accent,
  className,
}: MetricStatProps) {
  const shown = display ?? formatCompact(value ?? null);
  const hasTrend =
    (deltaPct !== null && deltaPct !== undefined && deltaPct !== 0) ||
    (delta !== null && delta !== undefined && delta !== 0);

  return (
    <div className={cn("card card-hover flex flex-col p-4", className)}>
      {icon && (
        <span className="well flex size-8 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-muted)] [&_svg]:size-4">
          {icon}
        </span>
      )}
      <p className={cn("text-[13px] font-medium text-[var(--color-muted)]", icon && "mt-3.5")}>{label}</p>

      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span
          className={cn(
            "num text-[28px] font-medium leading-9",
            accent ? "text-[var(--color-accent-text)]" : "text-[var(--color-text)]",
          )}
        >
          {shown}
        </span>
        {hasTrend ? (
          <TrendPill delta={delta} pct={deltaPct} />
        ) : (
          tag && (
            <span className="num rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-1.5 text-[11px] leading-[18px] text-[var(--color-muted)]">
              {tag}
            </span>
          )
        )}
      </div>

      {sublabel && <p className="mt-1 text-xs text-[var(--color-muted)]">{sublabel}</p>}
    </div>
  );
}
