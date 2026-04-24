import { getConseilsPhase } from '@/lib/cycle'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type { Phase } from '@/types'

interface ConseilsPhaseProps {
  phase: Phase
}

const CARTES = [
  { cle: 'sport' as const, titre: 'Sport', emoji: '💪' },
  { cle: 'nutrition' as const, titre: 'Nutrition', emoji: '🥗' },
  { cle: 'sommeil' as const, titre: 'Sommeil', emoji: '😴' },
  { cle: 'bienEtre' as const, titre: 'Bien-être', emoji: '🌿' },
]

export function ConseilsPhase({ phase }: ConseilsPhaseProps) {
  const design = PHASES_DESIGN[phase]
  const c = getConseilsPhase(phase)

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
        Conseils pour ta phase {design.emoji} {design.label}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {CARTES.map(({ cle, titre, emoji }) => (
          <div
            key={cle}
            className={`rounded-2xl border p-4 ${design.border} bg-white dark:bg-neutral-900/80`}
            style={{ backgroundColor: design.bgCard }}
          >
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
              {emoji} {titre}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: design.texte }}>
              {c[cle]}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 dark:bg-amber-950/40 dark:border-amber-800/60 p-4">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
          💡 Le savais-tu ?
        </p>
        <p className="text-sm leading-relaxed text-amber-950/90 dark:text-amber-50/95">
          {c.anecdote}
        </p>
      </div>

      <div
        className={`rounded-2xl border p-4 ${design.border}`}
        style={{ backgroundColor: design.bgCard }}
      >
        <p className="text-sm font-semibold mb-2" style={{ color: design.texte }}>
          ⚡ Astuce pratique
        </p>
        <p className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">{c.astuce}</p>
      </div>
    </section>
  )
}
