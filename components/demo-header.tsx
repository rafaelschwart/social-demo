import { BrandMark } from "@/components/shell/brand-mark";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { LiveClock } from "@/components/shell/live-clock";

export function DemoHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--scrim-topbar)] px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <BrandMark />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[15px] font-bold tracking-[-0.01em] text-[var(--color-text)]">Social Analytics</p>
        <p className="mt-px truncate text-[9.5px] font-medium uppercase tracking-[0.13em] text-[var(--color-faint)]">
          Rafael Schwart · Arqentia
        </p>
      </div>
      <span className="num ml-2 hidden rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-1.5 text-[10px] uppercase leading-[18px] tracking-[0.08em] text-[var(--color-muted)] sm:inline">
        Read-only
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        <LiveClock />
        <ThemeToggle />
      </div>
    </header>
  );
}
