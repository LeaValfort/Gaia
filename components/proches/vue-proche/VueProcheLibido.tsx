import { libidoVersPoints } from '@/lib/proches-vue-helpers'
import { cn } from '@/lib/utils'
import type { ProchePartageData } from '@/types'

const DOTS = 5

export function VueProcheLibido({ partage, visible }: { partage: ProchePartageData; visible: boolean }) {
  if (!visible || partage.libido == null || partage.libido === '') return null
  const k = libidoVersPoints(partage.libido)
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3',
        'bg-[#FFF7ED] border-[#FDBA74]',
        'dark:bg-orange-950/30 dark:border-orange-500/50'
      )}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">🔥 Libido</p>
        <p className="text-sm text-neutral-700 dark:text-neutral-200">{partage.libido}</p>
      </div>
      <div className="flex gap-1.5 mt-2" role="img" aria-label={`Niveau ${k} sur ${DOTS}`}>
        {Array.from({ length: DOTS }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-2.5 flex-1 max-w-8 rounded-full',
              i < k ? 'bg-orange-500 dark:bg-orange-400' : 'bg-orange-200/80 dark:bg-orange-900/50'
            )}
          />
        ))}
      </div>
    </div>
  )
}
