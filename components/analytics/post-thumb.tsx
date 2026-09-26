"use client";

import { useState } from "react";
import { Play, ImageIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Post media thumbnail — shows the actual image/video cover so a post is
 * identifiable at a glance. Video gets a play badge; text-only gets a glyph.
 * Uses a raw <img> (remote social CDN URLs, often time-limited signed links);
 * an expired link falls back to the media glyph instead of a broken image.
 */
export function PostThumb({
  thumbnailUrl,
  mediaType,
  className,
  size = "md",
}: {
  thumbnailUrl?: string | null;
  mediaType?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const dims = size === "sm" ? "size-10" : size === "lg" ? "size-16" : "size-12";
  const isVideo = mediaType === "video";
  const showImg = !!thumbnailUrl && !failed;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-2)]",
        dims,
        className,
      )}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt=""
          className="size-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
          // An expired link can fail before hydration, when onError never fires.
          ref={(el) => {
            if (el && el.complete && el.naturalWidth === 0) setFailed(true);
          }}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-[var(--color-faint)]">
          {isVideo ? <Play className="size-4" /> : mediaType ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
        </div>
      )}
      {isVideo && showImg && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-6 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <Play className="size-3.5 fill-current" />
          </span>
        </span>
      )}
    </div>
  );
}
