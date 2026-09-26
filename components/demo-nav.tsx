"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ANALYTICS_SECTIONS, sectionHref } from "@/components/analytics-dashboard/nav";
import { BrandMark } from "@/components/shell/brand-mark";

function useActive() {
  const pathname = (usePathname() || "/").replace(/\/+$/, "") || "/";
  return (slug: string) => (slug ? pathname === `/${slug}` : pathname === "/");
}

/** Desktop left menu: the analytics sections, grouped. */
export function DemoSidebar() {
  const isActive = useActive();
  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)] lg:flex">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <BrandMark />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[15px] font-bold tracking-[-0.01em] text-[var(--color-text)]">Social Analytics</p>
          <p className="mt-px text-[9.5px] font-medium uppercase tracking-[0.13em] text-[var(--color-faint)]">
            Rafael Schwart · Arqentia
          </p>
        </div>
      </div>
      <nav aria-label="Sections" className="flex-1 space-y-4 overflow-y-auto px-3 pb-3 pt-1">
        {ANALYTICS_SECTIONS.map((g) => (
          <div key={g.title}>
            <p className="px-2.5 pb-1 text-[11.5px] font-medium text-[var(--color-faint)]">{g.title}</p>
            <ul className="space-y-px">
              {g.items.map((item) => {
                const active = isActive(item.slug);
                const Icon = item.icon;
                return (
                  <li key={item.slug || "overview"}>
                    <Link
                      href={sectionHref("", item.slug, true)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-8 items-center gap-2.5 rounded-[var(--radius-control)] border px-2.5 text-[13px] font-medium transition-colors duration-150",
                        active
                          ? "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--shadow-card)]"
                          : "border-transparent text-[var(--color-muted)] hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] hover:text-[var(--color-text)]",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-[var(--color-accent-text)]" : "text-[var(--color-faint)]",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="p-3">
        <div className="card space-y-2.5 px-3 py-2.5">
          <div>
            <p className="eyebrow text-[9.5px]">Data source</p>
            <p className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-2)]">
              <span className="live-dot" aria-hidden />
              Zernio · read-only snapshot
            </p>
          </div>
          <div>
            <p className="eyebrow text-[9.5px]">Advice</p>
            <p className="mt-1 text-xs text-[var(--color-text-2)]">Platform specialist agents</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Mobile: the same sections as a scrolling tab strip under the header. */
export function MobileNav() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Sections"
      className="sticky top-12 z-20 flex gap-1 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--scrim-topbar)] px-3 py-2 backdrop-blur-md lg:hidden"
    >
      {ANALYTICS_SECTIONS.flatMap((g) => g.items).map((item) => {
        const active = isActive(item.slug);
        const Icon = item.icon;
        return (
          <Link
            key={item.slug || "overview"}
            href={sectionHref("", item.slug, true)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border px-2.5 text-[13px] font-medium",
              active
                ? "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
                : "border-transparent text-[var(--color-muted)]",
            )}
          >
            <Icon className={cn("size-3.5", active ? "text-[var(--color-accent-text)]" : "text-[var(--color-faint)]")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
