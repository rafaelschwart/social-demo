"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FolderOpen, RefreshCw, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EngineStatus } from "./types";
import { PageHeader } from "./ui";

const OK =
  "border-[color-mix(in_srgb,var(--color-positive)_32%,transparent)] bg-[var(--color-positive-soft)] text-[var(--color-positive)]";
const WARN =
  "border-[color-mix(in_srgb,var(--color-warning)_32%,transparent)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]";
const BAD =
  "border-[color-mix(in_srgb,var(--color-danger)_32%,transparent)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]";

function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={cn("num rounded-[var(--radius-chip)] border px-1.5 text-[10px] uppercase leading-[18px] tracking-[0.06em]", cls)}>
      {children}
    </span>
  );
}

function when(iso: string | null, tz: string): string {
  return iso
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: tz }).format(
        new Date(iso),
      )
    : "—";
}

function state(e: EngineStatus): { label: string; cls: string } {
  if (!e.connected) return { label: "Folder missing", cls: BAD };
  if (e.error) return { label: "Export failed", cls: BAD };
  if (!e.lastExportAt) return { label: "Not fed yet", cls: WARN };
  return { label: "Connected", cls: OK };
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="num mt-1 truncate text-[13px] text-[var(--color-text)]">{value}</dd>
    </div>
  );
}

function EngineCard({ e, tz, readOnly }: { e: EngineStatus; tz: string; readOnly: boolean }) {
  const st = state(e);
  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-bold tracking-[-0.01em]">{e.name}</p>
            <Pill cls={st.cls}>{st.label}</Pill>
          </div>
          <p className="mt-1 max-w-[70ch] text-[13px] text-[var(--color-muted)]">{e.executor}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {e.lanes.map((l) => (
          <span
            key={`${l.platform}-${l.brand}`}
            className="rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-1.5 text-[11px] font-semibold leading-[20px] text-[var(--color-text-2)]"
          >
            {l.label}
          </span>
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        <Fact label="Last fed" value={when(e.lastExportAt, tz)} />
        <Fact label="Data as of" value={when(e.dataAsOf, tz)} />
        <Fact label="Accounts · posts (90d)" value={e.lastExportAt ? `${e.accounts} · ${e.posts90}` : "—"} />
        <Fact label="Engine last active" value={when(e.engineActivityAt, tz)} />
      </dl>
      {!readOnly && e.folder && (
        <p className="well num flex items-center gap-2 truncate px-3 py-2 text-[12px] text-[var(--color-text-2)]" title={`${e.folder}/_command-center`}>
          <FolderOpen className="size-3.5 shrink-0 text-[var(--color-faint)]" aria-hidden />
          <span className="truncate">{e.folder}/_command-center</span>
        </p>
      )}
      {e.error && <p className="text-[12px] text-[var(--color-danger)]">{e.error}</p>}
    </Card>
  );
}

function RefreshButtons() {
  const router = useRouter();
  const [running, setRunning] = useState<"sync" | "export" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const run = async (mode: "sync" | "export") => {
    setRunning(mode);
    setMsg(null);
    try {
      const res = await fetch(`/api/orchestrator${mode === "export" ? "?sync=0" : ""}`, { method: "POST" });
      const body = (await res.json()) as { ok: boolean; error?: string; engines?: EngineStatus[] };
      const fed = body.engines?.filter((e) => !e.error).length ?? 0;
      setMsg(
        body.ok
          ? { ok: true, text: `${fed} engine${fed === 1 ? "" : "s"} fed.` }
          : { ok: false, text: body.error ?? `Some engines were not fed (${fed} of ${body.engines?.length ?? 0}).` },
      );
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setRunning(null);
    }
  };
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" disabled={!!running} onClick={() => run("export")}>
          <RefreshCw className={cn("size-3.5", running === "export" && "animate-spin")} />
          Re-send briefs
        </Button>
        <Button size="sm" disabled={!!running} onClick={() => run("sync")}>
          <RefreshCw className={cn("size-3.5", running === "sync" && "animate-spin")} />
          {running === "sync" ? "Syncing Zernio…" : "Sync Zernio & feed engines"}
        </Button>
      </div>
      {msg && <p className={cn("text-[11px]", msg.ok ? "text-[var(--color-positive)]" : "text-[var(--color-danger)]")}>{msg.text}</p>}
    </div>
  );
}

export function EnginesView({
  engines,
  timeZone,
  readOnly = false,
}: {
  engines: EngineStatus[];
  timeZone: string;
  /** Static demo: no refresh buttons, no local paths. */
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Orchestration"
        title="Execution engines"
        icon={<Workflow className="size-6 text-[var(--color-accent-text)]" aria-hidden />}
        subtitle="This app is the only reader of Zernio analytics. Each engine gets its lane's numbers, best times and specialist advice in a _command-center/ folder, and handles writing, design and publishing itself."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ol className="flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--color-text-2)]">
          {["Zernio", "Command Center", "_command-center/ briefs", "Engines execute"].map((step, i, all) => (
            <li key={step} className="flex items-center gap-2">
              <span className="card px-2.5 py-1 font-medium">{step}</span>
              {i < all.length - 1 && <ArrowRight className="size-3.5 text-[var(--color-faint)]" aria-hidden />}
            </li>
          ))}
        </ol>
        {!readOnly && <RefreshButtons />}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {engines.map((e) => (
          <EngineCard key={e.id} e={e} tz={timeZone} readOnly={readOnly} />
        ))}
      </div>

      <p className="max-w-[80ch] text-[12.5px] text-[var(--color-muted)]">
        {readOnly ? (
          "Engines are fed after every analytics sync and whenever the specialists run. This page is a snapshot of their status at publish time."
        ) : (
          <>
            Engines are fed automatically after every analytics sync and whenever the specialists run. The registry is{" "}
            <code className="num text-[var(--color-text-2)]">config/engines.json</code>. Nothing is written outside each
            engine&apos;s <code className="num text-[var(--color-text-2)]">_command-center/</code> folder, and a missing
            folder is reported, never created.
          </>
        )}
      </p>
    </div>
  );
}
