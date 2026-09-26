import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlatformView } from "@/components/analytics-dashboard/platform-view";
import { PLATFORM_META, PLATFORM_ORDER, platformFromSlug } from "@/components/analytics-dashboard/types";
import { NAV, snapshot } from "@/lib/snapshot";

export const dynamicParams = false;

export function generateStaticParams() {
  return PLATFORM_ORDER.map((p) => ({ platform: PLATFORM_META[p].slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }): Promise<Metadata> {
  const p = platformFromSlug((await params).platform);
  return { title: p ? PLATFORM_META[p].label : "Platform" };
}

export default async function PlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const platform = platformFromSlug((await params).platform);
  if (!platform) notFound();
  return <PlatformView snapshot={snapshot} platform={platform} linkMode="external" nav={NAV} />;
}
