"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, FlaskConical, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardEyebrow, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import { MethodNotes } from "./sections";
import { PLATFORM_META, type AnalyticsSnapshot, type Platform, type SpecialistRecs } from "./types";
import { ImpactChip, PageHeader, PlatformTile, stampOf } from "./ui";

const QUALITY: Record<SpecialistRecs["dataQuality"], { label: string; cls: string }> = {
  good: {
    label: "Backed by data",
    cls: "border-[color-mix(in_srgb,var(--color-positive)_32%,transparent)] bg-[var(--color-positive-soft)] text-[var(--color-positive)]",
  },
  limited: {
    label: "Limited data",
    cls: "border-[color-mix(in_srgb,var(--color-warning)_32%,transparent)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  },
  none: {
    label: "No post data · starting playbook",
    cls: "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-muted)]",
  },
};

function QualityChip({ q }: { q: SpecialistRecs["dataQuality"] }) {
  return (
    <span className={cn("num rounded-[var(--radius-chip)] border px-1.5 text-[10px] uppercase leading-[18px] tracking-[0.06em]", QUALITY[q].cls)}>
      {QUALITY[q].label}
    </span>
  );
}

const agentName = (p: Platform) => `${PLATFORM_META[p].label} specialist`;
const when = (iso: string, tz: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: tz }).format(new Date(iso));

