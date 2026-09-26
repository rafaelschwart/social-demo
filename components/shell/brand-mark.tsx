/** The "rs" tile — always ink-black with the beacon-blue bar, both themes. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={
        "grid size-8 shrink-0 place-items-center overflow-hidden rounded-[7px] border border-[var(--color-border-strong)] bg-[#0b0c0f] " +
        (className ?? "")
      }
    >
      <svg viewBox="0 0 64 64" role="img" aria-label="Rafael Schwart" className="block size-full">
        <rect width="64" height="64" fill="#0b0c0f" />
        <text
          x="32"
          y="38"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="700"
          fontSize="30"
          letterSpacing="-1"
          fill="#f4f1e8"
        >
          rs
        </text>
        <rect x="15" y="46" width="34" height="7" rx="1.5" fill="#3664ff" />
      </svg>
    </span>
  );
}
