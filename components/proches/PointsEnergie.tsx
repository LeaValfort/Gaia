import { cn } from '@/lib/utils'

export function PointsEnergie({ niveau }: { niveau: number | null }) {
  if (niveau == null) return null
  const arrondi = Math.min(5, Math.max(1, Math.round(niveau)))
  return (
    <div className="flex items-center gap-0.5" aria-label={`Énergie ${arrondi} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            'size-2 rounded-full',
            i <= arrondi ? 'bg-amber-500 dark:bg-amber-400' : 'bg-neutral-200 dark:bg-neutral-700'
          )}
        />
      ))}
    </div>
  )
}
