'use client'

import { Snowflake } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { EtapeBatchItem } from '@/components/alimentation/batch/EtapeBatchItem'
import type { SessionBatch } from '@/types'

interface DerouleBatchVueProps {
  session: SessionBatch
  onBasculer: (id: string) => void
}

/** Le déroulé de la session : progression, étapes à cocher, conservation. */
export function DerouleBatchVue({ session, onBasculer }: DerouleBatchVueProps) {
  const d = session.deroule
  if (!d) return null
  const faites = d.etapes.filter((e) => session.faits.includes(e.id)).length
  const pct = Math.round((faites / d.etapes.length) * 100)

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Ma session</h3>
          <span className="text-xs text-muted-foreground">
            {faites}/{d.etapes.length} étapes{d.duree_totale_min ? ` · ≈ ${d.duree_totale_min} min` : ''}
          </span>
        </div>
        <Progress value={pct} />
      </div>
      <ol className="space-y-2">
        {d.etapes.map((e, i) => (
          <EtapeBatchItem key={e.id} etape={e} numero={i + 1} fait={session.faits.includes(e.id)} onBasculer={() => onBasculer(e.id)} />
        ))}
      </ol>
      {d.conservation.length ? (
        <div className="rounded-xl bg-sky-50 p-3 dark:bg-sky-950/30">
          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-sky-900 dark:text-sky-100">
            <Snowflake className="size-4" aria-hidden /> Conservation
          </p>
          <ul className="space-y-1 text-sm text-sky-900/90 dark:text-sky-100/90">
            {d.conservation.map((c) => (
              <li key={c.recette}>
                <span className="font-medium">{c.recette}</span>
                {c.jours ? ` · ${c.jours} j au frigo` : ''} — {c.conseil}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
