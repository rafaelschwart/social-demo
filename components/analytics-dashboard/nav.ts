import { CalendarClock, LayoutDashboard, Sparkles, UsersRound } from "lucide-react";
import { InstagramGlyph, LinkedInGlyph, XGlyph } from "./platform-icons";

export interface AnalyticsNavItem {
  /** Path segment under the analytics base ("" = overview). */
  slug: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * The analytics sections, in left-menu order. The app mounts them under
 * /dashboard; the static demo at the site root. One list feeds both sidebars.
 */
export const ANALYTICS_SECTIONS: { title: string; items: AnalyticsNavItem[] }[] = [
  {
    title: "Analytics",
    items: [
      { slug: "", label: "Overview", icon: LayoutDashboard },
      { slug: "x", label: "X", icon: XGlyph },
      { slug: "linkedin", label: "LinkedIn", icon: LinkedInGlyph },
      { slug: "instagram", label: "Instagram", icon: InstagramGlyph },
    ],
  },
  {
    title: "Insights",
    items: [
      { slug: "best-times", label: "Best times to post", icon: CalendarClock },
      { slug: "recommendations", label: "Recommendations", icon: Sparkles },
    ],
  },
  {
    title: "Accounts",
    items: [{ slug: "accounts", label: "Connected accounts", icon: UsersRound }],
  },
];

/** Where an analytics section lives, e.g. ("/dashboard","x") → /dashboard/x; ("","x",true) → /x/. */
export function sectionHref(base: string, slug: string, trailingSlash = false): string {
  const path = slug ? `${base}/${slug}` : base || "/";
  return trailingSlash && !path.endsWith("/") ? `${path}/` : path;
}