/** Headline + top actions, for a platform page. */
export function SpecialistPreview({
  recs,
  platform,
  href,
  className,
}: {
  recs: SpecialistRecs | null;
  platform: Platform;
  href: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardEyebrow className="flex items-center gap-1.5">
            <Sparkles className="size-3" /> {agentName(platform)}
          </CardEyebrow>
          <CardTitle className="mt-1 text-base">{recs ? recs.headline : "No recommendations yet"}</CardTitle>
        </div>
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--color-accent-text)] hover:underline">
          All advice <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {recs ? (
          <ol className="space-y-3">
            {recs.actions.slice(0, 3).map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="num flex size-5 shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-accent-soft)] text-[11px] font-semibold text-[var(--color-accent-text)]">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold leading-snug">{a.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[var(--color-muted)]">{a.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-[var(--color-muted)]">The {agentName(platform)} hasn&apos;t run yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function RegenerateButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        size="sm"
        disabled={state === "running"}
        onClick={async () => {
          setState("running");
          setMsg(null);
          try {
            const res = await fetch("/api/analytics/recommendations", { method: "POST" });
            const body = (await res.json()) as { results?: { platform: string; ok: boolean; error?: string }[] };
            const failed = body.results?.filter((r) => !r.ok) ?? [];
            setState(failed.length ? "error" : "idle");
            setMsg(failed.length ? `Failed: ${failed.map((f) => f.platform).join(", ")}` : null);
            router.refresh();
          } catch (err) {
            setState("error");
            setMsg((err as Error).message);
          }
        }}
      >
        <RefreshCw className={cn("size-3.5", state === "running" && "animate-spin")} />
        {state === "running" ? "Specialists are working… (a few minutes)" : "Run specialists again"}
      </Button>
      {msg && <p className="text-[11px] text-[var(--color-danger)]">{msg}</p>}
    </div>
  );
}

function SpecialistCard({ recs, tz }: { recs: SpecialistRecs; tz: string }) {
  const meta = PLATFORM_META[recs.platform];
  return (
    <Card id={meta.slug} className="scroll-mt-20">
      <CardHeader className="flex-row flex-wrap items-start gap-3">
        <PlatformTile platform={recs.platform} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="eyebrow">{agentName(recs.platform)}</p>
            <QualityChip q={recs.dataQuality} />
          </div>
          <CardTitle className="mt-1.5 text-lg leading-snug">{recs.headline}</CardTitle>
          <p className="mt-2 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--color-text-2)]">{recs.diagnosis}</p>
        </div>
        <p className="num order-last w-full text-[11px] text-[var(--color-faint)] sm:order-none sm:w-auto">
          {when(recs.generatedAt, tz)}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            { title: "What's working", items: recs.working, tone: "var(--color-positive)" },
            { title: "What to fix", items: recs.fix, tone: "var(--color-warning)" },
          ].map((col) => (
            <div key={col.title} className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-2)_55%,transparent)] p-3.5">
              <p className="eyebrow mb-2.5 flex items-center gap-1.5 text-[9.5px]">
                <span className="size-1.5 rounded-full" style={{ background: col.tone }} />
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.items.map((it, i) => (
                  <li key={i}>
                    <p className="text-[13px] font-medium leading-snug">{it.point}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-muted)]">{it.evidence}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <p className="eyebrow mb-2.5">Do this · highest impact first</p>
          <ol className="divide-y divide-[var(--color-border)] rounded-[var(--radius-control)] border border-[var(--color-border)]">
            {recs.actions.map((a, i) => (
              <li key={i} className="flex gap-3 p-3.5">
                <span className="num flex size-6 shrink-0 items-center justify-center rounded-[5px] bg-[var(--color-accent-soft)] text-xs font-semibold text-[var(--color-accent-text)]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="mr-1 text-[14px] font-semibold leading-snug">{a.title}</p>
                    <ImpactChip kind="impact" level={a.impact} />
                    <ImpactChip kind="effort" level={a.effort} />
                    {a.account && (
                      <span className="num rounded-[var(--radius-chip)] border border-[var(--color-border)] px-1.5 text-[10px] leading-[18px] text-[var(--color-muted)]">
                        @{a.account.replace(/^@/, "")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-2)]">{a.detail}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
                    <span className="font-medium text-[var(--color-faint)]">Evidence · </span>
                    {a.evidence}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-2.5 flex items-center gap-1.5">
              <FlaskConical className="size-3" /> Experiments
            </p>
            <ul className="space-y-2.5">
              {recs.experiments.map((e, i) => (
                <li key={i} className="rounded-[var(--radius-control)] border border-[var(--color-border)] p-3">
                  <p className="text-[13px] font-medium leading-snug">{e.hypothesis}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-2)]">{e.test}</p>
                  <p className="num mt-1 text-[11px] text-[var(--color-muted)]">Measure: {e.metric}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-2.5">Cadence &amp; timing</p>
            <p className="rounded-[var(--radius-control)] border border-[color-mix(in_srgb,var(--color-accent)_28%,transparent)] bg-[var(--color-accent-soft)] p-3 text-[13px] leading-relaxed text-[var(--color-text-2)]">
              {recs.cadence}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const ORDER: Platform[] = ["linkedin", "instagram", "twitter"];

export function RecommendationsView({
  snapshot,
  canRegenerate = false,
}: {
  snapshot: AnalyticsSnapshot;
  canRegenerate?: boolean;
}) {
  const tz = snapshot.timeZone;
  const platforms = ORDER.filter((p) => snapshot.accounts.some((a) => a.platform === p));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Insights · specialist agents"
        title="Recommendations"
        subtitle="Three specialist agents — X, LinkedIn and Instagram — read every post and number on their platform and tell you what to change, ranked by impact."
        stamp={stampOf(snapshot)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Jump to platform" className="flex flex-wrap gap-2">
          {platforms.map((p) => {
            const r = snapshot.recommendations.find((x) => x.platform === p);
            return (
              <a
                key={p}
                href={`#${PLATFORM_META[p].slug}`}
                className="card card-hover inline-flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium"
              >
                <PlatformTile platform={p} size="sm" />
                {PLATFORM_META[p].label}
                {r && <span className="num text-[11px] text-[var(--color-faint)]">{r.actions.length} actions</span>}
              </a>
            );
          })}
        </nav>
        {canRegenerate && <RegenerateButton />}
      </div>

      {platforms.map((p) => {
        const r = snapshot.recommendations.find((x) => x.platform === p);
        return r ? (
          <SpecialistCard key={p} recs={r} tz={tz} />
        ) : (
          <Card key={p} id={PLATFORM_META[p].slug}>
            <CardContent className="pt-5">
              <EmptyState
                title={`The ${agentName(p)} hasn't run yet`}
                description={canRegenerate ? "Run the specialists to generate recommendations." : "Recommendations will appear after the next refresh."}
              />
            </CardContent>
          </Card>
        );
      })}

      <MethodNotes
        notes={[
          "Each specialist is a Claude agent with a platform playbook (.claude/agents/<platform>-specialist.md) that reads a brief of every post on its platform: metrics, formats, timing, and your own best-time table. It must cite the numbers behind each claim.",
          "Platform mechanics in the playbooks are practitioner heuristics, checked against your data — not guarantees. Advice marked \"No post data\" is a starting playbook, not a finding.",
          "Recommendations reflect the data as of the snapshot above; run them again after a few weeks of new posts.",
        ]}
      />
    </div>
  );
}
