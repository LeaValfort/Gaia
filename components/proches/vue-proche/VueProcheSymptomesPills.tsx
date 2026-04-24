import { cn } from '@/lib/utils'
import type { ProchePartageData } from '@/types'

export function VueProcheSymptomesPills({ partage, visible }: { partage: ProchePartageData; visible: boolean }) {
  if (!visible) return null
  const s = partage.symptomes
  if (s == null || s.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {s.map((x) => (
        <span
          key={x}
          className={cn(
            'rounded-full px-3 py-1 text-sm font-medium',
            'bg-[#FEF9C3] text-[#713F12] border border-[#EAB308]',
            'dark:bg-yellow-950/50 dark:text-yellow-100 dark:border-yellow-600/60'
          )}
        >
          {x}
        </span>
      ))}
    </div>
  )
}
