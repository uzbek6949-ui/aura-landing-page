export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="Aura logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="auraLogo" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="0.55" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#auraLogo)" />
      {/* concentric "aura" rings */}
      <circle cx="20" cy="20" r="11" fill="none" stroke="#ffffff" strokeOpacity="0.95" strokeWidth="2.4" />
      <circle cx="20" cy="20" r="5" fill="#ffffff" />
    </svg>
  );
}
