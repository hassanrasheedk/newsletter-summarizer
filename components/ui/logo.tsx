import { cn } from '@/lib/utils'

interface LogoIconProps {
  className?: string
  size?: number
}

/**
 * Skimr logo mark — a newsletter card with an AI scan line sweeping through it.
 * Content above the line is "processed" (bright), content below is pending (dim).
 */
export function LogoIcon({ className, size = 32 }: LogoIconProps) {
  const id = 'skimr-logo'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Skimr logo"
    >
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect width="40" height="40" rx="9" />
        </clipPath>
        <linearGradient id={`${id}-scan`} x1="0" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#06B6D4" />
          <stop offset="55%"  stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0C0C18" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        {/* Background */}
        <rect width="40" height="40" fill={`url(#${id}-bg)`} />

        {/* Above scan — processed / bright content lines */}
        <rect x="8" y="9"  width="24" height="2.5" rx="1.25" fill="#E2E8F0" fillOpacity="0.92" />
        <rect x="8" y="14" width="16" height="2.5" rx="1.25" fill="#94A3B8" fillOpacity="0.65" />

        {/* Glow halo around the scan line */}
        <rect x="0" y="17.5" width="40" height="7" fill={`url(#${id}-scan)`} fillOpacity="0.14" />

        {/* The scan line — the "skim" */}
        <rect x="0" y="20" width="40" height="2.5" fill={`url(#${id}-scan)`} />

        {/* Below scan — unprocessed / dim content lines */}
        <rect x="8" y="26" width="24" height="2.5" rx="1.25" fill="#475569" fillOpacity="0.55" />
        <rect x="8" y="31" width="14" height="2.5" rx="1.25" fill="#334155" fillOpacity="0.40" />
      </g>
    </svg>
  )
}

interface LogoWordmarkProps {
  className?: string
  collapsed?: boolean
}

export function LogoWordmark({ className, collapsed = false }: LogoWordmarkProps) {
  return (
    <div className={cn('flex items-center gap-2 select-none', className)}>
      <LogoIcon size={28} />
      {!collapsed && (
        <span className="text-[15px] font-bold tracking-tight text-foreground">
          Skim<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">r</span>
        </span>
      )}
    </div>
  )
}
