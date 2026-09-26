import { BrandMark } from "@/components/shell/brand-mark";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { LiveClock } from "@/components/shell/live-clock";

export function DemoHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--scrim-topbar)] px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
        <BrandMark />
        <p className="truncate text-[14px] font-bold tracking-[-0.01em] text-[var(--color-text)]">Social Analytics</p>
      </div>
      <span className="num hidden rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-1.5 text-[10px] uppercase leading-[18px] tracking-[0.08em] text-[var(--color-muted)] sm:inline">
        Read-only snapshot
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        <LiveClock />
        <ThemeToggle />
      </div>
    </header>
  );
}
