import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M5 17.5c3.6.4 6.6-.6 8.8-2.8 2.2-2.2 3.2-5.2 2.8-8.7-3.6-.4-6.6.6-8.8 2.8C5.6 11 4.6 14 5 17.5Z"
          fill="currentColor"
          opacity="0.95"
        />
        <path
          d="M6.5 18.5c2.2-4 5-6.8 9-9"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="font-serif text-xl font-semibold tracking-tight">
        Robin<span className="text-primary">Fi</span>
      </span>
    </span>
  )
}
