interface ArchitecturalMediaProps {
  readonly variant: "hero" | "estate" | "care" | "lifestyle";
  readonly label: string;
  readonly className?: string;
}

const PALETTES = {
  hero: ["#172232", "#394452", "#caa24b", "#e8dfcf"],
  estate: ["#25313c", "#8c6d4a", "#d9cbb5", "#f1ece2"],
  care: ["#183141", "#41758d", "#b4d0d0", "#edf0ea"],
  lifestyle: ["#28392f", "#71866e", "#c2a77b", "#efe4d0"],
} as const;

export function ArchitecturalMedia({
  variant,
  label,
  className,
}: ArchitecturalMediaProps) {
  const palette = PALETTES[variant];
  const gradientId = `gradient-${variant}`;
  const glowId = `glow-${variant}`;

  return (
    <figure className={className} data-prototype-fixture="media">
      <svg
        viewBox="0 0 1200 900"
        role="img"
        aria-label={`${label}. Abstract architectural prototype illustration.`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={palette[0]} />
            <stop offset="0.55" stopColor={palette[1]} />
            <stop offset="1" stopColor={palette[2]} />
          </linearGradient>
          <radialGradient id={glowId} cx="74%" cy="18%" r="70%">
            <stop offset="0" stopColor={palette[3]} stopOpacity="0.68" />
            <stop offset="1" stopColor={palette[0]} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1200" height="900" fill={`url(#${gradientId})`} />
        <rect width="1200" height="900" fill={`url(#${glowId})`} />
        <path d="M0 730 420 390 760 900H0Z" fill={palette[0]} opacity="0.76" />
        <path d="M360 900 840 160 1050 900Z" fill={palette[3]} opacity="0.34" />
        <path d="M800 900 1200 510V900Z" fill={palette[0]} opacity="0.82" />
        <path d="M710 112 965 112 965 706 710 706Z" fill="none" stroke={palette[3]} strokeOpacity="0.62" strokeWidth="8" />
        <path d="M755 112V706M800 112V706M845 112V706M890 112V706M935 112V706" stroke={palette[3]} strokeOpacity="0.2" strokeWidth="3" />
        <circle cx="216" cy="216" r="86" fill={palette[2]} opacity="0.48" />
        <path d="M0 782H1200" stroke={palette[3]} strokeOpacity="0.42" strokeWidth="2" />
      </svg>
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}
