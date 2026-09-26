"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact } from "@/lib/utils";

export type TrendDatum = Record<string, number | string | null | undefined>;

export interface TrendSeries {
  key: string;
  label: string;
  /** CSS color (token var). */
  color: string;
}

export interface TrendChartProps {
  data: TrendDatum[];
  /** Numeric series key to plot (single-series form). */
  dataKey?: string;
  /** Multi-series form; the first series is the hero (filled). */
  series?: TrendSeries[];
  /** Category (x) key. Defaults to "date". */
  xKey?: string;
  height?: number;
  /** Stroke / fill color for the single-series form (defaults to accent). */
  color?: string;
  /** Human label for the tooltip value (single-series form). */
  valueLabel?: string;
}

interface TooltipPayloadItem {
  value?: number | string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

function fmtX(v: unknown): string {
  if (typeof v === "string") {
    const d = new Date(v.length === 10 ? `${v}T12:00:00` : v);
    if (!Number.isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(d);
    }
    return v;
  }
  return String(v ?? "");
}

function fmtLong(v: unknown): string {
  if (typeof v === "string") {
    const d = new Date(v.length === 10 ? `${v}T12:00:00` : v);
    if (!Number.isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(d);
    }
  }
  return String(v ?? "");
}

function ChartTooltip({
  active,
  payload,
  series,
  xKey,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  series: TrendSeries[];
  xKey: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const raw = payload[0].payload?.[xKey];
  return (
    <div className="min-w-40 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-elevated)] px-3 py-2 text-xs shadow-[var(--shadow-pop)]">
      <p className="mb-1.5 font-medium text-[var(--color-text-2)]">{fmtLong(raw)}</p>
      <div className="space-y-1">
        {series.map((s) => {
          const item = payload.find((p) => p.dataKey === s.key);
          const v = item?.value;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <span className="h-3 w-[3px] rounded-full" style={{ background: s.color }} />
              <span className="flex-1 text-[var(--color-muted)]">{s.label}</span>
              <span className="num font-medium text-[var(--color-text)]">
                {typeof v === "number" ? formatCompact(v) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TrendChart({
  data,
  dataKey = "value",
  series,
  xKey = "date",
  height = 240,
  color = "var(--color-accent)",
  valueLabel,
}: TrendChartProps) {
  const gradId = React.useId().replace(/[:]/g, "");
  const lines: TrendSeries[] = series ?? [{ key: dataKey, label: valueLabel ?? "Value", color }];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 26, left: 0, bottom: 0 }}>
        <defs>
          {lines.map((s, i) => (
            <linearGradient key={s.key} id={`${gradId}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={i === 0 ? 0.34 : 0.12} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 4" stroke="var(--color-chart-grid)" vertical={false} />
        <XAxis
          dataKey={xKey as string}
          tickFormatter={fmtX}
          tick={{ fill: "var(--color-chart-tick)", fontSize: 11, fontFamily: "var(--font-num)" }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          minTickGap={36}
        />
        <YAxis
          tickFormatter={(v) => formatCompact(typeof v === "number" ? v : Number(v))}
          tick={{ fill: "var(--color-chart-tick)", fontSize: 11, fontFamily: "var(--font-num)" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1, strokeDasharray: "3 3" }}
          content={<ChartTooltip series={lines} xKey={xKey} />}
        />
        {/* Draw secondary series first so the hero sits on top. */}
        {[...lines].reverse().map((s) => {
          const i = lines.indexOf(s);
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={i === 0 ? 1.6 : 1.25}
              fill={`url(#${gradId}-${i})`}
              dot={false}
              activeDot={{ r: 3.5, fill: s.color, stroke: "var(--color-surface)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}
