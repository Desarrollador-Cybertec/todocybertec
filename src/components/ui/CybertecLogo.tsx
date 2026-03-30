interface CybertecLogoProps {
  variant?: 'full' | 'compact' | 'isotipo';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { shield: 28, text: 'text-sm', sub: 'text-[10px]' },
  md: { shield: 36, text: 'text-lg', sub: 'text-xs' },
  lg: { shield: 48, text: 'text-2xl', sub: 'text-sm' },
};

function CybertecShield({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield shape */}
      <path
        d="M24 4L6 12v12c0 11.1 7.68 21.48 18 24 10.32-2.52 18-12.9 18-24V12L24 4z"
        fill="#181D5E"
        stroke="#1B92D0"
        strokeWidth="1.5"
      />
      {/* Inner glow */}
      <path
        d="M24 8L10 14.5v9.5c0 9.24 6.4 17.9 14 20 7.6-2.1 14-10.76 14-20v-9.5L24 8z"
        fill="url(#shieldGrad)"
      />
      {/* C letter */}
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="system-ui, sans-serif"
        fontWeight="800"
        fontSize="18"
      >
        C
      </text>
      <defs>
        <linearGradient id="shieldGrad" x1="10" y1="8" x2="38" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1B92D0" stopOpacity="0.25" />
          <stop offset="1" stopColor="#181D5E" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function CybertecLogo({ variant = 'full', className = '', size = 'md' }: CybertecLogoProps) {
  const s = SIZES[size];

  if (variant === 'isotipo') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <CybertecShield size={s.shield} />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <CybertecShield size={s.shield} />
        <div className="flex flex-col">
          <span className={`${s.text} font-extrabold tracking-wide text-white leading-tight`}>
            TAPE
          </span>
          <span className={`${s.sub} font-medium text-cyber-radar/80 leading-tight`}>
            by Cybertec
          </span>
        </div>
      </div>
    );
  }

  // variant === 'full'
  return (
    <div className={`inline-flex flex-col items-center gap-1.5 ${className}`}>
      <CybertecShield size={s.shield} />
      <span className={`${s.sub} font-semibold tracking-[0.2em] uppercase text-cyber-radar/70`}>
        Cybertec
      </span>
    </div>
  );
}
