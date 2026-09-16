'use client'

import { ExternalLink } from 'lucide-react'
import type { Source } from '@/types'

interface SectionBibliographieProps {
  sources: Source[]
}

export function SectionBibliographie({ sources }: SectionBibliographieProps) {
  if (sources.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune source enregistrée pour le moment. Exécute la migration
        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
          20260916160000_conseils_sources.sql
        </code>
        dans Supabase pour charger les premières références.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Toutes les études et références utilisées pour les conseils et pourcentages de l'application.
      </p>
      <ul className="flex flex-col gap-2">
        {sources.map((s) => (
          <li key={s.id}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-start gap-2 rounded-lg border border-neutral-200 p-2.5 text-sm text-neutral-700 transition-colors hover:border-amber-300 hover:bg-amber-50/50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-amber-800 dark:hover:bg-amber-950/20"
            >
              <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-neutral-400" aria-hidden />
              <span>{s.titre}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
