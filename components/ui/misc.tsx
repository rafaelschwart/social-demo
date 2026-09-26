import * as React from "react";
import { AlertTriangle, Info, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-control)] bg-[var(--color-surface-2)]", className)}
      {...props}
    />
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-[var(--color-border)]", className)} />;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[color-mix(in_srgb,var(--color-surface-2)_45%,transparent)] p-10 text-center">
      {icon && <div className="text-[var(--color-faint)]">{icon}</div>}
      <div>
        <p className="text-sm font-semibold text-[var(--color-text)]">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-[52ch] text-xs leading-relaxed text-[var(--color-muted)]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * Caveat banner — the "render, don't hide" principle. Use for ToS warnings,
 * approximate-fidelity notices, stale-data stamps, and platform gaps.
 */
export function Caveat({
  tone = "warning",
  children,
}: {
  tone?: "warning" | "danger" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    warning:
      "border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[var(--color-warning-soft)] [&_svg]:text-[var(--color-warning)]",
    danger:
      "border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[var(--color-danger-soft)] [&_svg]:text-[var(--color-danger)]",
    info: "border-[color-mix(in_srgb,var(--color-accent)_28%,transparent)] bg-[var(--color-accent-soft)] [&_svg]:text-[var(--color-accent-text)]",
  }[tone];
  const Icon = tone === "info" ? Info : tone === "danger" ? OctagonAlert : AlertTriangle;
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-[var(--radius-control)] border px-3 py-2.5 text-xs text-[var(--color-text-2)]",
        styles,
      )}
    >
      <Icon className="mt-px size-3.5 shrink-0" aria-hidden />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
