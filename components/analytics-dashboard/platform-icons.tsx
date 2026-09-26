/**
 * Platform glyphs (outline, lucide-style stroke). This lucide version ships no
 * brand icons, so these are inline SVGs adapted from Tabler Icons (MIT).
 */
type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

export function XGlyph({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </Svg>
  );
}

export function LinkedInGlyph({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 11v5" />
      <path d="M8 8v.01" />
      <path d="M12 16v-5" />
      <path d="M16 16v-3a2 2 0 1 0 -4 0" />
      <path d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z" />
    </Svg>
  );
}

export function InstagramGlyph({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
      <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
      <path d="M16.5 7.5v.01" />
    </Svg>
  );
}

export function TikTokGlyph({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
    </Svg>
  );
}

export function FacebookGlyph({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
    </Svg>
  );
}

const GLYPHS: Record<string, (p: IconProps) => React.ReactElement> = {
  twitter: XGlyph,
  linkedin: LinkedInGlyph,
  instagram: InstagramGlyph,
  tiktok: TikTokGlyph,
  facebook: FacebookGlyph,
};

/** Glyph for any Zernio platform id (falls back to a neutral dot). */
export function PlatformGlyph({ platform, className }: IconProps & { platform: string }) {
  const G = GLYPHS[platform];
  if (G) return <G className={className} />;
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="4" />
    </Svg>
  );
}
