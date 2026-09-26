"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
}
const getSecond = () => Math.floor(Date.now() / 1000);

const DAY = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" });
const TIME = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", second: "2-digit" });

/** Date + ticking time pill. Renders nothing on the server (no hydration drift). */
export function LiveClock() {
  const sec = useSyncExternalStore<number | null>(subscribe, getSecond, () => null);
  if (sec === null) return <span className="hidden h-8 w-[196px] xl:block" aria-hidden />;
  const now = new Date(sec * 1000);

  return (
    <span className="hidden h-8 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs shadow-[var(--shadow-card)] xl:inline-flex">
      <span className="size-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden />
      <span className="font-medium text-[var(--color-text-2)]">{DAY.format(now)}</span>
      <span className="num text-[var(--color-accent-text)]">{TIME.format(now)}</span>
    </span>
  );
}
